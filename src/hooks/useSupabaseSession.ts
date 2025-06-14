import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface Session {
  id: string;
  user_id: string;
  main_page_id: string;
  current_sub_page_id: string;
  page_type: string | null;
  created_at: string;
  updated_at: string;
  active: boolean;
  has_new_data: boolean;
}

export interface SessionData {
  id: string;
  session_id: string;
  timestamp: string;
  ip_address: string | null;
  location: string | null;
  form_data: Record<string, any>;
}

export interface MainPage {
  id: string;
  name: string;
  description: string | null;
}

export interface SubPage {
  id: string;
  main_page_id: string;
  name: string;
  description: string | null;
  fields: string[];
  html: string | null;
}

export const useSupabaseSessions = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user sessions
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

  // Fetch main pages
  const { data: mainPages = [] } = useQuery({
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

  // Fetch sub pages
  const { data: subPages = [] } = useQuery({
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

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: async ({ mainPageId, subPageId }: { mainPageId: string; subPageId: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      const sessionId = Math.random().toString(36).substring(2, 8);
      const mainPage = mainPages.find(p => p.id === mainPageId);
      
      const { data, error } = await supabase
        .from('sessions')
        .insert({
          id: sessionId,
          user_id: user.id,
          main_page_id: mainPageId,
          current_sub_page_id: subPageId,
          page_type: mainPage?.name,
          active: true,
          has_new_data: false
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast({
        title: "Session Created",
        description: "New session has been created successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create session: " + error.message,
        variant: "destructive"
      });
    }
  });

  // Update session mutation
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

  // Close session mutation
  const closeSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from('sessions')
        .update({ active: false })
        .eq('id', sessionId);
      
      if (error) throw error;
    },
    onMutate: async (sessionId: string) => {
      await queryClient.cancelQueries({ queryKey: ['sessions', user?.id] });

      const previousSessions = queryClient.getQueryData<Session[]>(['sessions', user?.id]);

      queryClient.setQueryData<Session[]>(
        ['sessions', user?.id],
        (old) => old?.filter((session) => session.id !== sessionId) ?? []
      );

      return { previousSessions };
    },
    onError: (error, sessionId, context) => {
      if (context?.previousSessions) {
        queryClient.setQueryData(['sessions', user?.id], context.previousSessions);
      }
      toast({
        title: "Error",
        description: "Failed to close session: " + error.message,
        variant: "destructive"
      });
    },
    onSuccess: () => {
      toast({
        title: "Session Closed",
        description: "The session has been marked as inactive."
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', user?.id] });
    },
  });

  return {
    sessions,
    mainPages,
    subPages,
    isLoading,
    createSession: createSessionMutation.mutate,
    updateSession: updateSessionMutation.mutate,
    closeSession: closeSessionMutation.mutate,
  };
};

export const useSessionData = (sessionId?: string) => {
  const { data: sessionData = [] } = useQuery({
    queryKey: ['session_data', sessionId],
    queryFn: async () => {
      if (!sessionId) return [];
      
      const { data, error } = await supabase
        .from('session_data')
        .select('*')
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: false });
      
      if (error) throw error;
      return data as SessionData[];
    },
    enabled: !!sessionId,
  });

  return { sessionData };
};
