
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
    mutationFn: async ({ mainPageId, subPageId, sessionOptions }) => {
      if (!user) throw new Error('User not authenticated');
      
      const sessionId = Math.random().toString(36).substring(2, 8);
      const { data, error } = await supabase
        .from('sessions')
        .insert({
          id: sessionId,
          user_id: user.id,
          main_page_id: mainPageId,
          current_sub_page_id: subPageId,
          active: true,
          has_new_data: false,
          session_options: sessionOptions || {},
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as Session;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('Session created successfully!');
    },
    onError: (error) => {
      toast.error("Failed to create session", {
        description: error.message,
      });
    }
  });

  const updateSessionMutation = useMutation({
    mutationFn: async ({ sessionId, updates }: { sessionId: string; updates: Partial<Session> }) => {
      const { data, error } = await supabase
        .from('sessions')
        .update(updates)
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
