
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

      // Fetch user profile to get created_at for trial logic
      const { data: profileData } = await supabase
        .from('profiles')
        .select('created_at')
        .eq('id', user.id)
        .single();
      
      if (profileData) {
        setUserCreatedAt(profileData.created_at);
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
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { 
          priceId, 
          returnUrl: window.location.origin 
        },
      });

      if (error) throw error;
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

  const isPremium = subscription?.status === 'active' || subscription?.status === 'trialing';
  
  // Trial Logic: 5 days from created_at
  const trialDaysLimit = 5;
  let trialDaysLeft = 0;
  let trialExpired = false;

  if (userCreatedAt && !isPremium) {
    const createdDate = new Date(userCreatedAt);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    trialDaysLeft = Math.max(0, trialDaysLimit - diffDays);
    trialExpired = diffDays > trialDaysLimit;
  }

  const value = {
    subscription,
    isPremium,
    isLoading,
    trialDaysLeft,
    trialExpired,
    checkout,
    refreshSubscription: fetchSubscription,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
