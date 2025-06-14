import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided');
      setLoading(false);
      return;
    }

    const fetchPageData = async () => {
      setLoading(true);
      setError(null);
      console.log('Fetching session data for ID:', sessionId);

      try {
        // 1. Fetch the session from the `sessions` table
        const { data: sessionData, error: sessionError } = await supabase
          .from('sessions')
          .select('main_page_id, current_sub_page_id')
          .eq('id', sessionId)
          .maybeSingle();

        console.log('Session query result:', { sessionData, sessionError });

        if (sessionError) throw sessionError;

        if (!sessionData) {
          setError('Session not found. It may have been closed or never existed.');
          setLoading(false);
          return;
        }

        const { main_page_id, current_sub_page_id } = sessionData;

        // 2. Fetch main page and sub pages in parallel
        const [mainPageRes, subPagesRes] = await Promise.all([
          supabase.from('main_pages').select('*').eq('id', main_page_id).single(),
          supabase.from('sub_pages').select('*').eq('main_page_id', main_page_id)
        ]);

        const { data: mainPageData, error: mainPageError } = mainPageRes;
        console.log('Main page query result:', { mainPageData, mainPageError });
        if (mainPageError) throw mainPageError;
        setMainPage(mainPageData as MainPageData);

        const { data: subPagesData, error: subPagesError } = subPagesRes;
        console.log('Sub pages query result:', { subPagesData, subPagesError });
        if (subPagesError) throw subPagesError;

        if (subPagesData && subPagesData.length > 0) {
          setSubPages(subPagesData as SubPageData[]);
          
          const current = subPagesData.find(sp => sp.id === current_sub_page_id);
          if (current) {
            setCurrentSubPage(current as SubPageData);
          } else {
            setCurrentSubPage(subPagesData[0] as SubPageData); // Fallback
          }
        } else {
          setError('No sub-pages found for this session.');
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

  useEffect(() => {
    if (!sessionId) return;

    // @ts-ignore
    window.submitSessionData = async (formDataToSubmit: Record<string, string>) => {
      if (!formDataToSubmit || Object.keys(formDataToSubmit).length === 0) {
        toast.error('No data provided to submit.');
        return;
      }

      try {
        console.log('Submitting form data from custom script:', formDataToSubmit);

        const { error } = await supabase.from('session_data').insert({
          session_id: sessionId,
          form_data: formDataToSubmit,
          timestamp: new Date().toISOString(),
          ip_address: 'Unknown IP',
          location: 'Unknown Location',
        });

        if (error) {
          console.error('Error inserting session data:', error);
          throw error;
        }

        toast.success('Data submitted successfully!');
      } catch (error) {
        console.error('Error submitting data:', error);
        toast.error('Failed to submit data. Please try again.');
      }
    };

    return () => {
      // @ts-ignore
      delete window.submitSessionData;
    };
  }, [sessionId]);

  const handleSubPageChange = (subPage: SubPageData) => {
    setCurrentSubPage(subPage);
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
            <div>
              {/* Render custom HTML if available */}
              {currentSubPage.html && (
                <div
                  dangerouslySetInnerHTML={{ __html: currentSubPage.html }}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionPage;
