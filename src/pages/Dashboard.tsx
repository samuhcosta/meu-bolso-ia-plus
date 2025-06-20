
import React from 'react';
import { useDebt } from '@/contexts/DebtContext';
import { useFinancial } from '@/contexts/FinancialContext';
import { useAuth } from '@/contexts/AuthContext';
import FinancialSummaryCards from '@/components/dashboard/FinancialSummaryCards';
import DebtsSummaryCard from '@/components/dashboard/DebtsSummaryCard';
import MonthlyFlowChart from '@/components/dashboard/MonthlyFlowChart';
import EmptyStateCard from '@/components/dashboard/EmptyStateCard';
import SectionErrorFallback from '@/components/dashboard/SectionErrorFallback';
import { Skeleton } from '@/components/ui/skeleton';
import ErrorBoundary from '@/components/ErrorBoundary';

const Dashboard = () => {
  const { user } = useAuth();
  const { debts, installments, loading: debtsLoading } = useDebt();
  const { transactions, isLoading: financialLoading } = useFinancial();

  console.log('📊 Dashboard - Renderizando dashboard para:', user?.name);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Calcular dados financeiros do mês atual
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const currentMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === currentMonth && 
           transactionDate.getFullYear() === currentYear;
  });

  const totalIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = totalIncome - totalExpenses;

  // Dados para o gráfico dos últimos 3 meses
  const getMonthlyData = () => {
    const months = [];
    for (let i = 2; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - i, 1);
      const monthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === date.getMonth() && 
               transactionDate.getFullYear() === date.getFullYear();
      });

      const monthIncome = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const monthExpenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      months.push({
        month: date.toLocaleDateString('pt-BR', { month: 'short' }),
        receitas: monthIncome,
        despesas: monthExpenses
      });
    }
    return months;
  };

  const monthlyData = getMonthlyData();
  const hasTransactions = transactions.length > 0;
  const hasDebts = debts.length > 0;
  const isLoading = debtsLoading || financialLoading;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <Skeleton className="h-10 w-96 mx-auto" />
          <Skeleton className="h-6 w-80 mx-auto" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header personalizado */}
      <ErrorBoundary fallback={<SectionErrorFallback sectionName="cabeçalho" />}>
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Meu Bolso Pro
          </h1>
          <p className="text-xl text-muted-foreground">
            Olá, {user?.name}! Aqui está um resumo da sua saúde financeira deste mês.
          </p>
        </div>
      </ErrorBoundary>

      {/* Resumo Financeiro */}
      <ErrorBoundary fallback={<SectionErrorFallback sectionName="resumo financeiro" />}>
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">📊 Resumo Financeiro</h2>
          {hasTransactions ? (
            <FinancialSummaryCards
              totalIncome={totalIncome}
              totalExpenses={totalExpenses}
              balance={balance}
              formatCurrency={formatCurrency}
            />
          ) : (
            <EmptyStateCard type="transactions" />
          )}
        </div>
      </ErrorBoundary>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resumo de Dívidas */}
        <ErrorBoundary fallback={<SectionErrorFallback sectionName="resumo de dívidas" />}>
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">🧱 Dívidas</h2>
            {hasDebts ? (
              <DebtsSummaryCard
                debts={debts}
                installments={installments}
                formatCurrency={formatCurrency}
              />
            ) : (
              <EmptyStateCard type="debts" />
            )}
          </div>
        </ErrorBoundary>

        {/* Gráfico de Fluxo Mensal */}
        <ErrorBoundary fallback={<SectionErrorFallback sectionName="fluxo mensal" />}>
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">📅 Fluxo Mensal</h2>
            <MonthlyFlowChart
              data={monthlyData}
              formatCurrency={formatCurrency}
            />
          </div>
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default Dashboard;
