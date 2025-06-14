
import { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface LiveSession {
  id: string;
  session_token: string;
  user_id: string | null;
  page_url: string;
  started_at: string;
  ended_at: string | null;
  is_active: boolean;
  metadata: Record<string, any>;
}

export interface LiveInteraction {
  id: string;
  session_id: string;
  interaction_type: string;
  element_selector: string | null;
  element_content: string | null;
  coordinates: { x: number; y: number; viewport_width: number; viewport_height: number } | null;
  timestamp_offset: number;
  data: Record<string, any>;
}

export const useLiveSession = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentSession, setCurrentSession] = useState<LiveSession | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const sessionStartTime = useRef<number>(0);
  const interactionBuffer = useRef<Omit<LiveInteraction, 'id'>[]>([]);

  // Create live session
  const createSessionMutation = useMutation({
    mutationFn: async ({ pageUrl, metadata = {} }: { pageUrl: string; metadata?: Record<string, any> }) => {
      const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      
      const { data, error } = await supabase
        .from('live_sessions')
        .insert({
          session_token: sessionToken,
          user_id: user?.id || null,
          page_url: pageUrl,
          metadata
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as LiveSession;
    },
    onSuccess: (session) => {
      setCurrentSession(session);
      sessionStartTime.current = Date.now();
      setIsRecording(true);
    }
  });

  // End session
  const endSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from('live_sessions')
        .update({ 
          ended_at: new Date().toISOString(),
          is_active: false 
        })
        .eq('id', sessionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      setCurrentSession(null);
      setIsRecording(false);
      interactionBuffer.current = [];
    }
  });

  // Record interaction
  const recordInteraction = async (interaction: {
    type: string;
    element?: HTMLElement;
    coordinates?: { x: number; y: number };
    data?: Record<string, any>;
  }) => {
    if (!currentSession || !isRecording) return;

    const timestamp = Date.now() - sessionStartTime.current;
    const viewport = {
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight
    };

    const interactionData: Omit<LiveInteraction, 'id'> = {
      session_id: currentSession.id,
      interaction_type: interaction.type,
      element_selector: interaction.element ? getElementSelector(interaction.element) : null,
      element_content: interaction.element?.textContent?.substring(0, 100) || null,
      coordinates: interaction.coordinates ? { ...interaction.coordinates, ...viewport } : null,
      timestamp_offset: timestamp,
      data: interaction.data || {}
    };

    // Buffer interactions and batch insert
    interactionBuffer.current.push(interactionData);
    
    if (interactionBuffer.current.length >= 10) {
      await flushInteractionBuffer();
    }
  };

  const flushInteractionBuffer = async () => {
    if (interactionBuffer.current.length === 0) return;

    const interactions = [...interactionBuffer.current];
    interactionBuffer.current = [];

    try {
      const { error } = await supabase
        .from('live_interactions')
        .insert(interactions);
      
      if (error) throw error;
    } catch (error) {
      console.error('Failed to record interactions:', error);
      // Re-add to buffer if failed
      interactionBuffer.current.unshift(...interactions);
    }
  };

  const getElementSelector = (element: HTMLElement): string => {
    if (element.id) return `#${element.id}`;
    if (element.className) return `.${element.className.split(' ')[0]}`;
    return element.tagName.toLowerCase();
  };

  // Auto-flush buffer periodically
  useEffect(() => {
    if (!isRecording) return;

    const interval = setInterval(flushInteractionBuffer, 5000);
    return () => clearInterval(interval);
  }, [isRecording]);

  // Set up event listeners when recording
  useEffect(() => {
    if (!isRecording) return;

    const handleMouseMove = (e: MouseEvent) => {
      recordInteraction({
        type: 'mouse_move',
        coordinates: { x: e.clientX, y: e.clientY }
      });
    };

    const handleClick = (e: MouseEvent) => {
      recordInteraction({
        type: 'click',
        element: e.target as HTMLElement,
        coordinates: { x: e.clientX, y: e.clientY }
      });
    };

    const handleScroll = () => {
      recordInteraction({
        type: 'scroll',
        data: { 
          scrollX: window.scrollX, 
          scrollY: window.scrollY 
        }
      });
    };

    const handleKeydown = (e: KeyboardEvent) => {
      recordInteraction({
        type: 'keystroke',
        element: e.target as HTMLElement,
        data: { 
          key: e.key,
          code: e.code 
        }
      });
    };

    // Throttle mouse move events
    let mouseMoveThrottle: NodeJS.Timeout;
    const throttledMouseMove = (e: MouseEvent) => {
      clearTimeout(mouseMoveThrottle);
      mouseMoveThrottle = setTimeout(() => handleMouseMove(e), 100);
    };

    document.addEventListener('mousemove', throttledMouseMove);
    document.addEventListener('click', handleClick);
    document.addEventListener('scroll', handleScroll);
    document.addEventListener('keydown', handleKeydown);

    return () => {
      document.removeEventListener('mousemove', throttledMouseMove);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('scroll', handleScroll);
      document.removeEventListener('keydown', handleKeydown);
      clearTimeout(mouseMoveThrottle);
    };
  }, [isRecording]);

  // Cleanup on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentSession) {
        flushInteractionBuffer();
        endSessionMutation.mutate(currentSession.id);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentSession]);

  return {
    currentSession,
    isRecording,
    startSession: createSessionMutation.mutate,
    endSession: (sessionId: string) => endSessionMutation.mutate(sessionId),
    recordInteraction,
    flushInteractionBuffer
  };
};

// Hook for fetching session data
export const useSessionData = (sessionId?: string) => {
  const { data: session } = useQuery({
    queryKey: ['live_session', sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      
      const { data, error } = await supabase
        .from('live_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();
      
      if (error) throw error;
      return data as LiveSession;
    },
    enabled: !!sessionId
  });

  const { data: interactions = [] } = useQuery({
    queryKey: ['live_interactions', sessionId],
    queryFn: async () => {
      if (!sessionId) return [];
      
      const { data, error } = await supabase
        .from('live_interactions')
        .select('*')
        .eq('session_id', sessionId)
        .order('timestamp_offset', { ascending: true });
      
      if (error) throw error;
      // Type assertion with proper conversion
      return (data as any[]).map(item => ({
        ...item,
        coordinates: item.coordinates as { x: number; y: number; viewport_width: number; viewport_height: number } | null,
        data: item.data as Record<string, any>
      })) as LiveInteraction[];
    },
    enabled: !!sessionId
  });

  return { session, interactions };
};
