
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useDebt } from '@/contexts/DebtContext';
import { useCategories } from '@/contexts/CategoryContext';
import CategoryManager from '@/components/category/CategoryManager';
import { Calculator, CreditCard, Settings2 } from 'lucide-react';
import type { Debt } from '@/types/debt';

interface DebtFormProps {
  debt?: Debt;
  onSave?: () => void;
}

const DebtForm: React.FC<DebtFormProps> = ({ debt, onSave }) => {
  const { addDebt, updateDebt } = useDebt();
  const { getCategoriesByType } = useCategories();
  const [loading, setLoading] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const isEditing = !!debt;

  const [formData, setFormData] = useState({
    name: debt?.name || '',
    total_amount: debt?.total_amount?.toString() || '',
    installment_amount: debt?.installment_amount?.toString() || '',
    total_installments: debt?.total_installments?.toString() || '',
    down_payment: debt?.down_payment?.toString() || '',
    first_installment_date: debt?.first_installment_date || '',
    monthly_due_day: debt?.monthly_due_day?.toString() || '',
    category: debt?.category || '',
    notes: debt?.notes || '',
    notifications_enabled: debt?.notifications_enabled ?? true
  });

  const [autoCalculate, setAutoCalculate] = useState(true);

  const debtCategories = getCategoriesByType('debt');

  const calcInstallmentAmount = (total: string, down: string, installments: string) => {
    const totalVal = parseFloat(total) || 0;
    const downVal = parseFloat(down) || 0;
    const instCount = parseInt(installments) || 0;
    if (totalVal > 0 && instCount > 0) {
      return ((totalVal - downVal) / instCount).toFixed(2);
    }
    return '';
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      if (autoCalculate) {
        const totalAmount = field === 'total_amount' ? value as string : prev.total_amount;
        const downPayment = field === 'down_payment' ? value as string : prev.down_payment;
        const totalInstallments = field === 'total_installments' ? value as string : prev.total_installments;
        
        if (field === 'total_amount' || field === 'down_payment' || field === 'total_installments') {
          newData.installment_amount = calcInstallmentAmount(totalAmount, downPayment, totalInstallments);
        }
      }
      
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        name: formData.name,
        total_amount: parseFloat(formData.total_amount),
        installment_amount: parseFloat(formData.installment_amount),
        total_installments: parseInt(formData.total_installments),
        paid_installments: 0,
        down_payment: parseFloat(formData.down_payment) || 0,
        first_installment_date: formData.first_installment_date,
        monthly_due_day: parseInt(formData.monthly_due_day),
        category: formData.category,
        notes: formData.notes,
        notifications_enabled: formData.notifications_enabled
      };

      if (isEditing && debt) {
        await updateDebt(debt.id, data);
      } else {
        await addDebt(data);
      }

      if (!isEditing) {
        setFormData({
          name: '',
          total_amount: '',
          installment_amount: '',
          total_installments: '',
          down_payment: '',
          first_installment_date: '',
          monthly_due_day: '',
          category: '',
          notes: '',
          notifications_enabled: true
        });
      }

      onSave?.();
    } catch (error) {
      console.error('Error saving debt:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5" />
            <span>{isEditing ? 'Editar Dívida' : 'Cadastrar Nova Dívida'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Dívida *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ex: Cartão Nubank"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="category">Categoria *</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => setShowCategoryManager(true)}
                  >
                    <Settings2 className="h-3 w-3 mr-1" />
                    Gerenciar
                  </Button>
                </div>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => handleInputChange('category', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {debtCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="total_amount">Valor Total da Dívida *</Label>
                <Input
                  id="total_amount"
                  type="number"
                  step="0.01"
                  value={formData.total_amount}
                  onChange={(e) => handleInputChange('total_amount', e.target.value)}
                  placeholder="0,00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="total_installments">Número Total de Parcelas *</Label>
                <Input
                  id="total_installments"
                  type="number"
                  value={formData.total_installments}
                  onChange={(e) => handleInputChange('total_installments', e.target.value)}
                  placeholder="12"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="installment_amount">Valor da Parcela *</Label>
                  <div className="flex items-center space-x-2">
                    <Calculator className="w-4 h-4" />
                    <Label htmlFor="auto-calculate" className="text-sm">Auto calcular</Label>
                    <Switch
                      id="auto-calculate"
                      checked={autoCalculate}
                      onCheckedChange={setAutoCalculate}
                    />
                  </div>
                </div>
                <Input
                  id="installment_amount"
                  type="number"
                  step="0.01"
                  value={formData.installment_amount}
                  onChange={(e) => handleInputChange('installment_amount', e.target.value)}
                  placeholder="0,00"
                  disabled={autoCalculate}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="down_payment" className="flex items-center gap-1">
                  Valor de Entrada (R$)
                  <span className="text-xs text-muted-foreground font-normal">(opcional)</span>
                </Label>
                <Input
                  id="down_payment"
                  type="number"
                  step="0.01"
                  value={formData.down_payment}
                  onChange={(e) => handleInputChange('down_payment', e.target.value)}
                  placeholder="0,00"
                />
                <p className="text-xs text-muted-foreground">
                  Valor pago antecipadamente. Será registrado como despesa.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="first_installment_date">Data da Primeira Parcela *</Label>
                <Input
                  id="first_installment_date"
                  type="date"
                  value={formData.first_installment_date}
                  onChange={(e) => handleInputChange('first_installment_date', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthly_due_day">Dia de Vencimento Mensal *</Label>
                <Input
                  id="monthly_due_day"
                  type="number"
                  min="1"
                  max="31"
                  value={formData.monthly_due_day}
                  onChange={(e) => handleInputChange('monthly_due_day', e.target.value)}
                  placeholder="10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Informações adicionais sobre a dívida..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="notifications"
                checked={formData.notifications_enabled}
                onCheckedChange={(checked) => handleInputChange('notifications_enabled', checked)}
              />
              <Label htmlFor="notifications">Ativar notificações para esta dívida</Label>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Salvando...' : isEditing ? 'Atualizar Dívida' : 'Cadastrar Dívida'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <CategoryManager
        type="debt"
        open={showCategoryManager}
        onOpenChange={setShowCategoryManager}
      />
    </>
  );
};

export default DebtForm;
