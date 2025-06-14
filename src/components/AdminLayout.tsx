
import React from 'react';
import AdminSidebar from './AdminSidebar';
import { SessionProvider } from '@/contexts/SessionContext';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <SessionProvider>
      <SidebarProvider>
        <div className="min-h-screen bg-background flex w-full">
          <AdminSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
            </header>
            <main className="flex-1 p-6 md:p-8 overflow-auto">
              {children}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </SessionProvider>
  );
};

export default AdminLayout;
