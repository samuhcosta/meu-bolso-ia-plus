
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Debt, DebtInstallment } from '@/types/debt';
import { Eye, Edit, Trash2, Calendar } from 'lucide-react';

interface DebtCardProps {
  debt: Debt;
  installments: DebtInstallment[];
  onView: (debt: Debt) => void;
  onEdit: (debt: Debt) => void;
  onDelete: (debtId: string) => void;
}

const DebtCard: React.FC<DebtCardProps> = ({
  debt,
  installments,
  onView,
  onEdit,
  onDelete
}) => {
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

  const progress = getDebtProgress(debt);
  const nextInstallment = getNextInstallment(debt);
  const remainingAmount = debt.total_amount - (debt.paid_installments * debt.installment_amount);

  return (
    <Card className="hover:shadow-md transition-shadow">
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
              onClick={() => onView(debt)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(debt)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(debt.id)}
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
};

export default DebtCard;
