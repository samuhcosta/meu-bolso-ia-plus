
import React from 'react';
import { Button } from '@/components/ui/button';
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

const DebtReports: React.FC<DebtReportsProps> = ({ debts, installments }) => {
  // Dados por categoria
  const categoryChartData = calculateCategoryData(debts);

  // Dados de evolução mensal
  const monthlyData = getMonthlyData();

  // Estatísticas totais
  const { totalDebts, totalPaid, totalRemaining, overallProgress } = calculateTotalStats(debts);

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
      <DebtReportsSummary
        totalDebts={totalDebts}
        totalPaid={totalPaid}
        totalRemaining={totalRemaining}
        overallProgress={overallProgress}
        debtsCount={debts.length}
      />

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryDistributionChart data={categoryChartData} />
        <CategoryProgressChart data={categoryChartData} />
      </div>

      {/* Evolução Mensal */}
      <MonthlyEvolutionChart data={monthlyData} />

      {/* Detalhes por Categoria */}
      <CategoryDetailsCard data={categoryChartData} />
    </div>
  );
};

export default DebtReports;
