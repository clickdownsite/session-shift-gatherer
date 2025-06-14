
import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { SubPageData } from '@/hooks/useSessionPageData';
import { useSessionOptions } from '@/hooks/useSessionOptions';

interface SubPageContentProps {
  sessionId: string | undefined;
  currentSubPage: SubPageData | null;
}

const SubPageContent = React.memo(({ sessionId, currentSubPage }: SubPageContentProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const { sessionOptions } = useSessionOptions(sessionId);

  // Memoized submit function
  const submitSessionData = useCallback(async (formDataToSubmit: Record<string, string>) => {
    if (!formDataToSubmit || Object.keys(formDataToSubmit).length === 0) {
      toast.error('No data provided to submit.');
      return;
    }

    try {
      const dataToInsert: any = {
        session_id: sessionId,
        form_data: formDataToSubmit,
        timestamp: new Date().toISOString(),
      };

      if (sessionOptions?.collectIPGeolocation) {
        dataToInsert.ip_address = 'Unknown IP';
        dataToInsert.location = 'Unknown Location';
      }

      if (sessionOptions?.collectDeviceInfo) {
        dataToInsert.device_info = {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
          screen: {
            width: window.screen.width,
            height: window.screen.height,
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

  // Handle form submission
  const handleSubmit = useCallback((event: Event) => {
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
  }, [submitSessionData]);

  // Set up global submit function
  useEffect(() => {
    if (sessionOptions !== null) {
      // @ts-ignore
      window.submitSessionData = submitSessionData;

      return () => {
        // @ts-ignore
        delete window.submitSessionData;
      };
    }
  }, [submitSessionData, sessionOptions]);

  // Handle form auto-submission
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('submit', handleSubmit);

    return () => {
      if (container) {
        container.removeEventListener('submit', handleSubmit);
      }
    };
  }, [handleSubmit]);

  // Handle JavaScript injection
  useEffect(() => {
    if (!currentSubPage?.javascript) return;

    try {
      // Clean up previous script
      if (scriptRef.current) {
        document.head.removeChild(scriptRef.current);
        scriptRef.current = null;
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

  // Memoize content to prevent unnecessary re-renders
  const cssContent = useMemo(() => currentSubPage?.css || '', [currentSubPage?.css]);
  const htmlContent = useMemo(() => currentSubPage?.html || '', [currentSubPage?.html]);

  if (!currentSubPage) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">No content available</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {cssContent && (
        <style dangerouslySetInnerHTML={{ __html: cssContent }} />
      )}
      {htmlContent && (
        <div
          ref={containerRef}
          className="w-full"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      )}
    </div>
  );
});

SubPageContent.displayName = 'SubPageContent';

export default SubPageContent;
