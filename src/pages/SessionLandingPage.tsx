import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useSessions } from '@/hooks/useSessions';
import { useMainPages, useSubPages } from '@/hooks/usePageTemplates';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader, ExternalLink } from 'lucide-react';

const SessionLandingPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { sessions, isLoading } = useSessions();
  const { data: mainPages } = useMainPages();
  const { data: subPages } = useSubPages();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!sessionId) {
    return <Navigate to="/dashboard" replace />;
  }

  // Find session by ID
  const session = sessions.find(s => s.id === sessionId);
  
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive">Session Not Found</CardTitle>
            <CardDescription>
              The session you're looking for doesn't exist or has been removed.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <a href="/dashboard">Go to Dashboard</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const mainPage = mainPages?.find(p => p.id === session.main_page_id);
  const subPage = subPages?.find(p => p.id === session.current_sub_page_id);

  const handleEnterSession = () => {
    window.location.href = `/page/${sessionId}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="shadow-2xl border-0 bg-card/90 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <ExternalLink className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold text-card-foreground mb-2">
                {mainPage?.name || 'Session Page'}
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                {mainPage?.description || 'Welcome to this session'}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-accent/50 rounded-lg p-4">
              <h3 className="font-semibold text-accent-foreground mb-2">Current Section</h3>
              <p className="text-sm text-muted-foreground">
                {subPage?.name || 'Interactive Session'}
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-card-foreground">Session Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <span className="ml-2 font-medium text-primary">
                    {session.active ? 'Active' : 'Closed'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Created:</span>
                  <span className="ml-2 font-medium">
                    {new Date(session.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button 
                onClick={handleEnterSession}
                className="w-full h-12 text-lg font-semibold"
                disabled={!session.active}
              >
                {session.active ? 'Enter Session' : 'Session Closed'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SessionLandingPage;