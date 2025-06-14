
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface InteractionData {
  formId?: string;
  sessionId?: string;
  interactionType: string;
  elementSelector?: string;
  interactionData?: Record<string, any>;
  pageUrl?: string;
}

export const useInteractionTracking = () => {
  const trackInteractionMutation = useMutation({
    mutationFn: async (data: InteractionData) => {
      const { error } = await supabase
        .from('user_interactions')
        .insert({
          form_id: data.formId || null,
          session_id: data.sessionId || null,
          interaction_type: data.interactionType,
          element_selector: data.elementSelector || null,
          interaction_data: data.interactionData || {},
          page_url: data.pageUrl || window.location.href,
          ip_address: null // Could be populated if needed
        });
      
      if (error) throw error;
    },
    onError: (error) => {
      console.error('Failed to track interaction:', error);
    }
  });

  return {
    trackInteraction: trackInteractionMutation.mutate,
  };
};
