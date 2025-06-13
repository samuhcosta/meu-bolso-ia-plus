
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/utils/debtReportUtils';

interface MonthlyData {
  month: string;
  pago: number;
  restante: number;
}

interface MonthlyEvolutionChartProps {
  data: MonthlyData[];
}

const MonthlyEvolutionChart: React.FC<MonthlyEvolutionChartProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução de Pagamentos</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => formatCurrency(value)} />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Legend />
            <Line type="monotone" dataKey="pago" stroke="#10B981" strokeWidth={2} name="Valor Pago" />
            <Line type="monotone" dataKey="restante" stroke="#EF4444" strokeWidth={2} name="Valor Restante" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default MonthlyEvolutionChart;
