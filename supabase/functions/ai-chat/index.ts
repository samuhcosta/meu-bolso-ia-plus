import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

interface Message {
  role: "user" | "model"
  content: string
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Sessão expirada. Faça login novamente." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
      )
    }

    const token = authHeader.replace("Bearer ", "")
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Usuário não autenticado." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
      )
    }

    const { message, history, geminiKey: clientGeminiKey } = await req.json()
    const geminiKey = Deno.env.get("GEMINI_API_KEY") || clientGeminiKey
    if (!geminiKey) {
      return new Response(
        JSON.stringify({ success: false, error: "API do Gemini não configurada." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
      )
    }

    const tools = [
      {
        functionDeclarations: [
          {
            name: "getFinancialSummary",
            description: "Obtém um resumo financeiro completo do usuário: saldo total, receitas do mês, despesas do mês, total de transações, total de metas e total de dívidas.",
            parameters: { type: "object", properties: {}, required: [] },
          },
          {
            name: "getExpensesByCategory",
            description: "Obtém todas as despesas agrupadas por categoria.",
            parameters: { type: "object", properties: {}, required: [] },
          },
          {
            name: "getGoals",
            description: "Obtém todas as metas financeiras do usuário com progresso.",
            parameters: { type: "object", properties: {}, required: [] },
          },
          {
            name: "getDebts",
            description: "Obtém todas as dívidas do usuário com parcelas e status de pagamento.",
            parameters: { type: "object", properties: {}, required: [] },
          },
          {
            name: "getRecentTransactions",
            description: "Obtém as transações mais recentes do usuário (últimos 30 dias).",
            parameters: {
              type: "object",
              properties: {
                limit: { type: "number", description: "Quantidade de transações (padrão 10)" },
              },
              required: [],
            },
          },
          {
            name: "createTransaction",
            description: "Cria uma nova transação financeira (receita ou despesa). Use isso quando o usuário pedir para registrar um ganho ou gasto.",
            parameters: {
              type: "object",
              properties: {
                type: { type: "string", enum: ["income", "expense"], description: "income para receita, expense para despesa" },
                amount: { type: "number", description: "Valor da transação" },
                category: { type: "string", description: "Categoria da transação" },
                description: { type: "string", description: "Descrição da transação" },
                date: { type: "string", description: "Data no formato YYYY-MM-DD (padrão hoje)" },
              },
              required: ["type", "amount", "category", "description"],
            },
          },
        ],
      },
    ]

    const systemPrompt = `Você é o assistente financeiro do Meu Bolso Pro, um app de finanças pessoais.
Você ajuda o usuário a analisar gastos, criar transações, acompanhar metas e dívidas.
Sempre responda em português brasileiro de forma amigável e direta.
Use as funções disponíveis para buscar dados financeiros ou criar transações quando o usuário solicitar.
Quando o usuário pedir para registrar um gasto ou receita, use createTransaction.
Seja proativo em sugerir análises e dicas financeiras.`

    const contents: any[] = []

    if (history && Array.isArray(history)) {
      for (const msg of history) {
        contents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }],
        })
      }
    }

    contents.push({
      role: "user",
      parts: [{ text: message }],
    })

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        systemInstruction: { parts: [{ text: systemPrompt }] },
        tools,
      }),
    })

    const geminiResponse = await response.json()

    if (!geminiResponse.candidates || geminiResponse.candidates.length === 0) {
      const errorMsg = geminiResponse.error?.message || "Erro ao processar mensagem"
      console.error("[ai-chat] Gemini error:", JSON.stringify(geminiResponse))
      return new Response(
        JSON.stringify({ success: false, error: errorMsg }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
      )
    }

    const candidate = geminiResponse.candidates[0]
    const part = candidate.content.parts[0]

    if (part.functionCall) {
      const fc = part.functionCall
      const functionName = fc.name
      const functionArgs = fc.args || {}

      let functionResult: any

      switch (functionName) {
        case "getFinancialSummary": {
          const { data: transactions } = await supabaseClient
            .from("transactions")
            .select("*")
            .eq("user_id", user.id)

          const { data: goals } = await supabaseClient
            .from("goals")
            .select("*")
            .eq("user_id", user.id)

          const { data: debts } = await supabaseClient
            .from("debts")
            .select("*")
            .eq("user_id", user.id)

          const currentMonth = new Date().getMonth()
          const currentYear = new Date().getFullYear()

          const totalIncome = (transactions || [])
            .filter((t: any) => t.type === "income")
            .reduce((sum: number, t: any) => sum + Number(t.amount), 0)

          const totalExpenses = (transactions || [])
            .filter((t: any) => t.type === "expense")
            .reduce((sum: number, t: any) => sum + Number(t.amount), 0)

          const monthlyTransactions = (transactions || []).filter((t: any) => {
            const d = new Date(t.date)
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear
          })

          const monthlyIncome = monthlyTransactions
            .filter((t: any) => t.type === "income")
            .reduce((sum: number, t: any) => sum + Number(t.amount), 0)

          const monthlyExpenses = monthlyTransactions
            .filter((t: any) => t.type === "expense")
            .reduce((sum: number, t: any) => sum + Number(t.amount), 0)

          functionResult = {
            balance: totalIncome - totalExpenses,
            totalIncome,
            totalExpenses,
            monthlyIncome,
            monthlyExpenses,
            totalTransactions: (transactions || []).length,
            totalGoals: (goals || []).length,
            totalDebts: (debts || []).length,
          }
          break
        }

        case "getExpensesByCategory": {
          const { data: transactions } = await supabaseClient
            .from("transactions")
            .select("*")
            .eq("user_id", user.id)
            .eq("type", "expense")

          const byCategory: Record<string, number> = {}
          for (const t of transactions || []) {
            byCategory[t.category] = (byCategory[t.category] || 0) + Number(t.amount)
          }

          functionResult = Object.entries(byCategory)
            .map(([category, amount]) => ({ category, amount }))
            .sort((a, b) => b.amount - a.amount)
          break
        }

        case "getGoals": {
          const { data: goals } = await supabaseClient
            .from("goals")
            .select("*")
            .eq("user_id", user.id)

          functionResult = (goals || []).map((g: any) => ({
            title: g.title,
            targetAmount: Number(g.target_amount),
            currentAmount: Number(g.current_amount),
            progress: Math.min(Math.round((Number(g.current_amount) / Number(g.target_amount)) * 100), 100),
            deadline: g.deadline,
          }))
          break
        }

        case "getDebts": {
          const { data: debts } = await supabaseClient
            .from("debts")
            .select("*")
            .eq("user_id", user.id)

          const { data: installments } = await supabaseClient
            .from("debt_installments")
            .select("*, debts!inner(user_id)")
            .eq("debts.user_id", user.id)

          functionResult = (debts || []).map((d: any) => ({
            name: d.name,
            totalAmount: Number(d.total_amount),
            paidInstallments: d.paid_installments,
            totalInstallments: d.total_installments,
            installmentAmount: Number(d.installment_amount),
            progress: Math.min(Math.round((Number(d.paid_installments) / Number(d.total_installments)) * 100), 100),
          }))
          break
        }

        case "getRecentTransactions": {
          const limit = functionArgs.limit || 10
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

          const { data: transactions } = await supabaseClient
            .from("transactions")
            .select("*")
            .eq("user_id", user.id)
            .gte("date", thirtyDaysAgo.toISOString().split("T")[0])
            .order("date", { ascending: false })
            .limit(limit)

          functionResult = (transactions || []).map((t: any) => ({
            type: t.type,
            amount: Number(t.amount),
            category: t.category,
            description: t.description,
            date: t.date,
          }))
          break
        }

        case "createTransaction": {
          const transactionData = {
            user_id: user.id,
            type: functionArgs.type,
            amount: functionArgs.amount,
            category: functionArgs.category,
            description: functionArgs.description,
            date: functionArgs.date || new Date().toISOString().split("T")[0],
          }

          const { data, error } = await supabaseClient
            .from("transactions")
            .insert(transactionData)
            .select()
            .single()

          if (error) {
            functionResult = { success: false, error: error.message }
          } else {
            functionResult = {
              success: true,
              transaction: {
                id: data.id,
                type: data.type,
                amount: Number(data.amount),
                category: data.category,
                description: data.description,
                date: data.date,
              },
            }
          }
          break
        }

        default:
          functionResult = { error: "Função desconhecida" }
      }

      const secondResponse = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            ...contents,
            { role: "model", parts: [{ functionCall: { name: functionName, args: functionArgs } }] },
            { role: "user", parts: [{ functionResponse: { name: functionName, response: functionResult } }] },
          ],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          tools,
        }),
      })

      const secondGeminiResponse = await secondResponse.json()

      if (secondGeminiResponse.candidates && secondGeminiResponse.candidates.length > 0) {
        const text = secondGeminiResponse.candidates[0].content.parts[0]?.text || ""
        return new Response(
          JSON.stringify({ success: true, response: text }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
        )
      }

      return new Response(
        JSON.stringify({ success: true, response: "Operação realizada com sucesso!" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
      )
    }

    const text = part?.text || ""
    return new Response(
      JSON.stringify({ success: true, response: text }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[ai-chat] Erro:", message)
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    )
  }
})
