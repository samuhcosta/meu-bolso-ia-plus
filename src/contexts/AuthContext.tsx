
import React, { createContext, useContext } from 'react';
import { AuthContextType, UserProfile } from '@/types/auth';
import { useAuthState } from '@/hooks/useAuthState';
import { loginUser, registerUser, logoutUser, updateUserProfile, requestPasswordReset as requestReset, resetPassword as resetPass } from '@/services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    user,
    setUser,
    isLoading,
    setIsLoading,
    error,
    retryCount,
    maxRetries,
    retryAuth
  } = useAuthState();

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    const result = await loginUser(email, password);
    setIsLoading(false);
    return result;
  };

  const register = async (name: string, email: string, password: string, whatsapp?: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    const result = await registerUser(name, email, password, whatsapp);
    setIsLoading(false);
    return result;
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  const updateUser = async (userData: Partial<UserProfile>) => {
    if (!user) return;

    try {
      await updateUserProfile(user.id, userData);
      setUser({ ...user, ...userData });
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
    }
  };

  const requestPasswordReset = async (email: string): Promise<{ success: boolean; error?: string }> => {
    return await requestReset(email);
  };

  const resetPassword = async (token: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    return await resetPass(token, newPassword);
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
