
import React from 'react';
import { Navigate } from 'react-router-dom';
import { Loader } from 'lucide-react';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const adminSession = localStorage.getItem('adminSession');

  if (!adminSession) {
    return <Navigate to="/admin-login" replace />;
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;
