
import React from 'react';
import { useDebt } from '@/contexts/DebtContext';
import { useAuth } from '@/contexts/AuthContext';
import DebtDashboardCards from '@/components/debt/DebtDashboardCards';
import DebtListWithDetails from '@/components/debt/DebtListWithDetails';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Plus, TrendingUp, Calendar, Bell } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { debts, installments, loading } = useDebt();

  const upcomingInstallments = installments
    .filter(installment => !installment.is_paid)
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 5);

  const overdueInstallments = installments.filter(installment => 
    !installment.is_paid && new Date(installment.due_date) < new Date()
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-8">
      {/* Header de boas-vindas */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Bem-vindo ao Meu Bolso Pro
        </h1>
        <p className="text-xl text-muted-foreground">
          Olá, {user?.name}! Aqui está o resumo das suas finanças
        </p>
      </div>

      {/* Cards principais de dívidas */}
      <DebtDashboardCards 
        debts={debts} 
        installments={installments}
        loading={loading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Próximas parcelas */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Próximas Parcelas
            </CardTitle>
            <Link to="/debts?tab=installments">
              <Button variant="outline" size="sm">
                Ver Todas
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {upcomingInstallments.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma parcela próxima do vencimento</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingInstallments.map((installment) => {
                  const debt = debts.find(d => d.id === installment.debt_id);
                  const daysUntilDue = Math.ceil(
                    (new Date(installment.due_date).getTime() - new Date().getTime()) / 
                    (1000 * 3600 * 24)
                  );
                  
                  return (
                    <div key={installment.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">{debt?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Parcela {installment.installment_number} • 
                          {daysUntilDue === 0 ? ' Vence hoje' : 
                           daysUntilDue === 1 ? ' Vence amanhã' : 
                           ` Vence em ${daysUntilDue} dias`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(installment.amount)}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(installment.due_date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ações rápidas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/debts?tab=add-debt" className="block">
              <Button className="w-full justify-start" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Nova Dívida
              </Button>
            </Link>
            <Link to="/finances?tab=add-transaction" className="block">
              <Button className="w-full justify-start" variant="outline">
                <TrendingUp className="h-4 w-4 mr-2" />
                Nova Transação
              </Button>
            </Link>
            <Link to="/reports" className="block">
              <Button className="w-full justify-start" variant="outline">
                <Bell className="h-4 w-4 mr-2" />
                Ver Relatórios
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Dívidas recentes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Suas Dívidas</CardTitle>
          <Link to="/debts">
            <Button variant="outline" size="sm">
              Gerenciar Todas
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <DebtListWithDetails
            debts={debts.slice(0, 3)}
            installments={installments}
            loading={loading}
            onEditDebt={() => {}}
            onDeleteDebt={() => {}}
          />
          
          {debts.length === 0 && !loading && (
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Comece a controlar suas dívidas</h3>
              <p className="text-muted-foreground mb-4">
                Cadastre suas dívidas e tenha controle total das suas finanças.
              </p>
              <Link to="/debts?tab=add-debt">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Primeira Dívida
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
