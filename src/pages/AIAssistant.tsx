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

async function fetchContext(userId: string) {
  const [transactions, goals, debts, installments] = await Promise.all([
    supabase.from("transactions").select("*").eq("user_id", userId).then(r => r.data || []),
    supabase.from("goals").select("*").eq("user_id", userId).then(r => r.data || []),
    supabase.from("debts").select("*").eq("user_id", userId).then(r => r.data || []),
    supabase.from("debt_installments").select("*, debts!inner(user_id)").eq("debts.user_id", userId).then(r => r.data || []),
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

  const monthlyCats: Record<string, number> = {};
  for (const t of monthly.filter((t: any) => t.type === "expense")) {
    monthlyCats[t.category] = (monthlyCats[t.category] || 0) + Number(t.amount);
  }
  const topMonthlyCats = Object.entries(monthlyCats).sort((a: any, b: any) => b[1] - a[1]).slice(0, 5);

  const goalsData = (goals as any[]).map((g: any) => ({
    titulo: g.title,
    atual: Number(g.current_amount),
    meta: Number(g.target_amount),
    progresso: Math.min(Math.round((Number(g.current_amount) / Number(g.target_amount)) * 100), 100),
    prazo: g.deadline,
  }));

  const debtsData = (debts as any[]).map((d: any) => ({
    nome: d.name,
    total: Number(d.total_amount),
    valor_parcela: Number(d.installment_amount),
    parcelas_pagas: d.paid_installments,
    total_parcelas: d.total_installments,
    progresso: Math.min(Math.round((Number(d.paid_installments) / Number(d.total_installments)) * 100), 100),
  }));

  const paidInstallments = (installments as any[]).filter((i: any) => i.is_paid);
  const pendingInstallments = (installments as any[]).filter((i: any) => !i.is_paid);

  return JSON.stringify({
    saldo: allIncome - allExpenses,
    receitas_total: allIncome,
    despesas_total: allExpenses,
    receitas_mes: monthlyIncome,
    despesas_mes: monthlyExpenses,
    categorias_geral: topCats.map(([c, a]: any) => ({ categoria: c, valor: a })),
    categorias_mes: topMonthlyCats.map(([c, a]: any) => ({ categoria: c, valor: a })),
    metas: goalsData,
    dividas: debtsData,
    parcelas_pagas: paidInstallments.length,
    parcelas_pendentes: pendingInstallments.length,
    total_transacoes: tx.length,
  });
}

const AIAssistant = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Olá, ${user?.name || 'usuário'}! 👋

Sou seu **Assistente Financeiro Estratégico**. Minha função é analisar seus dados financeiros, identificar oportunidades de melhoria e sugerir estratégias personalizadas para você organizar suas finanças.

📊 *Posso ajudar com:* análises de gastos, tendências financeiras, saúde das suas metas, status das dívidas e dicas de economia baseadas no seu perfil.

**Como posso te ajudar hoje?**`,
      timestamp: new Date()
    }
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
      const context = await fetchContext(user.id);

      const history = messages.slice(-8).filter(m => m.content.length < 500).map(m => ({
        role: m.role === 'user' ? 'user' as const : 'model' as const,
        parts: [{ text: m.content }],
      }));

      const prompt = `Você é um Analista Financeiro Estratégico sênior, especialista em finanças pessoais.

Você recebeu os dados financeiros do usuário em formato JSON. Sua função é EXCLUSIVAMENTE analisar, interpretar e sugerir estratégias — você NUNCA cria, altera ou exclui nenhum dado.

## Dados do usuário:
${context}

## Regras:
1. Analise os dados com profundidade — não se limite a repetir os números
2. Identifique padrões, tendências e oportunidades de melhoria
3. Sugira estratégias personalizadas baseadas nos hábitos reais do usuário
4. Quando relevante, compare gastos atuais com meses anteriores
5. Aponte riscos (ex: muitas parcelas pendentes, gastos altos em categorias não essenciais)
6. Seja motivador mas honesto — se a situação financeira precisar de atenção, diga com clareza
7. Responda em português brasileiro, tom profissional e amigável
8. Use formatação simples com marcadores quando ajudar na legibilidade`;

      const reply = await callGemini([
        { role: 'user', parts: [{ text: prompt }] },
        { role: 'model', parts: [{ text: 'Compreendo os dados. Estou pronto para analisar e sugerir estratégias financeiras personalizadas.' }] },
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