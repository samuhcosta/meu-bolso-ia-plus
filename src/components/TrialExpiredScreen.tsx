
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Lock } from 'lucide-react';

const TrialExpiredScreen = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-primary/10">
              <Lock className="h-10 w-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Período de Teste Expirado</CardTitle>
          <CardDescription className="text-base">
            Seu período de teste grátis de 5 dias terminou.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Faça o upgrade para o <strong>Meu Bolso Pro</strong> e continue acessando
            todos os recursos exclusivos do sistema.
          </p>
          <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm text-left">
            <p className="font-medium text-foreground">Você está perdendo acesso a:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Entradas e Saídas</li>
              <li>• Controle de Dívidas</li>
              <li>• Metas Financeiras</li>
              <li>• Assistente IA</li>
              <li>• Relatórios Detalhados</li>
              <li>• Importação de Extratos</li>
            </ul>
          </div>
          <Link to="/plans" className="block">
            <Button className="w-full" size="lg">
              <Sparkles className="mr-2 h-5 w-5" />
              Fazer Upgrade Agora
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrialExpiredScreen;
