
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface FinancialSummaryProps {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  incomeTransactions: number;
  expenseTransactions: number;
  totalTransactions: number;
  formatCurrency: (value: number) => string;
}

const FinancialSummary: React.FC<FinancialSummaryProps> = ({
  totalIncome,
  totalExpenses,
  balance,
  incomeTransactions,
  expenseTransactions,
  totalTransactions,
  formatCurrency
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receitas</CardTitle>
          <TrendingUp className="h-4 w-4 text-secondary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-secondary">
            {formatCurrency(totalIncome)}
          </div>
          <p className="text-xs text-muted-foreground">
            {incomeTransactions} transações
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Despesas</CardTitle>
          <TrendingDown className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">
            {formatCurrency(totalExpenses)}
          </div>
          <p className="text-xs text-muted-foreground">
            {expenseTransactions} transações
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${
            balance >= 0 ? 'text-secondary' : 'text-destructive'
          }`}>
            {formatCurrency(balance)}
          </div>
          <p className="text-xs text-muted-foreground">
            {totalTransactions} transações no total
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialSummary;
