
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useFinancial, categories, Transaction } from '@/contexts/FinancialContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Edit, 
  Trash2,
  Calendar,
  Loader2
} from 'lucide-react';

const Finances = () => {
  const { transactions, addTransaction, updateTransaction, deleteTransaction, isLoading } = useFinancial();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense' | 'transfer',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.category || !formData.description) {
      toast({
        title: "Erro de validação",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const transactionData = {
      ...formData,
      amount: parseFloat(formData.amount)
    };

    try {
      if (editingId) {
        await updateTransaction(editingId, transactionData);
        setEditingId(null);
      } else {
        await addTransaction(transactionData);
      }

      setFormData({
        type: 'expense',
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Error submitting transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setFormData({
      type: transaction.type,
      amount: transaction.amount.toString(),
      category: transaction.category,
      description: transaction.description,
      date: transaction.date
    });
    setEditingId(transaction.id);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      await deleteTransaction(id);
    }
  };

  const filteredTransactions = transactions
    .filter(t => {
      const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           t.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !filterCategory || t.category === filterCategory;
      const matchesType = !filterType || t.type === filterType;
      return matchesSearch && matchesCategory && matchesType;
    });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'income':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'expense':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'transfer':
        return <Calendar className="w-4 h-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'income': return 'Receita';
      case 'expense': return 'Despesa';
      case 'transfer': return 'Transferência';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Minhas Finanças</h1>
        <p className="text-muted-foreground">
          Gerencie suas receitas, despesas e transferências
        </p>
      </div>

      <Tabs defaultValue="add" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="add">Adicionar Transação</TabsTrigger>
          <TabsTrigger value="list">Minhas Transações</TabsTrigger>
        </TabsList>

        <TabsContent value="add" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                {editingId ? 'Editar Transação' : 'Nova Transação'}
              </CardTitle>
              <CardDescription>
                {editingId ? 'Atualize os dados da transação' : 'Adicione uma nova movimentação financeira'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo *</Label>
                    <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">
                          <div className="flex items-center">
                            <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
                            Receita
                          </div>
                        </SelectItem>
                        <SelectItem value="expense">
                          <div className="flex items-center">
                            <TrendingDown className="w-4 h-4 mr-2 text-red-600" />
                            Despesa
                          </div>
                        </SelectItem>
                        <SelectItem value="transfer">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                            Transferência
                          </div>
                        </SelectItem>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Categoria *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
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
                    <Label htmlFor="description">Descrição *</Label>
                    <Input
                      id="description"
                      placeholder="Ex: Compra no supermercado"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
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

        <TabsContent value="list" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar transação..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os tipos</SelectItem>
                    <SelectItem value="income">Receitas</SelectItem>
                    <SelectItem value="expense">Despesas</SelectItem>
                    <SelectItem value="transfer">Transferências</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as categorias</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setFilterCategory('');
                    setFilterType('');
                  }}
                >
                  Limpar Filtros
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Transações</CardTitle>
              <CardDescription>
                {isLoading ? 'Carregando...' : `${filteredTransactions.length} transação(ões) encontrada(s)`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {transactions.length === 0 
                      ? "Você ainda não possui nenhuma transação registrada. Adicione sua primeira transação!"
                      : "Nenhuma transação encontrada com os filtros aplicados"
                    }
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead className="text-center">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getTypeIcon(transaction.type)}
                              <span className="font-medium">
                                {getTypeLabel(transaction.type)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(transaction.date)}</TableCell>
                          <TableCell>{transaction.category}</TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell className={`text-right font-semibold ${
                            transaction.type === 'income' 
                              ? 'text-green-600' 
                              : transaction.type === 'expense'
                              ? 'text-red-600'
                              : 'text-blue-600'
                          }`}>
                            {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : ''}
                            {formatCurrency(Number(transaction.amount))}
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-center space-x-1">
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
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
