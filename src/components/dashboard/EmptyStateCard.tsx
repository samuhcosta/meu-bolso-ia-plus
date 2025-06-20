
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateCardProps {
  type: 'transactions' | 'debts';
}

const EmptyStateCard: React.FC<EmptyStateCardProps> = ({ type }) => {
  if (type === 'transactions') {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhuma transação este mês</h3>
          <p className="text-muted-foreground mb-4">
            Você ainda não cadastrou receitas ou despesas este mês.
          </p>
          <Link to="/finances?tab=add-transaction">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Primeira Transação
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-dashed border-2">
      <CardContent className="flex flex-col items-center justify-center py-8 text-center">
        <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Nenhuma dívida ativa</h3>
        <p className="text-muted-foreground mb-4">
          Você ainda não possui dívidas ativas cadastradas.
        </p>
        <Link to="/debts?tab=add-debt">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Cadastrar Primeira Dívida
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default EmptyStateCard;
