
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

  console.log('SubPageContent render:', {
    sessionId,
    hasCurrentSubPage: !!currentSubPage,
    subPageId: currentSubPage?.id,
    hasHtml: !!currentSubPage?.html,
    hasCss: !!currentSubPage?.css,
    hasJavascript: !!currentSubPage?.javascript
  });

  // Memoized submit function
  const submitSessionData = useCallback(async (formDataToSubmit: Record<string, string>) => {
    console.log('submitSessionData called with:', formDataToSubmit);
    
    if (!formDataToSubmit || Object.keys(formDataToSubmit).length === 0) {
      console.warn('No data provided to submit');
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

      console.log('Inserting session data:', dataToInsert);
      const { error } = await supabase.from('session_data').insert(dataToInsert);

      if (error) {
        console.error('Error inserting session data:', error);
        throw error;
      }
      
      console.log('Session data submitted successfully');
      toast.success('Data submitted successfully!');
    } catch (error) {
      console.error('Error submitting data:', error);
      toast.error('Failed to submit data. Please try again.');
    }
  }, [sessionId, sessionOptions]);

  // Handle form submission
  const handleSubmit = useCallback((event: Event) => {
    console.log('Form submit event triggered');
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

      console.log('Form data collected:', dataToSubmit);

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
      console.log('Setting up global submitSessionData function');
      // @ts-ignore
      window.submitSessionData = submitSessionData;

      return () => {
        console.log('Cleaning up global submitSessionData function');
        // @ts-ignore
        delete window.submitSessionData;
      };
    }
  }, [submitSessionData, sessionOptions]);

  // Handle form auto-submission
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    console.log('Setting up form submit listener');
    container.addEventListener('submit', handleSubmit);

    return () => {
      if (container) {
        console.log('Cleaning up form submit listener');
        container.removeEventListener('submit', handleSubmit);
      }
    };
  }, [handleSubmit]);

  // Handle JavaScript injection
  useEffect(() => {
    if (!currentSubPage?.javascript) {
      console.log('No JavaScript to inject');
      return;
    }

    console.log('Injecting JavaScript for sub page:', currentSubPage.id);

    try {
      // Clean up previous script
      if (scriptRef.current) {
        console.log('Removing previous script');
        document.head.removeChild(scriptRef.current);
        scriptRef.current = null;
      }

      // Create and inject new script
      const script = document.createElement('script');
      script.textContent = currentSubPage.javascript;
      document.head.appendChild(script);
      scriptRef.current = script;
      
      console.log('JavaScript injected successfully');
      
      return () => {
        if (scriptRef.current) {
          try {
            console.log('Cleaning up injected script');
            document.head.removeChild(scriptRef.current);
          } catch (e) {
            console.warn('Script might have already been removed:', e);
          }
          scriptRef.current = null;
        }
      };
    } catch (error) {
      console.error('Error executing custom JavaScript:', error);
    }
  }, [currentSubPage?.javascript]);

  // Memoize content to prevent unnecessary re-renders
  const cssContent = useMemo(() => {
    const css = currentSubPage?.css || '';
    console.log('CSS content length:', css.length);
    return css;
  }, [currentSubPage?.css]);
  
  const htmlContent = useMemo(() => {
    const html = currentSubPage?.html || '';
    console.log('HTML content length:', html.length);
    return html;
  }, [currentSubPage?.html]);

  if (!currentSubPage) {
    console.log('No current sub page, showing placeholder');
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">No content available</p>
      </div>
    );
  }

  console.log('Rendering sub page content:', {
    hasCss: !!cssContent,
    hasHtml: !!htmlContent,
    cssLength: cssContent.length,
    htmlLength: htmlContent.length
  });

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
