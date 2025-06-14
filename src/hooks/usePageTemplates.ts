
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { MainPage, SubPage } from '@/types/session';

export const useMainPages = () => {
  return useQuery({
    queryKey: ['main_pages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('main_pages')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as MainPage[];
    },
  });
};

export const useSubPages = () => {
  return useQuery({
    queryKey: ['sub_pages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sub_pages')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as SubPage[];
    },
  });
};
