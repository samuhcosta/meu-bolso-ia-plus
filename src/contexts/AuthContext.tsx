
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Use the exact profile type from Supabase
type Profile = Database['public']['Tables']['profiles']['Row'];

interface UserProfile {
  id: string;
  name: string;
  email: string;
  whatsapp?: string;
  plan?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, whatsapp?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
  updateUser: (userData: Partial<UserProfile>) => void;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  error: string | null;
  retryCount: number;
  maxRetries: number;
  retryAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // Timeout utility with AbortController
  const createTimeoutPromise = <T,>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
    const controller = new AbortController();
    
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        controller.abort();
        reject(new Error(`Operação excedeu ${timeoutMs/1000}s`));
      }, timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
  };

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
        await loadUserProfile(session.user, attempt);
      } else {
        console.log('Nenhuma sessão ativa, usuário não logado');
        setIsLoading(false);
      }

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

  const loadUserProfile = async (authUser: User, attempt: number = 1) => {
    try {
      console.log('Iniciando carregamento de dados do usuário...');
      
      // Carregar perfil com timeout de 5 segundos
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
        
      const { data: profile, error } = await createTimeoutPromise(profilePromise, 5000);

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar perfil:', error);
        // Não falhar completamente, usar dados básicos
      }

      const userData = {
        id: authUser.id,
        name: profile?.name || authUser.user_metadata?.name || 'Usuário',
        email: authUser.email || '',
        whatsapp: profile?.whatsapp || '',
        plan: 'free'
      };

      setUser(userData);
      setError(null);
      setRetryCount(0);
      console.log('Dados do usuário carregados com sucesso');
      
    } catch (error) {
      console.error('Erro ao carregar perfil do usuário:', error);
      
      // Usar dados mínimos em caso de erro
      setUser({
        id: authUser.id,
        name: authUser.user_metadata?.name || 'Usuário',
        email: authUser.email || '',
        plan: 'free'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const retryAuth = () => {
    setRetryCount(0);
    initializeAuth(1);
  };

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener primeiro
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Mudança no estado de autenticação:', event, session?.user?.id);
      
      if (!mounted) return;

      try {
        if (session?.user) {
          await loadUserProfile(session.user);
        } else {
          setUser(null);
          setError(null);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Erro na mudança do estado de auth:', error);
        setError('Erro ao processar autenticação');
        setIsLoading(false);
      }
    });

    // Inicializar auth
    initializeAuth(1);

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Tentando login para:', email);
      
      const loginPromise = supabase.auth.signInWithPassword({ email, password });
      const { data, error } = await createTimeoutPromise(loginPromise, 10000);

      if (error) {
        console.error('Erro no login:', error);
        setIsLoading(false);
        
        if (error.message.includes('Invalid login credentials')) {
          return { success: false, error: 'Email ou senha incorretos.' };
        } else if (error.message.includes('Email not confirmed')) {
          return { success: false, error: 'Por favor, confirme seu email antes de fazer login.' };
        } else {
          return { success: false, error: error.message };
        }
      }

      console.log('Login realizado com sucesso');
      return { success: true };
    } catch (error) {
      console.error('Erro no login:', error);
      setIsLoading(false);
      return { success: false, error: 'Tempo limite excedido. Tente novamente.' };
    }
  };

  const register = async (name: string, email: string, password: string, whatsapp?: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Tentando registro para:', email);
      
      const registerPromise = supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name: name },
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      const { data, error } = await createTimeoutPromise(registerPromise, 10000);

      if (error) {
        console.error('Erro no registro:', error);
        setIsLoading(false);
        
        if (error.message.includes('User already registered')) {
          return { success: false, error: 'Este email já está cadastrado.' };
        } else {
          return { success: false, error: error.message };
        }
      }

      if (data.user && whatsapp) {
        await supabase
          .from('profiles')
          .update({ whatsapp })
          .eq('id', data.user.id);
      }

      console.log('Registro realizado com sucesso');
      return { success: true };
    } catch (error) {
      console.error('Erro no registro:', error);
      setIsLoading(false);
      return { success: false, error: 'Tempo limite excedido. Tente novamente.' };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setError(null);
    } catch (error) {
      console.error('Erro no logout:', error);
      setUser(null);
      setError(null);
    }
  };

  const updateUser = async (userData: Partial<UserProfile>) => {
    if (!user) return;

    try {
      const updatePromise = supabase
        .from('profiles')
        .update(userData)
        .eq('id', user.id);
        
      const { error } = await createTimeoutPromise(updatePromise, 5000);

      if (error) {
        console.error('Erro ao atualizar perfil:', error);
        return;
      }

      setUser({ ...user, ...userData });
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
    }
  };

  const requestPasswordReset = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('Solicitando reset de senha para:', email);
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', email)
        .single();

      if (profileError || !profile) {
        return { success: false, error: 'E-mail não encontrado em nossa base.' };
      }

      const resetToken = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          reset_token: resetToken,
          reset_token_expires_at: expiresAt.toISOString()
        })
        .eq('email', email);

      if (updateError) {
        console.error('Erro ao salvar token de reset:', updateError);
        return { success: false, error: 'Erro interno. Tente novamente.' };
      }

      const resetLink = `${window.location.origin}/reset-password?token=${resetToken}`;
      console.log('Link de reset de senha:', resetLink);
      
      return { success: true };
    } catch (error) {
      console.error('Erro na solicitação de reset:', error);
      return { success: false, error: 'Erro interno. Tente novamente.' };
    }
  };

  const resetPassword = async (token: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('Redefinindo senha com token:', token);
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, reset_token_expires_at')
        .eq('reset_token', token)
        .single();

      if (profileError || !profile) {
        return { success: false, error: 'Token de redefinição inválido.' };
      }

      const now = new Date();
      const expiresAt = new Date(profile.reset_token_expires_at!);
      
      if (now > expiresAt) {
        return { success: false, error: 'Este link expirou. Solicite uma nova redefinição.' };
      }

      const { error: resetError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (resetError) {
        console.error('Erro ao redefinir senha:', resetError);
        return { success: false, error: 'Erro ao redefinir senha. Tente novamente.' };
      }

      await supabase
        .from('profiles')
        .update({ 
          reset_token: null,
          reset_token_expires_at: null
        })
        .eq('reset_token', token);

      return { success: true };
    } catch (error) {
      console.error('Erro no reset de senha:', error);
      return { success: false, error: 'Erro interno. Tente novamente.' };
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    isLoading,
    updateUser,
    requestPasswordReset,
    resetPassword,
    error,
    retryCount,
    maxRetries,
    retryAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
