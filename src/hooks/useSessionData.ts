
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { SessionData } from '@/types/session';

export const useSessionData = (sessionId?: string) => {
  const { data: sessionData = [] } = useQuery({
    queryKey: ['session_data', sessionId],
    queryFn: async () => {
      if (!sessionId) return [];
      
      const { data, error } = await supabase
        .from('session_data')
        .select('*')
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: false });
      
      if (error) throw error;
      return data as SessionData[];
    },
    enabled: !!sessionId,
  });

  return { sessionData };
};
