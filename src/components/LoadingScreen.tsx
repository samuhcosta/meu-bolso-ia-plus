
import React, { useState, useEffect } from 'react';
import { Loader2, DollarSign, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LoadingScreenProps {
  message?: string;
  showRetryInfo?: boolean;
  currentRetry?: number;
  maxRetries?: number;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Carregando...",
  showRetryInfo = false,
  currentRetry = 0,
  maxRetries = 3
}) => {
  const [loadingTime, setLoadingTime] = useState(0);
  const [showSlowWarning, setShowSlowWarning] = useState(false);

  useEffect(() => {
    console.log('⏱️ Loading - Iniciando contador de tempo de carregamento');
    
    const interval = setInterval(() => {
      setLoadingTime(prev => {
        const newTime = prev + 1;
        
        // Mostrar aviso após 10 segundos
        if (newTime === 10) {
          console.warn('⚠️ Loading - Carregamento lento detectado (10s)');
          setShowSlowWarning(true);
        }
        
        return newTime;
      });
    }, 1000);

    return () => {
      console.log('🧹 Loading - Parando contador de tempo');
      clearInterval(interval);
    };
  }, []);

  const handleReload = () => {
    console.log('🔄 Loading - Usuário solicitou reload da página');
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="text-center space-y-6 max-w-md px-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center">
            <DollarSign className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-bold text-gradient">Meu Bolso Pro</span>
        </div>
        
        <div className="flex items-center justify-center space-x-3">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
          <p className="text-lg text-muted-foreground">{message}</p>
        </div>
        
        {showRetryInfo && currentRetry > 0 && (
          <div className="text-sm text-muted-foreground">
            Tentando novamente... tentativa {currentRetry}/{maxRetries}
          </div>
        )}
        
        <div className="w-64 h-1 bg-muted rounded-full mx-auto overflow-hidden">
          <div className="w-full h-full bg-gradient-to-r from-primary to-secondary animate-pulse"></div>
        </div>

        {showSlowWarning && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-center space-x-2 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">Carregamento mais lento que o esperado</span>
            </div>
            <p className="text-sm text-amber-700">
              Já se passaram {loadingTime} segundos. Pode haver problema de conexão.
            </p>
            <Button 
              onClick={handleReload}
              variant="outline"
              size="sm"
              className="w-full border-amber-200 text-amber-700 hover:bg-amber-50"
            >
              Recarregar Página
            </Button>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          Carregando há {loadingTime}s...
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
