
import React from 'react';
import { useParams } from 'react-router-dom';
import { useSessionPageData } from '@/hooks/useSessionPageData';
import SessionLoading from '@/components/session-page/SessionLoading';
import SessionError from '@/components/session-page/SessionError';
import SubPageContent from '@/components/session-page/SubPageContent';

const SessionPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { 
    currentSubPage, 
    loading, 
    error, 
    refetch
  } = useSessionPageData(sessionId);

  console.log('SessionPage render:', { 
    sessionId, 
    loading, 
    error, 
    hasSubPage: !!currentSubPage,
    subPageId: currentSubPage?.id
  });

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

  if (!currentSubPage) {
    return (
      <SessionError 
        error="No page content found" 
        sessionId={sessionId} 
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="min-h-screen w-full">
      <SubPageContent sessionId={sessionId} currentSubPage={currentSubPage} />
    </div>
  );
};

export default SessionPage;
