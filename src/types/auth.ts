
import type { Database } from '@/integrations/supabase/types';

// Use the exact profile type from Supabase
type Profile = Database['public']['Tables']['profiles']['Row'];

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  whatsapp?: string;
  plan?: string;
}

export interface AuthContextType {
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
