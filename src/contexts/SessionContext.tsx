import React, { createContext, useContext, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
  
  // Mock data for demo
  const [sessions, setSessions] = useState<any[]>([]);
  const [mainPages, setMainPages] = useState<any[]>([
    {
      id: 'main1',
      name: 'Contact Form',
      description: 'Simple contact form',
      subPages: [
        {
          id: 'sub1',
          name: 'Basic Info',
          description: 'Name and email',
          fields: ['name', 'email'],
          html: '<div>Contact Form</div>',
          parentId: 'main1'
        }
      ]
    }
  ]);

  const transformedMainPages = useMemo(() => mainPages, [mainPages]);
  const transformedSessions = useMemo(() => sessions, [sessions]);

  const getMainPageById = (mainPageId: string) => {
    return transformedMainPages.find(page => page.id === mainPageId);
  };

  const getSubPageById = (mainPageId: string, subPageId: string) => {
    const mainPage = getMainPageById(mainPageId);
    return mainPage?.subPages?.find((subPage: any) => subPage.id === subPageId);
  };

  const getSessionById = (sessionId: string) => {
    return transformedSessions.find(session => session.id === sessionId);
  };

  const addSession = (mainPageId: string, subPageId: string) => {
    const newSession = {
      id: `session_${Date.now()}`,
      mainPageId,
      currentSubPageId: subPageId,
      createdAt: new Date().toISOString(),
      active: true,
      hasNewData: false,
      data: []
    };
    setSessions(prev => [...prev, newSession]);
    toast.success("Session created successfully");
  };

  const addSessionData = async (sessionId: string, data: any) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, hasNewData: true, data: [...(session.data || []), data] }
        : session
    ));
    toast("New Data Received", { description: "New form submission received" });
  };

  const switchSubPage = (sessionId: string, newSubPageId: string) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, currentSubPageId: newSubPageId }
        : session
    ));
  };

  const resetNewDataFlag = (sessionId: string) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, hasNewData: false }
        : session
    ));
  };

  const closeSession = (sessionId: string) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, active: false }
        : session
    ));
    toast.success("Session closed");
  };

  const exportSessionData = async (sessionId: string) => {
    const session = getSessionById(sessionId);
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

  // Mock implementations for admin features
  const updateMainPage = async (updatedPage: any) => {
    setMainPages(prev => prev.map(page => 
      page.id === updatedPage.id ? { ...page, ...updatedPage } : page
    ));
    toast.success("Main page updated successfully");
  };

  const updateSubPage = async (mainPageId: string, updatedSubPage: any) => {
    setMainPages(prev => prev.map(page => 
      page.id === mainPageId 
        ? {
            ...page,
            subPages: page.subPages.map((subPage: any) => 
              subPage.id === updatedSubPage.id ? { ...subPage, ...updatedSubPage } : subPage
            )
          }
        : page
    ));
    toast.success("Sub page updated successfully");
  };

  const addMainPage = async (newPage: any): Promise<string> => {
    const newPageId = `page_${Date.now()}`;
    const pageWithId = { ...newPage, id: newPageId, subPages: [] };
    setMainPages(prev => [...prev, pageWithId]);
    toast.success("Main page created successfully");
    return newPageId;
  };

  const addSubPage = async (mainPageId: string, newSubPage: any): Promise<string> => {
    const newSubPageId = `subpage_${Date.now()}`;
    const subPageWithId = { ...newSubPage, id: newSubPageId, parentId: mainPageId };
    
    setMainPages(prev => prev.map(page => 
      page.id === mainPageId 
        ? { ...page, subPages: [...page.subPages, subPageWithId] }
        : page
    ));
    toast.success("Sub page created successfully");
    return newSubPageId;
  };

  const deleteMainPage = async (mainPageId: string) => {
    setMainPages(prev => prev.filter(page => page.id !== mainPageId));
    toast.success("Main page deleted successfully");
  };

  const deleteSubPage = async (mainPageId: string, subPageId: string) => {
    setMainPages(prev => prev.map(page => 
      page.id === mainPageId 
        ? { ...page, subPages: page.subPages.filter((subPage: any) => subPage.id !== subPageId) }
        : page
    ));
    toast.success("Sub page deleted successfully");
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
