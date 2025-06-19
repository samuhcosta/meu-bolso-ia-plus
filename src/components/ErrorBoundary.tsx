
import React, { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error('🚨 ErrorBoundary - Erro capturado:', error);
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('🚨 ErrorBoundary - Detalhes do erro:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
    
    this.setState({
      error,
      errorInfo
    });
  }

  handleReload = () => {
    console.log('🔄 ErrorBoundary - Recarregando aplicação...');
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

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
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              
              <CardTitle className="text-xl font-bold text-destructive">
                Ops! Tivemos um erro
              </CardTitle>
              
              <CardDescription className="text-center">
                Tivemos um erro ao carregar a página. Tente recarregar ou entre em contato com o suporte.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <Button 
                onClick={this.handleReload}
                className="w-full"
                variant="default"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Recarregar Página
              </Button>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
                  <strong>Erro:</strong> {this.state.error.message}
                </div>
              )}
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Se o problema persistir, entre em contato com o suporte
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
