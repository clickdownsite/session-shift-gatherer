
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, User, Settings, Bell, Shield } from 'lucide-react';

interface UserSettings {
  email_notifications: boolean;
  data_collection_default: boolean;
  ip_collection_default: boolean;
  session_timeout: number;
  auto_close_sessions: boolean;
}

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userProfile, setUserProfile] = useState({
    full_name: '',
    email: '',
    avatar_url: '',
  });
  const [settings, setSettings] = useState<UserSettings>({
    email_notifications: true,
    data_collection_default: true,
    ip_collection_default: true,
    session_timeout: 24,
    auto_close_sessions: false,
  });

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      if (profile) {
        setUserProfile({
          full_name: profile.full_name || '',
          email: user?.email || '',
          avatar_url: profile.avatar_url || '',
        });
      } else {
        // Create profile if it doesn't exist
        await supabase.from('profiles').insert({
          id: user?.id,
          full_name: '',
          updated_at: new Date().toISOString(),
        });
        
        setUserProfile({
          full_name: '',
          email: user?.email || '',
          avatar_url: '',
        });
      }

      // Load user settings from localStorage as fallback
      const savedSettings = localStorage.getItem(`user_settings_${user?.id}`);
      if (savedSettings) {
        try {
          const parsedSettings = JSON.parse(savedSettings);
          setSettings({
            email_notifications: parsedSettings.email_notifications ?? true,
            data_collection_default: parsedSettings.data_collection_default ?? true,
            ip_collection_default: parsedSettings.ip_collection_default ?? true,
            session_timeout: parsedSettings.session_timeout ?? 24,
            auto_close_sessions: parsedSettings.auto_close_sessions ?? false,
          });
        } catch (e) {
          console.error('Error parsing saved settings:', e);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          full_name: userProfile.full_name,
          avatar_url: userProfile.avatar_url,
          updated_at: new Date().toISOString(),
        });

      if (profileError) throw profileError;

      // Save settings to localStorage
      localStorage.setItem(`user_settings_${user?.id}`, JSON.stringify(settings));

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const updateProfile = (field: string, value: string) => {
    setUserProfile(prev => ({ ...prev, [field]: value }));
  };

  const updateSettings = (field: keyof UserSettings, value: boolean | number) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Please log in to view your profile.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <Button onClick={saveProfile} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                value={userProfile.email}
                disabled
                className="bg-muted"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Email cannot be changed here. Contact support if needed.
              </p>
            </div>
            
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={userProfile.full_name}
                onChange={(e) => updateProfile('full_name', e.target.value)}
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <Label htmlFor="avatarUrl">Avatar URL</Label>
              <Input
                id="avatarUrl"
                value={userProfile.avatar_url}
                onChange={(e) => updateProfile('avatar_url', e.target.value)}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email updates about your sessions
                </p>
              </div>
              <Switch
                checked={settings.email_notifications}
                onCheckedChange={(checked) => updateSettings('email_notifications', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-close Sessions</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically close inactive sessions
                </p>
              </div>
              <Switch
                checked={settings.auto_close_sessions}
                onCheckedChange={(checked) => updateSettings('auto_close_sessions', checked)}
              />
            </div>

            <div>
              <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                min="1"
                max="168"
                value={settings.session_timeout}
                onChange={(e) => updateSettings('session_timeout', parseInt(e.target.value) || 24)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Default Collection Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Default Collection Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Collect Device Info by Default</Label>
                <p className="text-sm text-muted-foreground">
                  New sessions will collect device information
                </p>
              </div>
              <Switch
                checked={settings.data_collection_default}
                onCheckedChange={(checked) => updateSettings('data_collection_default', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label>Collect IP & Location by Default</Label>
                <p className="text-sm text-muted-foreground">
                  New sessions will collect IP and geolocation data
                </p>
              </div>
              <Switch
                checked={settings.ip_collection_default}
                onCheckedChange={(checked) => updateSettings('ip_collection_default', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Account Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full">
              Change Password
            </Button>
            <Button variant="outline" className="w-full">
              Export Data
            </Button>
            <Button variant="destructive" className="w-full">
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
