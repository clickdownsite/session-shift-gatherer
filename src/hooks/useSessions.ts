
import React, { useState, useMemo, useCallback } from 'react';
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

// Global state management for sessions
let globalSessions: Session[] = [];
const sessionListeners: Set<(sessions: Session[]) => void> = new Set();

// Initialize from localStorage once
const initializeSessions = () => {
  if (globalSessions.length === 0 && typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('sessions');
      if (stored) {
        globalSessions = JSON.parse(stored);
        console.log('🔄 Initialized global sessions from localStorage:', globalSessions);
      }
    } catch (error) {
      console.error('❌ Error initializing sessions:', error);
      globalSessions = [];
    }
  }
};

// Save to localStorage and notify all listeners
const saveAndNotify = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('sessions', JSON.stringify(globalSessions));
    console.log('💾 Saved sessions to localStorage:', globalSessions);
  }
  sessionListeners.forEach(listener => listener([...globalSessions]));
};

export const useSessions = () => {
  const { user } = useAuth();
  
  // Initialize on first use
  React.useEffect(() => {
    initializeSessions();
  }, []);
  
  const [sessions, setSessions] = useState<Session[]>(() => {
    initializeSessions();
    return [...globalSessions];
  });

  // Subscribe to global state changes
  React.useEffect(() => {
    const listener = (newSessions: Session[]) => {
      console.log('🔔 Session state update received:', newSessions);
      setSessions(newSessions);
    };
    
    sessionListeners.add(listener);
    
    // Initial sync
    setSessions([...globalSessions]);
    
    return () => {
      sessionListeners.delete(listener);
    };
  }, []);

  const isLoading = false; // No loading in mock mode

  const createSession = useCallback((variables: CreateSessionVariables) => {
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
    
    // Add to global state
    globalSessions = [newSession, ...globalSessions];
    console.log('🚀 Updated global sessions:', globalSessions);
    
    // Save and notify all listeners
    saveAndNotify();
    
    console.log('✅ Session creation completed');
    toast.success('Session created successfully!');
  }, [user]);

  const updateSession = useCallback(({ sessionId, updates }: { sessionId: string; updates: Partial<Session> }) => {
    globalSessions = globalSessions.map(session => 
      session.id === sessionId 
        ? { ...session, ...updates, updated_at: new Date().toISOString() }
        : session
    );
    saveAndNotify();
  }, []);

  const closeSession = useCallback((sessionId: string) => {
    globalSessions = globalSessions.map(session => 
      session.id === sessionId 
        ? { ...session, active: false, updated_at: new Date().toISOString() }
        : session
    );
    saveAndNotify();
    toast.success("Session closed successfully");
  }, []);

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
