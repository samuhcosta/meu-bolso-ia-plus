
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Debt {
  id: string;
  user_id: string;
  name: string;
  total_amount: number;
  installment_amount: number;
  total_installments: number;
  paid_installments: number;
  first_installment_date: string;
  monthly_due_day: number;
  category: string;
  notes?: string;
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface DebtInstallment {
  id: string;
  debt_id: string;
  installment_number: number;
  due_date: string;
  amount: number;
  is_paid: boolean;
  paid_date?: string;
  created_at: string;
  updated_at: string;
}

interface DebtContextType {
  debts: Debt[];
  installments: DebtInstallment[];
  loading: boolean;
  addDebt: (debt: Omit<Debt, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateDebt: (id: string, debt: Partial<Debt>) => Promise<void>;
  deleteDebt: (id: string) => Promise<void>;
  markInstallmentAsPaid: (installmentId: string) => Promise<void>;
  markInstallmentAsUnpaid: (installmentId: string) => Promise<void>;
  fetchDebts: () => Promise<void>;
  fetchInstallments: (debtId?: string) => Promise<void>;
}

const DebtContext = createContext<DebtContextType | undefined>(undefined);

export const DebtProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [installments, setInstallments] = useState<DebtInstallment[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchDebts = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('debts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setDebts(data || []);
    } catch (error) {
      console.error('Error fetching debts:', error);
      toast({
        title: "Erro ao carregar dívidas",
        description: "Não foi possível carregar suas dívidas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchInstallments = async (debtId?: string) => {
    if (!user) return;

    try {
      let query = supabase
        .from('debt_installments')
        .select(`
          *,
          debts!inner(user_id)
        `)
        .eq('debts.user_id', user.id)
        .order('due_date', { ascending: true });

      if (debtId) {
        query = query.eq('debt_id', debtId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setInstallments(data || []);
    } catch (error) {
      console.error('Error fetching installments:', error);
      toast({
        title: "Erro ao carregar parcelas",
        description: "Não foi possível carregar as parcelas.",
        variant: "destructive",
      });
    }
  };

  const addDebt = async (debtData: Omit<Debt, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('debts')
        .insert({
          ...debtData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setDebts(prev => [data, ...prev]);
      await fetchInstallments(); // Refresh installments after adding debt

      toast({
        title: "Dívida cadastrada",
        description: "Dívida cadastrada com sucesso!",
      });
    } catch (error) {
      console.error('Error adding debt:', error);
      toast({
        title: "Erro ao cadastrar dívida",
        description: "Não foi possível cadastrar a dívida.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateDebt = async (id: string, debtData: Partial<Debt>) => {
    try {
      const { data, error } = await supabase
        .from('debts')
        .update(debtData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setDebts(prev => prev.map(debt => debt.id === id ? data : debt));

      toast({
        title: "Dívida atualizada",
        description: "Dívida atualizada com sucesso!",
      });
    } catch (error) {
      console.error('Error updating debt:', error);
      toast({
        title: "Erro ao atualizar dívida",
        description: "Não foi possível atualizar a dívida.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteDebt = async (id: string) => {
    try {
      const { error } = await supabase
        .from('debts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setDebts(prev => prev.filter(debt => debt.id !== id));
      setInstallments(prev => prev.filter(installment => installment.debt_id !== id));

      toast({
        title: "Dívida excluída",
        description: "Dívida excluída com sucesso!",
      });
    } catch (error) {
      console.error('Error deleting debt:', error);
      toast({
        title: "Erro ao excluir dívida",
        description: "Não foi possível excluir a dívida.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const markInstallmentAsPaid = async (installmentId: string) => {
    try {
      const { data, error } = await supabase
        .from('debt_installments')
        .update({
          is_paid: true,
          paid_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', installmentId)
        .select()
        .single();

      if (error) throw error;

      setInstallments(prev => 
        prev.map(installment => 
          installment.id === installmentId ? data : installment
        )
      );

      // Update debt paid_installments count
      const installment = installments.find(i => i.id === installmentId);
      if (installment) {
        const debt = debts.find(d => d.id === installment.debt_id);
        if (debt) {
          await updateDebt(debt.id, {
            paid_installments: debt.paid_installments + 1
          });
        }
      }

      toast({
        title: "Parcela marcada como paga",
        description: "Parcela marcada como paga com sucesso!",
      });
    } catch (error) {
      console.error('Error marking installment as paid:', error);
      toast({
        title: "Erro ao marcar parcela",
        description: "Não foi possível marcar a parcela como paga.",
        variant: "destructive",
      });
    }
  };

  const markInstallmentAsUnpaid = async (installmentId: string) => {
    try {
      const { data, error } = await supabase
        .from('debt_installments')
        .update({
          is_paid: false,
          paid_date: null
        })
        .eq('id', installmentId)
        .select()
        .single();

      if (error) throw error;

      setInstallments(prev => 
        prev.map(installment => 
          installment.id === installmentId ? data : installment
        )
      );

      // Update debt paid_installments count
      const installment = installments.find(i => i.id === installmentId);
      if (installment) {
        const debt = debts.find(d => d.id === installment.debt_id);
        if (debt && debt.paid_installments > 0) {
          await updateDebt(debt.id, {
            paid_installments: debt.paid_installments - 1
          });
        }
      }

      toast({
        title: "Parcela desmarcada",
        description: "Parcela desmarcada como não paga.",
      });
    } catch (error) {
      console.error('Error marking installment as unpaid:', error);
      toast({
        title: "Erro ao desmarcar parcela",
        description: "Não foi possível desmarcar a parcela.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchDebts();
      fetchInstallments();
    }
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
