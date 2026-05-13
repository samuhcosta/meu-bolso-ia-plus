
import { Transaction } from '@/contexts/FinancialContext';

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const getFilteredTransactions = (
  transactions: Transaction[],
  selectedYear: string,
  selectedMonth: string,
  selectedDay: string
) => {
  const year = parseInt(selectedYear);

  return transactions.filter(t => {
    const date = new Date(t.date);

    if (date.getFullYear() !== year) return false;
    if (selectedMonth !== 'all' && date.getMonth() !== parseInt(selectedMonth)) return false;
    if (selectedDay !== 'all' && date.getDate() !== parseInt(selectedDay)) return false;

    return true;
  });
};

export const calculateReportMetrics = (filteredTransactions: Transaction[]) => {
  const income = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income - expenses;

  const categoryExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as { [key: string]: number });

  const topCategories = Object.entries(categoryExpenses)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  return {
    income,
    expenses,
    balance,
    categoryExpenses,
    topCategories
  };
};

export const getMonthlyData = (transactions: Transaction[], selectedYear: string, selectedMonth: string) => {
  const months = selectedMonth !== 'all' ? [parseInt(selectedMonth)] : Array.from({ length: 12 }, (_, i) => i);

  return months.map(month => {
    const monthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === month && date.getFullYear() === parseInt(selectedYear);
    });

    const monthIncome = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthExpenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      month: new Date(2024, month).toLocaleDateString('pt-BR', { month: 'short' }),
      income: monthIncome,
      expenses: monthExpenses,
      balance: monthIncome - monthExpenses
    };
  });
};
