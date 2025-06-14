
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
import Family from "./pages/Family";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import Plans from "./pages/Plans";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading, error, retryCount, maxRetries, retryAuth } = useAuth();
  
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
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <FinancialProvider>
          <DebtProvider>
            <BrowserRouter>
              <Layout>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<PublicRoute><Index /></PublicRoute>} />
                  <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                  <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                  <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
                  <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
                  <Route path="/plans" element={<Plans />} />
                  <Route path="/support" element={<Support />} />
                  
                  {/* Protected Routes */}
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/finances" element={<ProtectedRoute><Finances /></ProtectedRoute>} />
                  <Route path="/debts" element={<ProtectedRoute><Debts /></ProtectedRoute>} />
                  <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                  <Route path="/goals" element={<ProtectedRoute><Goals /></ProtectedRoute>} />
                  <Route path="/ai-assistant" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
                  <Route path="/import" element={<ProtectedRoute><Import /></ProtectedRoute>} />
                  <Route path="/family" element={<ProtectedRoute><Family /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                  <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                  
                  {/* Catch all route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            </BrowserRouter>
          </DebtProvider>
        </FinancialProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
