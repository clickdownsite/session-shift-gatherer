
import { useState, useEffect, useCallback } from 'react';
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

export interface FlowStep {
  sub_page_id: string;
}

export const useSessionPageData = (sessionId: string | undefined) => {
  const [mainPage, setMainPage] = useState<MainPageData | null>(null);
  const [currentSubPage, setCurrentSubPage] = useState<SubPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flow, setFlow] = useState<{ id: string; steps: FlowStep[] } | null>(null);

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

      // Fetch session data
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select('main_page_id, current_sub_page_id, active, flow_id, current_flow_step')
        .eq('id', sessionId)
        .single();

      if (sessionError) {
        console.error('[useSessionPageData] Session error:', sessionError);
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

      // Fetch flow if assigned
      let flowData = null;
      if (sessionData.flow_id) {
        const { data: fdata, error: ferr } = await supabase
          .from('page_flows')
          .select('id, steps')
          .eq('id', sessionData.flow_id)
          .single();
        if (!ferr && fdata) {
          flowData = fdata;
        }
      }
      setFlow(flowData);

      // Determine which sub page to fetch
      let subPageIdToFetch = sessionData.current_sub_page_id;
      if (flowData && flowData.steps?.length > 0 && typeof sessionData.current_flow_step === 'number') {
        const step = flowData.steps[sessionData.current_flow_step];
        if (step?.sub_page_id) {
          subPageIdToFetch = step.sub_page_id;
        }
      }

      // Fetch main page and sub page
      const [mainPageResult, subPageResult] = await Promise.all([
        supabase
          .from('main_pages')
          .select('id, name, description')
          .eq('id', sessionData.main_page_id)
          .single(),
        supabase
          .from('sub_pages')
          .select('*')
          .eq('id', subPageIdToFetch)
          .eq('main_page_id', sessionData.main_page_id)
          .single()
      ]);

      const { data: mainPageData, error: mainPageError } = mainPageResult;
      const { data: subPageData, error: subPageError } = subPageResult;

      console.log('[useSessionPageData] Data fetched:', { mainPageData, subPageData });

      if (mainPageError) {
        console.error('[useSessionPageData] Main page error:', mainPageError);
        setError(`Failed to load main page: ${mainPageError.message}`);
        setLoading(false);
        return;
      }

      if (subPageError) {
        console.error('[useSessionPageData] Sub page error:', subPageError);
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
        setError('Could not find the requested page for this session');
        setLoading(false);
        return;
      }

      setMainPage(mainPageData as MainPageData);
      setCurrentSubPage(subPageData as SubPageData);
      setLoading(false);

      console.log('[useSessionPageData] fetchPageData END - Success');
    } catch (error) {
      console.error('[useSessionPageData] Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to load page: ${errorMessage}`);
      setLoading(false);
    }
  }, [sessionId]);

  const advanceFlowStep = useCallback(async () => {
    if (!sessionId || !flow || !currentSubPage) return;
    
    const curStep = flow.steps.findIndex(s => s.sub_page_id === currentSubPage.id);
    if (curStep === -1) return;
    
    if (curStep < flow.steps.length - 1) {
      await supabase.from('sessions').update({
        current_flow_step: curStep + 1,
        updated_at: new Date().toISOString()
      }).eq('id', sessionId);
    }
  }, [sessionId, flow, currentSubPage?.id]);

  useEffect(() => {
    fetchPageData();
  }, [fetchPageData]);

  // Real-time subscription for session changes
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`session_changes_${sessionId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'sessions',
        filter: `id=eq.${sessionId}`
      }, (payload) => {
        console.log('[useSessionPageData] Real-time update:', payload);
        const newData = payload.new as any;
        if (newData && (
          newData.current_sub_page_id !== currentSubPage?.id ||
          typeof newData.current_flow_step !== "undefined"
        )) {
          fetchPageData();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, currentSubPage?.id, fetchPageData]);

  return {
    mainPage,
    currentSubPage,
    loading,
    error,
    refetch: fetchPageData,
    flow,
    advanceFlowStep,
  };
};
