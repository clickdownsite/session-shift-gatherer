
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ConversionGoal {
  id: string;
  name: string;
  description: string | null;
  goal_type: 'page_visit' | 'click_element' | 'form_submit' | 'time_on_page';
  target_selector: string | null;
  target_value: Record<string, any> | null;
  created_by: string | null;
  created_at: string;
}

export interface ConversionEvent {
  id: string;
  goal_id: string;
  session_id: string;
  ab_test_id: string | null;
  variant_id: string | null;
  event_data: Record<string, any>;
  occurred_at: string;
}

export const useConversionTracking = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user's conversion goals
  const { data: goals = [] } = useQuery({
    queryKey: ['conversion_goals', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('conversion_goals')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ConversionGoal[];
    },
    enabled: !!user
  });

  // Create conversion goal
  const createGoalMutation = useMutation({
    mutationFn: async (goalData: {
      name: string;
      description?: string;
      goal_type: ConversionGoal['goal_type'];
      target_selector?: string;
      target_value?: Record<string, any>;
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('conversion_goals')
        .insert({
          name: goalData.name,
          description: goalData.description,
          goal_type: goalData.goal_type,
          target_selector: goalData.target_selector,
          target_value: goalData.target_value,
          created_by: user.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversion_goals'] });
    }
  });

  // Track conversion event
  const trackConversionMutation = useMutation({
    mutationFn: async ({
      goalId,
      sessionId,
      abTestId,
      variantId,
      eventData = {}
    }: {
      goalId: string;
      sessionId: string;
      abTestId?: string;
      variantId?: string;
      eventData?: Record<string, any>;
    }) => {
      const { data, error } = await supabase
        .from('conversion_events')
        .insert({
          goal_id: goalId,
          session_id: sessionId,
          ab_test_id: abTestId || null,
          variant_id: variantId || null,
          event_data: eventData
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  // Get conversion events for a goal
  const useConversionEvents = (goalId?: string) => {
    return useQuery({
      queryKey: ['conversion_events', goalId],
      queryFn: async () => {
        if (!goalId) return [];
        
        const { data, error } = await supabase
          .from('conversion_events')
          .select('*')
          .eq('goal_id', goalId)
          .order('occurred_at', { ascending: false });
        
        if (error) throw error;
        return data as ConversionEvent[];
      },
      enabled: !!goalId
    });
  };

  // Auto-track conversions based on goals
  const setupConversionTracking = (sessionId: string, abTestId?: string, variantId?: string) => {
    goals.forEach(goal => {
      switch (goal.goal_type) {
        case 'page_visit':
          if (goal.target_value?.url && window.location.pathname.includes(goal.target_value.url)) {
            trackConversionMutation.mutate({
              goalId: goal.id,
              sessionId,
              abTestId,
              variantId,
              eventData: { url: window.location.href }
            });
          }
          break;
          
        case 'click_element':
          if (goal.target_selector) {
            const elements = document.querySelectorAll(goal.target_selector);
            elements.forEach(element => {
              element.addEventListener('click', () => {
                trackConversionMutation.mutate({
                  goalId: goal.id,
                  sessionId,
                  abTestId,
                  variantId,
                  eventData: { 
                    selector: goal.target_selector,
                    elementText: element.textContent 
                  }
                });
              });
            });
          }
          break;
          
        case 'form_submit':
          if (goal.target_selector) {
            const forms = document.querySelectorAll(goal.target_selector);
            forms.forEach(form => {
              form.addEventListener('submit', () => {
                trackConversionMutation.mutate({
                  goalId: goal.id,
                  sessionId,
                  abTestId,
                  variantId,
                  eventData: { selector: goal.target_selector }
                });
              });
            });
          }
          break;
          
        case 'time_on_page':
          if (goal.target_value?.duration) {
            setTimeout(() => {
              trackConversionMutation.mutate({
                goalId: goal.id,
                sessionId,
                abTestId,
                variantId,
                eventData: { 
                  timeSpent: goal.target_value.duration,
                  url: window.location.href 
                }
              });
            }, goal.target_value.duration * 1000);
          }
          break;
      }
    });
  };

  return {
    goals,
    createGoal: createGoalMutation.mutate,
    trackConversion: trackConversionMutation.mutate,
    setupConversionTracking,
    useConversionEvents
  };
};
