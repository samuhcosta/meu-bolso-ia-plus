
-- Criar tabela para dívidas programadas
CREATE TABLE public.debts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  total_amount NUMERIC NOT NULL,
  installment_amount NUMERIC NOT NULL,
  total_installments INTEGER NOT NULL,
  paid_installments INTEGER NOT NULL DEFAULT 0,
  first_installment_date DATE NOT NULL,
  monthly_due_day INTEGER NOT NULL CHECK (monthly_due_day >= 1 AND monthly_due_day <= 31),
  category TEXT NOT NULL,
  notes TEXT,
  notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para cronograma de parcelas
CREATE TABLE public.debt_installments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  debt_id UUID REFERENCES public.debts(id) ON DELETE CASCADE NOT NULL,
  installment_number INTEGER NOT NULL,
  due_date DATE NOT NULL,
  amount NUMERIC NOT NULL,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  paid_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para notificações de dívidas
CREATE TABLE public.debt_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  debt_id UUID REFERENCES public.debts(id) ON DELETE CASCADE NOT NULL,
  installment_id UUID REFERENCES public.debt_installments(id) ON DELETE CASCADE NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('2_days_before', 'due_date', '1_day_after')),
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debt_installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debt_notifications ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para debts
CREATE POLICY "Users can view their own debts" 
  ON public.debts 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own debts" 
  ON public.debts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own debts" 
  ON public.debts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own debts" 
  ON public.debts 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas RLS para debt_installments
CREATE POLICY "Users can view installments of their debts" 
  ON public.debt_installments 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.debts 
    WHERE debts.id = debt_installments.debt_id 
    AND debts.user_id = auth.uid()
  ));

CREATE POLICY "Users can create installments for their debts" 
  ON public.debt_installments 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.debts 
    WHERE debts.id = debt_installments.debt_id 
    AND debts.user_id = auth.uid()
  ));

CREATE POLICY "Users can update installments of their debts" 
  ON public.debt_installments 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.debts 
    WHERE debts.id = debt_installments.debt_id 
    AND debts.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete installments of their debts" 
  ON public.debt_installments 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.debts 
    WHERE debts.id = debt_installments.debt_id 
    AND debts.user_id = auth.uid()
  ));

-- Políticas RLS para debt_notifications
CREATE POLICY "Users can view notifications of their debts" 
  ON public.debt_notifications 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.debts 
    WHERE debts.id = debt_notifications.debt_id 
    AND debts.user_id = auth.uid()
  ));

CREATE POLICY "System can manage debt notifications" 
  ON public.debt_notifications 
  FOR ALL 
  USING (true);

-- Função para gerar parcelas automaticamente
CREATE OR REPLACE FUNCTION generate_debt_installments(
  p_debt_id UUID,
  p_total_installments INTEGER,
  p_first_installment_date DATE,
  p_monthly_due_day INTEGER,
  p_installment_amount NUMERIC
)
RETURNS VOID AS $$
DECLARE
  i INTEGER;
  installment_date DATE;
BEGIN
  FOR i IN 1..p_total_installments LOOP
    -- Calcular a data da parcela baseada no mês e dia de vencimento
    installment_date := (p_first_installment_date + INTERVAL '1 month' * (i - 1));
    
    -- Ajustar para o dia de vencimento mensal correto
    installment_date := make_date(
      EXTRACT(YEAR FROM installment_date)::INTEGER,
      EXTRACT(MONTH FROM installment_date)::INTEGER,
      LEAST(p_monthly_due_day, EXTRACT(DAY FROM (date_trunc('month', installment_date) + INTERVAL '1 month - 1 day'))::INTEGER)
    );
    
    INSERT INTO public.debt_installments (
      debt_id,
      installment_number,
      due_date,
      amount
    ) VALUES (
      p_debt_id,
      i,
      installment_date,
      p_installment_amount
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para gerar parcelas automaticamente após inserir uma dívida
CREATE OR REPLACE FUNCTION trigger_generate_installments()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM generate_debt_installments(
    NEW.id,
    NEW.total_installments,
    NEW.first_installment_date,
    NEW.monthly_due_day,
    NEW.installment_amount
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_debt_insert
  AFTER INSERT ON public.debts
  FOR EACH ROW
  EXECUTE FUNCTION trigger_generate_installments();

-- Função para atualizar o updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_debts_updated_at
  BEFORE UPDATE ON public.debts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_debt_installments_updated_at
  BEFORE UPDATE ON public.debt_installments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
