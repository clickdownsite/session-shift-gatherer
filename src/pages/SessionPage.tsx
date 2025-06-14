
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
    error, 
    hasSubPage: !!currentSubPage,
    subPageId: currentSubPage?.id,
    subPageName: currentSubPage?.name
  });

  if (loading) {
    console.log('Showing loading state');
    return <SessionLoading />;
  }

  if (error) {
    console.log('Showing error state:', error);
    return (
      <SessionError 
        error={error} 
        sessionId={sessionId} 
        onRetry={refetch}
      />
    );
  }

  if (!currentSubPage) {
    console.log('No sub page found, showing error');
    return (
      <SessionError 
        error="No page content found" 
        sessionId={sessionId} 
        onRetry={refetch}
      />
    );
  }

  console.log('Rendering SubPageContent with:', {
    sessionId,
    subPageId: currentSubPage.id,
    hasHtml: !!currentSubPage.html,
    hasCss: !!currentSubPage.css
  });

  return (
    <div className="min-h-screen w-full">
      <SubPageContent sessionId={sessionId} currentSubPage={currentSubPage} />
    </div>
  );
};

export default SessionPage;
