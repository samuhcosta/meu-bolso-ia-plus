
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

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session);
      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session);
      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (authUser: User) => {
    try {
      console.log('Loading profile for user:', authUser.id);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        setIsLoading(false);
        return;
      }

      setUser({
        id: authUser.id,
        name: profile?.name || authUser.user_metadata?.name || '',
        email: authUser.email || '',
        whatsapp: profile?.whatsapp || '',
        plan: 'free' // Default plan
      });
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      console.log('Attempting login for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Login error:', error);
        setIsLoading(false);
        
        // Tratar diferentes tipos de erro
        if (error.message.includes('Invalid login credentials')) {
          return { success: false, error: 'Email ou senha incorretos.' };
        } else if (error.message.includes('Email not confirmed')) {
          return { success: false, error: 'Por favor, confirme seu email antes de fazer login.' };
        } else {
          return { success: false, error: error.message };
        }
      }

      console.log('Login successful:', data);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return { success: false, error: 'Erro interno. Tente novamente.' };
    }
  };

  const register = async (name: string, email: string, password: string, whatsapp?: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      console.log('Attempting registration for:', email);
      
      // Disable email confirmation for immediate login
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          },
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        console.error('Registration error:', error);
        setIsLoading(false);
        
        if (error.message.includes('User already registered')) {
          return { success: false, error: 'Este email já está cadastrado.' };
        } else {
          return { success: false, error: error.message };
        }
      }

      // Update profile with additional data if user was created
      if (data.user && whatsapp) {
        await supabase
          .from('profiles')
          .update({ whatsapp })
          .eq('id', data.user.id);
      }

      console.log('Registration successful:', data);
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      setIsLoading(false);
      return { success: false, error: 'Erro interno. Tente novamente.' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const updateUser = async (userData: Partial<UserProfile>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(userData)
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        return;
      }

      setUser({ ...user, ...userData });
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const requestPasswordReset = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('Requesting password reset for:', email);
      
      // First check if email exists in our database
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', email)
        .single();

      if (profileError || !profile) {
        return { success: false, error: 'E-mail não encontrado em nossa base.' };
      }

      // Generate reset token and expiration
      const resetToken = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour from now

      // Store token in profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          reset_token: resetToken,
          reset_token_expires_at: expiresAt.toISOString()
        })
        .eq('email', email);

      if (updateError) {
        console.error('Error storing reset token:', updateError);
        return { success: false, error: 'Erro interno. Tente novamente.' };
      }

      // For now, we'll just log the reset link since we don't have email sending configured
      const resetLink = `${window.location.origin}/reset-password?token=${resetToken}`;
      console.log('Password reset link:', resetLink);
      
      return { success: true };
    } catch (error) {
      console.error('Password reset request error:', error);
      return { success: false, error: 'Erro interno. Tente novamente.' };
    }
  };

  const resetPassword = async (token: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('Resetting password with token:', token);
      
      // Find profile with valid token
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, reset_token_expires_at')
        .eq('reset_token', token)
        .single();

      if (profileError || !profile) {
        return { success: false, error: 'Token de redefinição inválido.' };
      }

      // Check if token is expired
      const now = new Date();
      const expiresAt = new Date(profile.reset_token_expires_at!);
      
      if (now > expiresAt) {
        return { success: false, error: 'Este link expirou. Solicite uma nova redefinição.' };
      }

      // Reset password using Supabase admin function (this would need to be done via edge function in production)
      // For now, we'll use the auth.updateUser method with the user's session
      const { error: resetError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (resetError) {
        console.error('Error resetting password:', resetError);
        return { success: false, error: 'Erro ao redefinir senha. Tente novamente.' };
      }

      // Clear reset token
      await supabase
        .from('profiles')
        .update({ 
          reset_token: null,
          reset_token_expires_at: null
        })
        .eq('reset_token', token);

      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
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
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
