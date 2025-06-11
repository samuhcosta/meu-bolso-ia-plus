
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { UserProfile } from '@/types/auth';
import { createTimeoutPromise, loadUserProfile } from '@/utils/authHelpers';

export const useAuthState = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const initializeAuth = async (attempt: number = 1) => {
    try {
      console.log(`Tentativa ${attempt}/${maxRetries} - Inicializando autenticação...`);
      setIsLoading(true);
      setError(null);

      // Verificar sessão com timeout de 8 segundos
      const sessionPromise = supabase.auth.getSession();
      const { data: { session }, error: sessionError } = await createTimeoutPromise(sessionPromise, 8000);
      
      if (sessionError) {
        console.error('Erro na sessão:', sessionError);
        throw new Error('Erro ao verificar sessão');
      }

      console.log('Sessão verificada com sucesso:', !!session);
      
      if (session?.user) {
        const userData = await loadUserProfile(session.user, attempt);
        setUser(userData);
        setError(null);
        setRetryCount(0);
      } else {
        console.log('Nenhuma sessão ativa, usuário não logado');
        setUser(null);
      }
      
      setIsLoading(false);

    } catch (error) {
      console.error(`Tentativa ${attempt} falhou:`, error);
      
      if (attempt < maxRetries) {
        console.log(`Tentando novamente... tentativa ${attempt + 1}/${maxRetries}`);
        setRetryCount(attempt);
        setTimeout(() => initializeAuth(attempt + 1), 2000);
      } else {
        console.error('Falha final no carregamento');
        setError('Não foi possível carregar. Verifique sua conexão.');
        setIsLoading(false);
        setRetryCount(maxRetries);
      }
    }
  };

  const retryAuth = () => {
    setRetryCount(0);
    initializeAuth(1);
  };

  const handleAuthStateChange = async (event: string, session: any) => {
    console.log('Mudança no estado de autenticação:', event, session?.user?.id);
    
    try {
      if (session?.user) {
        const userData = await loadUserProfile(session.user);
        setUser(userData);
        setError(null);
      } else {
        setUser(null);
        setError(null);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Erro na mudança do estado de auth:', error);
      setError('Erro ao processar autenticação');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener primeiro
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Inicializar auth
    if (mounted) {
      initializeAuth(1);
    }

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    setUser,
    isLoading,
    setIsLoading,
    error,
    setError,
    retryCount,
    maxRetries,
    retryAuth
  };
};
