
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Debt } from '@/types/debt';

interface DebtProgressSummaryProps {
  debt: Debt;
  paidInstallments: number;
  totalAmount: number;
  paidAmount: number;
  progress: number;
}

const DebtProgressSummary: React.FC<DebtProgressSummaryProps> = ({
  debt,
  paidInstallments,
  totalAmount,
  paidAmount,
  progress
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo da Dívida</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Valor Total</p>
            <p className="text-lg font-semibold">{formatCurrency(totalAmount)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Valor Pago</p>
            <p className="text-lg font-semibold text-green-600">{formatCurrency(paidAmount)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Restante</p>
            <p className="text-lg font-semibold text-red-600">{formatCurrency(totalAmount - paidAmount)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Progresso</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm font-medium">{Math.round(progress)}%</span>
            </div>
          </div>
        </div>
        {debt.notes && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm"><strong>Observações:</strong> {debt.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DebtProgressSummary;
