
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface CategoryDonutChartProps {
  data: CategoryData[];
  total: number;
  formatCurrency: (value: number) => string;
}

const COLORS = ['#10B981', '#8B5CF6', '#F59E0B', '#3B82F6', '#EF4444', '#EC4899', '#06B6D4', '#F97316'];

const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({ data, total, formatCurrency }) => {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center h-full">
        <p className="text-muted-foreground text-sm">
          Sem despesas este mês.
        </p>
      </div>
    );
  }

  // Top 5 categories + "Outros"
  const sortedData = [...data].sort((a, b) => b.value - a.value);
  const topCategories = sortedData.slice(0, 5);
  const othersValue = sortedData.slice(5).reduce((sum, item) => sum + item.value, 0);
  
  const chartData = topCategories.map((item, i) => ({
    ...item,
    color: COLORS[i % COLORS.length],
  }));
  
  if (othersValue > 0) {
    chartData.push({ name: 'Outros', value: othersValue, color: '#6B7280' });
  }

  return (
    <div className="flex flex-col items-center h-full">
      {/* Donut Chart */}
      <div className="relative w-48 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold">{formatCurrency(total)}</span>
          <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Total Gasto</span>
        </div>
      </div>

      {/* Legend */}
      <div className="w-full mt-4 space-y-2">
        {chartData.map((item, i) => {
          const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <div key={i} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-muted-foreground truncate max-w-[100px]">{item.name}</span>
              </div>
              <span className="font-semibold">{percentage}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryDonutChart;
