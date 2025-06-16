
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { formatCurrency } from '@/utils/reportUtils';

interface ReportSummaryCardsProps {
  income: number;
  expenses: number;
  balance: number;
  incomeTransactionsCount: number;
  expenseTransactionsCount: number;
}

const ReportSummaryCards: React.FC<ReportSummaryCardsProps> = ({
  income,
  expenses,
  balance,
  incomeTransactionsCount,
  expenseTransactionsCount
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
            {formatCurrency(income)}
          </div>
          <p className="text-xs text-muted-foreground">
            {incomeTransactionsCount} transações
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
            {formatCurrency(expenses)}
          </div>
          <p className="text-xs text-muted-foreground">
            {expenseTransactionsCount} transações
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo</CardTitle>
          <BarChart3 className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${balance >= 0 ? 'text-secondary' : 'text-destructive'}`}>
            {formatCurrency(balance)}
          </div>
          <p className="text-xs text-muted-foreground">
            {balance >= 0 ? 'Superávit' : 'Déficit'} no período
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportSummaryCards;
