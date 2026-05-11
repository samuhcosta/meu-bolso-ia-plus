
import ExcelJS from 'exceljs';
import { Transaction } from '@/contexts/FinancialContext';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const getPeriodLabel = (period: string, year: string) => {
  const now = new Date();
  switch (period) {
    case 'current-month':
      return now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    case 'last-month': {
      const last = new Date(now.getFullYear(), now.getMonth() - 1);
      return last.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    }
    case 'current-year':
      return `Ano ${year}`;
    default:
      return year;
  }
};

interface ExcelParams {
  period: string;
  year: string;
  income: number;
  expenses: number;
  balance: number;
  topCategories: [string, number][];
  transactions: Transaction[];
  monthlyData: { month: string; income: number; expenses: number; balance: number }[];
}

const GREEN = 'FF10B981';
const GREEN_LIGHT = 'FFD1FAE5';
const RED = 'FFDC2626';
const RED_LIGHT = 'FFFEE2E2';
const GRAY_50 = 'FFF9FAFB';
const GRAY_100 = 'FFF3F4F6';
const GRAY_600 = 'FF6B7280';
const GRAY_900 = 'FF111827';
const WHITE = 'FFFFFFFF';

function applyHeaderStyle(header: ExcelJS.Cell) {
  header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GREEN } };
  header.font = { bold: true, color: { argb: WHITE }, size: 11, name: 'Calibri' };
  header.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  header.border = {
    top: { style: 'thin', color: { argb: GREEN } },
    bottom: { style: 'thin', color: { argb: GREEN } },
    left: { style: 'thin', color: { argb: GREEN } },
    right: { style: 'thin', color: { argb: GREEN } },
  };
}

function applyBodyCell(cell: ExcelJS.Cell, isAlternate: boolean) {
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isAlternate ? GRAY_50 : WHITE } };
  cell.font = { size: 10, name: 'Calibri', color: { argb: GRAY_900 } };
  cell.alignment = { vertical: 'middle', wrapText: true };
  cell.border = {
    top: { style: 'thin', color: { argb: GRAY_100 } },
    bottom: { style: 'thin', color: { argb: GRAY_100 } },
    left: { style: 'thin', color: { argb: GRAY_100 } },
    right: { style: 'thin', color: { argb: GRAY_100 } },
  };
}

