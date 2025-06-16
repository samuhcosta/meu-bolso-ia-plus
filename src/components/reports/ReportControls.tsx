
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download } from 'lucide-react';

interface ReportControlsProps {
  selectedPeriod: string;
  selectedYear: string;
  onPeriodChange: (value: string) => void;
  onYearChange: (value: string) => void;
  onExportPDF: () => void;
}

const ReportControls: React.FC<ReportControlsProps> = ({
  selectedPeriod,
  selectedYear,
  onPeriodChange,
  onYearChange,
  onExportPDF
}) => {
  const periods = [
    { value: 'current-month', label: 'Mês Atual' },
    { value: 'last-month', label: 'Mês Passado' },
    { value: 'current-year', label: 'Ano Atual' }
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="flex gap-2">
      <Select value={selectedPeriod} onValueChange={onPeriodChange}>
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
      
      <Select value={selectedYear} onValueChange={onYearChange}>
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
      
      <Button onClick={onExportPDF} variant="outline">
        <Download className="w-4 h-4 mr-2" />
        Exportar PDF
      </Button>
    </div>
  );
};

export default ReportControls;
