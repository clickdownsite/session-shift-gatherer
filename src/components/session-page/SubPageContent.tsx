import React, { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { SubPageData } from '@/hooks/useSessionPageData';

interface SubPageContentProps {
  sessionId: string | undefined;
  currentSubPage: SubPageData | null;
}

const SubPageContent = ({ sessionId, currentSubPage }: SubPageContentProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentSubPage?.javascript) {
      try {
        const script = document.createElement('script');
        script.textContent = currentSubPage.javascript;
        document.head.appendChild(script);
        
        return () => {
          try {
            document.head.removeChild(script);
          } catch (e) {
            // Script might have already been removed
          }
        };
      } catch (error) {
        console.error('Error executing custom JavaScript:', error);
      }
    }
  }, [currentSubPage]);

  useEffect(() => {
    if (!sessionId) return;

    // @ts-ignore
    window.submitSessionData = async (formDataToSubmit: Record<string, string>) => {
      if (!formDataToSubmit || Object.keys(formDataToSubmit).length === 0) {
        toast.error('No data provided to submit.');
        return;
      }

      try {
        const { error } = await supabase.from('session_data').insert({
          session_id: sessionId,
          form_data: formDataToSubmit,
          timestamp: new Date().toISOString(),
          ip_address: 'Unknown IP',
          location: 'Unknown Location',
        });

        if (error) {
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

        // @ts-ignore
        if (window.submitSessionData) {
          // @ts-ignore
          window.submitSessionData(dataToSubmit);
        } else {
          console.error('Data submission function is not available.');
        }
      }
    };

    container.addEventListener('submit', handleSubmit);

    return () => {
      if (container) {
        container.removeEventListener('submit', handleSubmit);
      }
    };
  }, [currentSubPage]);

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
