
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Plus,
  FileText,
  History,
  Settings,
  User,
  FormInput,
  BarChart3
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Create Session', href: '/create-session', icon: Plus },
  { name: 'User Pages', href: '/user-pages', icon: FileText },
  { name: 'Static Forms', href: '/static-forms', icon: FormInput },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'History', href: '/history', icon: History },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Profile', href: '/profile', icon: User },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="hidden md:fixed md:inset-y-0 md:left-0 md:z-50 md:block md:w-64 md:overflow-y-auto md:bg-white md:border-r md:border-gray-200">
      <div className="flex h-16 shrink-0 items-center px-6">
        <h1 className="text-xl font-bold">Session Manager</h1>
      </div>
      <nav className="mt-8">
        <div className="space-y-1 px-3">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link key={item.name} to={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Button>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
