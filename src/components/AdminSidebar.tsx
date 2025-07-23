import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Settings, Users, LayoutDashboard, FileText, Database, CreditCard, Moon, Sun, LogOut, ArrowLeft, Megaphone } from 'lucide-react';
import { useTheme } from 'next-themes';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { state } = useSidebar();
  const { user } = useAuth();
  
  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Pages', href: '/admin/pages', icon: FileText },
    { name: 'Data', href: '/admin/data', icon: Database },
    { name: 'Announcements', href: '/admin/announcements', icon: Megaphone },
    { name: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
    { name: 'Settings', href: '/admin/settings', icon: Settings }
  ];

  const handleSignOut = () => {
    localStorage.removeItem('adminSession');
    navigate('/admin-login');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  
  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4">
        {state !== 'collapsed' ? (
           <h1 className="text-xl font-bold">Admin Panel</h1>
        ) : (
          <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-semibold text-xl">A</div>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link to={item.href} className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        {state !== "collapsed" && <span>{item.name}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <div className="mt-auto flex flex-col items-center gap-2 border-t p-2">
          {/* User info */}
          <div className="flex w-full items-center p-2">
            <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-semibold">
              A
            </div>
            {state !== "collapsed" && (
                <div className="ml-3">
                  <p className="text-sm font-medium">{user?.user_metadata?.full_name || "Admin"}</p>
                  <p className="text-xs text-muted-foreground">System Administrator</p>
                </div>
            )}
          </div>

        <SidebarMenu className="w-full">
            <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/" className="flex w-full items-center gap-3">
                    <ArrowLeft className="h-4 w-4" />
                    {state !== "collapsed" && <span>Back to User Panel</span>}
                  </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton onClick={toggleTheme} className="flex w-full items-center gap-3">
                    {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    {state !== 'collapsed' && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton onClick={handleSignOut} className="flex w-full items-center gap-3 text-destructive hover:text-destructive">
                    <LogOut className="h-4 w-4" />
                    {state !== 'collapsed' && <span>Sign Out</span>}
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </div>
    </Sidebar>
  );
};

export default AdminSidebar;
