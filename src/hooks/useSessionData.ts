
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SessionPageData {
  session: {
    id: string;
    main_page_id: string;
    current_sub_page_id: string;
    active: boolean;
    session_options: Record<string, any>;
    first_viewer_ip?: string;
    flow_id?: string;
    current_flow_step?: number;
  };
  subPage: {
    id: string;
    name: string;
    html: string;
    css: string;
    javascript: string;
  };
  flow?: {
    id: string;
    steps: Array<{ sub_page_id: string }>;
  };
}

export const useSessionData = (sessionId: string | undefined) => {
  const [data, setData] = useState<SessionPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!sessionId) {
      setError('No session ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Single query to get all needed data
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select(`
          id,
          main_page_id,
          current_sub_page_id,
          active,
          session_options,
          first_viewer_ip,
          flow_id,
          current_flow_step
        `)
        .eq('id', sessionId)
        .single();

      if (sessionError || !sessionData) {
        throw new Error(sessionError?.message || 'Session not found');
      }

      if (!sessionData.active) {
        throw new Error('Session is no longer active');
      }

      // Determine which sub page to show
      let targetSubPageId = sessionData.current_sub_page_id;

      // Check if we have a flow and should use flow step
      if (sessionData.flow_id && typeof sessionData.current_flow_step === 'number') {
        const { data: flowData } = await supabase
          .from('page_flows')
          .select('id, steps')
          .eq('id', sessionData.flow_id)
          .single();

        if (flowData?.steps?.[sessionData.current_flow_step]?.sub_page_id) {
          targetSubPageId = flowData.steps[sessionData.current_flow_step].sub_page_id;
        }
      }

      // Get the sub page content
      const { data: subPageData, error: subPageError } = await supabase
        .from('sub_pages')
        .select('id, name, html, css, javascript')
        .eq('id', targetSubPageId)
        .single();

      if (subPageError || !subPageData) {
        throw new Error('Page content not found');
      }

      setData({
        session: sessionData,
        subPage: subPageData,
      });

    } catch (err) {
      console.error('Error fetching session data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load session');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Real-time updates
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`session_${sessionId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'sessions',
        filter: `id=eq.${sessionId}`
      }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, fetchData]);

  return { data, loading, error, refetch: fetchData };
};
