
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const usePageFlows = () => {
  return useQuery({
    queryKey: ["page_flows"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_flows')
        .select('id, name, steps')
        .order('name');
      if (error) throw error;
      return data || [];
    },
  });
};
