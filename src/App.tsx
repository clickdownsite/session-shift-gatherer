
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";
import Layout from "@/components/Layout";
import AdminLayout from "@/components/AdminLayout";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import CreateSession from "./pages/CreateSession";
import History from "./pages/History";
import LoginPage from "./pages/LoginPage";
import Auth from "./pages/Auth";
import AdminLogin from "./pages/AdminLogin";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminData from "./pages/admin/AdminData";
import AdminPages from "./pages/admin/AdminPages";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/page/:sessionId" element={<LoginPage />} />
              
              {/* Protected routes with main layout */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout>
                    <Index />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/create-session" element={
                <ProtectedRoute>
                  <Layout>
                    <CreateSession />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/history" element={
                <ProtectedRoute>
                  <Layout>
                    <History />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Layout>
                    <Settings />
                  </Layout>
                </ProtectedRoute>
              } />
              
              {/* Protected admin routes */}
              <Route path="/admin" element={
                <AdminProtectedRoute>
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                </AdminProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <AdminProtectedRoute>
                  <AdminLayout>
                    <AdminUsers />
                  </AdminLayout>
                </AdminProtectedRoute>
              } />
              <Route path="/admin/data" element={
                <AdminProtectedRoute>
                  <AdminLayout>
                    <AdminData />
                  </AdminLayout>
                </AdminProtectedRoute>
              } />
              <Route path="/admin/pages" element={
                <AdminProtectedRoute>
                  <AdminLayout>
                    <AdminPages />
                  </AdminLayout>
                </AdminProtectedRoute>
              } />
              <Route path="/admin/settings" element={
                <AdminProtectedRoute>
                  <AdminLayout>
                    <AdminSettings />
                  </AdminLayout>
                </AdminProtectedRoute>
              } />
              <Route path="/admin/subscriptions" element={
                <AdminProtectedRoute>
                  <AdminLayout>
                    <AdminSubscriptions />
                  </AdminLayout>
                </AdminProtectedRoute>
              } />
              
              {/* 404 page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
