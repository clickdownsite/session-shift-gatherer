
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Settings, Users, LayoutDashboard, FileText, Database, CreditCard, Moon, Sun, LogOut } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  
  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Pages', href: '/admin/pages', icon: FileText },
    { name: 'Data', href: '/admin/data', icon: Database },
    { name: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
    { name: 'Settings', href: '/admin/settings', icon: Settings }
  ];

  const handleSignOut = () => {
    localStorage.removeItem('adminSession');
    navigate('/admin-login');
  };
  
  return (
    <div className="hidden md:flex flex-col bg-sidebar text-sidebar-foreground w-64 p-4 shadow-lg">
      <div className="px-4 py-5 flex items-center">
        <h1 className="text-xl font-bold">Admin Panel</h1>
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
        <Link 
          to="/"
          className="flex items-center px-4 py-3 text-sm font-medium rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          ← Back to User Panel
        </Link>
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
            <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-semibold">
              A
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">Admin</p>
            <p className="text-xs text-opacity-90">System Administrator</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="mt-2 w-full flex items-center px-4 py-2 text-sm text-red-400 hover:text-red-300"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
