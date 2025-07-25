
import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Session } from '@/types/session';

type CreateSessionVariables = {
  mainPageId: string;
  subPageId: string;
  sessionOptions?: Record<string, any>;
  pageName?: string;
  flowId?: string;
};

export const useSessions = () => {
  const { user } = useAuth();
  
  // Initialize from localStorage
  const [sessions, setSessions] = useState<Session[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('sessions');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Save to localStorage whenever sessions change
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  const isLoading = false; // No loading in mock mode

  const createSession = (variables: CreateSessionVariables) => {
    console.log('🚀 createSession called with:', variables);
    console.log('🚀 current user:', user);
    
    if (!user) {
      console.error('❌ User not authenticated');
      toast.error('User not authenticated');
      return;
    }
    
    const sessionId = Math.random().toString(36).substring(2, 8);
    console.log('🚀 Generated sessionId:', sessionId);
    
    const newSession: Session = {
      id: sessionId,
      user_id: user.id,
      main_page_id: variables.mainPageId,
      current_sub_page_id: variables.subPageId,
      active: true,
      has_new_data: false,
      session_options: variables.sessionOptions || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      flow_id: variables.flowId && variables.flowId !== 'manual' ? variables.flowId : null,
      current_flow_step: variables.flowId && variables.flowId !== 'manual' ? 0 : null,
    };

    console.log('🚀 Created new session object:', newSession);
    
    setSessions(prev => {
      console.log('🚀 Previous sessions:', prev);
      const updated = [newSession, ...prev];
      console.log('🚀 Updated sessions:', updated);
      return updated;
    });
    
    console.log('✅ Session creation completed');
    toast.success('Session created successfully!');
  };

  const updateSession = ({ sessionId, updates }: { sessionId: string; updates: Partial<Session> }) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, ...updates, updated_at: new Date().toISOString() }
        : session
    ));
  };

  const closeSession = (sessionId: string) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, active: false, updated_at: new Date().toISOString() }
        : session
    ));
    toast.success("Session closed successfully");
  };

  const activeSessions = useMemo(() => 
    sessions.filter(session => session.active), 
    [sessions]
  );

  return {
    sessions: activeSessions,
    isLoading,
    createSession,
    updateSession,
    closeSession,
  };
};

export const useHistoricalSessions = () => {
  const { user } = useAuth();
  const [sessions] = useState<Session[]>([]); // Mock historical sessions

  const historicalSessions = useMemo(() => 
    sessions.filter(session => !session.active), 
    [sessions]
  );

  return {
    data: historicalSessions,
    isLoading: false,
    error: null,
  };
};
