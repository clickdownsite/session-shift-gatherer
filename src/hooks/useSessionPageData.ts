import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface MainPageData {
  id: string;
  name: string;
  description: string;
}

export interface SubPageData {
  id: string;
  name: string;
  description: string;
  html: string;
  css: string;
  javascript: string;
  fields: string[];
  main_page_id: string;
}

// Memo utility to shallow compare object keys/values (shallow)
function shallowEqual(a: any, b: any) {
  if (a === b) return true;
  if (typeof a !== 'object' || typeof b !== 'object') return false;
  const keysA = Object.keys(a ?? {});
  const keysB = Object.keys(b ?? {});
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (a[key] !== b[key]) return false;
  }
  return true;
}

export const useSessionPageData = (sessionId: string | undefined) => {
  const [mainPage, setMainPage] = useState<MainPageData | null>(null);
  const [currentSubPage, setCurrentSubPage] = useState<SubPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UseRef to keep previous values to avoid unnecessary state setting/renders
  const prevMainPage = useRef<MainPageData | null>(null);
  const prevSubPage = useRef<SubPageData | null>(null);

  // Function to fetch everything
  const fetchPageData = useCallback(async () => {
    console.log('[useSessionPageData] fetchPageData START', { sessionId });
    if (!sessionId) {
      setError('No session ID provided');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);

      // Fetch session meta
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select('main_page_id, current_sub_page_id, active')
        .eq('id', sessionId)
        .maybeSingle();

      if (sessionError) {
        setError(`Failed to load session: ${sessionError.message}`);
        setLoading(false);
        return;
      }

      if (!sessionData) {
        setError('Session not found');
        setLoading(false);
        return;
      }

      if (!sessionData.active) {
        setError('Session is no longer active');
        setLoading(false);
        return;
      }

      // Now fetch main_page and sub_page in parallel
      const mainPagePromise = supabase
        .from('main_pages')
        .select('id, name, description')
        .eq('id', sessionData.main_page_id)
        .maybeSingle();

      const subPagePromise = supabase
        .from('sub_pages')
        .select('*')
        .eq('id', sessionData.current_sub_page_id)
        .eq('main_page_id', sessionData.main_page_id)
        .maybeSingle();

      const [mainPageResult, subPageResult] = await Promise.all([
        mainPagePromise,
        subPagePromise
      ]);

      const { data: mainPageData, error: mainPageError } = mainPageResult;
      const { data: subPageData, error: subPageError } = subPageResult;

      // Log performance info
      console.log('[useSessionPageData] fetchPageData queries complete', { mainPageError, subPageError });

      if (mainPageError) {
        setError(`Failed to load main page: ${mainPageError.message}`);
        setLoading(false);
        return;
      }
      if (subPageError) {
        setError(`Failed to load page content: ${subPageError.message}`);
        setLoading(false);
        return;
      }

      if (!mainPageData) {
        setError('Main page not found');
        setLoading(false);
        return;
      }
      if (!subPageData) {
        setError('Could not find the requested page for this session. It might have been deleted or changed.');
        setLoading(false);
        return;
      }

      // Only update state if changed for less re-renders
      if (!shallowEqual(mainPageData, prevMainPage.current)) {
        setMainPage(mainPageData as MainPageData);
        prevMainPage.current = mainPageData as MainPageData;
      }
      if (!shallowEqual(subPageData, prevSubPage.current)) {
        setCurrentSubPage(subPageData as SubPageData);
        prevSubPage.current = subPageData as SubPageData;
      }
      setLoading(false);
      console.log('[useSessionPageData] fetchPageData END', { mainPageData, subPageData });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to load page: ${errorMessage}`);
      setLoading(false);
    }
  }, [sessionId]);

  // Switch sub page: only fetch sub page data, never main page again.
  const switchSubPage = useCallback(async (subPageId: string) => {
    if (!mainPage || !sessionId) {
      setError('No session or main page loaded.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Only fetch new sub page
      const { data: subPageData, error: subPageError } = await supabase
        .from('sub_pages')
        .select('*')
        .eq('id', subPageId)
        .eq('main_page_id', mainPage.id)
        .maybeSingle();

      if (subPageError) {
        setError(`Failed to load sub page: ${subPageError.message}`);
        setLoading(false);
        return;
      }
      if (!subPageData) {
        setError('Sub page not found');
        setLoading(false);
        return;
      }
      setCurrentSubPage(subPageData as SubPageData);
      prevSubPage.current = subPageData as SubPageData;
    } catch (e) {
      const err = e as Error;
      setError(`Failed to switch page: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [mainPage, sessionId]);

  // Only (re)fetch on mount or sessionId changes, NEVER on interval/timer.
  useEffect(() => {
    fetchPageData();
    // No interval, no active timer.
  }, [fetchPageData]);

  return {
    mainPage,
    currentSubPage,
    loading,
    error,
    setCurrentSubPage,
    refetch: fetchPageData,
    switchSubPage,
  };
};
