
import React from 'react';
import { useParams } from 'react-router-dom';
import SessionContent from '@/components/session-page/SessionContent';

const SessionPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();

  if (!sessionId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Invalid Session</h2>
          <p className="text-gray-600">No session ID provided in URL</p>
        </div>
      </div>
    );
  }

  return <SessionContent sessionId={sessionId} />;
};

export default SessionPage;
