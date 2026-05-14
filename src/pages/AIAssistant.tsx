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
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.5-flash',
  'gemini-1.5-flash',
];

async function callGemini(contents: any[]): Promise<any> {
  let lastError: any;

  for (const model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents }),
      });
      const json = await res.json();

      if (json.candidates?.length) return json;
      if (json.error?.message?.includes('not found') || json.error?.message?.includes('high demand')) {
        lastError = json.error;
        continue;
      }
      return json;
    } catch (e) {
      lastError = e;
      continue;
    }
  }

  throw new Error(lastError?.message || 'Todos os modelos estão indisponíveis. Tente novamente.');
}

async function fetchFinancialContext(userId: string): Promise<string> {
  const [transactions, goals, debts] = await Promise.all([
    supabase.from("transactions").select("*").eq("user_id", userId).then(r => r.data || []),
    supabase.from("goals").select("*").eq("user_id", userId).then(r => r.data || []),
    supabase.from("debts").select("*").eq("user_id", userId).then(r => r.data || []),
  ]);

  const tx = transactions as any[];
  const totalIncome = tx.filter((t: any) => t.type === "income").reduce((s: number, t: any) => s + Number(t.amount), 0);
  const totalExpenses = tx.filter((t: any) => t.type === "expense").reduce((s: number, t: any) => s + Number(t.amount), 0);

  const now = new Date();
  const monthlyTx = tx.filter((t: any) => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthlyIncome = monthlyTx.filter((t: any) => t.type === "income").reduce((s: number, t: any) => s + Number(t.amount), 0);
  const monthlyExpenses = monthlyTx.filter((t: any) => t.type === "expense").reduce((s: number, t: any) => s + Number(t.amount), 0);

  const byCategory: Record<string, number> = {};
  for (const t of tx.filter((t: any) => t.type === "expense")) {
    byCategory[t.category] = (byCategory[t.category] || 0) + Number(t.amount);
  }
  const topCategories = Object.entries(byCategory)
    .map(([c, a]) => ({ category: c, amount: a }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const goalsData = (goals as any[]).map((g: any) => ({
    title: g.title,
    current: Number(g.current_amount),
    target: Number(g.target_amount),
    progress: Math.min(Math.round((Number(g.current_amount) / Number(g.target_amount)) * 100), 100),
  }));

  const debtsData = (debts as any[]).map((d: any) => ({
    name: d.name,
    total: Number(d.total_amount),
    paidInstallments: d.paid_installments,
    totalInstallments: d.total_installments,
  }));

  return JSON.stringify({
    balance: totalIncome - totalExpenses,
    totalIncome,
    totalExpenses,
    monthlyIncome,
    monthlyExpenses,
    topCategories,
    goals: goalsData,
    debts: debtsData,
    transactionCount: tx.length,
  });
}

async function createTransactionAI(args: any, userId: string): Promise<string> {
  const { error } = await supabase.from("transactions").insert({
    user_id: userId,
    type: args.type,
    amount: args.amount,
    category: args.category,
    description: args.description,
    date: args.date || new Date().toISOString().split("T")[0],
  });
  return error ? `Erro: ${error.message}` : `Transação criada: ${args.type === "income" ? "receita" : "despesa"} de R$ ${args.amount} em "${args.category}" - ${args.description}`;
}

const AIAssistant = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Olá, ${user?.name || 'usuário'}! Sou seu assistente financeiro. Posso analisar gastos, acompanhar metas e dívidas, e criar transações para você. Como posso ajudar?`,
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
      // Check if user wants to create a transaction
      const lowerMsg = text.toLowerCase();
      const createMatch = lowerMsg.match(/(registre|crie|criar|adicionar|adiciona|lançar|lança|inserir|insere|colocar|coloca)\s+(uma\s+)?(receita|entrada|ganho|renda|despesa|gasto|saída|conta|pagamento)/i);
      const expenseKeywords = ['despesa', 'gasto', 'saída', 'conta', 'pagamento', 'transporte', 'alimentação', 'lazer', 'saúde', 'educação', 'moradia', 'assinatura', 'compras'];
      const type = createMatch ? (createMatch[3] ? 'expense' : 'expense') : null;
      const amountMatch = text.match(/(?:R?\$?\s*)?(\d+(?:[.,]\d{1,2})?)/);

      if (createMatch && amountMatch) {
        const amount = parseFloat(amountMatch[1].replace(',', '.'));
        const isIncome = /receita|entrada|ganho|renda/i.test(text);
        const matchedCategory = expenseKeywords.find(k => text.toLowerCase().includes(k)) || 'Outros';
        const result = await createTransactionAI({
          type: isIncome ? 'income' : 'expense',
          amount,
          category: matchedCategory,
          description: text.substring(0, 100),
          date: new Date().toISOString().split('T')[0],
        }, user.id);

        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `✅ ${result}`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        // Fetch context and call Gemini
        const context = await fetchFinancialContext(user.id);

        const history = messages.slice(-10).map(m => ({
          role: m.role === 'user' ? 'user' : 'model' as 'user' | 'model',
          parts: [{ text: m.content }],
        }));

        const systemInstruction = `Você é um assistente financeiro. Dados do usuário (JSON): ${context}

Com base nesses dados, responda perguntas sobre:
- Saldo, receitas e despesas
- Gastos por categoria
- Metas financeiras
- Dívidas e parcelas

Se o usuário pedir para criar uma transação, responda exatamente: "CRIAR_TRANSACAO: <o que ele quer criar>"
Responda em português brasileiro de forma amigável e direta.`;

        const contents = [
          { role: 'user', parts: [{ text: systemInstruction }] },
          { role: 'model', parts: [{ text: 'Entendi! Tenho acesso aos dados financeiros. Posso analisar, responder perguntas e criar transações. Como posso ajudar?' }] },
          ...history,
          { role: 'user', parts: [{ text }] },
        ];

        const json = await callGemini(contents);
        let responseText = json.candidates[0].content.parts[0]?.text || '';

        if (responseText.startsWith('CRIAR_TRANSACAO:')) {
          const desc = responseText.replace('CRIAR_TRANSACAO:', '').trim();
          const newAmountMatch = desc.match(/(?:R?\$?\s*)?(\d+(?:[.,]\d{1,2})?)/);
          const newAmount = newAmountMatch ? parseFloat(newAmountMatch[1].replace(',', '.')) : 0;
          const isExpenseType = expenseKeywords.some(k => desc.toLowerCase().includes(k));
          const cat = expenseKeywords.find(k => desc.toLowerCase().includes(k)) || 'Outros';
          const createResult = await createTransactionAI({
            type: isExpenseType ? 'expense' : 'income',
            amount: newAmount,
            category: cat,
            description: desc,
          }, user.id);

          const finalJson = await callGemini([
            ...contents,
            { role: 'model', parts: [{ text: responseText }] },
            { role: 'user', parts: [{ text: `Resultado: ${createResult}. Explique para o usuário o que foi feito.` }] },
          ]);
          responseText = finalJson.candidates?.[0]?.content?.parts?.[0]?.text || createResult;
        }

        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: responseText,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Não foi possível processar.",
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
        <p className="text-muted-foreground">Converse sobre suas finanças</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Perguntas Rápidas</CardTitle>
          <CardDescription>Clique em uma pergunta ou digite sua própria mensagem</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {quickQuestions.map((question, index) => (
              <Button key={index} variant="outline" size="sm"
                className="h-auto p-3 flex flex-col items-center space-y-2"
                onClick={() => setInputMessage(question.text)}>
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
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-lg ${
                message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                <div className="flex items-start space-x-2">
                  {message.role === 'assistant' && <Bot className="w-4 h-4 mt-1 flex-shrink-0 text-primary" />}
                  <div>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
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
                  <span className="text-sm">Analisando dados...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <Input value={inputMessage} onChange={e => setInputMessage(e.target.value)}
              placeholder="Digite sua pergunta sobre finanças..."
              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              className="flex-1" disabled={isLoading} />
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
              <h3 className="font-medium mb-2">💡 Como usar</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Pergunte: "Onde gastei mais este mês?"</li>
                <li>• Peça: "Registre uma despesa de R$ 50 de transporte"</li>
                <li>• Pergunte: "Qual meu saldo?" ou "Resumo financeiro"</li>
                <li>• Acompanhe: "Como estão minhas metas?"</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAssistant;