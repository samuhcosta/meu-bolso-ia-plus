
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useFinancial } from './FinancialContext';
import { useDebt } from './DebtContext';
import { supabase } from '@/integrations/supabase/client';

interface LazyLoadingState {
  userDataLoaded: boolean;
  transactionsLoaded: boolean;
  debtsLoaded: boolean;
  goalsLoaded: boolean;
  notificationsLoaded: boolean;
  isInitialLoading: boolean;
  errors: string[];
}

interface LazyFinancialContextType {
  loadingState: LazyLoadingState;
  retryLoad: (section: keyof LazyLoadingState) => void;
  retryAll: () => void;
}

const LazyFinancialContext = createContext<LazyFinancialContextType | undefined>(undefined);

export const useLazyFinancial = () => {
  const context = useContext(LazyFinancialContext);
  if (context === undefined) {
    throw new Error('useLazyFinancial must be used within a LazyFinancialProvider');
  }
  return context;
};

export const LazyFinancialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { transactions, goals, notifications, setTransactions, setGoals, setNotifications } = useFinancial();
  const { debts, setDebts } = useDebt();
  
  const [loadingState, setLoadingState] = useState<LazyLoadingState>({
    userDataLoaded: false,
    transactionsLoaded: false,
    debtsLoaded: false,
    goalsLoaded: false,
    notificationsLoaded: false,
    isInitialLoading: true,
    errors: []
  });

  const updateLoadingState = (updates: Partial<LazyLoadingState>) => {
    setLoadingState(prev => ({ ...prev, ...updates }));
  };

  // Funções para carregar dados individualmente
  const fetchTransactions = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) throw error;
    setTransactions(data || []);
  };

  const fetchGoals = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setGoals(data || []);
  };

  const fetchNotifications = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setNotifications(data || []);
  };

  const fetchDebts = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('debts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setDebts(data || []);
  };

  const loadSection = async (section: string, loadFunction: () => Promise<void>) => {
    try {
      console.log(`Carregando ${section}...`);
      await loadFunction();
      updateLoadingState({ [`${section}Loaded`]: true });
      console.log(`${section} carregado com sucesso`);
    } catch (error) {
      console.error(`Erro ao carregar ${section}:`, error);
      updateLoadingState({ 
        errors: [...loadingState.errors, `Erro ao carregar ${section}`]
      });
    }
  };

  const retryLoad = async (section: keyof LazyLoadingState) => {
    updateLoadingState({ 
      errors: loadingState.errors.filter(e => !e.includes(section))
    });
    
    switch (section) {
      case 'transactionsLoaded':
        await loadSection('transações', fetchTransactions);
        break;
      case 'debtsLoaded':
        await loadSection('dívidas', fetchDebts);
        break;
      case 'goalsLoaded':
        await loadSection('metas', fetchGoals);
        break;
      case 'notificationsLoaded':
        await loadSection('notificações', fetchNotifications);
        break;
    }
  };

  const retryAll = async () => {
    updateLoadingState({ errors: [], isInitialLoading: true });
    await loadAllData();
  };

  const loadAllData = async () => {
    if (!user) return;

    console.log('Iniciando carregamento dos dados financeiros...');
    updateLoadingState({ userDataLoaded: true });

    // Carregar dados em ordem de prioridade com pequenos delays
    const loadSequence = [
      { name: 'transações', fn: fetchTransactions, key: 'transactionsLoaded' },
      { name: 'metas', fn: fetchGoals, key: 'goalsLoaded' },
      { name: 'notificações', fn: fetchNotifications, key: 'notificationsLoaded' },
      { name: 'dívidas', fn: fetchDebts, key: 'debtsLoaded' }
    ];

    for (const { name, fn, key } of loadSequence) {
      await loadSection(name, fn);
      // Pequeno delay para não sobrecarregar
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    updateLoadingState({ isInitialLoading: false });
    console.log('Carregamento de dados financeiros concluído');
  };

  useEffect(() => {
    if (user) {
      loadAllData();
    } else {
      setLoadingState({
        userDataLoaded: false,
        transactionsLoaded: false,
        debtsLoaded: false,
        goalsLoaded: false,
        notificationsLoaded: false,
        isInitialLoading: false,
        errors: []
      });
    }
  }, [user]);

  const value = {
    loadingState,
    retryLoad,
    retryAll
  };

  return (
    <LazyFinancialContext.Provider value={value}>
      {children}
    </LazyFinancialContext.Provider>
  );
};
