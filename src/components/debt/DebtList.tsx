
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Trash2, 
  Calendar,
  DollarSign,
  CreditCard,
  Bell,
  BellOff
} from 'lucide-react';
import { Debt, DebtInstallment, useDebt } from '@/contexts/DebtContext';

interface DebtListProps {
  debts: Debt[];
  installments: DebtInstallment[];
  loading: boolean;
  onSelectDebt: (debtId: string) => void;
}

const DebtList: React.FC<DebtListProps> = ({ debts, installments, loading, onSelectDebt }) => {
  const { deleteDebt, updateDebt } = useDebt();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getNextInstallment = (debtId: string) => {
    const debtInstallments = installments.filter(i => i.debt_id === debtId && !i.is_paid);
    if (debtInstallments.length === 0) return null;
    
    return debtInstallments.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())[0];
  };

  const toggleNotifications = async (debt: Debt) => {
    await updateDebt(debt.id, {
      notifications_enabled: !debt.notifications_enabled
    });
  };

  const handleDelete = async (debtId: string) => {
    if (confirm('Tem certeza que deseja excluir esta dívida? Esta ação não pode ser desfeita.')) {
      await deleteDebt(debtId);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Suas Dívidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (debts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Suas Dívidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma dívida cadastrada</h3>
            <p className="text-muted-foreground">
              Cadastre suas dívidas para acompanhar os vencimentos e organizar suas finanças
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Suas Dívidas ({debts.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {debts.map((debt) => {
            const nextInstallment = getNextInstallment(debt.id);
            const progress = (debt.paid_installments / debt.total_installments) * 100;
            const isCompleted = debt.paid_installments >= debt.total_installments;
            const remainingAmount = Number(debt.installment_amount) * (debt.total_installments - debt.paid_installments);

            return (
              <div 
                key={debt.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => onSelectDebt(debt.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold">{debt.name}</h3>
                      <Badge variant="outline">{debt.category}</Badge>
                      {isCompleted && (
                        <Badge variant="default" className="bg-green-600">
                          Quitada
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Valor Total</p>
                        <p className="font-medium">{formatCurrency(Number(debt.total_amount))}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Valor da Parcela</p>
                        <p className="font-medium">{formatCurrency(Number(debt.installment_amount))}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Progresso</p>
                        <p className="font-medium">{debt.paid_installments}/{debt.total_installments}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Restante</p>
                        <p className="font-medium">{formatCurrency(remainingAmount)}</p>
                      </div>
                    </div>

                    {nextInstallment && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Próximo vencimento: {new Date(nextInstallment.due_date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    )}

                    {debt.notes && (
                      <p className="text-sm text-muted-foreground mt-2">{debt.notes}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-1 ml-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleNotifications(debt);
                      }}
                      title={debt.notifications_enabled ? 'Desativar notificações' : 'Ativar notificações'}
                    >
                      {debt.notifications_enabled ? (
                        <Bell className="w-4 h-4 text-blue-600" />
                      ) : (
                        <BellOff className="w-4 h-4 text-muted-foreground" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Implement edit functionality
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(debt.id);
                      }}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        isCompleted ? 'bg-green-600' : 'bg-primary'
                      }`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default DebtList;
