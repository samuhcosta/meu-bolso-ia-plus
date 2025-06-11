
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Debt, DebtInstallment } from '@/types/debt';

export const useDebtOperations = () => {
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
      await fetchInstallments();

      // Integração com receitas - criar transação automática
      if (debtData.total_amount > 0) {
        try {
          await supabase
            .from('transactions')
            .insert({
              user_id: user.id,
              type: 'expense',
              category: 'Dívidas',
              description: `Dívida registrada: ${debtData.name}`,
              amount: debtData.total_amount,
              date: new Date().toISOString().split('T')[0]
            });
        } catch (transactionError) {
          console.warn('Erro ao criar transação automática:', transactionError);
        }
      }

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

  return {
    debts,
    installments,
    loading,
    addDebt,
    updateDebt,
    deleteDebt,
    fetchDebts,
    fetchInstallments,
    setDebts,
    setInstallments
  };
};
