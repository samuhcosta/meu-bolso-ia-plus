
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useDebt } from '@/contexts/DebtContext';
import { Calculator, CreditCard } from 'lucide-react';

const DebtForm = () => {
  const { addDebt } = useDebt();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    total_amount: '',
    installment_amount: '',
    total_installments: '',
    paid_installments: '',
    first_installment_date: '',
    monthly_due_day: '',
    category: '',
    notes: '',
    notifications_enabled: true
  });

  const [autoCalculate, setAutoCalculate] = useState(true);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Auto calculate installment amount if enabled
      if (autoCalculate && (field === 'total_amount' || field === 'total_installments')) {
        const totalAmount = parseFloat(field === 'total_amount' ? value as string : prev.total_amount);
        const totalInstallments = parseInt(field === 'total_installments' ? value as string : prev.total_installments);
        
        if (totalAmount > 0 && totalInstallments > 0) {
          newData.installment_amount = (totalAmount / totalInstallments).toFixed(2);
        }
      }
      
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDebt({
        name: formData.name,
        total_amount: parseFloat(formData.total_amount),
        installment_amount: parseFloat(formData.installment_amount),
        total_installments: parseInt(formData.total_installments),
        paid_installments: parseInt(formData.paid_installments) || 0,
        first_installment_date: formData.first_installment_date,
        monthly_due_day: parseInt(formData.monthly_due_day),
        category: formData.category,
        notes: formData.notes,
        notifications_enabled: formData.notifications_enabled
      });

      // Reset form
      setFormData({
        name: '',
        total_amount: '',
        installment_amount: '',
        total_installments: '',
        paid_installments: '',
        first_installment_date: '',
        monthly_due_day: '',
        category: '',
        notes: '',
        notifications_enabled: true
      });
    } catch (error) {
      console.error('Error adding debt:', error);
    } finally {
      setLoading(false);
    }
  };

  const debtCategories = [
    'Cartão de Crédito',
    'Empréstimo',
    'Financiamento',
    'Consórcio',
    'FIES',
    'Prestação',
    'Outros'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="w-5 h-5" />
          <span>Cadastrar Nova Dívida</span>
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
              <Label htmlFor="category">Categoria *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => handleInputChange('category', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {debtCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
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
              <Label htmlFor="paid_installments">Parcelas Já Pagas</Label>
              <Input
                id="paid_installments"
                type="number"
                value={formData.paid_installments}
                onChange={(e) => handleInputChange('paid_installments', e.target.value)}
                placeholder="0"
              />
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
            {loading ? 'Cadastrando...' : 'Cadastrar Dívida'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default DebtForm;
