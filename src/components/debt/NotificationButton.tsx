
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';

interface NotificationButtonProps {
  unreadCount: number;
  onClick: () => void;
}

const NotificationButton: React.FC<NotificationButtonProps> = ({
  unreadCount,
  onClick
}) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
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
  );
};

export default NotificationButton;
