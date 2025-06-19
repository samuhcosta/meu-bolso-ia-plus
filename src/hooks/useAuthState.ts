
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
  const [loadingTimeout, setLoadingTimeout] = useState<NodeJS.Timeout | null>(null);
  const maxRetries = 3;

  const initializeAuth = async (attempt: number = 1) => {
    try {
      console.log(`🔐 Auth - Tentativa ${attempt}/${maxRetries} - Inicializando autenticação...`);
      setIsLoading(true);
      setError(null);

      // Timeout reduzido para 5 segundos
      console.log('🔍 Auth - Verificando sessão existente...');
      const sessionPromise = supabase.auth.getSession();
      const { data: { session }, error: sessionError } = await createTimeoutPromise(sessionPromise, 5000);
      
      if (sessionError) {
        console.error('❌ Auth - Erro na verificação de sessão:', sessionError);
        throw new Error(`Erro ao verificar sessão: ${sessionError.message}`);
      }

      console.log('✅ Auth - Sessão verificada:', !!session?.user);
      
      if (session?.user) {
        console.log('👤 Auth - Carregando dados do usuário...');
        const userData = await loadUserProfile(session.user);
        console.log('✅ Auth - Dados do usuário carregados:', userData.name);
        setUser(userData);
        setError(null);
        setRetryCount(0);
      } else {
        console.log('ℹ️ Auth - Nenhuma sessão ativa encontrada');
        setUser(null);
      }
      
      setIsLoading(false);

    } catch (error: any) {
      console.error(`❌ Auth - Tentativa ${attempt} falhou:`, error.message);
      
      if (attempt < maxRetries) {
        console.log(`🔄 Auth - Tentando novamente em 1 segundo... (${attempt + 1}/${maxRetries})`);
        setRetryCount(attempt);
        setTimeout(() => initializeAuth(attempt + 1), 1000);
      } else {
        console.error('💥 Auth - Todas as tentativas falharam');
        setError('Não foi possível carregar os dados do servidor. Tente novamente em alguns minutos.');
        setIsLoading(false);
        setRetryCount(maxRetries);
      }
    }
  };

  const retryAuth = () => {
    console.log('🔄 Auth - Retry manual iniciado pelo usuário');
    setRetryCount(0);
    initializeAuth(1);
  };

  const handleAuthStateChange = async (event: string, session: any) => {
    console.log('🔄 Auth - Mudança no estado detectada:', event, session?.user?.id);
    
    try {
      if (session?.user) {
        console.log('👤 Auth - Carregando dados após mudança de estado...');
        const userData = await loadUserProfile(session.user);
        console.log('✅ Auth - Dados atualizados:', userData.name);
        setUser(userData);
        setError(null);
      } else {
        console.log('👋 Auth - Usuário deslogado');
        setUser(null);
        setError(null);
      }
      setIsLoading(false);
    } catch (error: any) {
      console.error('❌ Auth - Erro na mudança do estado:', error.message);
      setError('Erro ao processar mudança de autenticação');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    console.log('🚀 Auth - Inicializando sistema de autenticação...');

    // Timeout de segurança de 15 segundos
    const timeout = setTimeout(() => {
      if (mounted && isLoading) {
        console.warn('⏰ Auth - Timeout de 15s atingido, forçando fim do loading');
        setError('Conexão demorou muito para responder. Tente recarregar a página.');
        setIsLoading(false);
      }
    }, 15000);

    setLoadingTimeout(timeout);

    // Setup do listener de mudanças de auth
    console.log('📡 Auth - Configurando listener de mudanças...');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Inicializar verificação de auth
    if (mounted) {
      initializeAuth(1);
    }

    return () => {
      console.log('🧹 Auth - Limpando recursos...');
      mounted = false;
      subscription.unsubscribe();
      if (timeout) {
        clearTimeout(timeout);
      }
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
