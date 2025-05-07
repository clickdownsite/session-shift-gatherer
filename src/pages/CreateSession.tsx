
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { useSessionContext } from '@/contexts/SessionContext';

const CreateSession = () => {
  const { addSession, mainPages } = useSessionContext();
  const navigate = useNavigate();
  const [mainPageId, setMainPageId] = useState(mainPages[0]?.id || '');
  const [subPageId, setSubPageId] = useState('');
  const [sessionName, setSessionName] = useState('');
  const [sessionDescription, setSessionDescription] = useState('');
  
  // Set initial subpage when main page changes
  React.useEffect(() => {
    const selectedMainPage = mainPages.find(p => p.id === mainPageId);
    if (selectedMainPage && selectedMainPage.subPages.length > 0) {
      setSubPageId(selectedMainPage.subPages[0].id);
    } else {
      setSubPageId('');
    }
  }, [mainPageId, mainPages]);
  
  const selectedMainPage = mainPages.find(p => p.id === mainPageId);
  const selectedSubPage = selectedMainPage?.subPages.find(p => p.id === subPageId);
  
  const handleCreateSession = () => {
    if (!mainPageId || !subPageId) {
      toast({
        title: "Error",
        description: "Please select both a page type and subpage",
        variant: "destructive"
      });
      return;
    }
    
    addSession(mainPageId, subPageId);
    toast({
      title: "New Session Created",
      description: `Session with ${selectedMainPage?.name} - ${selectedSubPage?.name} has been created.`
    });
    navigate('/');
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
            <Label htmlFor="session-name">Session Name (Optional)</Label>
            <Input 
              id="session-name" 
              placeholder="My Session" 
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="session-description">Description (Optional)</Label>
            <Textarea 
              id="session-description" 
              placeholder="Add some details about this session..."
              value={sessionDescription}
              onChange={(e) => setSessionDescription(e.target.value)}
              rows={3}
            />
          </div>
          
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
          
          {selectedMainPage && (
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
            <div className="pt-4">
              <h3 className="text-lg font-medium mb-3">Preview</h3>
              <div className="bg-secondary p-4 rounded-lg">
                <p className="text-sm font-medium mb-1">Selected Template:</p>
                <p className="text-base">{selectedMainPage?.name} - {selectedSubPage?.name}</p>
                <p className="text-sm text-muted-foreground mt-2">{selectedSubPage?.description}</p>
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
