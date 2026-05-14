import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Bot, Send, MessageCircle, TrendingUp, TrendingDown, Target, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`;

const toolDefinitions = {
  functionDeclarations: [
    {
      name: "getFinancialSummary",
      description: "Obtém resumo financeiro completo: saldo, receitas/despesas do mês, total de transações, metas e dívidas.",
      parameters: { type: "object", properties: {}, required: [] },
    },
    {
      name: "getExpensesByCategory",
      description: "Obtém despesas agrupadas por categoria.",
      parameters: { type: "object", properties: {}, required: [] },
    },
    {
      name: "getGoals",
      description: "Obtém todas as metas com progresso.",
      parameters: { type: "object", properties: {}, required: [] },
    },
    {
      name: "getDebts",
      description: "Obtém todas as dívidas com parcelas.",
      parameters: { type: "object", properties: {}, required: [] },
    },
    {
      name: "getRecentTransactions",
      description: "Obtém as transações recentes (últimos 30 dias).",
      parameters: {
        type: "object",
        properties: { limit: { type: "number", description: "Quantidade (padrão 10)" } },
        required: [],
      },
    },
    {
      name: "createTransaction",
      description: "Cria uma transação financeira (receita ou despesa).",
      parameters: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["income", "expense"] },
          amount: { type: "number" },
          category: { type: "string" },
          description: { type: "string" },
          date: { type: "string", description: "YYYY-MM-DD (padrão hoje)" },
        },
        required: ["type", "amount", "category", "description"],
      },
    },
  ],
};

async function executeTool(name: string, args: any, userId: string) {
  switch (name) {
    case "getFinancialSummary": {
      const [transactions, goals, debts] = await Promise.all([
        supabase.from("transactions").select("*").eq("user_id", userId).then(r => r.data || []),
        supabase.from("goals").select("*").eq("user_id", userId).then(r => r.data || []),
        supabase.from("debts").select("*").eq("user_id", userId).then(r => r.data || []),
      ]);

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      const totalIncome = (transactions as any[])
        .filter((t: any) => t.type === "income")
        .reduce((sum: number, t: any) => sum + Number(t.amount), 0);
      const totalExpenses = (transactions as any[])
        .filter((t: any) => t.type === "expense")
        .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

      const monthly = (transactions as any[]).filter((t: any) => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });
      const monthlyIncome = monthly.filter((t: any) => t.type === "income").reduce((s: number, t: any) => s + Number(t.amount), 0);
      const monthlyExpenses = monthly.filter((t: any) => t.type === "expense").reduce((s: number, t: any) => s + Number(t.amount), 0);

      return {
        balance: totalIncome - totalExpenses,
        totalIncome, totalExpenses,
        monthlyIncome, monthlyExpenses,
        totalTransactions: transactions.length,
        totalGoals: goals.length,
        totalDebts: debts.length,
      };
    }

    case "getExpensesByCategory": {
      const { data } = await supabase.from("transactions").select("*").eq("user_id", userId).eq("type", "expense");
      const byCategory: Record<string, number> = {};
      for (const t of (data || []) as any[]) {
        byCategory[t.category] = (byCategory[t.category] || 0) + Number(t.amount);
      }
      return Object.entries(byCategory)
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount);
    }

    case "getGoals": {
      const { data } = await supabase.from("goals").select("*").eq("user_id", userId);
      return ((data || []) as any[]).map((g: any) => ({
        title: g.title,
        targetAmount: Number(g.target_amount),
        currentAmount: Number(g.current_amount),
        progress: Math.min(Math.round((Number(g.current_amount) / Number(g.target_amount)) * 100), 100),
        deadline: g.deadline,
      }));
    }

    case "getDebts": {
      const [debtsResult, installmentsResult] = await Promise.all([
        supabase.from("debts").select("*").eq("user_id", userId),
        supabase.from("debt_installments").select("*, debts!inner(user_id)").eq("debts.user_id", userId),
      ]);
      return ((debtsResult.data || []) as any[]).map((d: any) => ({
        name: d.name,
        totalAmount: Number(d.total_amount),
        paidInstallments: d.paid_installments,
        totalInstallments: d.total_installments,
        installmentAmount: Number(d.installment_amount),
        progress: Math.min(Math.round((Number(d.paid_installments) / Number(d.total_installments)) * 100), 100),
      }));
    }

    case "getRecentTransactions": {
      const limit = args.limit || 10;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { data } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .gte("date", thirtyDaysAgo.toISOString().split("T")[0])
        .order("date", { ascending: false })
        .limit(limit);
      return ((data || []) as any[]).map((t: any) => ({
        type: t.type, amount: Number(t.amount), category: t.category, description: t.description, date: t.date,
      }));
    }

    case "createTransaction": {
      const { error } = await supabase.from("transactions").insert({
        user_id: userId,
        type: args.type,
        amount: args.amount,
        category: args.category,
        description: args.description,
        date: args.date || new Date().toISOString().split("T")[0],
      });
      return { success: !error, error: error?.message };
    }

    default:
      return { error: "Função desconhecida" };
  }
}

const systemPrompt = `Você é o assistente financeiro do Meu Bolso Pro, um app de finanças pessoais.
Ajude o usuário a analisar gastos, criar transações, acompanhar metas e dívidas.
Sempre responda em português brasileiro de forma amigável e direta.
Use as funções disponíveis para buscar dados ou criar transações quando o usuário solicitar.
Seja proativo em sugerir análises e dicas financeiras.`;

async function callGemini(contents: any[], tools?: any) {
  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents,
      systemInstruction: { parts: [{ text: systemPrompt }] },
      tools: tools || [toolDefinitions],
    }),
  });
  const json = await res.json();
  if (!json.candidates?.length) {
    throw new Error(json.error?.message || "Erro ao processar mensagem");
  }
  return json;
}

const AIAssistant = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      content: `Olá, ${user?.name || 'usuário'}! Sou seu assistente financeiro inteligente. Posso te ajudar a analisar seus gastos, criar transações, acompanhar suas metas e muito mais. Como posso te ajudar hoje?`,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    const text = inputMessage.trim();
    if (!text || isLoading || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const history = messages.slice(-20).map(m => ({
        role: m.role,
        parts: [{ text: m.content }],
      }));

      const contents = [
        ...history,
        { role: "user", parts: [{ text }] },
      ];

      const response = await callGemini(contents);
      let part = response.candidates[0].content.parts[0];

      if (part.functionCall) {
        const fc = part.functionCall;
        const result = await executeTool(fc.name, fc.args || {}, user.id);

        const secondResponse = await callGemini([
          ...contents,
          { role: "model", parts: [{ functionCall: { name: fc.name, args: fc.args } }] },
          { role: "user", parts: [{ functionResponse: { name: fc.name, response: result } }] },
        ]);

        part = secondResponse.candidates[0].content.parts[0];
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: part.text || "Operação realizada com sucesso!",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Não foi possível processar sua mensagem.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    { text: "Onde gastei mais?", icon: TrendingDown },
    { text: "Como economizar?", icon: TrendingUp },
    { text: "Qual meu saldo?", icon: Bot },
    { text: "Resumo financeiro", icon: Target }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Assistente IA</h1>
        <p className="text-muted-foreground">
          Conversa inteligente sobre suas finanças com Gemini AI
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Perguntas Rápidas</CardTitle>
          <CardDescription>
            Clique em uma pergunta ou digite sua própria mensagem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {quickQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="h-auto p-3 flex flex-col items-center space-y-2"
                onClick={() => setInputMessage(question.text)}
              >
                <question.icon className="w-4 h-4" />
                <span className="text-xs text-center">{question.text}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bot className="w-5 h-5 mr-2 text-primary" />
            Chat com IA
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.role === 'model' && (
                    <Bot className="w-4 h-4 mt-1 flex-shrink-0 text-primary" />
                  )}
                  <div>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted text-muted-foreground p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-primary" />
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Pensando...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Digite sua pergunta sobre finanças..."
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
              disabled={isLoading}
            />
            <Button onClick={handleSendMessage} disabled={!inputMessage.trim() || isLoading}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <MessageCircle className="w-5 h-5 text-primary mt-1" />
            <div>
              <h3 className="font-medium mb-2">💡 O que a IA pode fazer agora</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Analisar gastos:</strong> "Onde gastei mais este mês?"</li>
                <li>• <strong>Criar transações:</strong> "Registre uma despesa de R$ 50 de transporte"</li>
                <li>• <strong>Ver saldo:</strong> "Qual meu saldo atual?"</li>
                <li>• <strong>Acompanhar metas e dívidas:</strong> "Como estão minhas metas?"</li>
                <li>• <strong>Dicas de economia:</strong> "Como posso economizar?"</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAssistant;