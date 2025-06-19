
import React from 'react';
import { AlertCircle, RefreshCw, DollarSign, Wifi, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorScreenProps {
  error: string;
  onRetry?: () => void;
  retryCount?: number;
  maxRetries?: number;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ 
  error, 
  onRetry,
  retryCount = 0,
  maxRetries = 3
}) => {
  const handleRetry = () => {
    console.log('🔄 ErrorScreen - Usuário clicou em tentar novamente');
    if (onRetry) {
      onRetry();
    } else {
      console.log('🔄 ErrorScreen - Recarregando página (fallback)');
      window.location.reload();
    }
  };

  const handleReload = () => {
    console.log('🔄 ErrorScreen - Usuário solicitou reload completo');
    window.location.reload();
  };

  const isMaxRetriesReached = retryCount >= maxRetries;
  const isConnectionError = error.toLowerCase().includes('timeout') || 
                           error.toLowerCase().includes('conexão') ||
                           error.toLowerCase().includes('servidor');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">Meu Bolso Pro</span>
          </div>
          
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            {isConnectionError ? (
              <Wifi className="h-8 w-8 text-red-600" />
            ) : isMaxRetriesReached ? (
              <Clock className="h-8 w-8 text-red-600" />
            ) : (
              <AlertCircle className="h-8 w-8 text-red-600" />
            )}
          </div>
          
          <CardTitle className="text-xl font-bold text-destructive">
            {isConnectionError 
              ? 'Problema de Conexão' 
              : isMaxRetriesReached 
                ? 'Múltiplas Tentativas Falharam'
                : 'Ops! Algo deu errado'
            }
          </CardTitle>
          
          <CardDescription className="text-center">
            {isConnectionError 
              ? 'Não foi possível carregar os dados do servidor. Verifique sua conexão com a internet.'
              : error
            }
          </CardDescription>
          
          {retryCount > 0 && (
            <div className="text-sm text-muted-foreground mt-2 bg-muted/50 rounded p-2">
              Tentativas realizadas: {retryCount}/{maxRetries}
            </div>
          )}
        </CardHeader>
        
        <CardContent className="space-y-4">
          {!isMaxRetriesReached && (
            <Button 
              onClick={handleRetry}
              className="w-full"
              variant="default"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
          )}
          
          <Button 
            onClick={handleReload}
            className="w-full"
            variant={isMaxRetriesReached ? "default" : "outline"}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Recarregar Página Completa
          </Button>
          
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              {isConnectionError ? 'Dicas para resolver:' : 'Sugestões:'}
            </p>
            <ul className="text-xs text-muted-foreground space-y-1">
              {isConnectionError ? (
                <>
                  <li>• Verifique sua conexão com a internet</li>
                  <li>• Tente usar Wi-Fi ou dados móveis</li>
                  <li>• Aguarde alguns minutos e tente novamente</li>
                </>
              ) : (
                <>
                  <li>• Recarregue a página</li>
                  <li>• Limpe o cache do navegador</li>
                  <li>• Tente novamente em alguns minutos</li>
                </>
              )}
              <li>• Entre em contato com o suporte se persistir</li>
            </ul>
          </div>
          
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-muted-foreground bg-muted p-3 rounded border-l-4 border-red-500">
              <strong>Debug Info:</strong><br/>
              {error}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorScreen;
