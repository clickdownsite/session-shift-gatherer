
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';

const AdminSettings = () => {
  const [adminPassword, setAdminPassword] = useState('');

  const handleSaveGeneralSettings = () => {
    toast({
      title: "Settings Saved",
      description: "General settings have been updated",
    });
  };

  const handleSaveSecuritySettings = () => {
    toast({
      title: "Settings Saved",
      description: "Security settings have been updated",
    });
  };

  const handleSaveEmailSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Email settings have been updated",
    });
  };

  const handleChangeAdminPassword = () => {
    if (adminPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }

    localStorage.setItem('adminPassword', adminPassword);
    setAdminPassword('');
    toast({
      title: "Password Changed",
      description: "Admin password has been updated successfully",
    });
  };

  return (
    <div className="container mx-auto max-w-5xl animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">System Settings</h1>
        <p className="text-gray-500">Configure global system settings</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure basic system settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-3">
                <Label htmlFor="site-name">Site Name</Label>
                <Input id="site-name" defaultValue="Session Link Generator" />
              </div>
              
              <div className="grid gap-3">
                <Label htmlFor="site-url">Site URL</Label>
                <Input id="site-url" defaultValue="https://sessiongenerator.com" />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable maintenance mode to prevent user access
                  </p>
                </div>
                <Switch id="maintenance-mode" />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="user-registration">Allow User Registration</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow new users to register for an account
                  </p>
                </div>
                <Switch id="user-registration" defaultChecked />
              </div>
              
              <Button onClick={handleSaveGeneralSettings}>Save General Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure system security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="two-factor">Require Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Force users to set up 2FA for their accounts
                  </p>
                </div>
                <Switch id="two-factor" />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="password-policy">Enforce Strong Password Policy</Label>
                  <p className="text-sm text-muted-foreground">
                    Require complex passwords for all users
                  </p>
                </div>
                <Switch id="password-policy" defaultChecked />
              </div>
              
              <Separator />
              
              <div className="grid gap-3">
                <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                <Input id="session-timeout" type="number" defaultValue="60" />
              </div>
              
              <div className="grid gap-3">
                <Label htmlFor="max-login-attempts">Max Login Attempts</Label>
                <Input id="max-login-attempts" type="number" defaultValue="5" />
              </div>
              
              <Button onClick={handleSaveSecuritySettings}>Save Security Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admin">
          <Card>
            <CardHeader>
              <CardTitle>Admin Settings</CardTitle>
              <CardDescription>Manage admin access and credentials</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-3">
                <Label htmlFor="admin-password">Change Admin Password</Label>
                <Input 
                  id="admin-password" 
                  type="password" 
                  placeholder="Enter new admin password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                />
              </div>
              
              <Button onClick={handleChangeAdminPassword}>Update Admin Password</Button>
              
              <Separator />
              
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Current Admin Access</h4>
                <p className="text-sm text-muted-foreground">
                  Default password: Password123 (can be changed above)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
              <CardDescription>Configure system email settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-3">
                <Label htmlFor="smtp-server">SMTP Server</Label>
                <Input id="smtp-server" defaultValue="smtp.example.com" />
              </div>
              
              <div className="grid gap-3">
                <Label htmlFor="smtp-port">SMTP Port</Label>
                <Input id="smtp-port" defaultValue="587" />
              </div>
              
              <div className="grid gap-3">
                <Label htmlFor="smtp-username">SMTP Username</Label>
                <Input id="smtp-username" defaultValue="notification@example.com" />
              </div>
              
              <div className="grid gap-3">
                <Label htmlFor="smtp-password">SMTP Password</Label>
                <Input id="smtp-password" type="password" defaultValue="password" />
              </div>
              
              <div className="grid gap-3">
                <Label htmlFor="from-email">From Email</Label>
                <Input id="from-email" defaultValue="noreply@example.com" />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-encryption">Use SSL/TLS</Label>
                  <p className="text-sm text-muted-foreground">
                    Encrypt email communication
                  </p>
                </div>
                <Switch id="email-encryption" defaultChecked />
              </div>
              
              <Button onClick={handleSaveEmailSettings}>Save Email Settings</Button>
              
              <div className="pt-4">
                <Button variant="outline">Send Test Email</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
