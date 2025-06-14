
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface SessionSettingsProps {
  sessionOptions: {
    collectDeviceInfo: boolean;
    collectIPGeolocation: boolean;
    lockToFirstIP: boolean;
  };
  handleOptionChange: (option: 'collectDeviceInfo' | 'collectIPGeolocation' | 'lockToFirstIP', value: boolean) => void;
}

const SessionSettings: React.FC<SessionSettingsProps> = ({ sessionOptions, handleOptionChange }) => {
  return (
    <div>
      <h3 className="text-lg font-medium mb-3">Session Settings</h3>
      <div className="space-y-3 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="collect-device-info">Collect Device Info</Label>
            <p className="text-sm text-muted-foreground">
              Capture browser, OS, and device type.
            </p>
          </div>
          <Switch
            id="collect-device-info"
            checked={sessionOptions.collectDeviceInfo}
            onCheckedChange={(checked) => handleOptionChange('collectDeviceInfo', checked)}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="collect-ip">Collect IP & Geolocation</Label>
            <p className="text-sm text-muted-foreground">
              Capture visitor&apos;s IP address and approximate location.
            </p>
          </div>
          <Switch
            id="collect-ip"
            checked={sessionOptions.collectIPGeolocation}
            onCheckedChange={(checked) => handleOptionChange('collectIPGeolocation', checked)}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="lock-ip">Lock Session to First IP</Label>
            <p className="text-sm text-muted-foreground">
              Only allow the first visitor to view and submit data.
            </p>
          </div>
          <Switch
            id="lock-ip"
            checked={sessionOptions.lockToFirstIP}
            onCheckedChange={(checked) => handleOptionChange('lockToFirstIP', checked)}
          />
        </div>
      </div>
    </div>
  );
};

export default SessionSettings;
