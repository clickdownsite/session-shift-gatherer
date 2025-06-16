
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

      // Get session data with simplified query
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sessionError || !sessionData) {
        throw new Error('Session not found');
      }

      if (!sessionData.active) {
        throw new Error('Session is no longer active');
      }

      // Determine target sub page ID
      let targetSubPageId = sessionData.current_sub_page_id;

      // Check flow logic if needed
      let flowData = null;
      if (sessionData.flow_id && typeof sessionData.current_flow_step === 'number') {
        const { data: fData } = await supabase
          .from('page_flows')
          .select('id, steps')
          .eq('id', sessionData.flow_id)
          .single();

        if (fData?.steps?.[sessionData.current_flow_step]?.sub_page_id) {
          flowData = fData;
          targetSubPageId = fData.steps[sessionData.current_flow_step].sub_page_id;
        }
      }

      // Get sub page content
      const { data: subPageData, error: subPageError } = await supabase
        .from('sub_pages')
        .select('id, name, html, css, javascript')
        .eq('id', targetSubPageId)
        .single();

      if (subPageError || !subPageData) {
        throw new Error('Page content not found');
      }

      const finalData: SessionPageData = {
        session: {
          ...sessionData,
          session_options: typeof sessionData.session_options === 'string' 
            ? JSON.parse(sessionData.session_options) 
            : (sessionData.session_options || {})
        },
        subPage: subPageData,
        flow: flowData
      };

      setData(finalData);
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

  // Simplified real-time updates
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
