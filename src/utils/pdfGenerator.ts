import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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

interface ReportParams {
  period: string;
  year: string;
  income: number;
  expenses: number;
  balance: number;
  topCategories: [string, number][];
  transactions: Transaction[];
}

export const generatePDF = (params: ReportParams) => {
  const { period, year, income, expenses, balance, topCategories, transactions } = params;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const periodLabel = getPeriodLabel(period, year);
  let y = 20;

  // ========== HEADER ==========
  doc.setFillColor(16, 185, 129); // green-500
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Meu Bolso Pro', 14, 18);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Relatório Financeiro', 14, 28);

  doc.setFontSize(10);
  doc.text(`Período: ${periodLabel}`, 14, 36);

  doc.setFontSize(9);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`, pageWidth - 14, 36, { align: 'right' });

  y = 55;

  // ========== RESUMO FINANCEIRO ==========
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumo Financeiro', 14, y);
  y += 8;

  // Summary boxes
  const boxWidth = (pageWidth - 42) / 3;
  const boxes = [
    { label: 'Receitas', value: formatCurrency(income), color: [220, 252, 231] as [number, number, number], textColor: [22, 163, 74] as [number, number, number] },
    { label: 'Despesas', value: formatCurrency(expenses), color: [254, 226, 226] as [number, number, number], textColor: [220, 38, 38] as [number, number, number] },
    { label: 'Saldo', value: formatCurrency(balance), color: balance >= 0 ? [220, 252, 231] as [number, number, number] : [254, 226, 226] as [number, number, number], textColor: balance >= 0 ? [22, 163, 74] as [number, number, number] : [220, 38, 38] as [number, number, number] },
  ];

  boxes.forEach((box, i) => {
    const x = 14 + i * (boxWidth + 7);
    doc.setFillColor(box.color[0], box.color[1], box.color[2]);
    doc.roundedRect(x, y, boxWidth, 28, 3, 3, 'F');

    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(box.label, x + 6, y + 10);

    doc.setTextColor(box.textColor[0], box.textColor[1], box.textColor[2]);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(box.value, x + 6, y + 22);
  });

  y += 40;

  // ========== TOP CATEGORIAS ==========
  if (topCategories.length > 0) {
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Top Categorias de Despesa', 14, y);
    y += 4;

    const totalExpenses = topCategories.reduce((sum, [, val]) => sum + val, 0);

    autoTable(doc, {
      startY: y,
      head: [['#', 'Categoria', 'Valor', '% do Total']],
      body: topCategories.map(([cat, val], i) => [
        (i + 1).toString(),
        cat,
        formatCurrency(val),
        `${((val / totalExpenses) * 100).toFixed(1)}%`,
      ]),
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 5,
      },
      headStyles: {
        fillColor: [16, 185, 129],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { left: 14, right: 14 },
    });

    y = (doc as any).lastAutoTable.finalY + 15;
  }

  // ========== TABELA DE TRANSAÇÕES ==========
  if (transactions.length > 0) {
    // Check if we need a new page
    if (y > 220) {
      doc.addPage();
      y = 20;
    }

    doc.setTextColor(30, 30, 30);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Transações (${transactions.length})`, 14, y);
    y += 4;

    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    autoTable(doc, {
      startY: y,
      head: [['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor']],
      body: sortedTransactions.slice(0, 50).map((t) => [
        new Date(t.date).toLocaleDateString('pt-BR'),
        t.description.substring(0, 30),
        t.category,
        t.type === 'income' ? 'Receita' : 'Despesa',
        formatCurrency(t.amount),
      ]),
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [55, 65, 81],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251],
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 55 },
        2: { cellWidth: 35 },
        3: { cellWidth: 22 },
        4: { cellWidth: 30, halign: 'right' },
      },
      didParseCell: (data: any) => {
        // Color the "Valor" column
        if (data.column.index === 4 && data.section === 'body') {
          const row = sortedTransactions[data.row.index];
          if (row) {
            data.cell.styles.textColor = row.type === 'income' ? [22, 163, 74] : [220, 38, 38];
            data.cell.styles.fontStyle = 'bold';
          }
        }
        // Color the "Tipo" column
        if (data.column.index === 3 && data.section === 'body') {
          const row = sortedTransactions[data.row.index];
          if (row) {
            data.cell.styles.textColor = row.type === 'income' ? [22, 163, 74] : [220, 38, 38];
          }
        }
      },
      margin: { left: 14, right: 14 },
    });

    if (transactions.length > 50) {
      const finalY = (doc as any).lastAutoTable.finalY + 5;
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Exibindo as primeiras 50 de ${transactions.length} transações.`, 14, finalY);
    }
  }

  // ========== FOOTER em todas as páginas ==========
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setDrawColor(200, 200, 200);
    doc.line(14, pageHeight - 15, pageWidth - 14, pageHeight - 15);

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Meu Bolso Pro — meubolsopro.com', 14, pageHeight - 8);
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - 14, pageHeight - 8, { align: 'right' });
  }

  // ========== ABRIR EM NOVA ABA ==========
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  window.open(pdfUrl, '_blank');
};
