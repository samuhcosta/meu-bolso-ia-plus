
import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import { AlertCircle, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';

interface PageWrapperProps {
  children: React.ReactNode;
  pageName?: string;
}

const PageFallback: React.FC<{ pageName?: string }> = ({ pageName }) => {
  console.error(`💥 PageWrapper - Erro na página: ${pageName || 'Desconhecida'}`);
  
  return (
    <div className="min-h-[50vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          
          <CardTitle className="text-lg font-bold text-destructive">
            Erro na Página {pageName}
          </CardTitle>
          
          <CardDescription className="text-center">
            Não foi possível carregar esta seção. Outros recursos do app ainda estão funcionando.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <Button 
            onClick={() => window.location.reload()}
            className="w-full"
            variant="outline"
          >
            Recarregar Página
          </Button>
          
          <Link to="/dashboard" className="block">
            <Button className="w-full" variant="default">
              <Home className="w-4 h-4 mr-2" />
              Ir para Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

const PageWrapper: React.FC<PageWrapperProps> = ({ children, pageName }) => {
  return (
    <ErrorBoundary fallback={<PageFallback pageName={pageName} />}>
      {children}
    </ErrorBoundary>
  );
};

export default PageWrapper;
