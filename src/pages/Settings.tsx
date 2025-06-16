import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import ApiKeySettings from '@/components/ApiKeySettings';

const Settings = () => {
  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your settings have been updated successfully.",
    });
  };

  return (
    <div className="container mx-auto max-w-4xl animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-500">Configure your application preferences</p>
      </div>

      <div className="grid gap-6">
        <ApiKeySettings />

        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Configure your general application settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-save">Auto Save Sessions</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically save sessions when they are created
                </p>
              </div>
              <Switch id="auto-save" defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="real-time">Real-time Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Enable real-time updates for session data
                </p>
              </div>
              <Switch id="real-time" defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">Show Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Show notifications for new data entries
                </p>
              </div>
              <Switch id="notifications" defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session Default Settings</CardTitle>
            <CardDescription>Configure default settings for new sessions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="default-page-type">Default Page Type</Label>
              <Select defaultValue="login1">
                <SelectTrigger>
                  <SelectValue placeholder="Select default page type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="login1">Login1 (Email/Password)</SelectItem>
                  <SelectItem value="login2">Login2 (Auth Code)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="session-expiry">Session Expiry</Label>
              <Select defaultValue="24h">
                <SelectTrigger>
                  <SelectValue placeholder="Select session expiry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">1 Hour</SelectItem>
                  <SelectItem value="6h">6 Hours</SelectItem>
                  <SelectItem value="24h">24 Hours</SelectItem>
                  <SelectItem value="7d">7 Days</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Collection Settings</CardTitle>
            <CardDescription>Configure data collection preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="collect-ip">Collect IP Addresses</Label>
                <p className="text-sm text-muted-foreground">
                  Store IP addresses with submission data
                </p>
              </div>
              <Switch id="collect-ip" defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="collect-geolocation">Collect Geolocation</Label>
                <p className="text-sm text-muted-foreground">
                  Store geolocation data with submissions
                </p>
              </div>
              <Switch id="collect-geolocation" defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="collect-device">Collect Device Info</Label>
                <p className="text-sm text-muted-foreground">
                  Store browser and device information
                </p>
              </div>
              <Switch id="collect-device" defaultChecked />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end mt-4">
          <Button onClick={handleSaveSettings}>Save All Settings</Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
