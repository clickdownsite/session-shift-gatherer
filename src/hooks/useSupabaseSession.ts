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

// Optimization: No longer lookup main page name before createSession — let DB handle it, or do this in dashboard UI later.
export const useSupabaseSessions = () => {
  const sessionsHook = useSessionsHook();
  const { data: mainPages, isLoading: isLoadingMainPages } = useMainPages();
  const { data: subPages, isLoading: isLoadingSubPages } = useSubPages();

  const mainPagesList = useMemo(() => mainPages || [], [mainPages]);
  const subPagesList = useMemo(() => subPages || [], [subPages]);

  // Directly pass minimal variables to the mutation for fastest possible DB insert
  const createSession = (
    variables: CreateSessionVariables,
    options?: MutateOptions<SessionType, Error, CreateSessionVariables, unknown>
  ) => {
    sessionsHook.createSession(
      {
        mainPageId: variables.mainPageId,
        subPageId: variables.subPageId,
        sessionOptions: variables.sessionOptions,
      },
      options
    );
  };

  return {
    sessions: sessionsHook.sessions,
    mainPages: mainPagesList,
    subPages: subPagesList,
    isLoading: sessionsHook.isLoading,
    createSession,
    updateSession: sessionsHook.updateSession,
    closeSession: sessionsHook.closeSession,
  };
};

export const useSessionData = useSessionDataHook;
