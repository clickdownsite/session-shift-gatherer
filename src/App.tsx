
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { Loader } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import Layout from '@/components/Layout';
import AdminLayout from '@/components/AdminLayout';

// Lazy load pages for better performance
const Index = lazy(() => import('@/pages/Index'));
const Auth = lazy(() => import('@/pages/Auth'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const CreateSession = lazy(() => import('@/pages/CreateSession'));
const SessionPage = lazy(() => import('@/pages/SessionPage'));
const History = lazy(() => import('@/pages/History'));
const Analytics = lazy(() => import('@/pages/Analytics'));
const Settings = lazy(() => import('@/pages/Settings'));
const Profile = lazy(() => import('@/pages/Profile'));
const UserPages = lazy(() => import('@/pages/UserPages'));
const StaticForms = lazy(() => import('@/pages/StaticForms'));
const StaticFormPage = lazy(() => import('@/pages/StaticFormPage'));
const Flows = lazy(() => import('@/pages/Flows'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Admin Pages
const AdminLogin = lazy(() => import('@/pages/AdminLogin'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'));
const AdminPages = lazy(() => import('@/pages/admin/AdminPages'));
const AdminData = lazy(() => import('@/pages/admin/AdminData'));
const AdminAnnouncements = lazy(() => import('@/pages/admin/AdminAnnouncements'));
const AdminSubscriptions = lazy(() => import('@/pages/admin/AdminSubscriptions'));
const AdminSettings = lazy(() => import('@/pages/admin/AdminSettings'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader className="h-8 w-8 animate-spin" />
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>
          <Router>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/login" element={<LoginPage />} />
               <Route path="/form/:formId" element={<StaticFormPage />} />
               <Route path="/page/:sessionId" element={<SessionPage />} />
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
            </Suspense>
          </Router>
        </AuthProvider>
      </ThemeProvider>
      <Toaster />
      <SonnerToaster />
    </QueryClientProvider>
  );
}

export default App;
