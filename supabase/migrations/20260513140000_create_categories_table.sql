-- Categories table for user-defined categories
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'debt')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, name, type)
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'categories select') THEN
    CREATE POLICY "categories select" ON public.categories FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'categories insert') THEN
    CREATE POLICY "categories insert" ON public.categories FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'categories update') THEN
    CREATE POLICY "categories update" ON public.categories FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'categories delete') THEN
    CREATE POLICY "categories delete" ON public.categories FOR DELETE USING (auth.uid() = user_id);
  END IF;
END;
$$;

-- Seed default categories for existing users
INSERT INTO public.categories (user_id, name, type)
SELECT p.id, c.name, c.type
FROM public.profiles p
CROSS JOIN (
  VALUES 
    ('Salário', 'income'),
    ('Freelance', 'income'),
    ('Investimentos', 'income'),
    ('Outros', 'income'),
    ('Alimentação', 'expense'),
    ('Transporte', 'expense'),
    ('Moradia', 'expense'),
    ('Saúde', 'expense'),
    ('Educação', 'expense'),
    ('Lazer', 'expense'),
    ('Roupas', 'expense'),
    ('Outros', 'expense'),
    ('Cartão de Crédito', 'debt'),
    ('Empréstimo', 'debt'),
    ('Financiamento', 'debt'),
    ('Consórcio', 'debt'),
    ('FIES', 'debt'),
    ('Prestação', 'debt'),
    ('Outros', 'debt')
) AS c(name, type)
ON CONFLICT (user_id, name, type) DO NOTHING;
