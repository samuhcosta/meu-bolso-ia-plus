
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useFinancial, categories } from '@/contexts/FinancialContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Calendar,
  DollarSign
} from 'lucide-react';

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
          {/* Add Transaction Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                {editingId ? 'Editar Transação' : 'Nova Transação'}
              </CardTitle>
              <CardDescription>
                {editingId ? 'Atualize os dados da transação' : 'Adicione uma nova receita ou despesa'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo *</Label>
                    <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Receita</SelectItem>
                        <SelectItem value="expense">Despesa</SelectItem>
                        <SelectItem value="transfer">Transferência</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Valor (R$) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      value={formData.amount}
                      onChange={(e) => handleInputChange('amount', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Data *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição *</Label>
                  <Input
                    id="description"
                    placeholder="Ex: Compra no supermercado"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit">
                    {editingId ? 'Atualizar Transação' : 'Adicionar Transação'}
                  </Button>
                  {editingId && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setEditingId(null);
                        setFormData({
                          type: 'expense',
                          amount: '',
                          category: '',
                          description: '',
                          date: new Date().toISOString().split('T')[0]
                        });
                      }}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receitas</CardTitle>
                <TrendingUp className="h-4 w-4 text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-secondary">
                  {formatCurrency(totalIncome)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {filteredTransactions.filter(t => t.type === 'income').length} transações
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Despesas</CardTitle>
                <TrendingDown className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  {formatCurrency(totalExpenses)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {filteredTransactions.filter(t => t.type === 'expense').length} transações
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Saldo</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${
                  balance >= 0 ? 'text-secondary' : 'text-destructive'
                }`}>
                  {formatCurrency(balance)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {filteredTransactions.length} transações no total
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Buscar</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Descrição ou categoria"
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="income">Receita</SelectItem>
                      <SelectItem value="expense">Despesa</SelectItem>
                      <SelectItem value="transfer">Transferência</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Mês</Label>
                  <Select value={filters.month} onValueChange={(value) => handleFilterChange('month', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="0">Janeiro</SelectItem>
                      <SelectItem value="1">Fevereiro</SelectItem>
                      <SelectItem value="2">Março</SelectItem>
                      <SelectItem value="3">Abril</SelectItem>
                      <SelectItem value="4">Maio</SelectItem>
                      <SelectItem value="5">Junho</SelectItem>
                      <SelectItem value="6">Julho</SelectItem>
                      <SelectItem value="7">Agosto</SelectItem>
                      <SelectItem value="8">Setembro</SelectItem>
                      <SelectItem value="9">Outubro</SelectItem>
                      <SelectItem value="10">Novembro</SelectItem>
                      <SelectItem value="11">Dezembro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Ano</Label>
                  <Select value={filters.year} onValueChange={(value) => handleFilterChange('year', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Ano" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions List */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Transações</CardTitle>
              <CardDescription>
                {filteredTransactions.length > 0 
                  ? `${filteredTransactions.length} transação(ões) encontrada(s)`
                  : 'Nenhuma transação encontrada'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    {transactions.length === 0 
                      ? 'Nenhuma transação registrada'
                      : 'Nenhuma transação encontrada'
                    }
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {transactions.length === 0 
                      ? 'Comece adicionando sua primeira transação'
                      : 'Tente ajustar os filtros para encontrar suas transações'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTransactions.map((transaction) => (
                    <div 
                      key={transaction.id} 
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === 'income' 
                            ? 'bg-secondary/10' 
                            : transaction.type === 'expense'
                            ? 'bg-destructive/10'
                            : 'bg-primary/10'
                        }`}>
                          {transaction.type === 'income' ? (
                            <TrendingUp className="w-5 h-5 text-secondary" />
                          ) : transaction.type === 'expense' ? (
                            <TrendingDown className="w-5 h-5 text-destructive" />
                          ) : (
                            <DollarSign className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        
                        <div>
                          <h4 className="font-medium">{transaction.description}</h4>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Badge variant="outline">{transaction.category}</Badge>
                            <span>•</span>
                            <span>{new Date(transaction.date).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className={`text-lg font-semibold ${
                          transaction.type === 'income' 
                            ? 'text-secondary' 
                            : transaction.type === 'expense'
                            ? 'text-destructive'
                            : 'text-primary'
                        }`}>
                          {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : ''}
                          {formatCurrency(transaction.amount)}
                        </div>
                        
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(transaction)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(transaction.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Finances;
