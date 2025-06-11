
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Calendar, CreditCard, TrendingDown } from 'lucide-react';
import { Debt, DebtInstallment } from '@/contexts/DebtContext';

interface DebtDashboardCardsProps {
  debts: Debt[];
  installments: DebtInstallment[];
  loading: boolean;
}

const DebtDashboardCards: React.FC<DebtDashboardCardsProps> = ({ 
  debts, 
  installments, 
  loading 
}) => {
  // Calcular totais
  const totalDebts = debts.reduce((sum, debt) => sum + debt.total_amount, 0);
  const paidAmount = debts.reduce((sum, debt) => 
    sum + (debt.paid_installments * debt.installment_amount), 0
  );
  const activeDebts = totalDebts - paidAmount;

  // Próxima parcela a vencer
  const upcomingInstallments = installments
    .filter(installment => !installment.is_paid)
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
  
  const nextInstallment = upcomingInstallments[0];

  // Parcelas vencidas
  const overdueInstallments = installments.filter(installment => 
    !installment.is_paid && new Date(installment.due_date) < new Date()
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total de Dívidas */}
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
            Total de Dívidas
          </CardTitle>
          <CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
            {formatCurrency(totalDebts)}
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400">
            {debts.length} dívida{debts.length !== 1 ? 's' : ''} cadastrada{debts.length !== 1 ? 's' : ''}
          </p>
        </CardContent>
      </Card>

      {/* Dívidas Ativas */}
      <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300">
            Dívidas Ativas
          </CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-800 dark:text-red-200">
            {formatCurrency(activeDebts)}
          </div>
          <p className="text-xs text-red-600 dark:text-red-400">
            Restante a pagar
          </p>
        </CardContent>
      </Card>

      {/* Dívidas Pagas */}
      <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
            Dívidas Pagas
          </CardTitle>
          <TrendingDown className="h-4 w-4 text-green-600 dark:text-green-400 rotate-180" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-800 dark:text-green-200">
            {formatCurrency(paidAmount)}
          </div>
          <p className="text-xs text-green-600 dark:text-green-400">
            {totalDebts > 0 ? `${Math.round((paidAmount / totalDebts) * 100)}%` : '0%'} quitado
          </p>
        </CardContent>
      </Card>

      {/* Próximas Parcelas */}
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
            Próximo Vencimento
          </CardTitle>
          <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        </CardHeader>
        <CardContent>
          {nextInstallment ? (
            <>
              <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                {formatCurrency(nextInstallment.amount)}
              </div>
              <p className="text-xs text-purple-600 dark:text-purple-400">
                {new Date(nextInstallment.due_date).toLocaleDateString('pt-BR')}
              </p>
            </>
          ) : (
            <>
              <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                --
              </div>
              <p className="text-xs text-purple-600 dark:text-purple-400">
                Nenhuma parcela pendente
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Alertas de Parcelas Vencidas */}
      {overdueInstallments.length > 0 && (
        <Card className="md:col-span-2 lg:col-span-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 border-orange-200 dark:border-orange-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Parcelas em Atraso
            </CardTitle>
            <Badge variant="destructive">
              {overdueInstallments.length}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {overdueInstallments.slice(0, 3).map((installment) => {
                const debt = debts.find(d => d.id === installment.debt_id);
                return (
                  <div key={installment.id} className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{debt?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Parcela {installment.installment_number} - Venceu em {new Date(installment.due_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-600">
                        {formatCurrency(installment.amount)}
                      </p>
                    </div>
                  </div>
                );
              })}
              {overdueInstallments.length > 3 && (
                <p className="text-xs text-muted-foreground text-center">
                  E mais {overdueInstallments.length - 3} parcela{overdueInstallments.length - 3 > 1 ? 's' : ''} em atraso
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DebtDashboardCards;
