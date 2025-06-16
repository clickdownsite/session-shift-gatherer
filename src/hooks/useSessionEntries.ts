
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SessionEntry {
  id: string;
  session_id: string;
  form_data: Record<string, any>;
  timestamp: string;
  ip_address: string;
  location: string;
  device_info?: Record<string, any>;
}

export const useSessionEntries = (sessionId: string | undefined) => {
  const [sessionData, setSessionData] = useState<SessionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setSessionData([]);
      setLoading(false);
      return;
    }

    const fetchSessionEntries = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('session_data')
          .select('*')
          .eq('session_id', sessionId)
          .order('timestamp', { ascending: false });

        if (error) throw error;
        
        // Transform the data to match our SessionEntry interface
        const transformedData: SessionEntry[] = (data || []).map(entry => ({
          id: entry.id,
          session_id: entry.session_id,
          form_data: typeof entry.form_data === 'object' && entry.form_data !== null 
            ? entry.form_data as Record<string, any>
            : {},
          timestamp: entry.timestamp,
          ip_address: entry.ip_address || '',
          location: entry.location || '',
          device_info: typeof entry.device_info === 'object' && entry.device_info !== null 
            ? entry.device_info as Record<string, any>
            : undefined
        }));
        
        setSessionData(transformedData);
      } catch (err) {
        console.error('Error fetching session entries:', err);
        setError(err instanceof Error ? err.message : 'Failed to load session data');
        setSessionData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionEntries();

    // Real-time subscription for new entries
    const channel = supabase
      .channel(`session_data_${sessionId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'session_data',
        filter: `session_id=eq.${sessionId}`
      }, () => {
        fetchSessionEntries();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  return { sessionData, loading, error };
};
