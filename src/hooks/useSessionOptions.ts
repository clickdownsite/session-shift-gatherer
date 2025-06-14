
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSessionOptions = (sessionId: string | undefined) => {
  const [sessionOptions, setSessionOptions] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchSessionOptions = useCallback(async () => {
    if (!sessionId) {
      setSessionOptions({});
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sessions')
        .select('session_options')
        .eq('id', sessionId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching session options:', error);
        setSessionOptions({});
        return;
      }
      
      setSessionOptions(data?.session_options || {});
    } catch (error) {
      console.error("Error fetching session options:", error);
      setSessionOptions({});
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchSessionOptions();
  }, [fetchSessionOptions]);

  return { sessionOptions, loading };
};
