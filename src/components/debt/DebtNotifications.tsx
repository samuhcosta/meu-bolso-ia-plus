
import React, { useState } from 'react';
import { useDebt } from '@/contexts/DebtContext';
import { useNotificationGenerator } from '@/hooks/useNotificationGenerator';
import NotificationButton from './NotificationButton';
import NotificationPanel from './NotificationPanel';

const DebtNotifications: React.FC = () => {
  const { debts, installments } = useDebt();
  const [showNotifications, setShowNotifications] = useState(false);
  
  const { notifications, markAsRead, dismissNotification } = useNotificationGenerator(debts, installments);
  
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative">
      <NotificationButton
        unreadCount={unreadCount}
        onClick={() => setShowNotifications(!showNotifications)}
      />

      {showNotifications && (
        <NotificationPanel
          notifications={notifications}
          onClose={() => setShowNotifications(false)}
          onMarkAsRead={markAsRead}
          onDismiss={dismissNotification}
        />
      )}
    </div>
  );
};

export default DebtNotifications;
