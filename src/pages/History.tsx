
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Download, Copy, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSessionContext } from '@/contexts/SessionContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/sonner';
import { useSessionEntries } from '@/hooks/useSessionEntries';
import { useHistoricalSessions } from '@/hooks/useSessions';
import { Skeleton } from '@/components/ui/skeleton';

const History = () => {
  const { exportSessionData, getMainPageById } = useSessionContext();
  const [viewingSessionData, setViewingSessionData] = useState<{ 
    sessionId: string
  } | null>(null);
  
  const { sessionData } = useSessionEntries(viewingSessionData?.sessionId);
  const { data: historicalSessions = [], isLoading } = useHistoricalSessions();
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const viewSessionData = (sessionId: string) => {
    setViewingSessionData({
      sessionId: sessionId
    });
  };

  const handleCopyFieldValue = (value: string) => {
    navigator.clipboard.writeText(value);
    toast.success("Value Copied", {
      description: "Field value has been copied to clipboard."
    });
  };

  return (
    <div className="container mx-auto animate-fade-in py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Session History</h1>
          <p className="text-muted-foreground">View and analyze your past sessions</p>
        </div>
      </div>
      
      <div className="mb-8">
        {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
        ) : historicalSessions.length === 0 ? (
          <div className="bg-card rounded-lg p-8 text-center border">
            <div className="mb-4 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium mb-2">No sessions found</h3>
            <p className="text-muted-foreground mb-4">Your sessions will appear here once created</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {historicalSessions.map((session) => {
              const mainPage = getMainPageById(session.main_page_id);
              const pageTypeName = mainPage?.name || session.page_type || "Unknown";
              
              return (
                <Card key={session.id} className="border shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg font-medium">Session: {session.id}</CardTitle>
                      <Badge variant={session.main_page_id === 'login' ? 'default' : 'outline'} className={session.main_page_id === 'login' ? 'bg-brand-purple' : ''}>
                        {pageTypeName}
                      </Badge>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>Created {formatDate(session.created_at)}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="mt-2 flex items-center">
                      <span className="text-sm font-medium">Status:</span>
                      <Badge variant={session.active ? "default" : "secondary"} className="ml-2">
                        {session.active ? "Active" : "Closed"}
                      </Badge>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                        onClick={() => viewSessionData(session.id)}
                      >
                        <Eye className="h-4 w-4 mr-2" /> View Data
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => exportSessionData(session.id)}
                      >
                        <Download className="h-4 w-4 mr-2" /> Export
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Data Viewing Dialog */}
      <Dialog open={!!viewingSessionData} onOpenChange={() => setViewingSessionData(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Session Data: {viewingSessionData?.sessionId}</DialogTitle>
          </DialogHeader>
          {(!sessionData || sessionData.length === 0) ? (
            <div className="text-center py-8">
              <p>No data has been captured for this session yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {sessionData.map((entry, index) => (
                <Card key={entry.id || index} className="border">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        Entry #{index + 1} • {new Date(entry.timestamp).toLocaleString()}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {entry.location || 'Unknown Location'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
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
                              onClick={() => handleCopyFieldValue(String(value))}
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
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

export default History;
