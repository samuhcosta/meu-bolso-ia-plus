
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart3, Calendar } from 'lucide-react';
import { formatCurrency } from '@/utils/reportUtils';

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

interface MonthlyTrendsCardProps {
  monthlyData: MonthlyData[];
}

const MonthlyTrendsCard: React.FC<MonthlyTrendsCardProps> = ({ monthlyData }) => {
  const filteredData = monthlyData
    .filter(data => data.income > 0 || data.expenses > 0)
    .slice(-6);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          Tendência Mensal
        </CardTitle>
        <CardDescription>
          Comparativo de receitas e despesas por mês
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredData.length > 0 ? (
            filteredData.map((data, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium capitalize">{data.month}</span>
                  <span className={`text-sm font-medium ${
                    data.balance >= 0 ? 'text-secondary' : 'text-destructive'
                  }`}>
                    {formatCurrency(data.balance)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Receitas</span>
                      <span>{formatCurrency(data.income)}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1">
                      <div className="bg-secondary h-1 rounded-full" style={{ 
                        width: `${Math.max(data.income, data.expenses) > 0 ? (data.income / Math.max(data.income, data.expenses)) * 100 : 0}%` 
                      }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Despesas</span>
                      <span>{formatCurrency(data.expenses)}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1">
                      <div className="bg-destructive h-1 rounded-full" style={{ 
                        width: `${Math.max(data.income, data.expenses) > 0 ? (data.expenses / Math.max(data.income, data.expenses)) * 100 : 0}%` 
                      }} />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Nenhum dado encontrado para o ano selecionado
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyTrendsCard;
