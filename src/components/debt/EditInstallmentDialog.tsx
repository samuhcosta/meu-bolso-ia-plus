
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit } from 'lucide-react';
import { DebtInstallment } from '@/types/debt';

interface EditInstallmentDialogProps {
  installment: DebtInstallment;
  onEdit: (installment: DebtInstallment) => void;
}

const EditInstallmentDialog: React.FC<EditInstallmentDialogProps> = ({
  installment,
  onEdit
}) => {
  const [editAmount, setEditAmount] = useState(installment.amount.toString());
  const [editDueDate, setEditDueDate] = useState(installment.due_date);
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = () => {
    // This would be where the save logic goes
    // For now, we'll just close the dialog
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" onClick={() => onEdit(installment)}>
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
            <Button onClick={() => setIsOpen(false)} variant="outline">
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              Salvar Alterações
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditInstallmentDialog;
