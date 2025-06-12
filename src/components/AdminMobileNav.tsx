
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Settings, Users, LayoutDashboard, FileText, Database, CreditCard, Moon, Sun, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';

export function AdminMobileNav() {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  
  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Pages', href: '/admin/pages', icon: FileText },
    { name: 'Data', href: '/admin/data', icon: Database },
    { name: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
    { name: 'Settings', href: '/admin/settings', icon: Settings }
  ];
  
  return (
    <div className="md:hidden flex justify-between items-center mb-6">
      <h1 className="text-xl font-bold">Admin Panel</h1>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="bg-sidebar text-sidebar-foreground w-64 p-0">
          <div className="flex flex-col h-full">
            <div className="px-4 py-5 flex items-center justify-between">
              <h1 className="text-xl font-bold">Admin Panel</h1>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="mt-6 flex flex-col gap-2 px-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center px-4 py-3 text-sm font-medium rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  onClick={() => setOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </div>

            <div className="mt-auto">
              <Link 
                to="/"
                className="flex items-center px-4 py-3 text-sm font-medium rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                onClick={() => setOpen(false)}
              >
                ← Back to User Panel
              </Link>
            </div>
            
            <div className="mt-2 px-4 py-3">
              <button
                onClick={() => {
                  toggleTheme();
                  setOpen(false);
                }}
                className="w-full flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="h-4 w-4 mr-2" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4 mr-2" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>
            </div>
            
            <div className="mt-2 px-4 py-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-semibold">
                    A
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{user?.user_metadata?.full_name || "Admin"}</p>
                  <p className="text-xs text-opacity-90">{user?.email || "admin@example.com"}</p>
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
