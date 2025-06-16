
import React from 'react';
import { useParams } from 'react-router-dom';
import { useSessionPageData } from '@/hooks/useSessionPageData';
import SessionLoading from '@/components/session-page/SessionLoading';
import SessionError from '@/components/session-page/SessionError';
import SubPageContent from '@/components/session-page/SubPageContent';

const SessionPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  
  console.log('SessionPage render with sessionId from params:', sessionId);
  
  const { 
    currentSubPage, 
    loading, 
    error, 
    refetch
  } = useSessionPageData(sessionId);

  console.log('SessionPage render state:', { 
    sessionId, 
    loading, 
    error: !!error, 
    hasSubPage: !!currentSubPage,
    subPageId: currentSubPage?.id,
    subPageName: currentSubPage?.name
  });

  // Show loading state
  if (loading) {
    console.log('SessionPage: Showing loading state');
    return <SessionLoading />;
  }

  // Show error state
  if (error) {
    console.log('SessionPage: Showing error state:', error);
    return (
      <SessionError 
        error={error} 
        sessionId={sessionId} 
        onRetry={refetch}
      />
    );
  }

  // Show error if no sub page found
  if (!currentSubPage) {
    console.log('SessionPage: No sub page found, showing error');
    return (
      <SessionError 
        error="No page content found for this session" 
        sessionId={sessionId} 
        onRetry={refetch}
      />
    );
  }

  console.log('SessionPage: Rendering SubPageContent with:', {
    sessionId,
    subPageId: currentSubPage.id,
    hasHtml: !!currentSubPage.html,
    hasCss: !!currentSubPage.css,
    hasJavascript: !!currentSubPage.javascript
  });

  return (
    <div className="min-h-screen w-full bg-background">
      <SubPageContent sessionId={sessionId} currentSubPage={currentSubPage} />
    </div>
  );
};

export default SessionPage;
