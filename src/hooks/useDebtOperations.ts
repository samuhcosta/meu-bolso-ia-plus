
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

      // Create expense transaction for down payment
      if (debtData.down_payment && debtData.down_payment > 0) {
        try {
          await supabase.from('transactions').insert({
            user_id: user.id,
            type: 'expense',
            category: 'Pagamento de Dívidas',
            description: `Entrada - ${debtData.name}`,
            amount: debtData.down_payment,
            date: new Date().toISOString().split('T')[0]
          });
        } catch (txError) {
          console.warn('Erro ao criar transação de entrada:', txError);
        }
      }

      await fetchInstallments();

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
      // Buscar dívida atual para saber valores antigos
      const { data: oldDebt } = await supabase
        .from('debts')
        .select('name, down_payment')
        .eq('id', id)
        .single();

      const { data, error } = await supabase
        .from('debts')
        .update(debtData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setDebts(prev => prev.map(debt => debt.id === id ? data : debt));

      // Atualizar parcelas não pagas com o novo valor quando installment_amount mudar
      if (debtData.installment_amount !== undefined) {
        const { error: instError } = await supabase
          .from('debt_installments')
          .update({ amount: debtData.installment_amount })
          .eq('debt_id', id)
          .eq('is_paid', false);

        if (instError) {
          console.error('Error updating installments amount:', instError);
        }

        setInstallments(prev => prev.map(inst =>
          inst.debt_id === id && !inst.is_paid
            ? { ...inst, amount: debtData.installment_amount as number }
            : inst
        ));
      }

      // Sincronizar transação de entrada (down_payment)
      if (debtData.down_payment !== undefined) {
        const oldName = oldDebt?.name || debtData.name || '';
        const newName = debtData.name || oldName;
        const oldDescription = `Entrada - ${oldName}`;
        const newDescription = `Entrada - ${newName}`;

        // Buscar transação existente pelo nome anterior
        const { data: existingTx } = await supabase
          .from('transactions')
          .select('id')
          .eq('user_id', user.id)
          .eq('category', 'Pagamento de Dívidas')
          .eq('description', oldDescription)
          .maybeSingle();

        if (debtData.down_payment > 0) {
          if (existingTx) {
            // Atualizar transação existente
            await supabase
              .from('transactions')
              .update({
                amount: debtData.down_payment,
                description: newDescription
              })
              .eq('id', existingTx.id);
          } else {
            // Criar nova transação
            await supabase.from('transactions').insert({
              user_id: user.id,
              type: 'expense',
              category: 'Pagamento de Dívidas',
              description: newDescription,
              amount: debtData.down_payment,
              date: new Date().toISOString().split('T')[0]
            });
          }
        } else {
          // down_payment = 0, remover transação se existir
          if (existingTx) {
            await supabase
              .from('transactions')
              .delete()
              .eq('id', existingTx.id);
          }
        }
      }

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
      // Buscar dívida para saber o nome (usado na transação de entrada)
      const { data: debtToDelete } = await supabase
        .from('debts')
        .select('name')
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('debts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Remover transação de entrada associada
      if (debtToDelete) {
        await supabase
          .from('transactions')
          .delete()
          .eq('category', 'Pagamento de Dívidas')
          .eq('description', `Entrada - ${debtToDelete.name}`);
      }

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
