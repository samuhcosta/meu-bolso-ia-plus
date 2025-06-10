
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFinancial } from '@/contexts/FinancialContext';
import { useToast } from '@/hooks/use-toast';
import TransactionForm from '@/components/finance/TransactionForm';
import FinancialSummary from '@/components/finance/FinancialSummary';
import TransactionFilters from '@/components/finance/TransactionFilters';
import TransactionList from '@/components/finance/TransactionList';

const Finances = () => {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useFinancial();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense' | 'transfer',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    type: 'all',
    month: 'all',
    year: new Date().getFullYear().toString()
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount || !formData.category || !formData.description || !formData.date) {
      toast({
        title: "Erro de validação",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    const transactionData = {
      type: formData.type,
      amount: parseFloat(formData.amount),
      category: formData.category,
      description: formData.description,
      date: formData.date
    };

    if (editingId) {
      updateTransaction(editingId, transactionData);
      setEditingId(null);
    } else {
      addTransaction(transactionData);
    }

    setFormData({
      type: 'expense',
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleEdit = (transaction: any) => {
    setFormData({
      type: transaction.type,
      amount: transaction.amount.toString(),
      category: transaction.category,
      description: transaction.description,
      date: transaction.date
    });
    setEditingId(transaction.id);
  };

  const handleDelete = (id: string) => {
    deleteTransaction(id);
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      type: 'expense',
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(filters.search.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(filters.search.toLowerCase());
    const matchesCategory = filters.category === 'all' || transaction.category === filters.category;
    const matchesType = filters.type === 'all' || transaction.type === filters.type;
    
    const transactionDate = new Date(transaction.date);
    const matchesMonth = filters.month === 'all' || transactionDate.getMonth() === parseInt(filters.month);
    const matchesYear = transactionDate.getFullYear().toString() === filters.year;

    return matchesSearch && matchesCategory && matchesType && matchesMonth && matchesYear;
  });

  // Calculate totals
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Minhas Finanças</h1>
        <p className="text-muted-foreground">
          Gerencie suas transações e acompanhe seus gastos
        </p>
      </div>

      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transactions">Minhas Transações</TabsTrigger>
          <TabsTrigger value="add-transaction">Nova Transação</TabsTrigger>
        </TabsList>

        <TabsContent value="add-transaction" className="space-y-6">
          <TransactionForm
            formData={formData}
            editingId={editingId}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <FinancialSummary
            totalIncome={totalIncome}
            totalExpenses={totalExpenses}
            balance={balance}
            incomeTransactions={filteredTransactions.filter(t => t.type === 'income').length}
            expenseTransactions={filteredTransactions.filter(t => t.type === 'expense').length}
            totalTransactions={filteredTransactions.length}
            formatCurrency={formatCurrency}
          />

          <TransactionFilters
            filters={filters}
            onFilterChange={handleFilterChange}
          />

          <TransactionList
            transactions={filteredTransactions}
            onEdit={handleEdit}
            onDelete={handleDelete}
            formatCurrency={formatCurrency}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Finances;
