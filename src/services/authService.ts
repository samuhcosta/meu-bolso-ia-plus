
import { supabase } from '@/integrations/supabase/client';
import { createTimeoutPromise } from '@/utils/authHelpers';

export const loginUser = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Tentando login para:', email);
    
    const loginPromise = supabase.auth.signInWithPassword({ email, password });
    const { data, error } = await createTimeoutPromise(loginPromise, 10000);

    if (error) {
      console.error('Erro no login:', error);
      
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
    return { success: false, error: 'Tempo limite excedido. Tente novamente.' };
  }
};

export const registerUser = async (name: string, email: string, password: string, whatsapp?: string): Promise<{ success: boolean; error?: string }> => {
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
      
      if (error.message.includes('User already registered')) {
        return { success: false, error: 'Este email já está cadastrado.' };
      } else {
        return { success: false, error: error.message };
      }
    }

    if (data.user && whatsapp) {
      try {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ whatsapp })
          .eq('id', data.user.id);
        
        if (updateError) {
          console.error('Erro ao atualizar WhatsApp:', updateError);
        }
      } catch (updateError) {
        console.error('Erro ao atualizar WhatsApp:', updateError);
        // Não falhar o registro por causa do WhatsApp
      }
    }

    console.log('Registro realizado com sucesso');
    return { success: true };
  } catch (error) {
    console.error('Erro no registro:', error);
    return { success: false, error: 'Tempo limite excedido. Tente novamente.' };
  }
};

export const logoutUser = async () => {
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Erro no logout:', error);
  }
};

export const updateUserProfile = async (userId: string, userData: any): Promise<void> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(userData)
      .eq('id', userId);

    if (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    }
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    throw error;
  }
};

export const requestPasswordReset = async (email: string): Promise<{ success: boolean; error?: string }> => {
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

export const resetPassword = async (token: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
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

    try {
      await supabase
        .from('profiles')
        .update({ 
          reset_token: null,
          reset_token_expires_at: null
        })
        .eq('reset_token', token);
    } catch (cleanupError) {
      console.error('Erro ao limpar token:', cleanupError);
      // Não falhar a operação por causa da limpeza
    }

    return { success: true };
  } catch (error) {
    console.error('Erro no reset de senha:', error);
    return { success: false, error: 'Erro interno. Tente novamente.' };
  }
};
