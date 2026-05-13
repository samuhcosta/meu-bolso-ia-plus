
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useDebt } from '@/contexts/DebtContext';
import { useToast } from '@/hooks/use-toast';
import DebtForm from '@/components/debt/DebtForm';
import DebtDashboardCards from '@/components/debt/DebtDashboardCards';
import DebtListWithDetails from '@/components/debt/DebtListWithDetails';
import DebtInstallmentsView from '@/components/debt/DebtInstallmentsView';
import DebtReports from '@/components/debt/DebtReports';
import { Debt } from '@/types/debt';

const Debts = () => {
  const { debts, installments, loading, deleteDebt } = useDebt();
  const { toast } = useToast();
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [debtToEdit, setDebtToEdit] = useState<Debt | null>(null);

  const handleEditDebt = (debt: Debt) => {
    setDebtToEdit(debt);
  };

  const handleDeleteDebt = async (debtId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta dívida? Esta ação não pode ser desfeita.')) {
      try {
        await deleteDebt(debtId);
        toast({
          title: "Dívida excluída",
          description: "A dívida foi excluída com sucesso.",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível excluir a dívida.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Meu Bolso Pro - Controle de Dívidas
        </h1>
        <p className="text-muted-foreground">
          Gerencie suas dívidas de forma inteligente e automatizada
        </p>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="flex w-full overflow-x-auto gap-1 md:grid md:grid-cols-5 md:overflow-visible">
          <TabsTrigger value="dashboard" className="flex-shrink-0">Dashboard</TabsTrigger>
          <TabsTrigger value="add-debt" className="flex-shrink-0">Nova Dívida</TabsTrigger>
          <TabsTrigger value="list" className="flex-shrink-0">Minhas Dívidas</TabsTrigger>
          <TabsTrigger value="installments" className="flex-shrink-0">Cronograma</TabsTrigger>
          <TabsTrigger value="reports" className="flex-shrink-0">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <DebtDashboardCards 
            debts={debts} 
            installments={installments}
            loading={loading}
          />
          
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Dívidas Recentes</h3>
            <DebtListWithDetails
              debts={debts.slice(0, 3)}
              installments={installments}
              loading={loading}
              onEditDebt={handleEditDebt}
              onDeleteDebt={handleDeleteDebt}
            />
          </div>
        </TabsContent>

        <TabsContent value="add-debt" className="space-y-6">
          <DebtForm />
        </TabsContent>

        <TabsContent value="list" className="space-y-6">
          <DebtListWithDetails
            debts={debts}
            installments={installments}
            loading={loading}
            onEditDebt={handleEditDebt}
            onDeleteDebt={handleDeleteDebt}
          />
        </TabsContent>

        <TabsContent value="installments" className="space-y-6">
          {selectedDebt ? (
            <DebtInstallmentsView
              debt={selectedDebt}
              installments={installments.filter(inst => inst.debt_id === selectedDebt.id)}
              onBack={() => setSelectedDebt(null)}
            />
          ) : (
            <div>
              <h3 className="text-lg font-medium mb-4">Selecione uma dívida para ver o cronograma</h3>
              <div className="grid gap-4">
                {debts.map(debt => (
                  <div 
                    key={debt.id}
                    className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 dark:bg-card/40 dark:border-border/50 transition-colors"
                    onClick={() => setSelectedDebt(debt)}
                  >
                    <h4 className="font-medium">{debt.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {debt.paid_installments}/{debt.total_installments} parcelas pagas
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <DebtReports debts={debts} installments={installments} />
        </TabsContent>
      </Tabs>

      <Dialog open={!!debtToEdit} onOpenChange={(open) => { if (!open) setDebtToEdit(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Dívida</DialogTitle>
          </DialogHeader>
          {debtToEdit && (
            <DebtForm
              debt={debtToEdit}
              onSave={() => setDebtToEdit(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Debts;
