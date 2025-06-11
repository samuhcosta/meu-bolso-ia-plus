
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Debt, DebtInstallment } from '@/contexts/DebtContext';
import { Eye, Edit, Trash2, Calendar, DollarSign } from 'lucide-react';
import DebtInstallmentsView from './DebtInstallmentsView';

interface DebtListWithDetailsProps {
  debts: Debt[];
  installments: DebtInstallment[];
  loading: boolean;
  onEditDebt: (debt: Debt) => void;
  onDeleteDebt: (debtId: string) => void;
}

const DebtListWithDetails: React.FC<DebtListWithDetailsProps> = ({
  debts,
  installments,
  loading,
  onEditDebt,
  onDeleteDebt
}) => {
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getDebtProgress = (debt: Debt) => {
    const progress = (debt.paid_installments / debt.total_installments) * 100;
    return Math.round(progress);
  };

  const getNextInstallment = (debt: Debt) => {
    const debtInstallments = installments
      .filter(inst => inst.debt_id === debt.id && !inst.is_paid)
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
    
    return debtInstallments[0];
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'cartao': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'emprestimo': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'financiamento': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'pessoal': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'outros': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    };
    return colors[category.toLowerCase()] || colors['outros'];
  };

  if (selectedDebt) {
    const debtInstallments = installments.filter(inst => inst.debt_id === selectedDebt.id);
    return (
      <DebtInstallmentsView
        debt={selectedDebt}
        installments={debtInstallments}
        onBack={() => setSelectedDebt(null)}
      />
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (debts.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhuma dívida cadastrada</h3>
          <p className="text-muted-foreground mb-4">
            Comece cadastrando sua primeira dívida para ter controle total das suas finanças.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {debts.map((debt) => {
        const progress = getDebtProgress(debt);
        const nextInstallment = getNextInstallment(debt);
        const remainingAmount = debt.total_amount - (debt.paid_installments * debt.installment_amount);

        return (
          <Card key={debt.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{debt.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={getCategoryColor(debt.category)}>
                      {debt.category}
                    </Badge>
                    {progress === 100 && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Quitada
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDebt(debt)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditDebt(debt)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteDebt(debt.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Informações financeiras */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Valor Total</p>
                  <p className="font-semibold">{formatCurrency(debt.total_amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Valor da Parcela</p>
                  <p className="font-semibold">{formatCurrency(debt.installment_amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Restante</p>
                  <p className="font-semibold text-red-600">{formatCurrency(remainingAmount)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Parcelas</p>
                  <p className="font-semibold">{debt.paid_installments}/{debt.total_installments}</p>
                </div>
              </div>

              {/* Barra de progresso */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progresso de quitação</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Próxima parcela */}
              {nextInstallment && (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Próxima parcela</p>
                      <p className="text-xs text-muted-foreground">
                        Parcela {nextInstallment.installment_number} • {new Date(nextInstallment.due_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold">{formatCurrency(nextInstallment.amount)}</p>
                </div>
              )}

              {/* Observações */}
              {debt.notes && (
                <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                  <strong>Obs:</strong> {debt.notes}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default DebtListWithDetails;
