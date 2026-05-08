
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  LayoutDashboard, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  CreditCard, 
  Target, 
  FileText, 
  Settings, 
  LogOut,
  Wallet,
  PieChart,
  Sparkles,
  Menu
} from 'lucide-react';
import DebtNotifications from '@/components/debt/DebtNotifications';
import ErrorBoundary from '@/components/ErrorBoundary';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { isPremium, trialDaysLeft, trialExpired } = useSubscription();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Entradas', href: '/finances?type=income', icon: ArrowUpCircle },
    { name: 'Saídas', href: '/finances?type=expense', icon: ArrowDownCircle },
    { name: 'Dívidas', href: '/debts', icon: CreditCard },
    { name: 'Metas', href: '/goals', icon: Target },
    { name: 'Relatórios', href: '/reports', icon: FileText },
    { name: 'IA Assistente', href: '/ai-assistant', icon: Sparkles },
    { name: 'Configurações', href: '/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error: any) {
      console.error('Logout error:', error.message);
    }
  };

  const isCurrentPath = (path: string) => {
    return location.pathname === path || (path.includes('?') && location.pathname + location.search === path);
  };

  if (!user) return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 left-0 bg-sidebar-background border-r border-sidebar-border z-50">
        <div className="p-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Wallet className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Meu Bolso <span className="text-primary">Pro</span>
          </span>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isCurrentPath(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
                  active
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                    : 'text-sidebar-foreground/60 hover:text-white hover:bg-sidebar-accent'
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? '' : 'group-hover:text-primary'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {!isPremium && (
          <div className="px-4 mt-4">
            <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl p-4 border border-primary/20">
              <div className="flex items-center gap-2 mb-2 text-primary font-bold text-sm">
                <Sparkles className="h-4 w-4" />
                <span>Meu Bolso Pro Premium</span>
              </div>
              <p className="text-xs text-sidebar-foreground/60 mb-3">
                {trialExpired 
                  ? "Seu período de teste expirou. Assine agora para continuar usando!" 
                  : `Você tem ${trialDaysLeft} dias de teste restantes.`}
              </p>
              <Link to="/plans">
                <Button className="w-full h-9 text-xs font-bold shadow-lg shadow-primary/20">
                  Upgrade Agora
                </Button>
              </Link>
            </div>
          </div>
        )}

        <div className="p-4 mt-auto border-t border-sidebar-border space-y-4">
          <div className="flex items-center gap-3 px-2">
            <Avatar className="h-10 w-10 border-2 border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold truncate text-white">{user.name}</p>
              <p className="text-xs text-sidebar-foreground/40 truncate">{user.plan}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <DebtNotifications />
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex-1 justify-start gap-2 text-sidebar-foreground/60 hover:text-red-400 hover:bg-red-400/10"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64 pb-20 lg:pb-0">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-40 w-full h-16 flex items-center justify-between px-6 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Wallet className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg tracking-tight">Meu Bolso Pro</span>
          </div>
          <div className="flex items-center gap-2">
            {!isPremium && (
              <Link to="/plans">
                <Button size="sm" className="h-8 px-3 text-[10px] font-bold">UPGRADE</Button>
              </Link>
            )}
            <DebtNotifications />
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 lg:px-8 py-8">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>

        {/* Bottom Navigation - Mobile */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 h-20 bg-card/80 backdrop-blur-2xl border-t border-border px-6 flex items-center justify-between">
          {navigation.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const active = isCurrentPath(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center justify-center gap-1 transition-all duration-200 ${
                  active ? 'text-primary scale-110' : 'text-muted-foreground hover:text-primary'
                }`}
              >
                <div className={`p-2 rounded-xl ${active ? 'bg-primary/10' : ''}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider">{item.name}</span>
              </Link>
            );
          })}

          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <button className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-all duration-200">
                <div className="p-2 rounded-xl">
                  <Menu className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider">Menu</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[70vh] bg-sidebar-background border-t-sidebar-border rounded-t-[2rem]">
              <SheetHeader className="pb-6 border-b border-sidebar-border">
                <SheetTitle className="text-white flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  Menu Principal
                </SheetTitle>
              </SheetHeader>
              
              <div className="py-6 space-y-6 overflow-y-auto max-h-[calc(70vh-120px)]">
                <div className="grid grid-cols-2 gap-3">
                  {navigation.slice(4).map((item) => {
                    const Icon = item.icon;
                    const active = isCurrentPath(item.href);
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                          active
                            ? 'bg-primary/10 border-primary/20 text-primary'
                            : 'bg-sidebar-accent/50 border-sidebar-border text-sidebar-foreground/60'
                        }`}
                      >
                        <Icon className="h-6 w-6" />
                        <span className="text-xs font-bold text-center">{item.name}</span>
                      </Link>
                    );
                  })}
                  {/* Incluindo Metas manualmente se não estiver no slice(4) */}
                  {navigation[4]?.name !== 'Metas' && navigation.some(n => n.name === 'Metas') && (
                    <Link
                      to="/goals"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-sidebar-accent/50 border border-sidebar-border text-sidebar-foreground/60"
                    >
                      <Target className="h-6 w-6" />
                      <span className="text-xs font-bold">Metas</span>
                    </Link>
                  )}
                </div>

                <div className="pt-6 border-t border-sidebar-border space-y-4">
                  <div className="flex items-center gap-3 px-2">
                    <Avatar className="h-12 w-12 border-2 border-primary/20">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-base font-semibold truncate text-white">{user.name}</p>
                      <p className="text-sm text-sidebar-foreground/40 truncate">{user.plan}</p>
                    </div>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start gap-3 h-14 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-2xl"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-5 w-5" />
                    Sair da conta
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </div>
  );
};

export default Layout;
