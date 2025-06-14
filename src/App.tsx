
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import { SessionProvider } from "@/contexts/SessionContext";
import { LiveSessionProvider } from "@/components/LiveSessionProvider";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import CreateSession from "./pages/CreateSession";
import UserPages from "./pages/UserPages";
import History from "./pages/History";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import StaticForms from "./pages/StaticForms";
import StaticFormPage from "./pages/StaticFormPage";
import SessionPage from "./pages/SessionPage";
import Analytics from "./pages/Analytics";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import Layout from "./components/Layout";
import AdminLayout from "./components/AdminLayout";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminPages from "./pages/admin/AdminPages";
import AdminData from "./pages/admin/AdminData";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions";
import AdminSettings from "./pages/admin/AdminSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <SessionProvider>
              <LiveSessionProvider>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/form/:formId" element={<StaticFormPage />} />
                  <Route path="/page/:sessionId" element={<SessionPage />} />
                  
                  {/* Admin Routes */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin" element={
                    <AdminProtectedRoute>
                      <AdminLayout>
                        <Outlet />
                      </AdminLayout>
                    </AdminProtectedRoute>
                  }>
                    <Route index element={<AdminDashboard />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="pages" element={<AdminPages />} />
                    <Route path="data" element={<AdminData />} />
                    <Route path="subscriptions" element={<AdminSubscriptions />} />
                    <Route path="settings" element={<AdminSettings />} />
                  </Route>

                  {/* Protected User Routes */}
                  <Route path="/" element={
                    <ProtectedRoute>
                      <Layout>
                        <Outlet />
                      </Layout>
                    </ProtectedRoute>
                  }>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="create-session" element={<CreateSession />} />
                    <Route path="user-pages" element={<UserPages />} />
                    <Route path="history" element={<History />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="static-forms" element={<StaticForms />} />
                    <Route path="analytics" element={<Analytics />} />
                  </Route>

                  {/* 404 Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </LiveSessionProvider>
            </SessionProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
