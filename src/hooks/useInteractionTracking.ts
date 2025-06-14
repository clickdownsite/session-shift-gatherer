
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface InteractionData {
  sessionId?: string;
  formId?: string;
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
          session_id: data.sessionId || null,
          form_id: data.formId || null,
          interaction_type: data.interactionType,
          element_selector: data.elementSelector || null,
          interaction_data: data.interactionData || {},
          page_url: data.pageUrl || window.location.href,
          ip_address: null // Could be populated server-side if needed
        });
      
      if (error) throw error;
    },
    onError: (error) => {
      console.error('Failed to track interaction:', error);
    }
  });

  const trackInteraction = (data: InteractionData) => {
    trackInteractionMutation.mutate(data);
  };

  return { trackInteraction };
};

// Utility function to set up interaction tracking on a page
export const setupInteractionTracking = (formId?: string, sessionId?: string) => {
  const trackInteraction = (data: InteractionData) => {
    // This would be called by the mutation hook
  };

  // Track clicks
  const handleClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const selector = getElementSelector(target);
    
    trackInteraction({
      formId,
      sessionId,
      interactionType: 'click',
      elementSelector: selector,
      interactionData: {
        x: event.clientX,
        y: event.clientY,
        tagName: target.tagName,
        className: target.className,
        id: target.id
      }
    });
  };

  // Track key presses
  const handleKeyPress = (event: KeyboardEvent) => {
    const target = event.target as HTMLElement;
    const selector = getElementSelector(target);
    
    trackInteraction({
      formId,
      sessionId,
      interactionType: 'keypress',
      elementSelector: selector,
      interactionData: {
        key: event.key,
        code: event.code,
        tagName: target.tagName,
        value: (target as HTMLInputElement).value
      }
    });
  };

  // Track mouse movements (throttled)
  let mouseThrottle = false;
  const handleMouseMove = (event: MouseEvent) => {
    if (mouseThrottle) return;
    mouseThrottle = true;
    
    setTimeout(() => {
      trackInteraction({
        formId,
        sessionId,
        interactionType: 'mousemove',
        interactionData: {
          x: event.clientX,
          y: event.clientY
        }
      });
      mouseThrottle = false;
    }, 100); // Throttle to every 100ms
  };

  // Helper function to generate a CSS selector for an element
  const getElementSelector = (element: HTMLElement): string => {
    if (element.id) return `#${element.id}`;
    if (element.className) return `.${element.className.split(' ').join('.')}`;
    return element.tagName.toLowerCase();
  };

  // Set up event listeners
  document.addEventListener('click', handleClick);
  document.addEventListener('keypress', handleKeyPress);
  document.addEventListener('mousemove', handleMouseMove);

  // Return cleanup function
  return () => {
    document.removeEventListener('click', handleClick);
    document.removeEventListener('keypress', handleKeyPress);
    document.removeEventListener('mousemove', handleMouseMove);
  };
};
