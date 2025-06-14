
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface HeatmapData {
  id: string;
  page_url: string;
  element_selector: string | null;
  interaction_type: 'click' | 'hover' | 'scroll';
  coordinates: {
    x: number;
    y: number;
    viewport_width: number;
    viewport_height: number;
  };
  count: number;
  last_updated: string;
  created_at: string;
}

export const useHeatmap = () => {
  // Record heatmap data
  const recordHeatmapMutation = useMutation({
    mutationFn: async ({
      pageUrl,
      elementSelector,
      interactionType,
      coordinates
    }: {
      pageUrl: string;
      elementSelector?: string;
      interactionType: HeatmapData['interaction_type'];
      coordinates: HeatmapData['coordinates'];
    }) => {
      // Try to update existing record first
      const { data: existing } = await supabase
        .from('heatmap_data')
        .select('*')
        .eq('page_url', pageUrl)
        .eq('element_selector', elementSelector || '')
        .eq('interaction_type', interactionType)
        .eq('coordinates', JSON.stringify(coordinates))
        .single();

      if (existing) {
        // Update count
        const { error } = await supabase
          .from('heatmap_data')
          .update({ 
            count: existing.count + 1,
            last_updated: new Date().toISOString()
          })
          .eq('id', existing.id);
        
        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('heatmap_data')
          .insert({
            page_url: pageUrl,
            element_selector: elementSelector || null,
            interaction_type: interactionType,
            coordinates,
            count: 1
          });
        
        if (error) throw error;
      }
    }
  });

  // Get heatmap data for a page
  const useHeatmapData = (pageUrl?: string) => {
    return useQuery({
      queryKey: ['heatmap_data', pageUrl],
      queryFn: async () => {
        if (!pageUrl) return [];
        
        const { data, error } = await supabase
          .from('heatmap_data')
          .select('*')
          .eq('page_url', pageUrl)
          .order('count', { ascending: false });
        
        if (error) throw error;
        return data as HeatmapData[];
      },
      enabled: !!pageUrl
    });
  };

  // Auto-record heatmap data
  const setupHeatmapTracking = () => {
    const pageUrl = window.location.pathname;
    
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      recordHeatmapMutation.mutate({
        pageUrl,
        elementSelector: getElementSelector(target),
        interactionType: 'click',
        coordinates: {
          x: e.clientX,
          y: e.clientY,
          viewport_width: window.innerWidth,
          viewport_height: window.innerHeight
        }
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Sample hover events (1 in 100 to avoid spam)
      if (Math.random() < 0.01) {
        recordHeatmapMutation.mutate({
          pageUrl,
          interactionType: 'hover',
          coordinates: {
            x: e.clientX,
            y: e.clientY,
            viewport_width: window.innerWidth,
            viewport_height: window.innerHeight
          }
        });
      }
    };

    const handleScroll = () => {
      recordHeatmapMutation.mutate({
        pageUrl,
        interactionType: 'scroll',
        coordinates: {
          x: window.scrollX,
          y: window.scrollY,
          viewport_width: window.innerWidth,
          viewport_height: window.innerHeight
        }
      });
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  };

  const getElementSelector = (element: HTMLElement): string => {
    if (element.id) return `#${element.id}`;
    if (element.className) return `.${element.className.split(' ')[0]}`;
    return element.tagName.toLowerCase();
  };

  return {
    recordHeatmap: recordHeatmapMutation.mutate,
    useHeatmapData,
    setupHeatmapTracking
  };
};
