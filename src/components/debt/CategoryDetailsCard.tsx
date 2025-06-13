
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, CHART_COLORS } from '@/utils/debtReportUtils';

interface CategoryChartData {
  name: string;
  total: number;
  paid: number;
  remaining: number;
  percentage: number;
}

interface CategoryDetailsCardProps {
  data: CategoryChartData[];
}

const CategoryDetailsCard: React.FC<CategoryDetailsCardProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalhes por Categoria</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((category, index) => (
            <div key={category.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded" 
                    style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                  />
                  <span className="font-medium">{category.name}</span>
                  <Badge variant="outline">{category.percentage}% quitado</Badge>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(category.total)}</p>
                  <p className="text-sm text-muted-foreground">
                    Pago: {formatCurrency(category.paid)} • Restante: {formatCurrency(category.remaining)}
                  </p>
                </div>
              </div>
              <Progress value={category.percentage} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryDetailsCard;
