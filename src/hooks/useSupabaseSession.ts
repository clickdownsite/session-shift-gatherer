
import { useSessions as useSessionsHook } from './useSessions';
import { useMainPages, useSubPages } from './usePageTemplates';
import { useSessionData as useSessionDataHook } from './useSessionData';
import type { Session as SessionType } from '@/types/session';
import { MutateOptions } from '@tanstack/react-query';
import { useMemo } from 'react';

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

  // Use useMemo to avoid recomputation unless underlying data changes
  const mainPagesList = useMemo(() => mainPages || [], [mainPages]);
  const subPagesList = useMemo(() => subPages || [], [subPages]);

  const createSession = (
    variables: CreateSessionVariables,
    options?: MutateOptions<SessionType, Error, CreateSessionVariables, unknown>
  ) => {
    // Lookup mainPage name (avoid looping if not needed)
    const mainPage = mainPagesList.find(p => p.id === variables.mainPageId);
    sessionsHook.createSession(
      { ...variables, pageName: mainPage?.name },
      options
    );
  };

  return {
    sessions: sessionsHook.sessions,
    mainPages: mainPagesList,
    subPages: subPagesList,
    isLoading: sessionsHook.isLoading || isLoadingMainPages || isLoadingSubPages,
    createSession,
    updateSession: sessionsHook.updateSession,
    closeSession: sessionsHook.closeSession,
  };
};

export const useSessionData = useSessionDataHook;
