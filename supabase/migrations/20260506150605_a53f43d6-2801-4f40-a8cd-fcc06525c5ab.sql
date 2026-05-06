UPDATE auth.users SET email_confirmed_at = now() WHERE email_confirmed_at IS NULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.debts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.debt_installments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.goals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

ALTER TABLE public.transactions REPLICA IDENTITY FULL;
ALTER TABLE public.debts REPLICA IDENTITY FULL;
ALTER TABLE public.debt_installments REPLICA IDENTITY FULL;
ALTER TABLE public.goals REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;