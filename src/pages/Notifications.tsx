
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFinancial } from '@/contexts/FinancialContext';
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Target, 
  Bot, 
  Calendar,
  Trash2,
  BellOff
} from 'lucide-react';

const Notifications = () => {
  const { notifications, markNotificationAsRead } = useFinancial();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="w-5 h-5 text-destructive" />;
      case 'goal':
        return <Target className="w-5 h-5 text-secondary" />;
      case 'motivation':
        return <Bot className="w-5 h-5 text-primary" />;
      case 'bill':
        return <Calendar className="w-5 h-5 text-orange-500" />;
      default:
        return <Bell className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getNotificationBg = (type: string, read: boolean) => {
    if (read) return 'bg-muted/30';
    
    switch (type) {
      case 'alert':
        return 'bg-destructive/5 border-destructive/20';
      case 'goal':
        return 'bg-secondary/5 border-secondary/20';
      case 'motivation':
        return 'bg-primary/5 border-primary/20';
      case 'bill':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-background';
    }
  };

  const handleMarkAsRead = (id: string) => {
    markNotificationAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    notifications.forEach(notification => {
      if (!notification.read) {
        markNotificationAsRead(notification.id);
      }
    });
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const sortedNotifications = [...notifications].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Notificações</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 
              ? `${unreadCount} notificação(ões) não lida(s)`
              : 'Todas as notificações foram lidas'
            }
          </p>
        </div>
        
        {unreadCount > 0 && (
          <Button onClick={handleMarkAllAsRead} variant="outline">
            <CheckCircle className="w-4 h-4 mr-2" />
            Marcar todas como lidas
          </Button>
        )}
      </div>

      {/* Notification Settings Card */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Configurações de Notificação
          </CardTitle>
          <CardDescription>
            Configure como e quando você quer receber alertas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Bell className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="font-medium">Notificações no App</h3>
                <p className="text-sm text-muted-foreground">Sempre ativas</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Calendar className="w-8 h-8 text-secondary mx-auto mb-2" />
                <h3 className="font-medium">Email Semanal</h3>
                <p className="text-sm text-muted-foreground">Plano Pro+</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Bot className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <h3 className="font-medium">WhatsApp</h3>
                <p className="text-sm text-muted-foreground">Plano Premium</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-4">
        {sortedNotifications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <BellOff className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma notificação</h3>
              <p className="text-muted-foreground">
                Você receberá notificações sobre seus gastos, metas e alertas importantes aqui.
              </p>
            </CardContent>
          </Card>
        ) : (
          sortedNotifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`transition-all ${getNotificationBg(notification.type, notification.read)}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className={`text-sm font-medium ${notification.read ? 'text-muted-foreground' : 'text-foreground'}`}>
                          {notification.title}
                        </h4>
                        <p className={`text-sm mt-1 ${notification.read ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(notification.created_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Upgrade CTA */}
      <Card className="gradient-primary text-white">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-bold mb-2">
            Quer receber notificações por WhatsApp e Email?
          </h3>
          <p className="opacity-90 mb-4">
            Upgrade para o plano Pro ou Premium e nunca mais perca uma data importante ou gasto excessivo.
          </p>
          <Button variant="secondary" size="lg">
            Ver Planos
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Notifications;
