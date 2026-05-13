
import React, { useState } from 'react';
import { useFinancial } from '@/contexts/FinancialContext';
import { getFilteredTransactions, calculateReportMetrics, getMonthlyData } from '@/utils/reportUtils';
import { generatePDF } from '@/utils/pdfGenerator';
import { generateExcel } from '@/utils/excelGenerator';
import ReportSummaryCards from '@/components/reports/ReportSummaryCards';
import CategoryExpensesCard from '@/components/reports/CategoryExpensesCard';
import MonthlyTrendsCard from '@/components/reports/MonthlyTrendsCard';
import DetailedAnalysisCard from '@/components/reports/DetailedAnalysisCard';
import ReportControls from '@/components/reports/ReportControls';

const Reports = () => {
  const { transactions } = useFinancial();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedDay, setSelectedDay] = useState('all');

  const filteredTransactions = getFilteredTransactions(transactions, selectedYear, selectedMonth, selectedDay);
  const { income, expenses, balance, topCategories } = calculateReportMetrics(filteredTransactions);
  const monthlyData = getMonthlyData(transactions, selectedYear, selectedMonth);

  const exportToPDF = () => {
    generatePDF({
      period: selectedMonth === 'all' ? 'current-year' : 'current-month',
      year: selectedYear,
      income,
      expenses,
      balance,
      topCategories,
      transactions: filteredTransactions,
    });
  };

  const exportToExcel = async () => {
    await generateExcel({
      period: selectedMonth === 'all' ? 'current-year' : 'current-month',
      year: selectedYear,
      income,
      expenses,
      balance,
      topCategories,
      transactions: filteredTransactions,
      monthlyData,
    });
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
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          selectedDay={selectedDay}
          onYearChange={setSelectedYear}
          onMonthChange={(value) => { setSelectedMonth(value); setSelectedDay('all'); }}
          onDayChange={setSelectedDay}
          onExportPDF={exportToPDF}
          onExportExcel={exportToExcel}
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
