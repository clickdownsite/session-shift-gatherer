import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/sonner';
import { useSupabaseSessions } from '@/hooks/useSupabaseSession';

const CreateSession = () => {
  const { createSession, mainPages: rawMainPages, subPages } = useSupabaseSessions();
  const navigate = useNavigate();
  const [mainPageId, setMainPageId] = useState('');
  const [subPageId, setSubPageId] = useState('');
  const [sessionOptions, setSessionOptions] = useState({
    collectDeviceInfo: true,
    collectIPGeolocation: true,
    lockToFirstIP: false,
  });

  const mainPages = React.useMemo(() => {
    if (!rawMainPages || !subPages) return [];
    return rawMainPages.map(mp => ({
      ...mp,
      subPages: subPages.filter(sp => sp.main_page_id === mp.id)
    }));
  }, [rawMainPages, subPages]);
  
  // Set initial subpage when main page changes
  React.useEffect(() => {
    if (mainPageId) {
      const selectedMainPage = mainPages.find(p => p.id === mainPageId);
      if (selectedMainPage && selectedMainPage.subPages && selectedMainPage.subPages.length > 0) {
        setSubPageId(selectedMainPage.subPages[0].id);
      } else {
        setSubPageId('');
      }
    }
  }, [mainPages, mainPageId]);
  
  // Set initial main page when mainPages loads
  React.useEffect(() => {
    if (mainPages.length > 0 && !mainPageId) {
      setMainPageId(mainPages[0].id);
    }
  }, [mainPages, mainPageId]);
  
  const selectedMainPage = mainPages.find(p => p.id === mainPageId);
  const selectedSubPage = selectedMainPage?.subPages?.find(p => p.id === subPageId);
  
  const handleOptionChange = (option: keyof typeof sessionOptions, value: boolean) => {
    setSessionOptions(prev => ({ ...prev, [option]: value }));
  };

  const handleCreateSession = () => {
    if (!mainPageId || !subPageId) {
      toast.error("Error", {
        description: "Please select both a page type and subpage"
      });
      return;
    }
    
    createSession({ mainPageId, subPageId, sessionOptions }, {
      onSuccess: () => {
        toast.success("Session Created", {
          description: "New session has been created successfully."
        });
        navigate('/');
      }
    });
  };

  return (
    <div className="container mx-auto max-w-3xl animate-fade-in py-8">
      <h1 className="text-3xl font-bold mb-8">Create New Session</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Session Details</CardTitle>
          <CardDescription>Configure your new session</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="main-page-type">Page Type</Label>
            <Select value={mainPageId} onValueChange={setMainPageId}>
              <SelectTrigger id="main-page-type">
                <SelectValue placeholder="Select Page Type" />
              </SelectTrigger>
              <SelectContent>
                {mainPages.map((page) => (
                  <SelectItem key={page.id} value={page.id}>
                    {page.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedMainPage && selectedMainPage.subPages && selectedMainPage.subPages.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="sub-page-type">Sub Page</Label>
              <Select value={subPageId} onValueChange={setSubPageId}>
                <SelectTrigger id="sub-page-type">
                  <SelectValue placeholder="Select Sub Page" />
                </SelectTrigger>
                <SelectContent>
                  {selectedMainPage.subPages.map((subPage) => (
                    <SelectItem key={subPage.id} value={subPage.id}>
                      {subPage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {selectedSubPage && (
            <div className="pt-4 space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Preview</h3>
                <div className="bg-secondary p-4 rounded-lg">
                  <p className="text-sm font-medium mb-1">Selected Template:</p>
                  <p className="text-base">{selectedMainPage?.name} - {selectedSubPage?.name}</p>
                  <p className="text-sm text-muted-foreground mt-2">{selectedSubPage?.description}</p>
                </div>
              </div>
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
                                Capture visitor's IP address and approximate location.
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
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate('/')}>
            Cancel
          </Button>
          <Button onClick={handleCreateSession} disabled={!mainPageId || !subPageId}>
            Create Session
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreateSession;
