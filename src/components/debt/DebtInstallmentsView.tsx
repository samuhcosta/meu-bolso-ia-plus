
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useDebt } from '@/contexts/DebtContext';
import { Debt, DebtInstallment } from '@/contexts/DebtContext';
import { Check, Clock, Edit, ArrowLeft, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DebtInstallmentsViewProps {
  debt: Debt;
  installments: DebtInstallment[];
  onBack: () => void;
}

const DebtInstallmentsView: React.FC<DebtInstallmentsViewProps> = ({
  debt,
  installments,
  onBack
}) => {
  const { markInstallmentAsPaid, markInstallmentAsUnpaid } = useDebt();
  const { toast } = useToast();
  const [editingInstallment, setEditingInstallment] = useState<DebtInstallment | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editDueDate, setEditDueDate] = useState('');

  const debtInstallments = installments
    .filter(installment => installment.debt_id === debt.id)
    .sort((a, b) => a.installment_number - b.installment_number);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleMarkAsPaid = async (installment: DebtInstallment) => {
    try {
      await markInstallmentAsPaid(installment.id);
      toast({
        title: "Parcela marcada como paga",
        description: `Parcela ${installment.installment_number}/${debt.total_installments} foi marcada como paga.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível marcar a parcela como paga.",
        variant: "destructive",
      });
    }
  };

  const handleMarkAsUnpaid = async (installment: DebtInstallment) => {
    try {
      await markInstallmentAsUnpaid(installment.id);
      toast({
        title: "Parcela desmarcada",
        description: `Parcela ${installment.installment_number}/${debt.total_installments} foi desmarcada.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível desmarcar a parcela.",
        variant: "destructive",
      });
    }
  };

  const startEditing = (installment: DebtInstallment) => {
    setEditingInstallment(installment);
    setEditAmount(installment.amount.toString());
    setEditDueDate(installment.due_date);
  };

  const isOverdue = (dueDate: string, isPaid: boolean) => {
    return !isPaid && new Date(dueDate) < new Date();
  };

  const paidInstallments = debtInstallments.filter(i => i.is_paid).length;
  const totalAmount = debt.total_amount;
  const paidAmount = paidInstallments * debt.installment_amount;
  const progress = (paidAmount / totalAmount) * 100;

  return (
    <div className="space-y-6">
      {/* Header com botão voltar */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{debt.name}</h2>
          <p className="text-muted-foreground">
            {debt.category} • {debt.total_installments} parcelas
          </p>
        </div>
      </div>

      {/* Resumo da dívida */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo da Dívida</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Valor Total</p>
              <p className="text-lg font-semibold">{formatCurrency(totalAmount)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valor Pago</p>
              <p className="text-lg font-semibold text-green-600">{formatCurrency(paidAmount)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Restante</p>
              <p className="text-lg font-semibold text-red-600">{formatCurrency(totalAmount - paidAmount)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Progresso</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{Math.round(progress)}%</span>
              </div>
            </div>
          </div>
          {debt.notes && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm"><strong>Observações:</strong> {debt.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de parcelas */}
      <Card>
        <CardHeader>
          <CardTitle>Cronograma de Parcelas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {debtInstallments.map((installment) => (
              <div
                key={installment.id}
                className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                  installment.is_paid 
                    ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
                    : isOverdue(installment.due_date, installment.is_paid)
                    ? 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
                    : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    installment.is_paid 
                      ? 'bg-green-500 text-white' 
                      : isOverdue(installment.due_date, installment.is_paid)
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300'
                  }`}>
                    {installment.is_paid ? (
                      <Check className="h-4 w-4" />
                    ) : isOverdue(installment.due_date, installment.is_paid) ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : (
                      <Clock className="h-4 w-4" />
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        Parcela {installment.installment_number}/{debt.total_installments}
                      </p>
                      {installment.is_paid && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Paga
                        </Badge>
                      )}
                      {isOverdue(installment.due_date, installment.is_paid) && (
                        <Badge variant="destructive">
                          Em atraso
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Vencimento: {new Date(installment.due_date).toLocaleDateString('pt-BR')}
                      {installment.paid_date && (
                        <span className="ml-2">
                          • Paga em: {new Date(installment.paid_date).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <p className="font-semibold text-lg">
                    {formatCurrency(installment.amount)}
                  </p>
                  
                  <div className="flex items-center gap-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => startEditing(installment)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Editar Parcela {installment.installment_number}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="amount">Valor</Label>
                            <Input
                              id="amount"
                              type="number"
                              step="0.01"
                              value={editAmount}
                              onChange={(e) => setEditAmount(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="dueDate">Data de Vencimento</Label>
                            <Input
                              id="dueDate"
                              type="date"
                              value={editDueDate}
                              onChange={(e) => setEditDueDate(e.target.value)}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={() => setEditingInstallment(null)} variant="outline">
                              Cancelar
                            </Button>
                            <Button>
                              Salvar Alterações
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {installment.is_paid ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkAsUnpaid(installment)}
                      >
                        Desmarcar
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleMarkAsPaid(installment)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Marcar como Paga
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DebtInstallmentsView;
