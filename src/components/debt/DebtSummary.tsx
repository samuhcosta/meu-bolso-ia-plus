
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CreditCard, 
  Calendar, 
  TrendingUp, 
  AlertTriangle,
  DollarSign,
  CheckCircle
} from 'lucide-react';
import { Debt, DebtInstallment } from '@/contexts/DebtContext';

interface DebtSummaryProps {
  debts: Debt[];
  installments: DebtInstallment[];
  loading: boolean;
}

const DebtSummary: React.FC<DebtSummaryProps> = ({ debts, installments, loading }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const totalDebtAmount = debts.reduce((sum, debt) => sum + Number(debt.total_amount), 0);
  const totalPaidAmount = debts.reduce((sum, debt) => sum + (Number(debt.installment_amount) * debt.paid_installments), 0);
  const totalRemainingAmount = totalDebtAmount - totalPaidAmount;

  // Next 30 days installments
  const today = new Date();
  const next30Days = new Date();
  next30Days.setDate(today.getDate() + 30);

  const upcomingInstallments = installments.filter(installment => {
    const dueDate = new Date(installment.due_date);
    return !installment.is_paid && dueDate >= today && dueDate <= next30Days;
  });

  const overdueInstallments = installments.filter(installment => {
    const dueDate = new Date(installment.due_date);
    return !installment.is_paid && dueDate < today;
  });

  const upcomingAmount = upcomingInstallments.reduce((sum, installment) => sum + Number(installment.amount), 0);
  const overdueAmount = overdueInstallments.reduce((sum, installment) => sum + Number(installment.amount), 0);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total em Dívidas</p>
                <p className="text-2xl font-bold">{formatCurrency(totalDebtAmount)}</p>
              </div>
              <CreditCard className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor Restante</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalRemainingAmount)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Próximos 30 Dias</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(upcomingAmount)}</p>
                <p className="text-xs text-muted-foreground">{upcomingInstallments.length} parcela(s)</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Em Atraso</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(overdueAmount)}</p>
                <p className="text-xs text-muted-foreground">{overdueInstallments.length} parcela(s)</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {debts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Progresso das Dívidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {debts.map((debt) => {
              const progress = (debt.paid_installments / debt.total_installments) * 100;
              const isCompleted = debt.paid_installments >= debt.total_installments;
              
              return (
                <div key={debt.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{debt.name}</span>
                      {isCompleted && <CheckCircle className="w-4 h-4 text-green-600" />}
                      <Badge variant="outline">{debt.category}</Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {debt.paid_installments}/{debt.total_installments} parcelas
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Pago: {formatCurrency(Number(debt.installment_amount) * debt.paid_installments)}</span>
                    <span>Restante: {formatCurrency(Number(debt.installment_amount) * (debt.total_installments - debt.paid_installments))}</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DebtSummary;
