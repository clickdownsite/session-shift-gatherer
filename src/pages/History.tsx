
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSessionContext } from '@/contexts/SessionContext';

const History = () => {
  const { sessions, exportSessionData } = useSessionContext();
  
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

  return (
    <div className="container mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Session History</h1>
          <p className="text-gray-500">View and analyze your past sessions</p>
        </div>
      </div>
      
      <div className="mb-8">
        {historicalSessions.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center border">
            <div className="mb-4 text-gray-400">
              <Calendar className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium mb-2">No session history</h3>
            <p className="text-gray-500 mb-4">Your completed sessions with data will appear here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {historicalSessions.map((session) => (
              <Card key={session.id} className="border bg-white shadow-sm">
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
                  <div className="mt-2 flex items-center">
                    <span className="text-sm font-medium">Data captured:</span>
                    <Badge variant="outline" className="ml-2">
                      {session.data.length} {session.data.length === 1 ? 'entry' : 'entries'}
                    </Badge>
                  </div>
                  <div className="mt-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full"
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
    </div>
  );
};

export default History;
