
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { FinancialProvider } from "@/contexts/FinancialContext";
import { DebtProvider } from "@/contexts/DebtContext";
import Layout from "@/components/Layout";
import LoadingScreen from "@/components/LoadingScreen";
import ErrorScreen from "@/components/ErrorScreen";
import ErrorBoundary from "@/components/ErrorBoundary";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Finances from "./pages/Finances";
import Debts from "./pages/Debts";
import Reports from "./pages/Reports";
import Goals from "./pages/Goals";
import AIAssistant from "./pages/AIAssistant";
import Import from "./pages/Import";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import Plans from "./pages/Plans";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        console.log(`🔄 Query - Tentativa ${failureCount} falhou:`, error?.message);
        return failureCount < 2; // Máximo 2 tentativas
      },
      retryDelay: 1000,
    },
  },
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading, error, retryCount, maxRetries, retryAuth } = useAuth();
  
  console.log('🔐 ProtectedRoute - Estado:', { 
    hasUser: !!user, 
    isLoading, 
    hasError: !!error,
    retryCount 
  });
  
  if (isLoading) {
    return (
      <LoadingScreen 
        message="Verificando suas informações..." 
        showRetryInfo={retryCount > 0}
        currentRetry={retryCount}
        maxRetries={maxRetries}
      />
    );
  }

  if (error) {
    console.error('❌ ProtectedRoute - Erro de autenticação:', error);
    return (
      <ErrorScreen 
        error={error} 
        onRetry={retryAuth}
        retryCount={retryCount}
        maxRetries={maxRetries}
      />
    );
  }
  
  if (!user) {
    console.log('👤 ProtectedRoute - Usuário não autenticado, redirecionando para login');
    return <Navigate to="/login" replace />;
  }
  
  console.log('✅ ProtectedRoute - Usuário autenticado:', user.name);
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading, error, retryCount, maxRetries, retryAuth } = useAuth();
  
  console.log('🌐 PublicRoute - Estado:', { 
    hasUser: !!user, 
    isLoading, 
    hasError: !!error 
  });
  
  if (isLoading) {
    return (
      <LoadingScreen 
        message="Carregando..." 
        showRetryInfo={retryCount > 0}
        currentRetry={retryCount}
        maxRetries={maxRetries}
      />
    );
  }

  if (error) {
    console.error('❌ PublicRoute - Erro de autenticação:', error);
    return (
      <ErrorScreen 
        error={error} 
        onRetry={retryAuth}
        retryCount={retryCount}
        maxRetries={maxRetries}
      />
    );
  }
  
  if (user) {
    console.log('✅ PublicRoute - Usuário já autenticado, redirecionando para dashboard');
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const AppContent = () => {
  console.log('🚀 App - Renderizando aplicação principal');
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ErrorBoundary>
          <AuthProvider>
            <ErrorBoundary>
              <FinancialProvider>
                <ErrorBoundary>
                  <DebtProvider>
                    <BrowserRouter>
                      <ErrorBoundary>
                        <Layout>
                          <Routes>
                            {/* Public Routes */}
                            <Route path="/" element={
                              <ErrorBoundary>
                                <PublicRoute><Index /></PublicRoute>
                              </ErrorBoundary>
                            } />
                            <Route path="/login" element={
                              <ErrorBoundary>
                                <PublicRoute><Login /></PublicRoute>
                              </ErrorBoundary>
                            } />
                            <Route path="/register" element={
                              <ErrorBoundary>
                                <PublicRoute><Register /></PublicRoute>
                              </ErrorBoundary>
                            } />
                            <Route path="/forgot-password" element={
                              <ErrorBoundary>
                                <PublicRoute><ForgotPassword /></PublicRoute>
                              </ErrorBoundary>
                            } />
                            <Route path="/reset-password" element={
                              <ErrorBoundary>
                                <PublicRoute><ResetPassword /></PublicRoute>
                              </ErrorBoundary>
                            } />
                            <Route path="/plans" element={
                              <ErrorBoundary>
                                <Plans />
                              </ErrorBoundary>
                            } />
                            <Route path="/support" element={
                              <ErrorBoundary>
                                <Support />
                              </ErrorBoundary>
                            } />
                            
                            {/* Protected Routes */}
                            <Route path="/dashboard" element={
                              <ErrorBoundary>
                                <ProtectedRoute><Dashboard /></ProtectedRoute>
                              </ErrorBoundary>
                            } />
                            <Route path="/finances" element={
                              <ErrorBoundary>
                                <ProtectedRoute><Finances /></ProtectedRoute>
                              </ErrorBoundary>
                            } />
                            <Route path="/debts" element={
                              <ErrorBoundary>
                                <ProtectedRoute><Debts /></ProtectedRoute>
                              </ErrorBoundary>
                            } />
                            <Route path="/reports" element={
                              <ErrorBoundary>
                                <ProtectedRoute><Reports /></ProtectedRoute>
                              </ErrorBoundary>
                            } />
                            <Route path="/goals" element={
                              <ErrorBoundary>
                                <ProtectedRoute><Goals /></ProtectedRoute>
                              </ErrorBoundary>
                            } />
                            <Route path="/ai-assistant" element={
                              <ErrorBoundary>
                                <ProtectedRoute><AIAssistant /></ProtectedRoute>
                              </ErrorBoundary>
                            } />
                            <Route path="/import" element={
                              <ErrorBoundary>
                                <ProtectedRoute><Import />
                              </ProtectedRoute>
                              </ErrorBoundary>
                            } />
                            <Route path="/settings" element={
                              <ErrorBoundary>
                                <ProtectedRoute><Settings /></ProtectedRoute>
                              </ErrorBoundary>
                            } />
                            <Route path="/notifications" element={
                              <ErrorBoundary>
                                <ProtectedRoute><Notifications /></ProtectedRoute>
                              </ErrorBoundary>
                            } />
                            
                            {/* Catch all route */}
                            <Route path="*" element={
                              <ErrorBoundary>
                                <NotFound />
                              </ErrorBoundary>
                            } />
                          </Routes>
                        </Layout>
                      </ErrorBoundary>
                    </BrowserRouter>
                  </DebtProvider>
                </ErrorBoundary>
              </FinancialProvider>
            </ErrorBoundary>
          </AuthProvider>
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

const App = () => {
  console.log('🎯 App - Inicializando Meu Bolso Pro');
  
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
};

export default App;
