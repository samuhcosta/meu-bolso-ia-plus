
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from '@/components/ui/use-toast';

interface Subscription {
  id: string;
  status: string;
  plan_name: string;
  stripe_price_id: string;
  billing_cycle: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

interface SubscriptionContextType {
  subscription: Subscription | null;
  isPremium: boolean;
  isLoading: boolean;
  trialDaysLeft: number;
  trialExpired: boolean;
  checkout: (priceId: string) => Promise<void>;
  cancelSubscription: (reason: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userCreatedAt, setUserCreatedAt] = useState<string | null>(null);
  const [trialDaysConfig, setTrialDaysConfig] = useState<number>(5);

  const fetchSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    try {
      // Fetch subscription
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (subError && subError.code !== 'PGRST116') throw subError;
      setSubscription(subData);

      // Fetch user profile to get created_at and trial_days
      const { data: profileData } = await supabase
        .from('profiles')
        .select('created_at, trial_days')
        .eq('id', user.id)
        .single();
      
      if (profileData) {
        setUserCreatedAt(profileData.created_at);
        if (profileData.trial_days != null) {
          setTrialDaysConfig(profileData.trial_days);
        }
      }

    } catch (error) {
      console.error('Error fetching subscription/profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
    
    if (user) {
      const channel = supabase
        .channel('subscription_changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'subscriptions', filter: `user_id=eq.${user.id}` }, 
          () => fetchSubscription()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const checkout = async (priceId: string) => {
    if (!user) {
      toast({
        title: "Acesso necessário",
        description: "Você precisa estar logado para assinar um plano.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('create-checkout-session', {
        body: { 
          priceId, 
          returnUrl: window.location.origin,
        },
      });

      // The function always returns 200, check data.success
      if (invokeError) {
        throw new Error(`Erro de conexão: ${invokeError.message}`);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Erro desconhecido ao iniciar checkout.');
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast({
        title: "Erro ao iniciar checkout",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  const cancelSubscription = async (reason: string): Promise<{ success: boolean; error?: string; message?: string }> => {
    if (!user) {
      return { success: false, error: "Você precisa estar logado." };
    }

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('cancel-subscription', {
        body: { reason },
      });

      if (invokeError) {
        return { success: false, error: `Erro de conexão: ${invokeError.message}` };
      }

      if (!data?.success) {
        return { success: false, error: data?.error || 'Erro ao cancelar assinatura.' };
      }

      await fetchSubscription();

      return { success: true, message: data.message };
    } catch (error: any) {
      return { success: false, error: error.message || 'Erro inesperado.' };
    }
  };

  const isPremium = subscription?.status === 'active' || subscription?.status === 'trialing';
  
  // Trial Logic: from created_at + trial_days (configurado no banco)
  let trialDaysLeft = 0;
  let trialExpired = false;

  if (isPremium) {
    trialDaysLeft = 0;
    trialExpired = false;
  } else if (userCreatedAt) {
    const createdDate = new Date(userCreatedAt);
    const currentDate = new Date();
    const diffMs = currentDate.getTime() - createdDate.getTime();
    const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    trialDaysLeft = Math.max(0, trialDaysConfig - diffDays);
    trialExpired = diffDays >= trialDaysConfig;
  } else {
    // Ainda carregando o perfil - mostra dias configurados otimisticamente
    trialDaysLeft = trialDaysConfig;
    trialExpired = false;
  }

  const value = {
    subscription,
    isPremium,
    isLoading,
    trialDaysLeft,
    trialExpired,
    checkout,
    cancelSubscription,
    refreshSubscription: fetchSubscription,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
