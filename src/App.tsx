
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/hooks/useAuth';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import Layout from '@/components/Layout';
import AdminLayout from '@/components/AdminLayout';

// Pages
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import LoginPage from '@/pages/LoginPage';
import Dashboard from '@/pages/Dashboard';
import CreateSession from '@/pages/CreateSession';
import SessionPage from '@/pages/SessionPage';
import History from '@/pages/History';
import Analytics from '@/pages/Analytics';
import Settings from '@/pages/Settings';
import Profile from '@/pages/Profile';
import UserPages from '@/pages/UserPages';
import StaticForms from '@/pages/StaticForms';
import StaticFormPage from '@/pages/StaticFormPage';
import Flows from '@/pages/Flows';
import NotFound from '@/pages/NotFound';

// Admin Pages
import AdminLogin from '@/pages/AdminLogin';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminPages from '@/pages/admin/AdminPages';
import AdminData from '@/pages/admin/AdminData';
import AdminAnnouncements from '@/pages/admin/AdminAnnouncements';
import AdminSubscriptions from '@/pages/admin/AdminSubscriptions';
import AdminSettings from '@/pages/admin/AdminSettings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/form/:formId" element={<StaticFormPage />} />
              <Route path="/session/:sessionId" element={<SessionPage />} />
              
              {/* Protected User Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-session"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <CreateSession />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <History />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Analytics />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Settings />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Profile />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pages"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <UserPages />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/static-forms"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <StaticForms />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/flows"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Flows />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout>
                      <AdminDashboard />
                    </AdminLayout>
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout>
                      <AdminUsers />
                    </AdminLayout>
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/pages"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout>
                      <AdminPages />
                    </AdminLayout>
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/data"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout>
                      <AdminData />
                    </AdminLayout>
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/announcements"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout>
                      <AdminAnnouncements />
                    </AdminLayout>
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/subscriptions"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout>
                      <AdminSubscriptions />
                    </AdminLayout>
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout>
                      <AdminSettings />
                    </AdminLayout>
                  </AdminProtectedRoute>
                }
              />

              {/* Catch all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
      <Toaster />
      <SonnerToaster />
    </QueryClientProvider>
  );
}

export default App;
