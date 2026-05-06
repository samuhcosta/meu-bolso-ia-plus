
import React, { useMemo } from 'react';
import { useFinancial } from '@/contexts/FinancialContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Target, 
  CreditCard, 
  AlertCircle, 
  Info,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';
import MonthlyFlowChart from '@/components/dashboard/MonthlyFlowChart';
import SectionErrorFallback from '@/components/dashboard/SectionErrorFallback';
import { Skeleton } from '@/components/ui/skeleton';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const { transactions, goals, debts, installments, getBalance, isLoading } = useFinancial();

  const balances = useMemo(() => getBalance(), [transactions, goals, debts, installments]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getIntelligenceMessage = () => {
    if (balances.reservedGoals > 0) {
      return {
        text: `Você tem ${formatCurrency(balances.reservedGoals)} reservados em suas metas. Esse valor não consta no seu saldo disponível para gastos.`,
        type: 'info',
        icon: Target
      };
    }
    if (balances.committedValues > balances.availableBalance) {
      return {
        text: `Atenção: Seus valores comprometidos superam seu saldo disponível. Revise seus gastos.`,
        type: 'warning',
        icon: AlertCircle
      };
    }
    return {
      text: `Seu planejamento financeiro está em dia! Você pagou ${formatCurrency(balances.paidDebts)} em dívidas este mês.`,
      type: 'success',
      icon: CheckCircle2
    };
  };

  const intel = getIntelligenceMessage();

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-48 lg:col-span-2 rounded-3xl" />
          <Skeleton className="h-48 rounded-3xl" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Welcome & Total Balance Hero */}
      <div className="flex flex-col lg:flex-row gap-6">
        <Card className="flex-1 bg-gradient-to-br from-primary to-primary/80 border-none shadow-2xl shadow-primary/20 rounded-[2rem] overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
            <Wallet size={120} />
          </div>
          <CardContent className="p-8 lg:p-10 relative z-10">
            <div className="flex items-center gap-2 text-primary-foreground/80 mb-2 font-medium">
              <div className="h-2 w-2 rounded-full bg-primary-foreground animate-pulse" />
              Total em Conta
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold text-primary-foreground tracking-tight mb-4">
              {formatCurrency(balances.balance)}
            </h2>
            <div className="flex flex-wrap gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/10">
                <p className="text-[10px] uppercase tracking-wider text-primary-foreground/60 font-bold">Livre para uso durante o mês</p>
                <p className="font-semibold text-primary-foreground">{formatCurrency(balances.balance - balances.reservedGoals)}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/10">
                <p className="text-[10px] uppercase tracking-wider text-primary-foreground/60 font-bold">Comprometido (Parcelas)</p>
                <p className="font-semibold text-primary-foreground">{formatCurrency(balances.committedValues)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Intelligence Message */}
        <Card className="lg:w-80 bg-card border-border/50 rounded-[2rem] shadow-xl p-8 flex flex-col justify-between">
          <div>
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-6 ${
              intel.type === 'warning' ? 'bg-amber-500/10 text-amber-500' : 
              intel.type === 'info' ? 'bg-primary/10 text-primary' : 'bg-green-500/10 text-green-500'
            }`}>
              <intel.icon className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">Visão Inteligente</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {intel.text}
            </p>
          </div>
          <Link to="/reports" className="flex items-center gap-2 text-primary text-sm font-bold mt-6 group">
            Ver relatórios <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Card>
      </div>

      {/* Mini Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/finances?type=income" className="block transition-transform hover:scale-[1.02]">
          <Card className="bg-card hover:bg-card/80 border-border/50 rounded-3xl transition-all group overflow-hidden relative h-full">
            <div className="absolute top-0 right-0 p-4 text-green-500/10 group-hover:text-green-500/20 transition-colors">
              <TrendingUp size={40} />
            </div>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground mb-1">Entradas (Mês)</p>
              <p className="text-2xl font-bold text-green-500">{formatCurrency(balances.income)}</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/finances?type=expense" className="block transition-transform hover:scale-[1.02]">
          <Card className="bg-card hover:bg-card/80 border-border/50 rounded-3xl transition-all group overflow-hidden relative h-full">
            <div className="absolute top-0 right-0 p-4 text-red-500/10 group-hover:text-red-500/20 transition-colors">
              <TrendingDown size={40} />
            </div>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground mb-1">Saídas (Mês)</p>
              <p className="text-2xl font-bold text-red-500">{formatCurrency(balances.expenses)}</p>
            </CardContent>
          </Card>
        </Link>

        <Card className="bg-card hover:bg-card/80 border-border/50 rounded-3xl transition-all group overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 text-primary/10 group-hover:text-primary/20 transition-colors">
            <Target size={40} />
          </div>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground mb-1">Reservado Metas</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(balances.reservedGoals)}</p>
          </CardContent>
        </Card>

        <Card className="bg-card hover:bg-card/80 border-border/50 rounded-3xl transition-all group overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 text-amber-500/10 group-hover:text-amber-500/20 transition-colors">
            <CreditCard size={40} />
          </div>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground mb-1">Dívidas Ativas</p>
            <p className="text-2xl font-bold text-amber-500">{formatCurrency(balances.committedValues)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 bg-card border-border/50 rounded-[2rem] overflow-hidden">
          <CardHeader className="p-8 pb-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Fluxo de Caixa</CardTitle>
                <p className="text-sm text-muted-foreground">Comparativo de entradas e saídas</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 text-xs font-medium">
                  <div className="h-3 w-3 rounded-full bg-primary" /> Receitas
                </div>
                <div className="flex items-center gap-2 text-xs font-medium">
                  <div className="h-3 w-3 rounded-full bg-red-500" /> Despesas
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="h-72 w-full">
              <ErrorBoundary fallback={<SectionErrorFallback sectionName="fluxo mensal" />}>
                <MonthlyFlowChart
                  data={(() => {
                    const months = [];
                    const now = new Date();
                    for (let i = 2; i >= 0; i--) {
                      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                      const mTransactions = transactions.filter(t => {
                        const td = new Date(t.date);
                        return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear();
                      });
                      months.push({
                        month: d.toLocaleDateString('pt-BR', { month: 'short' }),
                        receitas: mTransactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0),
                        despesas: mTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
                      });
                    }
                    return months;
                  })()}
                  formatCurrency={formatCurrency}
                />
              </ErrorBoundary>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 rounded-[2rem] overflow-hidden">
          <CardHeader className="p-8 pb-0">
            <CardTitle className="text-xl">Status de Dívidas</CardTitle>
            <p className="text-sm text-muted-foreground">Progresso de pagamentos</p>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="relative h-48 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-3xl font-bold">{Math.round((balances.paidDebts / (balances.totalDebts || 1)) * 100)}%</span>
                <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">Pago</span>
              </div>
              {/* Simplificando o gráfico de dívidas para um resumo visual */}
              <svg className="h-40 w-40 -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="12"
                  className="text-muted/20"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="12"
                  strokeDasharray={440}
                  strokeDashoffset={440 - (440 * (balances.paidDebts / (balances.totalDebts || 1)))}
                  strokeLinecap="round"
                  className="text-primary"
                />
              </svg>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2"><Clock className="h-4 w-4" /> Restante</span>
                <span className="font-bold">{formatCurrency(balances.committedValues)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Já Pago</span>
                <span className="font-bold text-green-500">{formatCurrency(balances.paidDebts)}</span>
              </div>
            </div>
            <Link to="/debts">
              <Button className="w-full rounded-2xl mt-4 bg-muted hover:bg-muted/80 text-foreground" variant="ghost">
                Gerenciar Dívidas
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