export const generateExcel = async (params: ExcelParams) => {
  const { period, year, income, expenses, balance, topCategories, transactions, monthlyData } = params;
  const periodLabel = getPeriodLabel(period, year);
  const now = new Date();

  const wb = new ExcelJS.Workbook();
  wb.creator = 'Meu Bolso Pro';
  wb.created = now;

  // ============ SHEET 1: RESUMO ============
  const ws1 = wb.addWorksheet('Resumo Financeiro', {
    pageSetup: { orientation: 'portrait', fitToPage: true },
  });

  const totalExpenses = topCategories.reduce((sum, [, val]) => sum + val, 0);

  // Title
  ws1.mergeCells('A1:C1');
  const titleCell = ws1.getCell('A1');
  titleCell.value = 'Meu Bolso Pro — Relatório Financeiro';
  titleCell.font = { bold: true, size: 16, color: { argb: GREEN }, name: 'Calibri' };
  titleCell.alignment = { horizontal: 'left', vertical: 'middle' };
  ws1.getRow(1).height = 30;

  // Period & date
  ws1.mergeCells('A2:C2');
  const periodCell = ws1.getCell('A2');
  periodCell.value = `Período: ${periodLabel}`;
  periodCell.font = { size: 12, color: { argb: GRAY_600 }, name: 'Calibri' };
  ws1.getRow(2).height = 22;

  ws1.mergeCells('A3:C3');
  const dateCell = ws1.getCell('A3');
  dateCell.value = `Gerado em: ${now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`;
  dateCell.font = { size: 10, color: { argb: GRAY_600 }, name: 'Calibri' };
  ws1.getRow(3).height = 20;

  // Blank row
  ws1.getRow(4).height = 10;

  // Section title: Resumo Financeiro
  ws1.mergeCells('A5:C5');
  const section1 = ws1.getCell('A5');
  section1.value = 'RESUMO FINANCEIRO';
  section1.font = { bold: true, size: 13, color: { argb: GRAY_900 }, name: 'Calibri' };
  section1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GRAY_100 } };
  ws1.getRow(5).height = 24;

  // Header row
  const hRow = ws1.getRow(6);
  hRow.getCell(1).value = 'Indicador';
  hRow.getCell(2).value = 'Valor';
  applyHeaderStyle(hRow.getCell(1));
  applyHeaderStyle(hRow.getCell(2));
  ws1.getRow(6).height = 22;

  // Data
  const summaryData: { label: string; value: number; color?: string }[] = [
    { label: 'Receitas', value: income, color: GREEN },
    { label: 'Despesas', value: expenses, color: RED },
    { label: 'Saldo', value: balance, color: balance >= 0 ? GREEN : RED },
  ];

  summaryData.forEach((item, i) => {
    const row = ws1.getRow(7 + i);
    const cellA = row.getCell(1);
    const cellB = row.getCell(2);

    cellA.value = item.label;
    cellB.value = item.value;

    applyBodyCell(cellA, i % 2 === 1);
    applyBodyCell(cellB, i % 2 === 1);

    cellA.font = { bold: true, size: 11, name: 'Calibri', color: { argb: GRAY_900 } };
    cellB.font = { bold: true, size: 11, name: 'Calibri', color: { argb: item.color || GRAY_900 } };
    cellB.numFmt = '#,##0.00';
    cellB.alignment = { horizontal: 'right', vertical: 'middle' };
    cellA.alignment = { vertical: 'middle' };

    row.height = 22;
  });

  // Blank row
  ws1.getRow(10).height = 10;

  // Section: Top Categorias
  ws1.mergeCells('A11:C11');
  const section2 = ws1.getCell('A11');
  section2.value = 'TOP CATEGORIAS DE DESPESA';
  section2.font = { bold: true, size: 13, color: { argb: GRAY_900 }, name: 'Calibri' };
  section2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GRAY_100 } };
  ws1.getRow(11).height = 24;

  const catHeaderRow = ws1.getRow(12);
  catHeaderRow.getCell(1).value = 'Categoria';
  catHeaderRow.getCell(2).value = 'Valor';
  catHeaderRow.getCell(3).value = '% do Total';
  applyHeaderStyle(catHeaderRow.getCell(1));
  applyHeaderStyle(catHeaderRow.getCell(2));
  applyHeaderStyle(catHeaderRow.getCell(3));
  ws1.getRow(12).height = 22;

  topCategories.forEach(([cat, val], i) => {
    const row = ws1.getRow(13 + i);
    const cellA = row.getCell(1);
    const cellB = row.getCell(2);
    const cellC = row.getCell(3);

    cellA.value = cat;
    cellB.value = val;
    cellC.value = totalExpenses > 0 ? `${((val / totalExpenses) * 100).toFixed(1)}%` : '0%';

    applyBodyCell(cellA, i % 2 === 1);
    applyBodyCell(cellB, i % 2 === 1);
    applyBodyCell(cellC, i % 2 === 1);

    cellB.numFmt = '#,##0.00';
    cellB.alignment = { horizontal: 'right', vertical: 'middle' };
    cellC.alignment = { horizontal: 'center', vertical: 'middle' };

    row.height = 20;
  });

  ws1.getColumn(1).width = 38;
  ws1.getColumn(2).width = 20;
  ws1.getColumn(3).width = 16;

  // ============ SHEET 2: TRANSAÇÕES ============
  const ws2 = wb.addWorksheet('Transações', {
    pageSetup: { orientation: 'landscape', fitToPage: true },
  });

  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const txHeaderRow = ws2.getRow(1);
  txHeaderRow.getCell(1).value = 'Data';
  txHeaderRow.getCell(2).value = 'Descrição';
  txHeaderRow.getCell(3).value = 'Categoria';
  txHeaderRow.getCell(4).value = 'Tipo';
  txHeaderRow.getCell(5).value = 'Valor';
  for (let c = 1; c <= 5; c++) {
    applyHeaderStyle(txHeaderRow.getCell(c));
  }
  ws2.getRow(1).height = 22;

  sortedTransactions.forEach((t, i) => {
    const row = ws2.getRow(2 + i);
    row.getCell(1).value = new Date(t.date).toLocaleDateString('pt-BR');
    row.getCell(2).value = t.description;
    row.getCell(3).value = t.category;
    row.getCell(4).value = t.type === 'income' ? 'Receita' : 'Despesa';
    row.getCell(5).value = t.amount;

    for (let c = 1; c <= 5; c++) {
      applyBodyCell(row.getCell(c), i % 2 === 1);
    }

    const typeColor = t.type === 'income' ? GREEN : RED;
    row.getCell(4).font = { bold: true, size: 10, name: 'Calibri', color: { argb: typeColor } };
    row.getCell(5).font = { bold: true, size: 10, name: 'Calibri', color: { argb: typeColor } };
    row.getCell(5).numFmt = '#,##0.00';
    row.getCell(5).alignment = { horizontal: 'right', vertical: 'middle' };
    row.getCell(4).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

    row.height = 20;
  });

  ws2.getColumn(1).width = 14;
  ws2.getColumn(2).width = 45;
  ws2.getColumn(3).width = 22;
  ws2.getColumn(4).width = 12;
  ws2.getColumn(5).width = 16;

  // ============ SHEET 3: TENDÊNCIA MENSAL ============
  const monthlyFiltered = monthlyData.filter(d => d.income > 0 || d.expenses > 0);

  if (monthlyFiltered.length > 0) {
    const ws3 = wb.addWorksheet('Tendência Mensal', {
      pageSetup: { orientation: 'portrait', fitToPage: true },
    });

    const mHeaderRow = ws3.getRow(1);
    mHeaderRow.getCell(1).value = 'Mês';
    mHeaderRow.getCell(2).value = 'Receitas';
    mHeaderRow.getCell(3).value = 'Despesas';
    mHeaderRow.getCell(4).value = 'Saldo';
    for (let c = 1; c <= 4; c++) {
      applyHeaderStyle(mHeaderRow.getCell(c));
    }
    ws3.getRow(1).height = 22;

    monthlyFiltered.forEach((d, i) => {
      const row = ws3.getRow(2 + i);
      row.getCell(1).value = d.month;
      row.getCell(2).value = d.income;
      row.getCell(3).value = d.expenses;
      row.getCell(4).value = d.balance;

      for (let c = 1; c <= 4; c++) {
        applyBodyCell(row.getCell(c), i % 2 === 1);
      }

      const balColor = d.balance >= 0 ? GREEN : RED;
      row.getCell(1).font = { bold: true, size: 10, name: 'Calibri', color: { argb: GRAY_900 } };
      row.getCell(2).font = { size: 10, name: 'Calibri', color: { argb: GREEN } };
      row.getCell(3).font = { size: 10, name: 'Calibri', color: { argb: RED } };
      row.getCell(4).font = { bold: true, size: 10, name: 'Calibri', color: { argb: balColor } };

      for (let c = 2; c <= 4; c++) {
        row.getCell(c).numFmt = '#,##0.00';
        row.getCell(c).alignment = { horizontal: 'right', vertical: 'middle' };
      }
      row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

      row.height = 20;
    });

    ws3.getColumn(1).width = 16;
    ws3.getColumn(2).width = 16;
    ws3.getColumn(3).width = 16;
    ws3.getColumn(4).width = 16;
  }

  // Download
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `relatorio-financeiro-${periodLabel.replace(/\s+/g, '-').toLowerCase()}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
};
