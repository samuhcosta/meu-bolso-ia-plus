
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, X, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { useDebt } from '@/contexts/DebtContext';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  type: 'due_soon' | 'overdue' | 'paid';
  title: string;
  message: string;
  debtName: string;
  installmentNumber: number;
  amount: number;
  dueDate: string;
  isRead: boolean;
}

const DebtNotifications: React.FC = () => {
  const { debts, installments } = useDebt();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

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

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'due_soon':
        return <Calendar className="h-4 w-4 text-yellow-600" />;
      case 'overdue':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'due_soon':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950';
      case 'overdue':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950';
      case 'paid':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950';
      default:
        return 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900';
    }
  };

  return (
    <div className="relative">
      {/* Botão de notificações */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>

      {/* Painel de notificações */}
      {showNotifications && (
        <Card className="absolute right-0 top-12 w-80 max-h-96 overflow-y-auto z-50 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Notificações</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotifications(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma notificação</p>
              </div>
            ) : (
              <div className="space-y-2 p-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border ${getNotificationStyle(notification.type)} ${
                      !notification.isRead ? 'ring-2 ring-blue-500 ring-opacity-20' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1">
                        {getNotificationIcon(notification.type)}
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{notification.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-medium">
                              {formatCurrency(notification.amount)}
                            </span>
                            <span className="text-muted-foreground">
                              • {new Date(notification.dueDate).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="h-6 w-6 p-0"
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => dismissNotification(notification.id)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DebtNotifications;
