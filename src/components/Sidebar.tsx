
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Calendar, LinkIcon, Settings, User } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  
  const navigation = [
    { name: 'Sessions', href: '/', icon: LinkIcon },
    { name: 'History', href: '/history', icon: Calendar },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings }
  ];
  
  return (
    <div className="hidden md:flex flex-col bg-sidebar text-sidebar-foreground w-64 p-4 shadow-lg">
      <div className="px-4 py-5 flex items-center">
        <h1 className="text-xl font-bold">Session Generator</h1>
      </div>
      
      <div className="mt-10 flex flex-col gap-2">
        {navigation.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              'flex items-center px-4 py-3 text-sm font-medium rounded-md',
              location.pathname === item.href
                ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            )}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
          </Link>
        ))}
      </div>
      
      <div className="mt-auto px-4 py-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-purple-300 flex items-center justify-center text-purple-800 font-semibold">
              U
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">User</p>
            <p className="text-xs text-opacity-90">user@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
