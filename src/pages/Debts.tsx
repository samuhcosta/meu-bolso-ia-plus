
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDebt } from '@/contexts/DebtContext';
import DebtForm from '@/components/debt/DebtForm';
import DebtList from '@/components/debt/DebtList';
import DebtSummary from '@/components/debt/DebtSummary';
import FuturePlanning from '@/components/debt/FuturePlanning';

const Debts = () => {
  const { debts, installments, loading } = useDebt();
  const [selectedDebt, setSelectedDebt] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dívidas Programadas</h1>
        <p className="text-muted-foreground">
          Gerencie suas dívidas parceladas e acompanhe os vencimentos
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="add-debt">Nova Dívida</TabsTrigger>
          <TabsTrigger value="installments">Cronograma</TabsTrigger>
          <TabsTrigger value="planning">Planejamento</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <DebtSummary 
            debts={debts} 
            installments={installments}
            loading={loading}
          />
          <DebtList 
            debts={debts}
            installments={installments}
            loading={loading}
            onSelectDebt={setSelectedDebt}
          />
        </TabsContent>

        <TabsContent value="add-debt" className="space-y-6">
          <DebtForm />
        </TabsContent>

        <TabsContent value="installments" className="space-y-6">
          <div className="text-center py-8">
            <h3 className="text-lg font-medium mb-2">Cronograma de Parcelas</h3>
            <p className="text-muted-foreground">
              Visualize e gerencie todas as parcelas das suas dívidas
            </p>
          </div>
        </TabsContent>

        <TabsContent value="planning" className="space-y-6">
          <FuturePlanning 
            debts={debts}
            installments={installments}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Debts;
