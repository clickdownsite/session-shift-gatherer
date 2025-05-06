
import React from 'react';
import Sidebar from './Sidebar';
import { SessionProvider } from '@/contexts/SessionContext';
import { MobileNav } from './MobileNav';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-background flex">
        <Sidebar />
        <div className="flex-1 p-6 md:p-8 overflow-auto">
          <MobileNav />
          {children}
        </div>
      </div>
    </SessionProvider>
  );
};

export default Layout;
