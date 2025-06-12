
import React, { createContext, useContext, useEffect } from 'react';
import { useSupabaseSessions } from '@/hooks/useSupabaseSession';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/sonner';

// Page type definitions
interface SubPage {
  id: string;
  name: string;
  description: string;
  fields: string[];
  html: string;
  parentId: string;
}

interface MainPage {
  id: string;
  name: string;
  description: string;
  subPages: SubPage[];
}

interface SessionData {
  timestamp: string;
  ip: string;
  location: string;
  formData: Record<string, string>;
}

interface Session {
  id: string;
  mainPageId: string;
  currentSubPageId: string;
  pageType?: string;
  createdAt: string;
  data: SessionData[];
  active: boolean;
  hasNewData: boolean;
}

interface SessionContextType {
  sessions: any[];
  mainPages: any[];
  addSession: (mainPageId: string, subPageId: string) => void;
  addSessionData: (sessionId: string, data: any) => void;
  switchSubPage: (sessionId: string, newSubPageId: string) => void;
  exportSessionData: (sessionId: string) => void;
  getSessionById: (sessionId: string) => any | undefined;
  getMainPageById: (mainPageId: string) => any | undefined;
  getSubPageById: (mainPageId: string, subPageId: string) => any | undefined;
  closeSession: (sessionId: string) => void;
  resetNewDataFlag: (sessionId: string) => void;
  updateMainPage: (updatedPage: any) => void;
  updateSubPage: (mainPageId: string, updatedSubPage: any) => void;
  addMainPage: (newPage: any) => string;
  addSubPage: (mainPageId: string, newSubPage: any) => string;
  deleteMainPage: (mainPageId: string) => void;
  deleteSubPage: (mainPageId: string, subPageId: string) => void;
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
  const { user } = useAuth();
  const { sessions, mainPages, subPages, createSession, updateSession, closeSession: closeSessionDB } = useSupabaseSessions();

  // Set up realtime subscriptions
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('session-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'session_data'
        },
        (payload) => {
          // Show notification for new data
          toast("New Data Received", {
            description: `New form submission received for session`,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Transform Supabase data to match expected format
  const transformedMainPages = mainPages.map(page => ({
    ...page,
    subPages: subPages.filter(subPage => subPage.main_page_id === page.id).map(subPage => ({
      ...subPage,
      parentId: subPage.main_page_id,
      fields: subPage.fields || []
    }))
  }));

  const transformedSessions = sessions.map(session => ({
    ...session,
    mainPageId: session.main_page_id,
    currentSubPageId: session.current_sub_page_id,
    pageType: session.page_type,
    createdAt: session.created_at,
    hasNewData: session.has_new_data,
    data: [] // Will be loaded separately when needed
  }));

  const getMainPageById = (mainPageId: string) => {
    return transformedMainPages.find(page => page.id === mainPageId);
  };

  const getSubPageById = (mainPageId: string, subPageId: string) => {
    const mainPage = getMainPageById(mainPageId);
    return mainPage?.subPages?.find(subPage => subPage.id === subPageId);
  };

  const getSessionById = (sessionId: string) => {
    return transformedSessions.find(session => session.id === sessionId);
  };

  const addSession = (mainPageId: string, subPageId: string) => {
    createSession({ mainPageId, subPageId });
  };

  const addSessionData = async (sessionId: string, data: any) => {
    try {
      const { error } = await supabase
        .from('session_data')
        .insert({
          session_id: sessionId,
          timestamp: data.timestamp,
          ip_address: data.ip,
          location: data.location,
          form_data: data.formData
        });

      if (error) throw error;

      // Update session to mark new data
      await supabase
        .from('sessions')
        .update({ has_new_data: true })
        .eq('id', sessionId);

    } catch (error) {
      console.error('Error adding session data:', error);
    }
  };

  const switchSubPage = (sessionId: string, newSubPageId: string) => {
    updateSession({ 
      sessionId, 
      updates: { 
        current_sub_page_id: newSubPageId,
        updated_at: new Date().toISOString()
      } 
    });
  };

  const resetNewDataFlag = (sessionId: string) => {
    updateSession({ 
      sessionId, 
      updates: { has_new_data: false } 
    });
  };

  const closeSession = (sessionId: string) => {
    closeSessionDB(sessionId);
  };

  const exportSessionData = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('session_data')
        .select('*')
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: false });

      if (error) throw error;

      const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(data, null, 2)
      )}`;
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute('href', dataStr);
      downloadAnchorNode.setAttribute('download', `session_${sessionId}_data.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    } catch (error) {
      console.error('Error exporting session data:', error);
    }
  };

  // Mock implementations for admin features (to be implemented later)
  const updateMainPage = (updatedPage: any) => {
    console.log('Update main page:', updatedPage);
  };

  const updateSubPage = (mainPageId: string, updatedSubPage: any) => {
    console.log('Update sub page:', mainPageId, updatedSubPage);
  };

  const addMainPage = (newPage: any) => {
    console.log('Add main page:', newPage);
    return 'new-id';
  };

  const addSubPage = (mainPageId: string, newSubPage: any) => {
    console.log('Add sub page:', mainPageId, newSubPage);
    return 'new-sub-id';
  };

  const deleteMainPage = (mainPageId: string) => {
    console.log('Delete main page:', mainPageId);
  };

  const deleteSubPage = (mainPageId: string, subPageId: string) => {
    console.log('Delete sub page:', mainPageId, subPageId);
  };

  return (
    <SessionContext.Provider
      value={{
        sessions: transformedSessions,
        mainPages: transformedMainPages,
        addSession,
        addSessionData,
        switchSubPage,
        exportSessionData,
        getSessionById,
        getMainPageById,
        getSubPageById,
        closeSession,
        resetNewDataFlag,
        updateMainPage,
        updateSubPage,
        addMainPage,
        addSubPage,
        deleteMainPage,
        deleteSubPage
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};
