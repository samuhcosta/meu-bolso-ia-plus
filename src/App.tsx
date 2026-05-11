
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SubscriptionProvider, useSubscription } from "@/contexts/SubscriptionContext";
import { FinancialProvider } from "@/contexts/FinancialContext";
import { DebtProvider } from "@/contexts/DebtContext";
import Layout from "@/components/Layout";
import LoadingScreen from "@/components/LoadingScreen";
import ErrorScreen from "@/components/ErrorScreen";
import ErrorBoundary from "@/components/ErrorBoundary";
import TrialExpiredScreen from "@/components/TrialExpiredScreen";

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
import CheckoutSuccess from "./pages/CheckoutSuccess";
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
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const TrialFeatureRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading: authLoading } = useAuth();
  const { isPremium, isLoading: subLoading, trialExpired } = useSubscription();
  
  if (authLoading || subLoading) {
    return <LoadingScreen message="Verificando acesso..." />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // If not premium AND trial has expired, show block screen with upgrade message
  if (!isPremium && trialExpired) {
    return <TrialExpiredScreen />;
  }
  
  return <>{children}</>;
};

const AppContent = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ErrorBoundary>
          <AuthProvider>
            <SubscriptionProvider>
              <ErrorBoundary>
                <FinancialProvider>
                  <ErrorBoundary>
                    <DebtProvider>
                      <BrowserRouter>
                        <ErrorBoundary>
                          <Layout>
                            <Routes>
                              {/* Public Routes */}
                              <Route path="/" element={<Index />} />
                              <Route path="/login" element={<Login />} />
                              <Route path="/register" element={<Register />} />
                              <Route path="/forgot-password" element={<ForgotPassword />} />
                              <Route path="/reset-password" element={<ResetPassword />} />
                              <Route path="/plans" element={<Plans />} />
                              <Route path="/support" element={<Support />} />
                              <Route path="/checkout-success" element={<CheckoutSuccess />} />
                              
                              {/* Protected Routes */}
                              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                              <Route path="/finances" element={<TrialFeatureRoute><Finances /></TrialFeatureRoute>} />
                              <Route path="/debts" element={<TrialFeatureRoute><Debts /></TrialFeatureRoute>} />
                              <Route path="/reports" element={<TrialFeatureRoute><Reports /></TrialFeatureRoute>} />
                              <Route path="/goals" element={<TrialFeatureRoute><Goals /></TrialFeatureRoute>} />
                              <Route path="/ai-assistant" element={<TrialFeatureRoute><AIAssistant /></TrialFeatureRoute>} />
                              <Route path="/import" element={<TrialFeatureRoute><Import /></TrialFeatureRoute>} />
                              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                              <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                              
                              {/* Catch all route */}
                              <Route path="*" element={<NotFound />} />
                            </Routes>
                          </Layout>
                        </ErrorBoundary>
                      </BrowserRouter>
                    </DebtProvider>
                  </ErrorBoundary>
                </FinancialProvider>
              </ErrorBoundary>
            </SubscriptionProvider>
          </AuthProvider>
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
};

export default App;
