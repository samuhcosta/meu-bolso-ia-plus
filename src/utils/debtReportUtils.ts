
import { Debt, DebtInstallment } from '@/types/debt';

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const calculateCategoryData = (debts: Debt[]) => {
  const categoryData = debts.reduce((acc, debt) => {
    const category = debt.category;
    const total = debt.total_amount;
    const paid = debt.paid_installments * debt.installment_amount;
    
    if (!acc[category]) {
      acc[category] = { total: 0, paid: 0, remaining: 0 };
    }
    
    acc[category].total += total;
    acc[category].paid += paid;
    acc[category].remaining += (total - paid);
    
    return acc;
  }, {} as Record<string, { total: number; paid: number; remaining: number }>);

  return Object.entries(categoryData).map(([name, data]) => ({
    name,
    total: data.total,
    paid: data.paid,
    remaining: data.remaining,
    percentage: Math.round((data.paid / data.total) * 100) || 0
  }));
};

export const calculateTotalStats = (debts: Debt[]) => {
  const totalDebts = debts.reduce((sum, debt) => sum + debt.total_amount, 0);
  const totalPaid = debts.reduce((sum, debt) => sum + (debt.paid_installments * debt.installment_amount), 0);
  const totalRemaining = totalDebts - totalPaid;
  const overallProgress = totalDebts > 0 ? (totalPaid / totalDebts) * 100 : 0;

  return {
    totalDebts,
    totalPaid,
    totalRemaining,
    overallProgress
  };
};

export const getMonthlyData = () => {
  // Dados de evolução mensal (simulado - em produção viria do histórico)
  return [
    { month: 'Jan', pago: 1200, restante: 8800 },
    { month: 'Fev', pago: 2400, restante: 7600 },
    { month: 'Mar', pago: 3600, restante: 6400 },
    { month: 'Abr', pago: 4800, restante: 5200 },
    { month: 'Mai', pago: 6000, restante: 4000 },
    { month: 'Jun', pago: 7200, restante: 2800 }
  ];
};

export const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
