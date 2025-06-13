
import React, { useState } from 'react';
import { Debt, DebtInstallment } from '@/types/debt';
import DebtInstallmentsView from './DebtInstallmentsView';
import DebtCard from './DebtCard';
import DebtSkeleton from './DebtSkeleton';
import EmptyDebtList from './EmptyDebtList';

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
          <DebtSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (debts.length === 0) {
    return <EmptyDebtList />;
  }

  return (
    <div className="space-y-4">
      {debts.map((debt) => (
        <DebtCard
          key={debt.id}
          debt={debt}
          installments={installments}
          onView={setSelectedDebt}
          onEdit={onEditDebt}
          onDelete={onDeleteDebt}
        />
      ))}
    </div>
  );
};

export default DebtListWithDetails;
