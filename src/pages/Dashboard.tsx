
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Calendar, Copy, LinkIcon } from 'lucide-react';
import { useSessionContext, PageType } from '@/contexts/SessionContext';

const Dashboard = () => {
  const { sessions, createSession, switchPageType, exportSessionData } = useSessionContext();
  
  const handleCreateSession = (pageType: PageType) => {
    createSession(pageType);
  };
  
  const copyToClipboard = (sessionId: string) => {
    const url = `${window.location.origin}/page/${sessionId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copied",
      description: "Session link copied to clipboard!",
    });
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="container mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Session Link Generator</h1>
          <p className="text-gray-500">Create and manage your session links</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            onClick={() => handleCreateSession('login1')} 
            className="bg-brand-purple hover:bg-brand-purpleDark"
          >
            Create Login1 Session
          </Button>
          <Button 
            onClick={() => handleCreateSession('login2')} 
            className="bg-brand-purpleLight hover:bg-brand-purple"
          >
            Create Login2 Session
          </Button>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Current Sessions</h2>
        {sessions.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center border">
            <div className="mb-4 text-gray-400">
              <LinkIcon className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium mb-2">No active sessions</h3>
            <p className="text-gray-500 mb-4">Create a new session to get started</p>
            <div className="flex justify-center space-x-3">
              <Button 
                onClick={() => handleCreateSession('login1')}
                className="bg-brand-purple hover:bg-brand-purpleDark"
              >
                Create Login1 Session
              </Button>
              <Button 
                onClick={() => handleCreateSession('login2')} 
                className="bg-brand-purpleLight hover:bg-brand-purple"
              >
                Create Login2 Session
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map((session) => (
              <Card key={session.id} className="session-card border bg-white shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-medium">Session ID: {session.id}</CardTitle>
                    <Badge variant={session.pageType === 'login1' ? 'default' : 'outline'} className={session.pageType === 'login1' ? 'bg-brand-purple' : ''}>
                      {session.pageType === 'login1' ? 'Login1' : 'Login2'}
                    </Badge>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>Created {formatDate(session.createdAt)}</span>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                    <span className="text-sm truncate font-mono text-gray-600">
                      {`${window.location.origin}/page/${session.id}`}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="ml-2"
                      onClick={() => copyToClipboard(session.id)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-4 flex items-center">
                    <span className="text-sm font-medium">Data captured:</span>
                    <Badge variant="outline" className="ml-2">
                      {session.data.length} {session.data.length === 1 ? 'entry' : 'entries'}
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => switchPageType(session.id)}
                  >
                    Switch to {session.pageType === 'login1' ? 'Login2' : 'Login1'}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => exportSessionData(session.id)}
                    disabled={session.data.length === 0}
                  >
                    Export Data
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
