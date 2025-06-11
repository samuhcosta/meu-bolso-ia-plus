
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Debt, DebtInstallment } from '@/types/debt';

export const useInstallmentOperations = (
  installments: DebtInstallment[],
  debts: Debt[],
  setInstallments: React.Dispatch<React.SetStateAction<DebtInstallment[]>>,
  updateDebt: (id: string, debt: Partial<Debt>) => Promise<void>
) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const markInstallmentAsPaid = async (installmentId: string) => {
    if (!user) return;

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

          // Integração com receitas - criar receita automática
          try {
            await supabase
              .from('transactions')
              .insert({
                user_id: user.id,
                type: 'expense',
                category: 'Pagamento de Dívidas',
                description: `Pagamento parcela ${installment.installment_number} - ${debt.name}`,
                amount: installment.amount,
                date: new Date().toISOString().split('T')[0]
              });
          } catch (transactionError) {
            console.warn('Erro ao criar transação de pagamento:', transactionError);
          }
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

  return {
    markInstallmentAsPaid,
    markInstallmentAsUnpaid
  };
};
