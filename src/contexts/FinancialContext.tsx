
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface Transaction {
  id: string;
  userId: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  category: string;
  description: string;
  date: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'alert' | 'goal' | 'motivation' | 'bill';
  read: boolean;
  createdAt: string;
}

interface FinancialContextType {
  transactions: Transaction[];
  goals: Goal[];
  notifications: Notification[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'userId' | 'createdAt'>) => void;
  updateGoal: (id: string, goal: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  getBalance: () => { income: number; expenses: number; balance: number };
  getTransactionsByPeriod: (year: number, month?: number) => Transaction[];
  getCategoryExpenses: () => { [key: string]: number };
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (context === undefined) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
};

const categories = [
  'Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Educação', 
  'Lazer', 'Roupas', 'Outros', 'Salário', 'Freelance', 'Investimentos'
];

export const FinancialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (user) {
      loadUserData();
      generateSampleNotifications();
    } else {
      setTransactions([]);
      setGoals([]);
      setNotifications([]);
    }
  }, [user]);

  const loadUserData = () => {
    if (!user) return;
    
    const savedTransactions = JSON.parse(localStorage.getItem(`transactions_${user.id}`) || '[]');
    const savedGoals = JSON.parse(localStorage.getItem(`goals_${user.id}`) || '[]');
    const savedNotifications = JSON.parse(localStorage.getItem(`notifications_${user.id}`) || '[]');
    
    setTransactions(savedTransactions);
    setGoals(savedGoals);
    setNotifications(savedNotifications);
  };

  const generateSampleNotifications = () => {
    if (!user) return;
    
    const sampleNotifications: Notification[] = [
      {
        id: '1',
        userId: user.id,
        title: 'Meta em andamento!',
        message: 'Você está a 75% da sua meta de economia mensal. Continue assim!',
        type: 'motivation',
        read: false,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        userId: user.id,
        title: 'Gasto acima da média',
        message: 'Seus gastos com alimentação estão 20% acima do mês passado.',
        type: 'alert',
        read: false,
        createdAt: new Date().toISOString()
      }
    ];
    
    const existing = JSON.parse(localStorage.getItem(`notifications_${user.id}`) || '[]');
    if (existing.length === 0) {
      localStorage.setItem(`notifications_${user.id}`, JSON.stringify(sampleNotifications));
      setNotifications(sampleNotifications);
    }
  };

  const addTransaction = (transactionData: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    
    const newTransaction: Transaction = {
      ...transactionData,
      id: Date.now().toString(),
      userId: user.id,
      createdAt: new Date().toISOString()
    };
    
    const updatedTransactions = [...transactions, newTransaction];
    setTransactions(updatedTransactions);
    localStorage.setItem(`transactions_${user.id}`, JSON.stringify(updatedTransactions));
  };

  const updateTransaction = (id: string, transactionData: Partial<Transaction>) => {
    if (!user) return;
    
    const updatedTransactions = transactions.map(t => 
      t.id === id ? { ...t, ...transactionData } : t
    );
    setTransactions(updatedTransactions);
    localStorage.setItem(`transactions_${user.id}`, JSON.stringify(updatedTransactions));
  };

  const deleteTransaction = (id: string) => {
    if (!user) return;
    
    const updatedTransactions = transactions.filter(t => t.id !== id);
    setTransactions(updatedTransactions);
    localStorage.setItem(`transactions_${user.id}`, JSON.stringify(updatedTransactions));
  };

  const addGoal = (goalData: Omit<Goal, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    
    const newGoal: Goal = {
      ...goalData,
      id: Date.now().toString(),
      userId: user.id,
      createdAt: new Date().toISOString()
    };
    
    const updatedGoals = [...goals, newGoal];
    setGoals(updatedGoals);
    localStorage.setItem(`goals_${user.id}`, JSON.stringify(updatedGoals));
  };

  const updateGoal = (id: string, goalData: Partial<Goal>) => {
    if (!user) return;
    
    const updatedGoals = goals.map(g => 
      g.id === id ? { ...g, ...goalData } : g
    );
    setGoals(updatedGoals);
    localStorage.setItem(`goals_${user.id}`, JSON.stringify(updatedGoals));
  };

  const deleteGoal = (id: string) => {
    if (!user) return;
    
    const updatedGoals = goals.filter(g => g.id !== id);
    setGoals(updatedGoals);
    localStorage.setItem(`goals_${user.id}`, JSON.stringify(updatedGoals));
  };

  const markNotificationAsRead = (id: string) => {
    if (!user) return;
    
    const updatedNotifications = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updatedNotifications);
    localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updatedNotifications));
  };

  const getBalance = () => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
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
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
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
    getCategoryExpenses
  };

  return (
    <FinancialContext.Provider value={value}>
      {children}
    </FinancialContext.Provider>
  );
};

export { categories };
