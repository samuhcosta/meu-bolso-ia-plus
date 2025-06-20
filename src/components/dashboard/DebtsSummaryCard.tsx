
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Debt, DebtInstallment } from '@/types/debt';

interface DebtsSummaryCardProps {
  debts: Debt[];
  installments: DebtInstallment[];
  formatCurrency: (value: number) => string;
}

const DebtsSummaryCard: React.FC<DebtsSummaryCardProps> = ({
  debts,
  installments,
  formatCurrency
}) => {
  const activeDebts = debts.filter(debt => debt.paid_installments < debt.total_installments);
  const totalActiveDebt = activeDebts.reduce((sum, debt) => 
    sum + (debt.total_amount - (debt.paid_installments * debt.installment_amount)), 0
  );
  
  const totalPaidDebt = debts.reduce((sum, debt) => 
    sum + (debt.paid_installments * debt.installment_amount), 0
  );

  const nextInstallment = installments
    .filter(installment => !installment.is_paid)
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())[0];

  const overdueInstallments = installments.filter(installment => 
    !installment.is_paid && new Date(installment.due_date) < new Date()
  );

  const nextDebt = nextInstallment ? debts.find(d => d.id === nextInstallment.debt_id) : null;

  return (
    <Link to="/debts" className="block">
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-purple-600" />
            Resumo de Dívidas
          </CardTitle>
          {overdueInstallments.length > 0 && (
            <AlertTriangle className="h-5 w-5 text-red-500" />
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-red-500" />
                <span className="text-sm text-muted-foreground">Em Aberto</span>
              </div>
              <p className="text-lg font-bold text-red-600">
                {formatCurrency(totalActiveDebt)}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-muted-foreground">Pago</span>
              </div>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(totalPaidDebt)}
              </p>
            </div>
          </div>

          {nextInstallment && nextDebt && (
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-muted-foreground">Próxima Parcela</span>
              </div>
              <div className="space-y-1">
                <p className="font-medium">{nextDebt.name}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(nextInstallment.due_date).toLocaleDateString('pt-BR')} • 
                  {formatCurrency(nextInstallment.amount)}
                </p>
              </div>
            </div>
          )}

          {overdueInstallments.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium text-red-700">
                  {overdueInstallments.length} parcela(s) em atraso
                </span>
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center">
            Clique para gerenciar suas dívidas
          </p>
        </CardContent>
      </Card>
    </Link>
  );
};

export default DebtsSummaryCard;
