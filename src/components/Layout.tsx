
import React from 'react';
import Sidebar from './Sidebar';
import { SessionProvider } from '@/contexts/SessionContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 p-6 md:p-8 overflow-auto">
          {children}
        </div>
      </div>
    </SessionProvider>
  );
};

export default Layout;
