import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Bot, Send, TrendingUp, TrendingDown, Target, Loader2, LineChart } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL = 'gemini-2.5-flash';

async function callGemini(contents: any[]): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents }),
  });
  const json = await res.json();
  if (!json.candidates?.length) {
    throw new Error(json.error?.message || 'Erro ao processar');
  }
  let text = json.candidates[0].content.parts[0]?.text || '';
  text = text.replace(/\*\*(.*?)\*\*/g, '$1');
  text = text.replace(/___?(.*?)___?/g, '$1');
  text = text.replace(/^[ \t]*\*[ \t]+/gm, '• ');
  text = text.replace(/^[ \t]*-[ \t]+/gm, '• ');
  return text;
}

async function fetchContext(userId: string) {
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
  for (const t of monthly.filter((t: any) => t.type === "expense")) {
    cats[t.category] = (cats[t.category] || 0) + Number(t.amount);
  }
  const topCats = Object.entries(cats).sort((a: any, b: any) => b[1] - a[1]).slice(0, 5);

  const goalsData = (goals as any[]).map((g: any) => ({
    t: g.title,
    a: Number(g.current_amount),
    m: Number(g.target_amount),
    p: Math.min(Math.round((Number(g.current_amount) / Number(g.target_amount)) * 100), 100),
  }));

  const debtsData = (debts as any[]).map((d: any) => ({
    n: d.name,
    t: Number(d.total_amount),
    pp: d.paid_installments,
    tp: d.total_installments,
  }));

  return JSON.stringify({
    b: allIncome - allExpenses,
    ri: allIncome,
    re: allExpenses,
    mi: monthlyIncome,
    me: monthlyExpenses,
    ct: topCats.map(([c, a]: any) => ({ c, a })),
    g: goalsData,
    d: debtsData,
    tx: tx.length,
  });
}

const AIAssistant = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Olá! Sou seu **Analista Financeiro Estratégico**. Posso analisar seus gastos, metas e dívidas, além de sugerir estratégias. O que você gostaria de saber?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const contextRef = useRef<{ data: string; time: number } | null>(null);
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
      // Cache context for 60s to avoid re-fetching on every message
      if (!contextRef.current || Date.now() - contextRef.current.time > 60000) {
        contextRef.current = { data: await fetchContext(user.id), time: Date.now() };
      }

      const history = messages.slice(-4).filter(m => m.content.length < 500).map(m => ({
        role: m.role === 'user' ? 'user' as const : 'model' as const,
        parts: [{ text: m.content }],
      }));

      const isFirstQuery = messages.length <= 1;

      const prompt = isFirstQuery
        ? `Analista financeiro. Dados do usuario (JSON): ${contextRef.current.data}

Responda com analises e estrategias sobre gastos, receitas, metas e dividas.
Nunca crie, altere ou exclua dados.
Tom profissional, resposta curta e objetiva em portugues.`

        : `(Contexto ja enviado anteriormente. Responda a pergunta do usuario com base na conversa.)`;

      const reply = await callGemini([
        ...(isFirstQuery
          ? [{ role: 'model' as const, parts: [{ text: 'Ok, tenho os dados. Vou analisar.' }] }]
          : []),
        ...history,
        { role: 'user', parts: [{ text: isFirstQuery ? text : `[historico acima] ${text}` }] },
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
    { text: "Análise completa", icon: LineChart },
    { text: "Onde gastei mais?", icon: TrendingDown },
    { text: "Como economizar?", icon: TrendingUp },
    { text: "Saúde das metas", icon: Target },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Assistente IA</h1>
        <p className="text-muted-foreground">Analista financeiro estratégico para suas finanças</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Análises Rápidas</CardTitle><CardDescription>Clique em um tema ou faça sua própria pergunta</CardDescription></CardHeader>
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
        <CardHeader><CardTitle className="flex items-center gap-2"><Bot className="w-5 h-5 text-primary" />Assistente Financeiro Estratégico</CardTitle></CardHeader>
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
                <Bot className="w-4 h-4 text-primary" /><Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Analisando dados...</span>
              </div>
            </div>
          )}
          <div ref={ref} />
        </CardContent>
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Ex: Analise meus gastos do mês..." onKeyDown={e => e.key === 'Enter' && handleSend()} disabled={loading} />
            <Button onClick={handleSend} disabled={!input.trim() || loading}><Send className="w-4 h-4" /></Button>
          </div>
        </div>
      </Card>

      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <LineChart className="w-5 h-5 text-primary mt-1" />
            <div>
              <h3 className="font-medium mb-2">📊 O que este assistente faz</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Análise detalhada de gastos por categoria</li>
                <li>• Diagnóstico da saúde financeira e tendências</li>
                <li>• Estratégias personalizadas de economia</li>
                <li>• Acompanhamento de metas e dívidas</li>
                <li>• Sugestões de orçamento e planejamento</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAssistant;