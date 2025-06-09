
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

// Use the exact types from Supabase
export type Transaction = Database['public']['Tables']['transactions']['Row'];
export type Goal = Database['public']['Tables']['goals']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];

// Input types for inserts
export type TransactionInsert = Database['public']['Tables']['transactions']['Insert'];
export type GoalInsert = Database['public']['Tables']['goals']['Insert'];

interface FinancialContextType {
  transactions: Transaction[];
  goals: Goal[];
  notifications: Notification[];
  addTransaction: (transaction: Omit<TransactionInsert, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addGoal: (goal: Omit<GoalInsert, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateGoal: (id: string, goal: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  getBalance: () => { income: number; expenses: number; balance: number };
  getTransactionsByPeriod: (year: number, month?: number) => Transaction[];
  getCategoryExpenses: () => { [key: string]: number };
  isLoading: boolean;
  refreshData: () => Promise<void>;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (context === undefined) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
};

export const categories = [
  'Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Educação', 
  'Lazer', 'Roupas', 'Outros', 'Salário', 'Freelance', 'Investimentos'
];

export const FinancialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      refreshData();
    } else {
      setTransactions([]);
      setGoals([]);
      setNotifications([]);
    }
  }, [user]);

  const refreshData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Load transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (transactionsError) {
        console.error('Error loading transactions:', transactionsError);
      } else {
        setTransactions(transactionsData || []);
      }

      // Load goals
      const { data: goalsData, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (goalsError) {
        console.error('Error loading goals:', goalsError);
      } else {
        setGoals(goalsData || []);
      }

      // Load notifications
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (notificationsError) {
        console.error('Error loading notifications:', notificationsError);
      } else {
        setNotifications(notificationsData || []);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addTransaction = async (transactionData: Omit<TransactionInsert, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          ...transactionData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding transaction:', error);
        toast({
          title: "Erro",
          description: "Não foi possível adicionar a transação.",
          variant: "destructive",
        });
        return;
      }

      setTransactions(prev => [data, ...prev]);
      toast({
        title: "Sucesso!",
        description: "Transação adicionada com sucesso.",
      });
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao adicionar transação.",
        variant: "destructive",
      });
    }
  };

  const updateTransaction = async (id: string, transactionData: Partial<Transaction>) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update(transactionData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating transaction:', error);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar a transação.",
          variant: "destructive",
        });
        return;
      }

      setTransactions(prev => prev.map(t => t.id === id ? data : t));
      toast({
        title: "Sucesso!",
        description: "Transação atualizada com sucesso.",
      });
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting transaction:', error);
        toast({
          title: "Erro",
          description: "Não foi possível excluir a transação.",
          variant: "destructive",
        });
        return;
      }

      setTransactions(prev => prev.filter(t => t.id !== id));
      toast({
        title: "Sucesso!",
        description: "Transação excluída com sucesso.",
      });
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const addGoal = async (goalData: Omit<GoalInsert, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('goals')
        .insert({
          ...goalData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding goal:', error);
        return;
      }

      setGoals(prev => [data, ...prev]);
    } catch (error) {
      console.error('Error adding goal:', error);
    }
  };

  const updateGoal = async (id: string, goalData: Partial<Goal>) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('goals')
        .update(goalData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating goal:', error);
        return;
      }

      setGoals(prev => prev.map(g => g.id === id ? data : g));
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  const deleteGoal = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting goal:', error);
        return;
      }

      setGoals(prev => prev.filter(g => g.id !== id));
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const markNotificationAsRead = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error marking notification as read:', error);
        return;
      }

      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getBalance = () => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    return {
      income,
      expenses,
      balance: income - expenses
    };
  };

  const getTransactionsByPeriod = (year: number, month?: number) => {
    return transactions.filter(t => {
      const transactionDate = new Date(t.date);
      const yearMatch = transactionDate.getFullYear() === year;
      const monthMatch = month === undefined || transactionDate.getMonth() === month;
      return yearMatch && monthMatch;
    });
  };

  const getCategoryExpenses = () => {
    const categoryTotals: { [key: string]: number } = {};
    
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount);
      });
    
    return categoryTotals;
  };

  const value = {
    transactions,
    goals,
    notifications,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addGoal,
    updateGoal,
    deleteGoal,
    markNotificationAsRead,
    getBalance,
    getTransactionsByPeriod,
    getCategoryExpenses,
    isLoading,
    refreshData
  };

  return (
    <FinancialContext.Provider value={value}>
      {children}
    </FinancialContext.Provider>
  );
};
