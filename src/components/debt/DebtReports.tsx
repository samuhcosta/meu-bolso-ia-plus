
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Debt, DebtInstallment } from '@/contexts/DebtContext';
import { Download } from 'lucide-react';
import DebtReportsSummary from './DebtReportsSummary';
import CategoryDistributionChart from './CategoryDistributionChart';
import CategoryProgressChart from './CategoryProgressChart';
import MonthlyEvolutionChart from './MonthlyEvolutionChart';
import CategoryDetailsCard from './CategoryDetailsCard';
import { calculateCategoryData, calculateTotalStats, getMonthlyData } from '@/utils/debtReportUtils';

interface DebtReportsProps {
  debts: Debt[];
  installments: DebtInstallment[];
}

const months = [
  { value: 'all', label: 'Todos os meses' },
  { value: '0', label: 'Janeiro' },
  { value: '1', label: 'Fevereiro' },
  { value: '2', label: 'Março' },
  { value: '3', label: 'Abril' },
  { value: '4', label: 'Maio' },
  { value: '5', label: 'Junho' },
  { value: '6', label: 'Julho' },
  { value: '7', label: 'Agosto' },
  { value: '8', label: 'Setembro' },
  { value: '9', label: 'Outubro' },
  { value: '10', label: 'Novembro' },
  { value: '11', label: 'Dezembro' },
];

const DebtReports: React.FC<DebtReportsProps> = ({ debts, installments }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedDay, setSelectedDay] = useState('all');

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const filteredDebts = debts.filter(debt => {
    const date = new Date(debt.created_at);
    if (date.getFullYear() !== parseInt(selectedYear)) return false;
    if (selectedMonth !== 'all' && date.getMonth() !== parseInt(selectedMonth)) return false;
    if (selectedDay !== 'all' && date.getDate() !== parseInt(selectedDay)) return false;
    return true;
  });

  const categoryChartData = calculateCategoryData(filteredDebts);
  const monthlyData = getMonthlyData();
  const { totalDebts, totalPaid, totalRemaining, overallProgress } = calculateTotalStats(filteredDebts);

  const downloadReport = () => {
    console.log('Downloading report...');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Relatórios de Dívidas</h2>
          <p className="text-muted-foreground">
            Análise completa da sua situação financeira
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
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

          <Select value={selectedMonth} onValueChange={(value) => { setSelectedMonth(value); setSelectedDay('all'); }}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map(month => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedDay} onValueChange={setSelectedDay}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os dias</SelectItem>
              {Array.from({ length: 31 }, (_, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>
                  Dia {i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={downloadReport} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Baixar Relatório
          </Button>
        </div>
      </div>

      <DebtReportsSummary
        totalDebts={totalDebts}
        totalPaid={totalPaid}
        totalRemaining={totalRemaining}
        overallProgress={overallProgress}
        debtsCount={filteredDebts.length}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryDistributionChart data={categoryChartData} />
        <CategoryProgressChart data={categoryChartData} />
      </div>

      <MonthlyEvolutionChart data={monthlyData} />

      <CategoryDetailsCard data={categoryChartData} />
    </div>
  );
};

export default DebtReports;
