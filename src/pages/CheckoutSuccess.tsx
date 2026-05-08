
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { toast } from '@/components/ui/use-toast';

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshSubscription, isPremium } = useSubscription();

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      // Small delay to allow webhook to process
      const timer = setTimeout(() => {
        refreshSubscription();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, refreshSubscription]);

  useEffect(() => {
    if (isPremium) {
      toast({
        title: "Assinatura ativada!",
        description: "Bem-vindo ao Meu Bolso Pro Premium.",
      });
    }
  }, [isPremium]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-8 p-8 rounded-2xl bg-card border border-border shadow-xl">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-primary" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Pagamento Aprovado!</h1>
          <p className="text-muted-foreground text-lg">
            Sua assinatura está sendo processada. Em alguns segundos seu acesso será liberado.
          </p>
        </div>

        <div className="flex flex-col space-y-4 pt-4">
          <Button 
            size="lg" 
            className="w-full text-lg h-12"
            onClick={() => navigate('/dashboard')}
          >
            Ir para o Dashboard
          </Button>
          
          <div className="flex items-center justify-center text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Sincronizando conta...
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
