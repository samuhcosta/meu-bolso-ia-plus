
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart3 } from 'lucide-react';

interface MonthlyData {
  month: string;
  receitas: number;
  despesas: number;
}

interface MonthlyFlowChartProps {
  data: MonthlyData[];
  formatCurrency: (value: number) => string;
}

const CustomTooltip = ({ active, payload, label, formatCurrency }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/95 backdrop-blur-sm border border-border rounded-xl p-3 shadow-xl">
        <p className="font-bold text-sm mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-semibold" style={{ color: entry.color }}>
              {formatCurrency(entry.value)}
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const MonthlyFlowChart: React.FC<MonthlyFlowChartProps> = ({ data, formatCurrency }) => {
  const filteredData = data.filter(item => item.receitas > 0 || item.despesas > 0).slice(-6);

  if (filteredData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center h-full">
        <BarChart3 className="h-12 w-12 text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground text-sm">
          Adicione transações para ver seu fluxo de caixa aqui.
        </p>
      </div>
    );
  }

  const formatYAxis = (value: number) => {
    if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}k`;
    return `R$ ${value}`;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10B981" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#10B981" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EF4444" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#EF4444" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} vertical={false} />
        <XAxis 
          dataKey="month" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} 
          tickFormatter={formatYAxis}
        />
        <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
        <Area
          type="monotone"
          dataKey="receitas"
          name="Receitas"
          stroke="#10B981"
          strokeWidth={2.5}
          fill="url(#colorReceitas)"
          dot={{ r: 4, fill: '#10B981', strokeWidth: 2, stroke: '#10B981' }}
          activeDot={{ r: 6, fill: '#10B981', stroke: 'white', strokeWidth: 2 }}
        />
        <Area
          type="monotone"
          dataKey="despesas"
          name="Despesas"
          stroke="#EF4444"
          strokeWidth={2.5}
          fill="url(#colorDespesas)"
          dot={{ r: 4, fill: '#EF4444', strokeWidth: 2, stroke: '#EF4444' }}
          activeDot={{ r: 6, fill: '#EF4444', stroke: 'white', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default MonthlyFlowChart;
