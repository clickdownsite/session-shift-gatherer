
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { Loader } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';

// Lazy load pages for better performance
const Auth = lazy(() => import('@/pages/Auth'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const CreateSession = lazy(() => import('@/pages/CreateSession'));
const SessionPage = lazy(() => import('@/pages/SessionPage'));
const SessionLandingPage = lazy(() => import('@/pages/SessionLandingPage'));
const History = lazy(() => import('@/pages/History'));
const Analytics = lazy(() => import('@/pages/Analytics'));
const Settings = lazy(() => import('@/pages/Settings'));
const Profile = lazy(() => import('@/pages/Profile'));
const UserPages = lazy(() => import('@/pages/UserPages'));
const StaticForms = lazy(() => import('@/pages/StaticForms'));
const StaticFormPage = lazy(() => import('@/pages/StaticFormPage'));
const Flows = lazy(() => import('@/pages/Flows'));
const NotFound = lazy(() => import('@/pages/NotFound'));

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
              {/* Public Routes - Session Landing Pages */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/form/:formId" element={<StaticFormPage />} />
              <Route path="/page/:sessionId" element={<SessionPage />} />
              <Route path="/session/:sessionId" element={<SessionPage />} />
              
              {/* Default redirect to dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* Session Landing Pages - using wildcard to catch session IDs */}
              <Route path="/:sessionId" element={<SessionLandingPage />} />
              
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
