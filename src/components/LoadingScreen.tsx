
import React from 'react';
import { Loader2, DollarSign } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Carregando..." 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="text-center space-y-6">
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
        
        <div className="w-64 h-1 bg-muted rounded-full mx-auto overflow-hidden">
          <div className="w-full h-full bg-gradient-to-r from-primary to-secondary animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
