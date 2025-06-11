
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { UserProfile } from '@/types/auth';

// Timeout utility with AbortController
export const createTimeoutPromise = <T,>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  const controller = new AbortController();
  
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      controller.abort();
      reject(new Error(`Operação excedeu ${timeoutMs/1000}s`));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
};

export const loadUserProfile = async (authUser: User): Promise<UserProfile> => {
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

    console.log('Dados do usuário carregados com sucesso');
    return userData;
    
  } catch (error) {
    console.error('Erro ao carregar perfil do usuário:', error);
    
    // Usar dados mínimos em caso de erro
    return {
      id: authUser.id,
      name: authUser.user_metadata?.name || 'Usuário',
      email: authUser.email || '',
      plan: 'free'
    };
  }
};
