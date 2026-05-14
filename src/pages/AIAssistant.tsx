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
const MODEL = 'gemini-2.0-flash';

async function callGemini(contents: any[]): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents }),
  });
  const json = await res.json();
  if (!json.candidates?.length) {
    throw new Error(json.error?.message || 'Erro ao processar mensagem');
  }
  return json.candidates[0].content.parts[0]?.text || '';
}

async function getContext(userId: string) {
  const [transactions, goals, debts] = await Promise.all([
    supabase.from("transactions").select("*").eq("user_id", userId).then(r => r.data || []),
    supabase.from("goals").select("*").eq("user_id", userId).then(r => r.data || []),
    supabase.from("debts").select("*").eq("user_id", userId).then(r => r.data || []),
  ]);

  const tx = transactions as any[];
  const allIncome = tx.filter((t: any) => t.type === "income").reduce((s: number, t: any) => s + Number(t.amount), 0);
  const allExpenses = tx.filter((t: any) => t.type === "expense").reduce((s: number, t: any) => s + Number(t.amount), 0);

  const now = new Date();
  const monthly = tx.filter((t: any) => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthlyIncome = monthly.filter((t: any) => t.type === "income").reduce((s: number, t: any) => s + Number(t.amount), 0);
  const monthlyExpenses = monthly.filter((t: any) => t.type === "expense").reduce((s: number, t: any) => s + Number(t.amount), 0);

  const cats: Record<string, number> = {};
  for (const t of tx.filter((t: any) => t.type === "expense")) {
    cats[t.category] = (cats[t.category] || 0) + Number(t.amount);
  }
  const topCats = Object.entries(cats).sort((a: any, b: any) => b[1] - a[1]).slice(0, 5);

  const goalsData = (goals as any[]).map((g: any) => ({
    titulo: g.title,
    atual: Number(g.current_amount),
    meta: Number(g.target_amount),
    progresso: Math.min(Math.round((Number(g.current_amount) / Number(g.target_amount)) * 100), 100),
  }));

  const debtsData = (debts as any[]).map((d: any) => ({
    nome: d.name,
    total: Number(d.total_amount),
    pago: d.paid_installments,
    parcelas: d.total_installments,
  }));

  return JSON.stringify({
    saldo: allIncome - allExpenses,
    receitas_total: allIncome,
    despesas_total: allExpenses,
    receitas_mes: monthlyIncome,
    despesas_mes: monthlyExpenses,
    top_categorias: topCats.map(([c, a]: any) => ({ categoria: c, valor: a })),
    metas: goalsData,
    dividas: debtsData,
  });
}

const AIAssistant = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: `Olá, ${user?.name || 'usuário'}! Como posso ajudar com suas finanças?`, timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { ref.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading || !user) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() };
    setMessages(p => [...p, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const lower = text.toLowerCase();
      let result = '';

      // Detect "criar / registrar transação"
      const createMatch = text.match(/(?:registre|crie|criar|adicionar|adiciona|lançar|inserir)\s+(?:uma\s+)?(?:receita|entrada|ganho|despesa|gasto|saída)/i);
      const amountMatch = text.match(/(?:R?\$?\s*)?(\d+(?:[.,]\d{1,2})?)/);
      if (createMatch && amountMatch) {
        const amount = parseFloat(amountMatch[1].replace(',', '.'));
        const isIncome = /receita|entrada|ganho|renda/i.test(text);
        const category = ['transporte', 'alimentação', 'lazer', 'saúde', 'educação', 'moradia', 'assinatura', 'compras', 'salário', 'freela']
          .find(k => text.toLowerCase().includes(k)) || 'Outros';

        const { error } = await supabase.from("transactions").insert({
          user_id: user.id, type: isIncome ? 'income' : 'expense', amount, category,
          description: text.substring(0, 100),
          date: new Date().toISOString().split('T')[0],
        });

        if (error) throw new Error(error.message);
        result = `✅ ${isIncome ? 'Receita' : 'Despesa'} de R$ ${amount.toFixed(2).replace('.', ',')} registrada em "${category}"!`;
      }

      // Detect "adicionar valor à meta"
      const goalAddMatch = text.match(/(?:adiciona|adicionar|colocar|coloca|acrescenta|aumenta)\s+(?:mais\s+)?(?:R?\$?\s*)?(\d+(?:[.,]\d{1,2})?)\s*(?:reais)?\s*(?:na|em|para|à)\s*(?:minha|meta|objetivo)/i);
      if (goalAddMatch) {
        const value = parseFloat(goalAddMatch[1].replace(',', '.'));
        const { data: goals } = await supabase.from("goals").select("*").eq("user_id", user.id);
        if (goals && goals.length > 0) {
          const goal = goals[0];
          await supabase.from("goals").update({ current_amount: Number(goal.current_amount) + value }).eq("id", goal.id);
          result = `✅ Adicionado R$ ${value.toFixed(2).replace('.', ',')} à meta "${goal.title}"!`;
        } else {
          result = '❌ Você não tem nenhuma meta criada. Vá em Metas para criar uma primeiro.';
        }
      }

      if (result) {
        const msg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: result, timestamp: new Date() };
        setMessages(p => [...p, msg]);
        setLoading(false);
        return;
      }

      // Query mode: send to Gemini with context
      const context = await getContext(user.id);
      const history = messages.slice(-8).filter(m => m.content.length < 500).map(m => ({
        role: m.role === 'user' ? 'user' as const : 'model' as const,
        parts: [{ text: m.content }],
      }));

      const prompt = `Você é um assistente financeiro. Dados do usuário (JSON): ${context}

Com base nesses dados, responda perguntas sobre saldo, gastos, categorias, metas e dívidas.
Se perguntarem como economizar, dê dicas personalizadas baseadas nos gastos reais.
Responda em português brasileiro de forma amigável e curta.`;

      const reply = await callGemini([
        { role: 'user', parts: [{ text: prompt }] },
        { role: 'model', parts: [{ text: 'Entendi! Tenho os dados financeiros.' }] },
        ...history,
        { role: 'user', parts: [{ text }] },
      ]);

      const msg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: reply, timestamp: new Date() };
      setMessages(p => [...p, msg]);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message || "Erro ao processar.", variant: "destructive" });
    } finally {
      setLoading(false);
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
      <div><h1 className="text-3xl font-bold">Assistente IA</h1><p className="text-muted-foreground">Converse sobre suas finanças</p></div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Perguntas Rápidas</CardTitle><CardDescription>Clique ou digite sua mensagem</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {quickQuestions.map((q, i) => (
              <Button key={i} variant="outline" size="sm" className="h-auto p-3 flex flex-col items-center space-y-2" onClick={() => setInput(q.text)}>
                <q.icon className="w-4 h-4" /><span className="text-xs text-center">{q.text}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="h-[600px] flex flex-col">
        <CardHeader><CardTitle className="flex items-center"><Bot className="w-5 h-5 mr-2 text-primary" />Chat com IA</CardTitle></CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-4">
          {messages.map(m => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-lg ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                <div className="flex items-start space-x-2">
                  {m.role === 'assistant' && <Bot className="w-4 h-4 mt-1 flex-shrink-0 text-primary" />}
                  <div>
                    <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                    <p className="text-xs opacity-70 mt-1">{m.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-muted text-muted-foreground p-3 rounded-lg flex items-center gap-2">
                <Bot className="w-4 h-4 text-primary" /><Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Processando...</span>
              </div>
            </div>
          )}
          <div ref={ref} />
        </CardContent>
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Digite sua pergunta..." onKeyDown={e => e.key === 'Enter' && handleSend()} disabled={loading} />
            <Button onClick={handleSend} disabled={!input.trim() || loading}><Send className="w-4 h-4" /></Button>
          </div>
        </div>
      </Card>

      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <MessageCircle className="w-5 h-5 text-primary mt-1" />
            <div>
              <h3 className="font-medium mb-2">💡 Exemplos</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• "Onde gastei mais este mês?"</li>
                <li>• "Registre uma despesa de R$ 50 de transporte"</li>
                <li>• "Adicione mais R$ 100 na minha meta"</li>
                <li>• "Qual meu saldo?" ou "Resumo financeiro"</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAssistant;