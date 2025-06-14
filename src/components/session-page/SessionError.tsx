
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SessionErrorProps {
  error: string;
  sessionId?: string;
}

const SessionError = ({ error, sessionId }: SessionErrorProps) => (
  <div className="min-h-screen flex items-center justify-center">
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Page Error</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-red-600 mb-4">{error}</p>
        <p className="text-sm text-muted-foreground">
          Page ID: {sessionId || 'Not provided'}
        </p>
      </CardContent>
    </Card>
  </div>
);

export default SessionError;
