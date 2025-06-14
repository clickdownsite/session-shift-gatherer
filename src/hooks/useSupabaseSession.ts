
import { useSessions as useSessionsHook } from './useSessions';
import { useMainPages, useSubPages } from './usePageTemplates';
import { useSessionData as useSessionDataHook } from './useSessionData';
import type { Session as SessionType, SessionData as SessionDataType, MainPage as MainPageType, SubPage as SubPageType } from '@/types/session';
import { MutateOptions } from '@tanstack/react-query';

export type { Session, SessionData, MainPage, SubPage } from '@/types/session';

type CreateSessionVariables = {
  mainPageId: string;
  subPageId: string;
  sessionOptions?: Record<string, any>;
};

export const useSupabaseSessions = () => {
  const sessionsHook = useSessionsHook();
  const { data: mainPages, isLoading: isLoadingMainPages } = useMainPages();
  const { data: subPages, isLoading: isLoadingSubPages } = useSubPages();

  const createSession = (
    variables: CreateSessionVariables,
    options?: MutateOptions<SessionType, Error, CreateSessionVariables, unknown>
  ) => {
    const mainPage = (mainPages || []).find(p => p.id === variables.mainPageId);
    sessionsHook.createSession(
      { ...variables, pageName: mainPage?.name },
      options
    );
  };

  return {
    sessions: sessionsHook.sessions,
    mainPages: mainPages || [],
    subPages: subPages || [],
    isLoading: sessionsHook.isLoading || isLoadingMainPages || isLoadingSubPages,
    createSession,
    updateSession: sessionsHook.updateSession,
    closeSession: sessionsHook.closeSession,
  };
};

export const useSessionData = useSessionDataHook;

