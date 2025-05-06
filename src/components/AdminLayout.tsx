
import React from 'react';
import AdminSidebar from './AdminSidebar';
import { SessionProvider } from '@/contexts/SessionContext';
import { AdminMobileNav } from './AdminMobileNav';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-background flex">
        <AdminSidebar />
        <div className="flex-1 p-6 md:p-8 overflow-auto">
          <AdminMobileNav />
          {children}
        </div>
      </div>
    </SessionProvider>
  );
};

export default AdminLayout;
