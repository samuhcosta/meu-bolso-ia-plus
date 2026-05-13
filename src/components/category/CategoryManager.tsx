
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import { useCategories, Category } from '@/contexts/CategoryContext';

interface CategoryManagerProps {
  type?: 'income' | 'expense' | 'debt';
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TYPE_LABELS: Record<string, string> = {
  income: 'Receitas',
  expense: 'Despesas',
  debt: 'Dívidas',
};

const CategoryManager: React.FC<CategoryManagerProps> = ({ type, open, onOpenChange }) => {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories();
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'income' | 'expense' | 'debt'>(type || 'expense');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const filteredCategories = type
    ? categories.filter(c => c.type === type)
    : categories;

  const grouped = filteredCategories.reduce<Record<string, Category[]>>((acc, cat) => {
    if (!acc[cat.type]) acc[cat.type] = [];
    acc[cat.type].push(cat);
    return acc;
  }, {});

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await addCategory(newName.trim(), newType);
    setNewName('');
  };

  const handleStartEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) return;
    await updateCategory(id, editName.trim());
    setEditingId(null);
    setEditName('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleDelete = async (cat: Category) => {
    if (window.confirm(`Tem certeza que deseja excluir a categoria "${cat.name}"?\n\nAs transações existentes com essa categoria não serão afetadas.`)) {
      await deleteCategory(cat.id);
    }
  };

  const typesToShow = type ? [type] : Object.keys(grouped) as ('income' | 'expense' | 'debt')[];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Categorias</DialogTitle>
          <DialogDescription>
            Adicione, edite ou remova categorias personalizadas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-end gap-2 p-3 border rounded-lg bg-muted/30">
            <div className="flex-1 space-y-1">
              <Label htmlFor="new-category">Nova categoria</Label>
              <Input
                id="new-category"
                placeholder="Nome da categoria"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
            </div>
            {!type && (
              <div className="w-32 space-y-1">
                <Label htmlFor="new-type">Tipo</Label>
                <Select value={newType} onValueChange={(v) => setNewType(v as 'income' | 'expense' | 'debt')}>
                  <SelectTrigger id="new-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Receita</SelectItem>
                    <SelectItem value="expense">Despesa</SelectItem>
                    <SelectItem value="debt">Dívida</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button onClick={handleAdd} size="icon" className="flex-shrink-0">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {typesToShow.map((t) => (
            <div key={t}>
              <h4 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                {TYPE_LABELS[t]}
              </h4>
              <div className="space-y-1">
                {(grouped[t] || []).map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 group"
                  >
                    {editingId === cat.id ? (
                      <>
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(cat.id)}
                          className="h-8 flex-1"
                          autoFocus
                        />
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleSaveEdit(cat.id)}>
                          <Check className="h-4 w-4 text-green-500" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCancelEdit}>
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 text-sm">{cat.name}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100" onClick={() => handleStartEdit(cat)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 hover:text-red-500" onClick={() => handleDelete(cat)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                ))}
                {(!grouped[t] || grouped[t].length === 0) && (
                  <p className="text-xs text-muted-foreground p-2">Nenhuma categoria cadastrada.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryManager;
