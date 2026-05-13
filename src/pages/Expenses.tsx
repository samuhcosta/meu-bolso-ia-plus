
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFinancial, Transaction } from '@/contexts/FinancialContext';
import { useCategories } from '@/contexts/CategoryContext';
import { useToast } from '@/hooks/use-toast';
import TransactionForm from '@/components/finance/TransactionForm';
import TransactionFilters from '@/components/finance/TransactionFilters';
import TransactionList from '@/components/finance/TransactionList';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingDown, ArrowDownCircle } from 'lucide-react';

const Expenses = () => {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useFinancial();
  const { getCategoriesByType } = useCategories();
  const { toast } = useToast();

  const categories = getCategoriesByType('expense').map(c => c.name);
  const [activeTab, setActiveTab] = useState('transactions');

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
    type: 'expense',
    month: new Date().getMonth().toString(),
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
      type: 'expense' as const,
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
    setActiveTab('transactions');
  };

  const handleEdit = (transaction: Transaction) => {
    setFormData({
      type: 'expense',
      amount: transaction.amount.toString(),
      category: transaction.category,
      description: transaction.description,
      date: transaction.date
    });
    setEditingId(transaction.id);
    setActiveTab('add-transaction');
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
    setActiveTab('transactions');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const expenseTransactions = transactions.filter(t => t.type === 'expense');

  const filteredTransactions = expenseTransactions.filter(transaction => {
    const matchesSearch = (transaction.description || '').toLowerCase().includes(filters.search.toLowerCase()) ||
                         (transaction.category || '').toLowerCase().includes(filters.search.toLowerCase());
    const matchesCategory = filters.category === 'all' || transaction.category === filters.category;

    const transactionDate = new Date(transaction.date);
    const matchesMonth = filters.month === 'all' || transactionDate.getMonth() === parseInt(filters.month);
    const matchesYear = transactionDate.getFullYear().toString() === filters.year;

    return matchesSearch && matchesCategory && matchesMonth && matchesYear;
  });

  const totalExpenses = filteredTransactions.reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-rose-500/10">
          <ArrowDownCircle className="w-8 h-8 text-rose-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-rose-500">Saídas</h1>
          <p className="text-muted-foreground">
            Gerencie seus gastos e acompanhe suas despesas
          </p>
        </div>
      </div>

      <Card className="border-rose-500/20 bg-rose-500/5">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <TrendingDown className="w-6 h-6 text-rose-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total de Despesas</p>
              <p className="text-3xl font-bold text-rose-500">{formatCurrency(totalExpenses)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transactions">Meus Gastos</TabsTrigger>
          <TabsTrigger value="add-transaction">Nova Despesa</TabsTrigger>
        </TabsList>

        <TabsContent value="add-transaction" className="space-y-6">
          <TransactionForm
            formData={formData}
            editingId={editingId}
            categories={categories}
            lockedType="expense"
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <TransactionFilters
            filters={filters}
            categories={categories}
            hideTypeFilter
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

export default Expenses;
