
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Settings2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import CategoryManager from '@/components/category/CategoryManager';

interface TransactionFormData {
  type: 'income' | 'expense' | 'transfer';
  amount: string;
  category: string;
  description: string;
  date: string;
}

interface TransactionFormProps {
  formData: TransactionFormData;
  editingId: string | null;
  categories: string[];
  lockedType?: 'income' | 'expense';
  onInputChange: (field: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  formData,
  editingId,
  categories,
  lockedType,
  onInputChange,
  onSubmit,
  onCancel
}) => {
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  const isIncome = lockedType === 'income' || formData.type === 'income';
  const isExpense = lockedType === 'expense' || formData.type === 'expense';

  return (
    <>
      <Card className={`border-t-4 ${isIncome ? 'border-t-emerald-500' : isExpense ? 'border-t-rose-500' : ''}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {lockedType === 'income' ? (
              <ArrowUpCircle className="w-5 h-5 text-emerald-500" />
            ) : lockedType === 'expense' ? (
              <ArrowDownCircle className="w-5 h-5 text-rose-500" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
            {editingId ? 'Editar Transação' : lockedType === 'income' ? 'Nova Receita' : lockedType === 'expense' ? 'Nova Despesa' : 'Nova Transação'}
          </CardTitle>
          <CardDescription>
            {editingId ? 'Atualize os dados da transação' : lockedType === 'income' ? 'Adicione uma nova receita' : lockedType === 'expense' ? 'Adicione uma nova despesa' : 'Adicione uma nova receita ou despesa'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!lockedType && (
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo *</Label>
                  <Select value={formData.type} onValueChange={(value) => onInputChange('type', value)}>
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
              )}

              <div className="space-y-2">
                <Label htmlFor="amount">Valor (R$) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.amount}
                  onChange={(e) => onInputChange('amount', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="category">Categoria *</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => setShowCategoryManager(true)}
                  >
                    <Settings2 className="h-3 w-3 mr-1" />
                    Gerenciar
                  </Button>
                </div>
                <Select value={formData.category} onValueChange={(value) => onInputChange('category', value)}>
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
                  onChange={(e) => onInputChange('date', e.target.value)}
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
                onChange={(e) => onInputChange('description', e.target.value)}
                required
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit">
                {editingId ? 'Atualizar Transação' : 'Adicionar'}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <CategoryManager
        type={lockedType}
        open={showCategoryManager}
        onOpenChange={setShowCategoryManager}
      />
    </>
  );
};

export default TransactionForm;
