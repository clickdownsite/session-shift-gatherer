
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import type { Session } from '@/types/session';

type CreateSessionVariables = {
  mainPageId: string;
  subPageId: string;
  sessionOptions?: Record<string, any>;
  pageName?: string;
  flowId?: string;
};

export const useSessions = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['sessions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('active', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Session[];
    },
    enabled: !!user,
  });

  const createSessionMutation = useMutation<Session, Error, CreateSessionVariables>({
    mutationFn: async ({ mainPageId, subPageId, sessionOptions, flowId }) => {
      if (!user) throw new Error('User not authenticated');
      
      const sessionId = Math.random().toString(36).substring(2, 8);
      const sessionData: any = {
        id: sessionId,
        user_id: user.id,
        main_page_id: mainPageId,
        current_sub_page_id: subPageId,
        active: true,
        has_new_data: false,
        session_options: sessionOptions || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Add flow configuration if provided
      if (flowId && flowId !== 'manual') {
        sessionData.flow_id = flowId;
        sessionData.current_flow_step = 0;
      }

      const { data, error } = await supabase
        .from('sessions')
        .insert(sessionData)
        .select()
        .single();
      
      if (error) {
        console.error('Session creation error:', error);
        throw error;
      }
      return data as Session;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('Session created successfully!');
    },
    onError: (error) => {
      console.error('Session creation failed:', error);
      toast.error("Failed to create session", {
        description: error.message,
      });
    }
  });

  const updateSessionMutation = useMutation({
    mutationFn: async ({ sessionId, updates }: { sessionId: string; updates: Partial<Session> }) => {
      const { data, error } = await supabase
        .from('sessions')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    }
  });

  const closeSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from('sessions')
        .update({ active: false, updated_at: new Date().toISOString() })
        .eq('id', sessionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', user?.id] });
      toast.success("Session closed successfully");
    },
    onError: (error) => {
      toast.error("Failed to close session", {
        description: error.message,
      });
    },
  });

  return {
    sessions,
    isLoading,
    createSession: createSessionMutation.mutate,
    updateSession: updateSessionMutation.mutate,
    closeSession: closeSessionMutation.mutate,
  };
};

export const useHistoricalSessions = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['historical_sessions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('active', false)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data as Session[];
    },
    enabled: !!user,
  });
};
