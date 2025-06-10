
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Edit,
  Trash2,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Transaction } from '@/contexts/FinancialContext';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  formatCurrency: (value: number) => string;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onEdit,
  onDelete,
  formatCurrency
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Transações</CardTitle>
        <CardDescription>
          {transactions.length > 0 
            ? `${transactions.length} transação(ões) encontrada(s)`
            : 'Nenhuma transação encontrada'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              Nenhuma transação encontrada
            </h3>
            <p className="text-muted-foreground mb-4">
              Tente ajustar os filtros para encontrar suas transações
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div 
                key={transaction.id} 
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'income' 
                      ? 'bg-secondary/10' 
                      : transaction.type === 'expense'
                      ? 'bg-destructive/10'
                      : 'bg-primary/10'
                  }`}>
                    {transaction.type === 'income' ? (
                      <TrendingUp className="w-5 h-5 text-secondary" />
                    ) : transaction.type === 'expense' ? (
                      <TrendingDown className="w-5 h-5 text-destructive" />
                    ) : (
                      <DollarSign className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-medium">{transaction.description}</h4>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Badge variant="outline">{transaction.category}</Badge>
                      <span>•</span>
                      <span>{new Date(transaction.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className={`text-lg font-semibold ${
                    transaction.type === 'income' 
                      ? 'text-secondary' 
                      : transaction.type === 'expense'
                      ? 'text-destructive'
                      : 'text-primary'
                  }`}>
                    {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : ''}
                    {formatCurrency(Number(transaction.amount))}
                  </div>
                  
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEdit(transaction)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDelete(transaction.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionList;
