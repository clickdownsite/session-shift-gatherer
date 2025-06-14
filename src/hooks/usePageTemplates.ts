
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
    queryKey: ['sub_pages_summary'], // Using a distinct query key for performance
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sub_pages')
        // Select only fields needed for list views to improve initial load time.
        .select('id, name, description, fields, main_page_id, created_at, updated_at')
        .order('name');
      
      if (error) throw error;
      if (!data) return [];

      // Add default empty values for heavy text fields to match the SubPage type
      // without fetching their potentially large content.
      const transformedData = data.map(p => ({
        ...p,
        html: '',
        css: '',
        javascript: '',
      }));
      
      return transformedData as SubPage[];
    },
  });
};
