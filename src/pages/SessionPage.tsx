
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';

interface MainPageData {
  id: string;
  name: string;
  description: string;
}

interface SubPageData {
  id: string;
  name: string;
  description: string;
  html: string;
  css: string;
  javascript: string;
  fields: string[];
  main_page_id: string;
}

const SessionPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [mainPage, setMainPage] = useState<MainPageData | null>(null);
  const [currentSubPage, setCurrentSubPage] = useState<SubPageData | null>(null);
  const [subPages, setSubPages] = useState<SubPageData[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError('No page ID provided');
      setLoading(false);
      return;
    }

    const fetchPageData = async () => {
      console.log('Fetching page data for ID:', sessionId);
      
      try {
        // First, try to fetch as main page
        const { data: mainPageData, error: mainPageError } = await supabase
          .from('main_pages')
          .select('*')
          .eq('id', sessionId)
          .maybeSingle();

        console.log('Main page query result:', { mainPageData, mainPageError });

        if (mainPageData) {
          console.log('Found main page:', mainPageData);
          setMainPage(mainPageData);

          // Fetch sub pages for this main page
          const { data: subPagesData, error: subPagesError } = await supabase
            .from('sub_pages')
            .select('*')
            .eq('main_page_id', sessionId);

          console.log('Sub pages query result:', { subPagesData, subPagesError });

          if (subPagesData && subPagesData.length > 0) {
            setSubPages(subPagesData);
            setCurrentSubPage(subPagesData[0]);
          }
        } else {
          // If not found as main page, try as sub page
          const { data: subPageData, error: subPageError } = await supabase
            .from('sub_pages')
            .select('*')
            .eq('id', sessionId)
            .maybeSingle();

          console.log('Sub page query result:', { subPageData, subPageError });

          if (subPageData) {
            console.log('Found sub page:', subPageData);
            setCurrentSubPage(subPageData);

            // Also fetch the main page info and other sub pages
            const { data: parentMainPage } = await supabase
              .from('main_pages')
              .select('*')
              .eq('id', subPageData.main_page_id)
              .maybeSingle();

            if (parentMainPage) {
              setMainPage(parentMainPage);
              
              // Fetch all sub pages for navigation
              const { data: allSubPages } = await supabase
                .from('sub_pages')
                .select('*')
                .eq('main_page_id', subPageData.main_page_id);
              
              if (allSubPages) {
                setSubPages(allSubPages);
              }
            }
          } else {
            console.log('Page not found in either table');
            setError('Page not found');
            return;
          }
        }
      } catch (error) {
        console.error('Error fetching page:', error);
        setError(`Failed to load page: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, [sessionId]);

  // Execute custom JavaScript when currentSubPage changes
  useEffect(() => {
    if (currentSubPage?.javascript) {
      try {
        console.log('Executing custom JavaScript:', currentSubPage.javascript);
        const script = document.createElement('script');
        script.textContent = currentSubPage.javascript;
        document.head.appendChild(script);
        
        return () => {
          try {
            document.head.removeChild(script);
          } catch (e) {
            console.log('Script already removed');
          }
        };
      } catch (error) {
        console.error('Error executing custom JavaScript:', error);
      }
    }
  }, [currentSubPage?.javascript]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sessionId || !formData || Object.keys(formData).length === 0) {
      toast.error('Please fill in at least one field');
      return;
    }

    try {
      console.log('Submitting form data:', formData);

      const { error } = await supabase
        .from('session_data')
        .insert({
          session_id: sessionId,
          timestamp: new Date().toISOString(),
          ip_address: 'Unknown IP',
          location: 'Unknown Location',
          form_data: formData
        });

      if (error) {
        console.error('Error inserting session data:', error);
        throw error;
      }

      toast.success('Data submitted successfully!');
      setFormData({});
    } catch (error) {
      console.error('Error submitting data:', error);
      toast.error('Failed to submit data. Please try again.');
    }
  };

  const handleSubPageChange = (subPage: SubPageData) => {
    setCurrentSubPage(subPage);
    setFormData({});
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading page...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
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
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Render custom CSS */}
      {currentSubPage?.css && (
        <style dangerouslySetInnerHTML={{ __html: currentSubPage.css }} />
      )}

      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          {/* Main page info */}
          {mainPage && (
            <div className="mb-6">
              <h1 className="text-3xl font-bold">{mainPage.name}</h1>
              {mainPage.description && (
                <p className="text-muted-foreground mt-2">{mainPage.description}</p>
              )}
            </div>
          )}

          {/* Sub page navigation */}
          {subPages.length > 1 && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {subPages.map((subPage) => (
                  <Button
                    key={subPage.id}
                    variant={currentSubPage?.id === subPage.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSubPageChange(subPage)}
                  >
                    {subPage.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Current sub page content */}
          {currentSubPage && (
            <div className="space-y-6">
              {/* Sub page title and description */}
              <div>
                <h2 className="text-2xl font-semibold">{currentSubPage.name}</h2>
                {currentSubPage.description && (
                  <p className="text-muted-foreground mt-2">{currentSubPage.description}</p>
                )}
              </div>

              {/* Render custom HTML if available */}
              {currentSubPage.html && (
                <div 
                  className="prose prose-sm max-w-none mb-6"
                  dangerouslySetInnerHTML={{ __html: currentSubPage.html }}
                />
              )}

              {/* Dynamic form based on fields */}
              <Card>
                <CardHeader>
                  <CardTitle>Submit Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {currentSubPage.fields && currentSubPage.fields.length > 0 ? (
                      currentSubPage.fields.map((field, index) => (
                        <div key={index} className="space-y-2">
                          <Label htmlFor={field}>{field}</Label>
                          {field.toLowerCase().includes('message') || 
                           field.toLowerCase().includes('comment') || 
                           field.toLowerCase().includes('description') ? (
                            <Textarea
                              id={field}
                              placeholder={`Enter ${field.toLowerCase()}`}
                              value={formData[field] || ''}
                              onChange={(e) => handleInputChange(field, e.target.value)}
                            />
                          ) : (
                            <Input
                              id={field}
                              type={field.toLowerCase().includes('email') ? 'email' : 
                                   field.toLowerCase().includes('phone') ? 'tel' : 
                                   field.toLowerCase().includes('password') ? 'password' : 'text'}
                              placeholder={`Enter ${field.toLowerCase()}`}
                              value={formData[field] || ''}
                              onChange={(e) => handleInputChange(field, e.target.value)}
                            />
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                          id="message"
                          placeholder="Enter your message"
                          value={formData.message || ''}
                          onChange={(e) => handleInputChange('message', e.target.value)}
                        />
                      </div>
                    )}

                    <Button type="submit" className="w-full">
                      Submit
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionPage;
