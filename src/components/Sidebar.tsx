
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Calendar, Settings, User, LinkIcon, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  
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

      <div className="mt-auto">
        {user?.isAdmin && (
          <Link 
            to="/admin"
            className="flex items-center px-4 py-3 text-sm font-medium rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            Admin Panel →
          </Link>
        )}
      </div>
      
      <div className="mt-2 px-4 py-3">
        <button
          onClick={toggleTheme}
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
            <div className="h-8 w-8 rounded-full bg-purple-300 flex items-center justify-center text-purple-800 font-semibold">
              {user?.name?.charAt(0) || "U"}
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">{user?.name || "User"}</p>
            <p className="text-xs text-opacity-90">{user?.email || "user@example.com"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
