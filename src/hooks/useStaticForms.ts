
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface StaticForm {
  id: string;
  name: string;
  description: string | null;
  fields: any[];
  html: string | null;
  css: string | null;
  javascript: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface StaticFormSubmission {
  id: string;
  form_id: string | null;
  submission_data: Record<string, any>;
  ip_address: string | null;
  user_agent: string | null;
  submitted_at: string;
}

export interface UserInteraction {
  id: string;
  session_id: string | null;
  form_id: string | null;
  interaction_type: string;
  element_selector: string | null;
  interaction_data: Record<string, any> | null;
  timestamp: string;
  page_url: string | null;
  ip_address: string | null;
}

export const useStaticForms = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user's static forms
  const { data: staticForms = [], isLoading } = useQuery({
    queryKey: ['static_forms', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('static_forms')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as StaticForm[];
    },
    enabled: !!user,
  });

  // Fetch active static forms (public)
  const { data: activeStaticForms = [] } = useQuery({
    queryKey: ['active_static_forms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('static_forms')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as StaticForm[];
    },
  });

  // Create static form mutation
  const createStaticFormMutation = useMutation({
    mutationFn: async (formData: Partial<StaticForm>) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('static_forms')
        .insert({
          ...formData,
          created_by: user.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['static_forms'] });
      toast({
        title: "Static Form Created",
        description: "Your static form has been created successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create static form: " + error.message,
        variant: "destructive"
      });
    }
  });

  // Update static form mutation
  const updateStaticFormMutation = useMutation({
    mutationFn: async ({ formId, updates }: { formId: string; updates: Partial<StaticForm> }) => {
      const { data, error } = await supabase
        .from('static_forms')
        .update(updates)
        .eq('id', formId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['static_forms'] });
      toast({
        title: "Form Updated",
        description: "Static form has been updated successfully."
      });
    }
  });

  // Delete static form mutation
  const deleteStaticFormMutation = useMutation({
    mutationFn: async (formId: string) => {
      const { error } = await supabase
        .from('static_forms')
        .delete()
        .eq('id', formId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['static_forms'] });
      toast({
        title: "Form Deleted",
        description: "Static form has been deleted successfully."
      });
    }
  });

  return {
    staticForms,
    activeStaticForms,
    isLoading,
    createStaticForm: createStaticFormMutation.mutate,
    updateStaticForm: updateStaticFormMutation.mutate,
    deleteStaticForm: deleteStaticFormMutation.mutate,
  };
};

export const useStaticFormSubmissions = (formId?: string) => {
  const { user } = useAuth();
  
  const { data: submissions = [] } = useQuery({
    queryKey: ['static_form_submissions', formId],
    queryFn: async () => {
      if (!formId) return [];
      
      const { data, error } = await supabase
        .from('static_form_submissions')
        .select('*')
        .eq('form_id', formId)
        .order('submitted_at', { ascending: false });
      
      if (error) throw error;
      return data as StaticFormSubmission[];
    },
    enabled: !!formId && !!user,
  });

  // Submit form data mutation
  const submitFormMutation = useMutation({
    mutationFn: async ({ formId, submissionData }: { formId: string; submissionData: Record<string, any> }) => {
      const { data, error } = await supabase
        .from('static_form_submissions')
        .insert({
          form_id: formId,
          submission_data: submissionData,
          ip_address: null, // Could be populated client-side if needed
          user_agent: navigator.userAgent
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Form Submitted",
        description: "Your response has been recorded successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: "Failed to submit form: " + error.message,
        variant: "destructive"
      });
    }
  });

  return {
    submissions,
    submitForm: submitFormMutation.mutate,
  };
};
