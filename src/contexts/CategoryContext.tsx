
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: 'income' | 'expense' | 'debt';
  created_at: string;
}

interface CategoryContextType {
  categories: Category[];
  loading: boolean;
  dbAvailable: boolean;
  addCategory: (name: string, type: 'income' | 'expense' | 'debt') => Promise<void>;
  updateCategory: (id: string, name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  getCategoriesByType: (type: 'income' | 'expense' | 'debt') => Category[];
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

const CATEGORY_DEFAULTS: Array<{ name: string; type: 'income' | 'expense' | 'debt' }> = [
  { name: 'Salário', type: 'income' },
  { name: 'Freelance', type: 'income' },
  { name: 'Investimentos', type: 'income' },
  { name: 'Outros', type: 'income' },
  { name: 'Alimentação', type: 'expense' },
  { name: 'Transporte', type: 'expense' },
  { name: 'Moradia', type: 'expense' },
  { name: 'Saúde', type: 'expense' },
  { name: 'Educação', type: 'expense' },
  { name: 'Lazer', type: 'expense' },
  { name: 'Roupas', type: 'expense' },
  { name: 'Outros', type: 'expense' },
  { name: 'Cartão de Crédito', type: 'debt' },
  { name: 'Empréstimo', type: 'debt' },
  { name: 'Financiamento', type: 'debt' },
  { name: 'Consórcio', type: 'debt' },
  { name: 'FIES', type: 'debt' },
  { name: 'Prestação', type: 'debt' },
  { name: 'Outros', type: 'debt' },
];

let localCounter = 0;
function makeLocalCategory(name: string, type: 'income' | 'expense' | 'debt', userId: string): Category {
  localCounter++;
  return {
    id: `local-${localCounter}-${Date.now()}`,
    user_id: userId,
    name,
    type,
    created_at: new Date().toISOString(),
  };
}

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [dbAvailable, setDbAvailable] = useState(false);
  const seeded = useRef(false);

  const loadFromDb = useCallback(async (): Promise<Category[] | null> => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('type')
      .order('name');

    if (error) {
      console.warn('Category table not available yet, using local fallback:', error.message);
      return null;
    }
    return data as Category[];
  }, [user]);

  const seedDb = useCallback(async () => {
    if (!user || seeded.current) return;
    seeded.current = true;
    const { error } = await supabase.from('categories').insert(
      CATEGORY_DEFAULTS.map(cat => ({
        user_id: user.id,
        name: cat.name,
        type: cat.type,
      }))
    );
    if (error) {
      console.warn('Could not seed categories to DB:', error.message);
    }
  }, [user]);

  const initCategories = useCallback(async () => {
    if (!user) {
      setCategories([]);
      setDbAvailable(false);
      return;
    }

    setLoading(true);
    try {
      const fromDb = await loadFromDb();

      if (fromDb !== null) {
        setDbAvailable(true);
        if (fromDb.length === 0) {
          await seedDb();
          const refreshed = await loadFromDb();
          setCategories(refreshed || fromDb);
        } else {
          setCategories(fromDb);
        }
      } else {
        setDbAvailable(false);
        setCategories(
          CATEGORY_DEFAULTS.map(c => makeLocalCategory(c.name, c.type, user.id))
        );
      }
    } catch (err) {
      console.error('Error initializing categories:', err);
      setDbAvailable(false);
      if (user) {
        setCategories(
          CATEGORY_DEFAULTS.map(c => makeLocalCategory(c.name, c.type, user.id))
        );
      }
    } finally {
      setLoading(false);
    }
  }, [user, loadFromDb, seedDb]);

  useEffect(() => {
    initCategories();
  }, [user, initCategories]);

  const addCategory = async (name: string, type: 'income' | 'expense' | 'debt') => {
    if (!user) return;

    const exists = categories.some(c => c.name === name && c.type === type);
    if (exists) {
      toast({
        title: "Categoria duplicada",
        description: `Já existe uma categoria "${name}" do tipo ${type === 'income' ? 'Receita' : type === 'expense' ? 'Despesa' : 'Dívida'}.`,
        variant: "destructive",
      });
      return;
    }

    if (dbAvailable) {
      try {
        const { data, error } = await supabase
          .from('categories')
          .insert({ user_id: user.id, name, type })
          .select()
          .single();

        if (error) {
          toast({
            title: "Erro",
            description: "Não foi possível adicionar a categoria.",
            variant: "destructive",
          });
          return;
        }

        setCategories(prev => [...prev, data as Category]);
      } catch (error) {
        console.error('Error adding category:', error);
        return;
      }
    } else {
      const local = makeLocalCategory(name, type, user.id);
      setCategories(prev => [...prev, local]);
    }

    toast({
      title: "Sucesso!",
      description: `Categoria "${name}" adicionada.`,
    });
  };

  const updateCategory = async (id: string, name: string) => {
    if (!user) return;

    if (dbAvailable) {
      try {
        const { data, error } = await supabase
          .from('categories')
          .update({ name })
          .eq('id', id)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) {
          toast({
            title: "Erro",
            description: "Não foi possível atualizar a categoria.",
            variant: "destructive",
          });
          return;
        }

        setCategories(prev => prev.map(c => c.id === id ? (data as Category) : c));
      } catch (error) {
        console.error('Error updating category:', error);
        return;
      }
    } else {
      setCategories(prev => prev.map(c => c.id === id ? { ...c, name } : c));
    }

    toast({
      title: "Sucesso!",
      description: "Categoria atualizada.",
    });
  };

  const deleteCategory = async (id: string) => {
    if (!user) return;

    if (dbAvailable) {
      try {
        const { error } = await supabase
          .from('categories')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) {
          toast({
            title: "Erro",
            description: "Não foi possível excluir a categoria.",
            variant: "destructive",
          });
          return;
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        return;
      }
    }

    setCategories(prev => prev.filter(c => c.id !== id));
    toast({
      title: "Sucesso!",
      description: "Categoria excluída.",
    });
  };

  const getCategoriesByType = (type: 'income' | 'expense' | 'debt') => {
    return categories.filter(c => c.type === type);
  };

  return (
    <CategoryContext.Provider value={{
      categories,
      loading,
      dbAvailable,
      addCategory,
      updateCategory,
      deleteCategory,
      getCategoriesByType,
    }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
};
