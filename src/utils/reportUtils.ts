
import { Transaction } from '@/contexts/FinancialContext';

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const getFilteredTransactions = (
  transactions: Transaction[],
  selectedPeriod: string,
  selectedYear: string
) => {
  const now = new Date();
  const year = parseInt(selectedYear);
  
  return transactions.filter(t => {
    const date = new Date(t.date);
    const transactionYear = date.getFullYear();
    
    if (transactionYear !== year) return false;
    
    switch (selectedPeriod) {
      case 'current-month':
        return date.getMonth() === now.getMonth() && transactionYear === now.getFullYear();
      case 'last-month':
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
        return date.getMonth() === lastMonth.getMonth() && transactionYear === lastMonth.getFullYear();
      case 'current-year':
        return transactionYear === year;
      default:
        return true;
    }
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

export const getMonthlyData = (transactions: Transaction[], selectedYear: string) => {
  return Array.from({ length: 12 }, (_, i) => {
    const month = i;
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
