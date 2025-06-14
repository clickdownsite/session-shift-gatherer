
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface SessionErrorProps {
  error: string;
  sessionId?: string;
  onRetry?: () => void;
}

const SessionError = ({ error, sessionId, onRetry }: SessionErrorProps) => (
  <div className="min-h-screen flex items-center justify-center p-4">
    <Card className="max-w-md w-full">
      <CardHeader>
        <CardTitle className="text-red-600">Page Error</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm">{error}</p>
        {sessionId && (
          <p className="text-xs text-muted-foreground">
            Session ID: {sessionId}
          </p>
        )}
        {onRetry && (
          <Button 
            onClick={onRetry} 
            variant="outline" 
            size="sm" 
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  </div>
);

export default SessionError;
