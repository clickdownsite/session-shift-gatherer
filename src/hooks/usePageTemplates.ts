
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { defaultMainPages, defaultSubPages } from '@/data/defaultPages';

export const useMainPages = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['main_pages', user?.id],
    queryFn: async () => {
      // Get user pages and system defaults
      const { data, error } = await supabase
        .from('main_pages')
        .select('*')
        .or(`created_by.eq.${user?.id || 'system'},created_by.eq.system`)
        .order('created_by', { ascending: false }) // User pages first
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // If no system pages exist, create them
      if (!data.some(page => page.created_by === 'system')) {
        await createDefaultPages();
        // Refetch after creating defaults
        const { data: newData, error: newError } = await supabase
          .from('main_pages')
          .select('*')
          .or(`created_by.eq.${user?.id || 'system'},created_by.eq.system`)
          .order('created_by', { ascending: false })
          .order('created_at', { ascending: false });
        
        if (newError) throw newError;
        return newData || [];
      }
      
      return data || [];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useSubPages = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['sub_pages', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sub_pages')
        .select('*')
        .or(`created_by.eq.${user?.id || 'system'},created_by.eq.system`)
        .order('created_by', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

const createDefaultPages = async () => {
  try {
    // Insert default main pages
    const { error: mainError } = await supabase
      .from('main_pages')
      .upsert(defaultMainPages.map(page => ({
        ...page,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })), { onConflict: 'id' });
    
    if (mainError) throw mainError;

    // Insert default sub pages
    const { error: subError } = await supabase
      .from('sub_pages')
      .upsert(defaultSubPages.map(page => ({
        ...page,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })), { onConflict: 'id' });
    
    if (subError) throw subError;
    
    console.log('Default pages created successfully');
  } catch (error) {
    console.error('Error creating default pages:', error);
  }
};

export const useCreateDefaultPages = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createDefaultPages,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['main_pages'] });
      queryClient.invalidateQueries({ queryKey: ['sub_pages'] });
    }
  });
};
