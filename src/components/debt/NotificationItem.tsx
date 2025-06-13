
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, AlertTriangle, CheckCircle, Bell, X } from 'lucide-react';
import { Notification } from '@/types/notifications';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDismiss: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDismiss
}) => {
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
    <div
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
              onClick={() => onMarkAsRead(notification.id)}
              className="h-6 w-6 p-0"
            >
              <CheckCircle className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDismiss(notification.id)}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
