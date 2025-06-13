
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';

const EmptyDebtList: React.FC = () => {
  return (
    <Card>
      <CardContent className="text-center py-8">
        <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Nenhuma dívida cadastrada</h3>
        <p className="text-muted-foreground mb-4">
          Comece cadastrando sua primeira dívida para ter controle total das suas finanças.
        </p>
      </CardContent>
    </Card>
  );
};

export default EmptyDebtList;
