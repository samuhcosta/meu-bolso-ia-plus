
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { UserProfile } from '@/types/auth';

// Timeout utility
export const createTimeoutPromise = <T,>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Timeout: Operação excedeu ${timeoutMs/1000}s`));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
};

export const loadUserProfile = async (authUser: User): Promise<UserProfile> => {
  try {
    console.log('👤 Profile - Iniciando carregamento do perfil do usuário:', authUser.id);
    
    // Executar a query do Supabase com timeout - criar Promise executando a query
    const profileQueryPromise = Promise.resolve(
      supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()
    );

    const { data: profile, error } = await createTimeoutPromise(profileQueryPromise, 10000);

    if (error && error.code !== 'PGRST116') {
      console.warn('⚠️ Profile - Erro ao carregar perfil (usando dados básicos):', error.message);
    } else if (profile) {
      console.log('✅ Profile - Perfil carregado do banco:', profile.name);
    }

    const userData: UserProfile = {
      id: authUser.id,
      name: profile?.name || authUser.user_metadata?.name || 'Usuário',
      email: authUser.email || '',
      whatsapp: profile?.whatsapp || '',
      plan: 'free'
    };

    console.log('✅ Profile - Dados do usuário finalizados:', {
      id: userData.id,
      name: userData.name,
      email: userData.email
    });
    
    return userData;
    
  } catch (error: any) {
    console.error('❌ Profile - Erro ao carregar perfil, usando dados mínimos:', error.message);
    
    // Dados de fallback em caso de erro
    const fallbackData: UserProfile = {
      id: authUser.id,
      name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Usuário',
      email: authUser.email || '',
      plan: 'free'
    };

    console.log('🔄 Profile - Usando dados de fallback:', fallbackData);
    return fallbackData;
  }
};
