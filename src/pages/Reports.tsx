
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFinancial } from '@/contexts/FinancialContext';
import { BarChart3, PieChart, TrendingDown, TrendingUp, Download, Calendar } from 'lucide-react';

const Reports = () => {
  const { transactions, getBalance, getCategoryExpenses } = useFinancial();
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getFilteredTransactions = () => {
    const now = new Date();
    const year = parseInt(selectedYear);
    
    return transactions.filter(t => {
      const date = new Date(t.date);
      const transactionYear = date.getFullYear();
      
      if (transactionYear !== year) return false;
      
      switch (selectedPeriod) {
        case 'current-month':
          return date.getMonth() === now.getMonth() && transactionYear === now.getFullYear();
        case 'last-month':
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
          return date.getMonth() === lastMonth.getMonth() && transactionYear === lastMonth.getFullYear();
        case 'current-year':
          return transactionYear === year;
        default:
          return true;
      }
    });
  };

  const filteredTransactions = getFilteredTransactions();
  
  const income = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const expenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const balance = income - expenses;

  const categoryExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as { [key: string]: number });

  const topCategories = Object.entries(categoryExpenses)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = i;
    const monthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === month && date.getFullYear() === parseInt(selectedYear);
    });
    
    const monthIncome = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const monthExpenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      month: new Date(2024, month).toLocaleDateString('pt-BR', { month: 'short' }),
      income: monthIncome,
      expenses: monthExpenses,
      balance: monthIncome - monthExpenses
    };
  });

  const periods = [
    { value: 'current-month', label: 'Mês Atual' },
    { value: 'last-month', label: 'Mês Passado' },
    { value: 'current-year', label: 'Ano Atual' }
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const exportToPDF = () => {
    // Simulate PDF export
    const reportData = {
      period: periods.find(p => p.value === selectedPeriod)?.label,
      year: selectedYear,
      income,
      expenses,
      balance,
      transactions: filteredTransactions.length,
      topCategories
    };
    
    console.log('Exporting report:', reportData);
    alert('Relatório exportado com sucesso! (Funcionalidade simulada)');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground">
            Análise detalhada das suas finanças
          </p>
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periods.map(period => (
                <SelectItem key={period.value} value={period.value}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button onClick={exportToPDF} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">
              {formatCurrency(income)}
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredTransactions.filter(t => t.type === 'income').length} transações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatCurrency(expenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredTransactions.filter(t => t.type === 'expense').length} transações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            <BarChart3 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? 'text-secondary' : 'text-destructive'}`}>
              {formatCurrency(balance)}
            </div>
            <p className="text-xs text-muted-foreground">
              {balance >= 0 ? 'Superávit' : 'Déficit'} no período
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Expenses */}
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

        {/* Monthly Trends */}
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
              {monthlyData
                .filter(data => data.income > 0 || data.expenses > 0)
                .slice(-6)
                .map((data, index) => (
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
              ))}
              
              {monthlyData.filter(data => data.income > 0 || data.expenses > 0).length === 0 && (
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
      </div>

      {/* Detailed Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Análise Detalhada</CardTitle>
          <CardDescription>
            Insights automáticos sobre seus hábitos financeiros
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {expenses === 0 ? (
            <p className="text-muted-foreground">
              Adicione algumas transações para ver análises detalhadas dos seus gastos.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">📊 Estatísticas</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Ticket médio de gastos:</span>
                    <span className="font-medium">
                      {formatCurrency(filteredTransactions.filter(t => t.type === 'expense').length > 0 
                        ? expenses / filteredTransactions.filter(t => t.type === 'expense').length 
                        : 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Maior categoria de gasto:</span>
                    <span className="font-medium">
                      {topCategories.length > 0 ? topCategories[0][0] : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxa de economia:</span>
                    <span className={`font-medium ${balance >= 0 ? 'text-secondary' : 'text-destructive'}`}>
                      {income > 0 ? ((balance / income) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">💡 Recomendações</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  {balance < 0 && (
                    <p>• Seus gastos estão maiores que sua renda. Considere revisar o orçamento.</p>
                  )}
                  {topCategories.length > 0 && topCategories[0][1] > expenses * 0.3 && (
                    <p>• A categoria "{topCategories[0][0]}" representa mais de 30% dos gastos.</p>
                  )}
                  {balance > income * 0.2 && (
                    <p>• Excelente controle! Considere investir o excedente.</p>
                  )}
                  <p>• Use metas financeiras para melhorar seu planejamento.</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
