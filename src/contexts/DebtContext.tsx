
import React, { createContext, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useDebtOperations } from '@/hooks/useDebtOperations';
import { useInstallmentOperations } from '@/hooks/useInstallmentOperations';
import { DebtContextType } from '@/types/debt';

const DebtContext = createContext<DebtContextType | undefined>(undefined);

export const DebtProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const {
    debts,
    installments,
    loading,
    addDebt,
    updateDebt,
    deleteDebt,
    fetchDebts,
    fetchInstallments,
    setInstallments
  } = useDebtOperations();

  const { markInstallmentAsPaid, markInstallmentAsUnpaid } = useInstallmentOperations(
    installments,
    debts,
    setInstallments,
    updateDebt
  );

  useEffect(() => {
    if (!user) return;
    fetchDebts();
    fetchInstallments();

    const channel = supabase
      .channel(`debts-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'debts', filter: `user_id=eq.${user.id}` },
        () => { fetchDebts(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'debt_installments' },
        () => { fetchInstallments(); })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const value = {
    debts,
    installments,
    loading,
    addDebt,
    updateDebt,
    deleteDebt,
    markInstallmentAsPaid,
    markInstallmentAsUnpaid,
    fetchDebts,
    fetchInstallments
  };

  return (
    <DebtContext.Provider value={value}>
      {children}
    </DebtContext.Provider>
  );
};

export const useDebt = () => {
  const context = useContext(DebtContext);
  if (context === undefined) {
    throw new Error('useDebt must be used within a DebtProvider');
  }
  return context;
};

// Re-export types for backward compatibility
export type { Debt, DebtInstallment } from '@/types/debt';
