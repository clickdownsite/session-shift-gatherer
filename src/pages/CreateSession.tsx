
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
  const { addSession } = useSessionContext();
  const navigate = useNavigate();
  const [pageType, setPageType] = useState('login1');
  const [sessionName, setSessionName] = useState('');
  const [sessionDescription, setSessionDescription] = useState('');
  
  const pageTypes = [
    { id: 'login1', name: 'Email & Password Login' },
    { id: 'login2', name: 'Auth Code Login' },
    { id: 'login3', name: 'OTP Verification' },
    { id: 'login4', name: 'Social Login' }
  ];
  
  const handleCreateSession = () => {
    addSession(pageType);
    toast({
      title: "New Session Created",
      description: `Session with ${getPageTypeName(pageType)} has been created.`
    });
    navigate('/');
  };
  
  const getPageTypeName = (type: string) => {
    const pageType = pageTypes.find(p => p.id === type);
    return pageType ? pageType.name : type;
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
            <Label htmlFor="page-type">Page Type</Label>
            <Select value={pageType} onValueChange={setPageType}>
              <SelectTrigger id="page-type">
                <SelectValue placeholder="Select Page Type" />
              </SelectTrigger>
              <SelectContent>
                {pageTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="pt-4">
            <h3 className="text-lg font-medium mb-3">Preview</h3>
            <div className="bg-secondary p-4 rounded-lg">
              <p className="text-sm font-medium mb-1">Selected Template:</p>
              <p className="text-base">{getPageTypeName(pageType)}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate('/')}>
            Cancel
          </Button>
          <Button onClick={handleCreateSession}>
            Create Session
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreateSession;
