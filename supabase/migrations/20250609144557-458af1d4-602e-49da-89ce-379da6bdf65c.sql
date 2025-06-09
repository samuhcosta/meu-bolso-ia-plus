
-- Adicionar colunas para recuperação de senha na tabela profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS reset_token TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS reset_token_expires_at TIMESTAMP WITH TIME ZONE;

-- Criar índice para melhor performance na busca por tokens
CREATE INDEX IF NOT EXISTS idx_profiles_reset_token ON public.profiles(reset_token);

-- Criar função para limpar tokens expirados (limpeza automática)
CREATE OR REPLACE FUNCTION public.cleanup_expired_reset_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles 
  SET reset_token = NULL, reset_token_expires_at = NULL
  WHERE reset_token_expires_at < NOW();
END;
$$;
