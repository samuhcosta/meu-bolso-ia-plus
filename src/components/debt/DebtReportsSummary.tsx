
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingDown, TrendingUp, Target } from 'lucide-react';
import { formatCurrency } from '@/utils/debtReportUtils';

interface DebtReportsSummaryProps {
  totalDebts: number;
  totalPaid: number;
  totalRemaining: number;
  overallProgress: number;
  debtsCount: number;
}

const DebtReportsSummary: React.FC<DebtReportsSummaryProps> = ({
  totalDebts,
  totalPaid,
  totalRemaining,
  overallProgress,
  debtsCount
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Dívidas</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalDebts)}</div>
          <p className="text-xs text-muted-foreground">
            {debtsCount} dívida{debtsCount !== 1 ? 's' : ''} ativa{debtsCount !== 1 ? 's' : ''}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor Pago</CardTitle>
          <TrendingDown className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</div>
          <p className="text-xs text-muted-foreground">
            {Math.round(overallProgress)}% do total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Restante</CardTitle>
          <TrendingUp className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{formatCurrency(totalRemaining)}</div>
          <p className="text-xs text-muted-foreground">
            {Math.round(100 - overallProgress)}% restante
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Progresso Geral</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Math.round(overallProgress)}%</div>
          <Progress value={overallProgress} className="mt-2" />
        </CardContent>
      </Card>
    </div>
  );
};

export default DebtReportsSummary;
