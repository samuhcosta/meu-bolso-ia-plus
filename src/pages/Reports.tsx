
import React, { useState } from 'react';
import { useFinancial } from '@/contexts/FinancialContext';
import { getFilteredTransactions, calculateReportMetrics, getMonthlyData } from '@/utils/reportUtils';
import ReportSummaryCards from '@/components/reports/ReportSummaryCards';
import CategoryExpensesCard from '@/components/reports/CategoryExpensesCard';
import MonthlyTrendsCard from '@/components/reports/MonthlyTrendsCard';
import DetailedAnalysisCard from '@/components/reports/DetailedAnalysisCard';
import ReportControls from '@/components/reports/ReportControls';

const Reports = () => {
  const { transactions } = useFinancial();
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const filteredTransactions = getFilteredTransactions(transactions, selectedPeriod, selectedYear);
  const { income, expenses, balance, topCategories } = calculateReportMetrics(filteredTransactions);
  const monthlyData = getMonthlyData(transactions, selectedYear);

  const exportToPDF = () => {
    // Simulate PDF export
    const reportData = {
      period: selectedPeriod,
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
        
        <ReportControls
          selectedPeriod={selectedPeriod}
          selectedYear={selectedYear}
          onPeriodChange={setSelectedPeriod}
          onYearChange={setSelectedYear}
          onExportPDF={exportToPDF}
        />
      </div>

      <ReportSummaryCards
        income={income}
        expenses={expenses}
        balance={balance}
        incomeTransactionsCount={filteredTransactions.filter(t => t.type === 'income').length}
        expenseTransactionsCount={filteredTransactions.filter(t => t.type === 'expense').length}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryExpensesCard topCategories={topCategories} expenses={expenses} />
        <MonthlyTrendsCard monthlyData={monthlyData} />
      </div>

      <DetailedAnalysisCard
        expenses={expenses}
        income={income}
        balance={balance}
        filteredTransactions={filteredTransactions}
        topCategories={topCategories}
      />
    </div>
  );
};

export default Reports;
