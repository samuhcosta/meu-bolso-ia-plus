
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { Debt, DebtInstallment } from '@/contexts/DebtContext';

interface FuturePlanningProps {
  debts: Debt[];
  installments: DebtInstallment[];
}

const FuturePlanning: React.FC<FuturePlanningProps> = ({ debts, installments }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getNext12MonthsData = () => {
    const months = [];
    const today = new Date();
    
    for (let i = 0; i < 12; i++) {
      const month = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + i + 1, 0);
      
      const monthInstallments = installments.filter(installment => {
        const dueDate = new Date(installment.due_date);
        return !installment.is_paid && 
               dueDate >= month && 
               dueDate <= nextMonth;
      });

      const totalAmount = monthInstallments.reduce((sum, installment) => sum + Number(installment.amount), 0);
      
      months.push({
        month: month.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
        installments: monthInstallments.length,
        amount: totalAmount,
        date: month
      });
    }
    
    return months;
  };

  const monthsData = getNext12MonthsData();
  const averageMonthlyAmount = monthsData.reduce((sum, month) => sum + month.amount, 0) / 12;
  const peakMonth = monthsData.reduce((prev, current) => (prev.amount > current.amount) ? prev : current);
  const lightestMonth = monthsData.reduce((prev, current) => (prev.amount < current.amount) ? prev : current);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Média Mensal</p>
                <p className="text-2xl font-bold">{formatCurrency(averageMonthlyAmount)}</p>
              </div>
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mês Mais Pesado</p>
                <p className="text-lg font-bold text-red-600">{formatCurrency(peakMonth.amount)}</p>
                <p className="text-xs text-muted-foreground">{peakMonth.month}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mês Mais Leve</p>
                <p className="text-lg font-bold text-green-600">{formatCurrency(lightestMonth.amount)}</p>
                <p className="text-xs text-muted-foreground">{lightestMonth.month}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Planejamento dos Próximos 12 Meses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthsData.map((monthData, index) => {
              const isHighMonth = monthData.amount > averageMonthlyAmount * 1.2;
              const isLowMonth = monthData.amount < averageMonthlyAmount * 0.8;
              
              return (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium capitalize">{monthData.month}</h3>
                      {isHighMonth && <AlertTriangle className="w-4 h-4 text-red-600" />}
                      {isLowMonth && <CheckCircle className="w-4 h-4 text-green-600" />}
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        isHighMonth ? 'text-red-600' : 
                        isLowMonth ? 'text-green-600' : 
                        'text-foreground'
                      }`}>
                        {formatCurrency(monthData.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {monthData.installments} parcela(s)
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Progress 
                      value={averageMonthlyAmount > 0 ? (monthData.amount / (averageMonthlyAmount * 2)) * 100 : 0} 
                      className="h-2" 
                    />
                    
                    {isHighMonth && (
                      <div className="flex items-center space-x-2 text-sm text-red-600">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Mês com alta concentração de parcelas</span>
                      </div>
                    )}
                    
                    {isLowMonth && monthData.amount > 0 && (
                      <div className="flex items-center space-x-2 text-sm text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span>Mês mais tranquilo para o orçamento</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {monthsData.some(month => month.amount > averageMonthlyAmount * 1.2) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-orange-700">
              <AlertTriangle className="w-5 h-5" />
              <span>Recomendações Financeiras</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-orange-700">
              <p>• Considere criar uma reserva para os meses com maior concentração de parcelas</p>
              <p>• Avalie a possibilidade de renegociar algumas datas de vencimento</p>
              <p>• Planeje uma redução de gastos extras nos meses mais pesados</p>
              <p>• Considere antecipar algumas parcelas nos meses mais leves</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FuturePlanning;
