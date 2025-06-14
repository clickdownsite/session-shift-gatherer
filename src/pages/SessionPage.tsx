
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
  } = useSessionPageData(sessionId);

  if (loading) {
    return <SessionLoading />;
  }

  if (error) {
    return <SessionError error={error} sessionId={sessionId} />;
  }

  return (
    <SubPageContent sessionId={sessionId} currentSubPage={currentSubPage} />
  );
};

export default SessionPage;
