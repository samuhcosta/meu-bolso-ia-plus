
import { useState, useEffect } from 'react';
import { Debt, DebtInstallment } from '@/types/debt';
import { Notification } from '@/types/notifications';
import { useToast } from '@/hooks/use-toast';

export const useNotificationGenerator = (debts: Debt[], installments: DebtInstallment[]) => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    generateNotifications();
  }, [debts, installments]);

  const generateNotifications = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    
    const newNotifications: Notification[] = [];

    installments.forEach(installment => {
      const debt = debts.find(d => d.id === installment.debt_id);
      if (!debt) return;

      const dueDate = new Date(installment.due_date);
      const timeDiff = dueDate.getTime() - now.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

      // Parcelas que vencem amanhã
      if (daysDiff === 1 && !installment.is_paid) {
        newNotifications.push({
          id: `due_soon_${installment.id}`,
          type: 'due_soon',
          title: 'Parcela vence amanhã',
          message: `A parcela ${installment.installment_number} da dívida "${debt.name}" vence amanhã.`,
          debtName: debt.name,
          installmentNumber: installment.installment_number,
          amount: installment.amount,
          dueDate: installment.due_date,
          isRead: false
        });
      }

      // Parcelas em atraso
      if (daysDiff < 0 && !installment.is_paid) {
        newNotifications.push({
          id: `overdue_${installment.id}`,
          type: 'overdue',
          title: 'Parcela em atraso',
          message: `A parcela ${installment.installment_number} da dívida "${debt.name}" está em atraso há ${Math.abs(daysDiff)} dia${Math.abs(daysDiff) > 1 ? 's' : ''}.`,
          debtName: debt.name,
          installmentNumber: installment.installment_number,
          amount: installment.amount,
          dueDate: installment.due_date,
          isRead: false
        });
      }
    });

    setNotifications(newNotifications);

    // Mostrar toast para notificações importantes
    const overdueCount = newNotifications.filter(n => n.type === 'overdue').length;
    const dueSoonCount = newNotifications.filter(n => n.type === 'due_soon').length;

    if (overdueCount > 0) {
      toast({
        title: "Atenção!",
        description: `Você tem ${overdueCount} parcela${overdueCount > 1 ? 's' : ''} em atraso.`,
        variant: "destructive",
      });
    } else if (dueSoonCount > 0) {
      toast({
        title: "Lembrete",
        description: `${dueSoonCount} parcela${dueSoonCount > 1 ? 's' : ''} vence${dueSoonCount === 1 ? '' : 'm'} amanhã.`,
      });
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const dismissNotification = (notificationId: string) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  return {
    notifications,
    markAsRead,
    dismissNotification
  };
};
