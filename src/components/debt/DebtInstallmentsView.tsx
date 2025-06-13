
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useDebt } from '@/contexts/DebtContext';
import { Debt, DebtInstallment } from '@/contexts/DebtContext';
import { ArrowLeft } from 'lucide-react';
import DebtProgressSummary from './DebtProgressSummary';
import InstallmentItem from './InstallmentItem';

interface DebtInstallmentsViewProps {
  debt: Debt;
  installments: DebtInstallment[];
  onBack: () => void;
}

const DebtInstallmentsView: React.FC<DebtInstallmentsViewProps> = ({
  debt,
  installments,
  onBack
}) => {
  const { markInstallmentAsPaid, markInstallmentAsUnpaid } = useDebt();
  const { toast } = useToast();

  const debtInstallments = installments
    .filter(installment => installment.debt_id === debt.id)
    .sort((a, b) => a.installment_number - b.installment_number);

  const handleMarkAsPaid = async (installment: DebtInstallment) => {
    try {
      await markInstallmentAsPaid(installment.id);
      toast({
        title: "Parcela marcada como paga",
        description: `Parcela ${installment.installment_number}/${debt.total_installments} foi marcada como paga.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível marcar a parcela como paga.",
        variant: "destructive",
      });
    }
  };

  const handleMarkAsUnpaid = async (installment: DebtInstallment) => {
    try {
      await markInstallmentAsUnpaid(installment.id);
      toast({
        title: "Parcela desmarcada",
        description: `Parcela ${installment.installment_number}/${debt.total_installments} foi desmarcada.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível desmarcar a parcela.",
        variant: "destructive",
      });
    }
  };

  const handleEditInstallment = (installment: DebtInstallment) => {
    // This function will be called when editing an installment
    console.log('Editing installment:', installment);
  };

  const paidInstallments = debtInstallments.filter(i => i.is_paid).length;
  const totalAmount = debt.total_amount;
  const paidAmount = paidInstallments * debt.installment_amount;
  const progress = (paidAmount / totalAmount) * 100;

  return (
    <div className="space-y-6">
      {/* Header com botão voltar */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{debt.name}</h2>
          <p className="text-muted-foreground">
            {debt.category} • {debt.total_installments} parcelas
          </p>
        </div>
      </div>

      {/* Resumo da dívida */}
      <DebtProgressSummary
        debt={debt}
        paidInstallments={paidInstallments}
        totalAmount={totalAmount}
        paidAmount={paidAmount}
        progress={progress}
      />

      {/* Lista de parcelas */}
      <Card>
        <CardHeader>
          <CardTitle>Cronograma de Parcelas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {debtInstallments.map((installment) => (
              <InstallmentItem
                key={installment.id}
                installment={installment}
                debt={debt}
                onMarkAsPaid={handleMarkAsPaid}
                onMarkAsUnpaid={handleMarkAsUnpaid}
                onEdit={handleEditInstallment}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DebtInstallmentsView;
