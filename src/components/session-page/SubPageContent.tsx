
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { SubPageData } from '@/hooks/useSessionPageData';

interface SubPageContentProps {
  sessionId: string | undefined;
  currentSubPage: SubPageData | null;
}

const SubPageContent = ({ sessionId, currentSubPage }: SubPageContentProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sessionOptions, setSessionOptions] = useState<any>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  // Memoize session options fetch
  const fetchSessionOptions = useCallback(async () => {
    if (!sessionId) return;

    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('session_options')
        .eq('id', sessionId)
        .single();
      
      if (error) throw error;
      setSessionOptions(data?.session_options || {});
    } catch (error) {
      console.error("Error fetching session options:", error);
      setSessionOptions({});
    }
  }, [sessionId]);

  // Memoize submit function
  const submitSessionData = useCallback(async (formDataToSubmit: Record<string, string>) => {
    if (!formDataToSubmit || Object.keys(formDataToSubmit).length === 0) {
      toast.error('No data provided to submit.');
      return;
    }

    if (!sessionOptions) {
      console.error('Session options not loaded');
      return;
    }

    try {
      const dataToInsert: any = {
        session_id: sessionId,
        form_data: formDataToSubmit,
        timestamp: new Date().toISOString(),
      };

      if (sessionOptions.collectIPGeolocation) {
        dataToInsert.ip_address = 'Unknown IP';
        dataToInsert.location = 'Unknown Location';
      }

      if (sessionOptions.collectDeviceInfo) {
        dataToInsert.device_info = {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
          screen: {
            width: window.screen.width,
            height: window.screen.height,
            availWidth: window.screen.availWidth,
            availHeight: window.screen.availHeight,
            colorDepth: window.screen.colorDepth,
            pixelDepth: window.screen.pixelDepth,
          }
        };
      }

      const { error } = await supabase.from('session_data').insert(dataToInsert);

      if (error) throw error;
      toast.success('Data submitted successfully!');
    } catch (error) {
      console.error('Error submitting data:', error);
      toast.error('Failed to submit data. Please try again.');
    }
  }, [sessionId, sessionOptions]);

  // Fetch session options on mount
  useEffect(() => {
    fetchSessionOptions();
  }, [fetchSessionOptions]);

  // Handle JavaScript injection with cleanup
  useEffect(() => {
    if (!currentSubPage?.javascript) return;

    try {
      // Clean up previous script
      if (scriptRef.current) {
        document.head.removeChild(scriptRef.current);
      }

      // Create and inject new script
      const script = document.createElement('script');
      script.textContent = currentSubPage.javascript;
      document.head.appendChild(script);
      scriptRef.current = script;
      
      return () => {
        if (scriptRef.current) {
          try {
            document.head.removeChild(scriptRef.current);
          } catch (e) {
            // Script might have already been removed
          }
          scriptRef.current = null;
        }
      };
    } catch (error) {
      console.error('Error executing custom JavaScript:', error);
    }
  }, [currentSubPage?.javascript]);

  // Set up global submit function
  useEffect(() => {
    if (sessionOptions === null) return;

    // @ts-ignore
    window.submitSessionData = submitSessionData;

    return () => {
      // @ts-ignore
      delete window.submitSessionData;
    };
  }, [submitSessionData, sessionOptions]);

  // Handle form auto-submission
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleSubmit = (event: Event) => {
      const form = event.target as HTMLFormElement;

      if (form && form.tagName === 'FORM' && !form.hasAttribute('data-no-auto-submit')) {
        event.preventDefault();
        console.log('Auto-capturing form submission...');

        const formData = new FormData(form);
        const dataToSubmit: Record<string, string> = {};
        formData.forEach((value, key) => {
          if (typeof value === 'string') {
            dataToSubmit[key] = value;
          }
        });

        if (Object.keys(dataToSubmit).length === 0) {
          console.warn('Form has no data to submit.');
          return;
        }

        submitSessionData(dataToSubmit);
      }
    };

    container.addEventListener('submit', handleSubmit);

    return () => {
      if (container) {
        container.removeEventListener('submit', handleSubmit);
      }
    };
  }, [currentSubPage, submitSessionData]);

  if (!currentSubPage) return null;

  return (
    <>
      {currentSubPage.css && (
        <style dangerouslySetInnerHTML={{ __html: currentSubPage.css }} />
      )}
      {currentSubPage.html && (
        <div
          ref={containerRef}
          dangerouslySetInnerHTML={{ __html: currentSubPage.html }}
        />
      )}
    </>
  );
};

export default SubPageContent;
