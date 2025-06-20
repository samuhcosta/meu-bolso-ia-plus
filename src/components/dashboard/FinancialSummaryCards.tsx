
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FinancialSummaryCardsProps {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  formatCurrency: (value: number) => string;
}

const FinancialSummaryCards: React.FC<FinancialSummaryCardsProps> = ({
  totalIncome,
  totalExpenses,
  balance,
  formatCurrency
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Link to="/finances?tab=transactions" className="block">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Receitas do Mês</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Clique para ver detalhes
            </p>
          </CardContent>
        </Card>
      </Link>

      <Link to="/finances?tab=transactions" className="block">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Despesas do Mês</CardTitle>
            <TrendingDown className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Clique para ver detalhes
            </p>
          </CardContent>
        </Card>
      </Link>

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Saldo Atual</CardTitle>
          <DollarSign className="h-5 w-5 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${
            balance >= 0 ? 'text-blue-600' : 'text-red-600'
          }`}>
            {formatCurrency(balance)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {balance >= 0 ? 'Superávit mensal' : 'Déficit mensal'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialSummaryCards;
