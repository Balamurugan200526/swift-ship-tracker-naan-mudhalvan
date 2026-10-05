import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoadingSpinner from './components/LoadingSpinner';
import ProtectedRoute from './components/ProtectedRoute';
import AIAssistant from './components/AIAssistant';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import AgentLayout from './layouts/AgentLayout';
import CustomerLayout from './layouts/CustomerLayout';
import SupportLayout from './layouts/SupportLayout';

// Public pages (eager load)
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TrackingPage from './pages/TrackingPage';
import NotFoundPage from './pages/NotFoundPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

// Lazy-loaded pages
const AdminDashboard       = lazy(() => import('./pages/admin/AdminDashboard'));
const ParcelsPage          = lazy(() => import('./pages/admin/ParcelsPage'));
const SendersPage          = lazy(() => import('./pages/admin/SendersPage'));
const ReceiversPage        = lazy(() => import('./pages/admin/ReceiversPage'));
const DeliveriesPage       = lazy(() => import('./pages/admin/DeliveriesPage'));
const ReportsPage          = lazy(() => import('./pages/admin/ReportsPage'));
const AuditPage            = lazy(() => import('./pages/admin/AuditPage'));
const UsersPage            = lazy(() => import('./pages/admin/UsersPage'));
const AgentDashboard       = lazy(() => import('./pages/agent/AgentDashboard'));
const AgentDeliveriesPage  = lazy(() => import('./pages/agent/AgentDeliveriesPage'));
const CustomerDashboard    = lazy(() => import('./pages/customer/CustomerDashboard'));
const CustomerParcelsPage  = lazy(() => import('./pages/customer/CustomerParcelsPage'));
const SupportDashboard     = lazy(() => import('./pages/support/SupportDashboard'));

// Root redirect based on role
const RootRedirect = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const routes: Record<string, string> = {
    ADMIN: '/admin/dashboard',
    DELIVERY_AGENT: '/agent/dashboard',
    CUSTOMER: '/customer/dashboard',
    SUPPORT: '/support/dashboard',
  };
  return <Navigate to={routes[user?.role || ''] || '/login'} replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { borderRadius: '12px', fontSize: '14px', fontWeight: '500' },
            success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/track" element={<TrackingPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Root redirect */}
            <Route path="/dashboard" element={<RootRedirect />} />

            {/* Admin routes */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard"  element={<AdminDashboard />} />
              <Route path="parcels"    element={<ParcelsPage />} />
              <Route path="senders"    element={<SendersPage />} />
              <Route path="receivers"  element={<ReceiversPage />} />
              <Route path="deliveries" element={<DeliveriesPage />} />
              <Route path="reports"    element={<ReportsPage />} />
              <Route path="audit"      element={<AuditPage />} />
              <Route path="users"      element={<UsersPage />} />
            </Route>

            {/* Delivery Agent routes */}
            <Route path="/agent" element={<ProtectedRoute allowedRoles={['DELIVERY_AGENT']}><AgentLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard"  element={<AgentDashboard />} />
              <Route path="deliveries" element={<AgentDeliveriesPage />} />
            </Route>

            {/* Customer routes */}
            <Route path="/customer" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><CustomerLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<CustomerDashboard />} />
              <Route path="parcels"   element={<CustomerParcelsPage />} />
            </Route>

            {/* Support routes */}
            <Route path="/support" element={<ProtectedRoute allowedRoles={['SUPPORT']}><SupportLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<SupportDashboard />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>

        {/* Floating AI Assistant — visible everywhere */}
        <AIAssistantWrapper />
      </BrowserRouter>
    </AuthProvider>
  );
}

// AI Assistant only shown when not on login/register pages
const AIAssistantWrapper = () => {
  const path = window.location.pathname;
  if (['/login', '/register', '/'].includes(path)) return null;
  return <AIAssistant />;
};

export default App;
