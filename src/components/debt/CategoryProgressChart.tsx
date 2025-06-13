
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/utils/debtReportUtils';

interface CategoryChartData {
  name: string;
  total: number;
  paid: number;
  remaining: number;
  percentage: number;
}

interface CategoryProgressChartProps {
  data: CategoryChartData[];
}

const CategoryProgressChart: React.FC<CategoryProgressChartProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Progresso por Categoria</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => formatCurrency(value)} />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Legend />
            <Bar dataKey="paid" fill="#10B981" name="Pago" />
            <Bar dataKey="remaining" fill="#EF4444" name="Restante" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default CategoryProgressChart;
