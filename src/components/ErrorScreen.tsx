
import React from 'react';
import { AlertCircle, RefreshCw, DollarSign, Wifi } from 'lucide-react';
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
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const isMaxRetriesReached = retryCount >= maxRetries;

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
            {isMaxRetriesReached ? (
              <Wifi className="h-8 w-8 text-red-600" />
            ) : (
              <AlertCircle className="h-8 w-8 text-red-600" />
            )}
          </div>
          
          <CardTitle className="text-xl font-bold text-destructive">
            {isMaxRetriesReached ? 'Problema de Conexão' : 'Ops! Algo deu errado'}
          </CardTitle>
          
          <CardDescription className="text-center">
            {error}
          </CardDescription>
          
          {retryCount > 0 && (
            <div className="text-sm text-muted-foreground mt-2">
              Tentativas realizadas: {retryCount}/{maxRetries}
            </div>
          )}
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Button 
            onClick={handleRetry}
            className="w-full"
            variant="default"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {isMaxRetriesReached ? 'Recarregar Página' : 'Tentar Novamente'}
          </Button>
          
          {isMaxRetriesReached && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Sugestões:
              </p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                <li>• Verifique sua conexão com a internet</li>
                <li>• Tente novamente em alguns minutos</li>
                <li>• Entre em contato com o suporte se persistir</li>
              </ul>
            </div>
          )}
          
          {!isMaxRetriesReached && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Se o problema persistir, entre em contato com o suporte
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorScreen;
