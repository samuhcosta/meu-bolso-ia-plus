
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PieChart } from 'lucide-react';
import { formatCurrency } from '@/utils/reportUtils';

interface CategoryExpensesCardProps {
  topCategories: [string, number][];
  expenses: number;
}

const CategoryExpensesCard: React.FC<CategoryExpensesCardProps> = ({
  topCategories,
  expenses
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <PieChart className="w-5 h-5 mr-2" />
          Gastos por Categoria
        </CardTitle>
        <CardDescription>
          Onde você mais gastou no período selecionado
        </CardDescription>
      </CardHeader>
      <CardContent>
        {topCategories.length === 0 ? (
          <div className="text-center py-8">
            <PieChart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nenhum gasto encontrado no período
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {topCategories.map(([category, amount], index) => {
              const percentage = expenses > 0 ? (amount / expenses) * 100 : 0;
              return (
                <div key={category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{category}</span>
                    <span className="text-sm text-muted-foreground">
                      {formatCurrency(amount)} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoryExpensesCard;
