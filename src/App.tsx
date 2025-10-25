
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Context
import { AuthProvider } from "./contexts/AuthContext";

// Auth Components
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { RoleGuard } from "./components/auth/RoleGuard";

// Layouts
import { DashboardLayout } from "./components/layouts/DashboardLayout";
import { AppLayout } from "./components/AppLayout";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import RoleSelection from "./pages/RoleSelection";

// Seller Pages
import SellerDashboard from "./pages/SellerDashboard";
import SellerOnboarding from "./pages/SellerOnboarding";
import InvoiceNew from "./pages/InvoiceNew";
import InvoiceNewConnected from "./pages/InvoiceNewConnected";
import Invoices from "./pages/Invoices";
import InvoiceDetail from "./pages/InvoiceDetail";
import InvoiceDetailNew from "./pages/InvoiceDetailNew";

// Funder Pages
import FunderDashboardNew from './pages/FunderDashboardNew';
import FunderOnboarding from "./pages/FunderOnboarding";
import MarketNew from "./pages/MarketNew";
import Portfolio from "./pages/Portfolio";
import Analytics from "./pages/Analytics";

// Operator Pages
import OperatorDashboard from "./pages/OperatorDashboard";
import OperatorFunders from "./pages/OperatorFunders";
import OperatorKYB from "./pages/OperatorKYB";
import OperatorInvoices from "./pages/OperatorInvoices";
import OperatorPools from "./pages/OperatorPools";
import OperatorInsurance from "./pages/OperatorInsurance";
import OperatorAudit from "./pages/OperatorAudit";

// Shared Pages
import Settings from "./pages/Settings";
import SettingsNew from "./pages/SettingsNew";
import DebugAuth from "./pages/DebugAuth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/debug-auth" element={<DebugAuth />} />

            {/* Role Selection (Protected but no role required) */}
            <Route
              path="/role-selection"
              element={
                <ProtectedRoute>
                  <RoleSelection />
                </ProtectedRoute>
              }
            />

            {/* Seller Routes */}
            <Route
              path="/dashboard/seller"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['seller', 'admin']}>
                    <DashboardLayout>
                      <SellerDashboard />
                    </DashboardLayout>
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/onboarding/seller"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['seller', 'admin']}>
                    <DashboardLayout>
                      <SellerOnboarding />
                    </DashboardLayout>
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/invoices"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['seller', 'admin']}>
                    <DashboardLayout>
                      <Invoices />
                    </DashboardLayout>
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/invoices/new"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['seller', 'admin']}>
                    <InvoiceNewConnected />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/invoices/:id"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['seller', 'funder', 'operator', 'admin']}>
                    <InvoiceDetailNew />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />

            {/* Funder Routes */}
            <Route
              path="/dashboard/funder"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['funder', 'operator', 'admin']}>
                    <FunderDashboardNew />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/onboarding/funder"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['funder', 'operator', 'admin']}>
                    <DashboardLayout>
                      <FunderOnboarding />
                    </DashboardLayout>
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/market"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['funder', 'operator', 'admin']}>
                    <MarketNew />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/portfolio"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['funder', 'operator', 'admin']}>
                    <Portfolio />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['funder', 'operator', 'admin']}>
                    <Analytics />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />

            {/* Operator Routes */}
            <Route
              path="/dashboard/operator"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['operator', 'admin']}>
                    <AppLayout>
                      <OperatorDashboard />
                    </AppLayout>
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/ops/kyb"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['operator', 'admin']}>
                    <AppLayout>
                      <OperatorKYB />
                    </AppLayout>
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/ops/invoices"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['operator', 'admin']}>
                    <AppLayout>
                      <OperatorInvoices />
                    </AppLayout>
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/ops/funders"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['operator', 'admin']}>
                    <AppLayout>
                      <OperatorFunders />
                    </AppLayout>
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/ops/pools"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['operator', 'admin']}>
                    <AppLayout>
                      <OperatorPools />
                    </AppLayout>
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/ops/insurance"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['operator', 'admin']}>
                    <AppLayout>
                      <OperatorInsurance />
                    </AppLayout>
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/ops/audit"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['operator', 'admin']}>
                    <AppLayout>
                      <OperatorAudit />
                    </AppLayout>
                  </RoleGuard>
                </ProtectedRoute>
              }
            />

            {/* Shared Protected Routes */}
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Settings />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
