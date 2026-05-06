
ALTER FUNCTION public.set_updated_at() SET search_path = public;
ALTER FUNCTION public.generate_debt_installments() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
