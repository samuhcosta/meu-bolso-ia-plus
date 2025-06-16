
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatCurrency } from '@/utils/reportUtils';
import { Transaction } from '@/contexts/FinancialContext';

interface DetailedAnalysisCardProps {
  expenses: number;
  income: number;
  balance: number;
  filteredTransactions: Transaction[];
  topCategories: [string, number][];
}

const DetailedAnalysisCard: React.FC<DetailedAnalysisCardProps> = ({
  expenses,
  income,
  balance,
  filteredTransactions,
  topCategories
}) => {
  return (
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
  );
};

export default DetailedAnalysisCard;
