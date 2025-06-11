
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Debt, DebtInstallment } from '@/contexts/DebtContext';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Download, TrendingDown, TrendingUp, Target } from 'lucide-react';

interface DebtReportsProps {
  debts: Debt[];
  installments: DebtInstallment[];
}

const DebtReports: React.FC<DebtReportsProps> = ({ debts, installments }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Dados por categoria
  const categoryData = debts.reduce((acc, debt) => {
    const category = debt.category;
    const total = debt.total_amount;
    const paid = debt.paid_installments * debt.installment_amount;
    
    if (!acc[category]) {
      acc[category] = { total: 0, paid: 0, remaining: 0 };
    }
    
    acc[category].total += total;
    acc[category].paid += paid;
    acc[category].remaining += (total - paid);
    
    return acc;
  }, {} as Record<string, { total: number; paid: number; remaining: number }>);

  const categoryChartData = Object.entries(categoryData).map(([name, data]) => ({
    name,
    total: data.total,
    paid: data.paid,
    remaining: data.remaining,
    percentage: Math.round((data.paid / data.total) * 100) || 0
  }));

  // Dados de evolução mensal (simulado - em produção viria do histórico)
  const monthlyData = [
    { month: 'Jan', pago: 1200, restante: 8800 },
    { month: 'Fev', pago: 2400, restante: 7600 },
    { month: 'Mar', pago: 3600, restante: 6400 },
    { month: 'Abr', pago: 4800, restante: 5200 },
    { month: 'Mai', pago: 6000, restante: 4000 },
    { month: 'Jun', pago: 7200, restante: 2800 }
  ];

  // Cores para os gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const totalDebts = debts.reduce((sum, debt) => sum + debt.total_amount, 0);
  const totalPaid = debts.reduce((sum, debt) => sum + (debt.paid_installments * debt.installment_amount), 0);
  const totalRemaining = totalDebts - totalPaid;
  const overallProgress = totalDebts > 0 ? (totalPaid / totalDebts) * 100 : 0;

  const downloadReport = () => {
    // Implementar download do relatório
    console.log('Downloading report...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Relatórios de Dívidas</h2>
          <p className="text-muted-foreground">
            Análise completa da sua situação financeira
          </p>
        </div>
        <Button onClick={downloadReport} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Baixar Relatório
        </Button>
      </div>

      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Dívidas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalDebts)}</div>
            <p className="text-xs text-muted-foreground">
              {debts.length} dívida{debts.length !== 1 ? 's' : ''} ativa{debts.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Pago</CardTitle>
            <TrendingDown className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round(overallProgress)}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Restante</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalRemaining)}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round(100 - overallProgress)}% restante
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progresso Geral</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(overallProgress)}%</div>
            <Progress value={overallProgress} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Pizza - Distribuição por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="total"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Barras - Progresso por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle>Progresso por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryChartData}>
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
      </div>

      {/* Evolução Mensal */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução de Pagamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
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

      {/* Detalhes por Categoria */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhes por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryChartData.map((category, index) => (
              <div key={category.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
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
    </div>
  );
};

export default DebtReports;
