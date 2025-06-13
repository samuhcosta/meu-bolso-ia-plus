
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Clock, AlertTriangle } from 'lucide-react';
import { Debt, DebtInstallment } from '@/types/debt';
import EditInstallmentDialog from './EditInstallmentDialog';

interface InstallmentItemProps {
  installment: DebtInstallment;
  debt: Debt;
  onMarkAsPaid: (installment: DebtInstallment) => void;
  onMarkAsUnpaid: (installment: DebtInstallment) => void;
  onEdit: (installment: DebtInstallment) => void;
}

const InstallmentItem: React.FC<InstallmentItemProps> = ({
  installment,
  debt,
  onMarkAsPaid,
  onMarkAsUnpaid,
  onEdit
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const isOverdue = (dueDate: string, isPaid: boolean) => {
    return !isPaid && new Date(dueDate) < new Date();
  };

  return (
    <div
      className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
        installment.is_paid 
          ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
          : isOverdue(installment.due_date, installment.is_paid)
          ? 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
          : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
          installment.is_paid 
            ? 'bg-green-500 text-white' 
            : isOverdue(installment.due_date, installment.is_paid)
            ? 'bg-red-500 text-white'
            : 'bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300'
        }`}>
          {installment.is_paid ? (
            <Check className="h-4 w-4" />
          ) : isOverdue(installment.due_date, installment.is_paid) ? (
            <AlertTriangle className="h-4 w-4" />
          ) : (
            <Clock className="h-4 w-4" />
          )}
        </div>
        
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium">
              Parcela {installment.installment_number}/{debt.total_installments}
            </p>
            {installment.is_paid && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Paga
              </Badge>
            )}
            {isOverdue(installment.due_date, installment.is_paid) && (
              <Badge variant="destructive">
                Em atraso
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Vencimento: {new Date(installment.due_date).toLocaleDateString('pt-BR')}
            {installment.paid_date && (
              <span className="ml-2">
                • Paga em: {new Date(installment.paid_date).toLocaleDateString('pt-BR')}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <p className="font-semibold text-lg">
          {formatCurrency(installment.amount)}
        </p>
        
        <div className="flex items-center gap-1">
          <EditInstallmentDialog
            installment={installment}
            onEdit={onEdit}
          />

          {installment.is_paid ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onMarkAsUnpaid(installment)}
            >
              Desmarcar
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={() => onMarkAsPaid(installment)}
              className="bg-green-600 hover:bg-green-700"
            >
              Marcar como Paga
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstallmentItem;
