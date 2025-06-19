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

interface CreateStaticFormData {
  name: string;
  description?: string;
  fields?: any[];
  html?: string;
  css?: string;
  javascript?: string;
  is_active?: boolean;
}

export const useStaticForms = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user's static forms with persistent storage
  const { data: staticForms = [], isLoading } = useQuery({
    queryKey: ['static_forms', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Try to get from Supabase first
      const { data, error } = await supabase
        .from('static_forms')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching static forms:', error);
        // Fallback to localStorage
        const savedForms = localStorage.getItem(`static_forms_${user.id}`);
        if (savedForms) {
          try {
            return JSON.parse(savedForms) as StaticForm[];
          } catch (e) {
            console.error('Error parsing saved forms:', e);
            return [];
          }
        }
        return [];
      }
      
      // Save to localStorage as backup
      localStorage.setItem(`static_forms_${user.id}`, JSON.stringify(data));
      return data as StaticForm[];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
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
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Create static form mutation with persistent storage
  const createStaticFormMutation = useMutation({
    mutationFn: async (formData: CreateStaticFormData) => {
      if (!user) throw new Error('User not authenticated');
      
      const newForm = {
        id: Math.random().toString(36).substring(7),
        name: formData.name,
        description: formData.description || null,
        fields: formData.fields || [],
        html: formData.html || '',
        css: formData.css || '',
        javascript: formData.javascript || '',
        is_active: formData.is_active !== undefined ? formData.is_active : true,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Try to save to Supabase
      try {
        const { data, error } = await supabase
          .from('static_forms')
          .insert(newForm)
          .select()
          .single();
        
        if (error) throw error;
        
        // Also save to localStorage
        const existingForms = staticForms;
        const updatedForms = [data, ...existingForms];
        localStorage.setItem(`static_forms_${user.id}`, JSON.stringify(updatedForms));
        
        return data;
      } catch (error) {
        console.error('Error saving to Supabase, using localStorage:', error);
        // Fallback to localStorage only
        const existingForms = staticForms;
        const updatedForms = [newForm, ...existingForms];
        localStorage.setItem(`static_forms_${user.id}`, JSON.stringify(updatedForms));
        return newForm;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['static_forms'] });
      toast({
        title: "Static Form Created",
        description: "Your static form has been created and saved successfully."
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

  // Update static form mutation with persistent storage
  const updateStaticFormMutation = useMutation({
    mutationFn: async ({ formId, updates }: { formId: string; updates: Partial<StaticForm> }) => {
      const updatedForm = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      try {
        // Try to update in Supabase
        const { data, error } = await supabase
          .from('static_forms')
          .update(updatedForm)
          .eq('id', formId)
          .select()
          .single();
        
        if (error) throw error;
        
        // Also update localStorage
        const existingForms = staticForms;
        const updatedForms = existingForms.map(form => 
          form.id === formId ? { ...form, ...updatedForm } : form
        );
        localStorage.setItem(`static_forms_${user?.id}`, JSON.stringify(updatedForms));
        
        return data;
      } catch (error) {
        console.error('Error updating in Supabase, using localStorage:', error);
        // Fallback to localStorage only
        const existingForms = staticForms;
        const updatedForms = existingForms.map(form => 
          form.id === formId ? { ...form, ...updatedForm } : form
        );
        localStorage.setItem(`static_forms_${user?.id}`, JSON.stringify(updatedForms));
        return updatedForms.find(f => f.id === formId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['static_forms'] });
      toast({
        title: "Form Updated",
        description: "Static form has been updated and saved successfully."
      });
    }
  });

  // Soft delete static form mutation (deactivate instead of delete)
  const deleteStaticFormMutation = useMutation({
    mutationFn: async (formId: string) => {
      // Instead of deleting, just deactivate the form
      const updates = { 
        is_active: false,
        updated_at: new Date().toISOString()
      };

      try {
        // Try to update in Supabase
        const { error } = await supabase
          .from('static_forms')
          .update(updates)
          .eq('id', formId);
        
        if (error) throw error;
        
        // Also update localStorage
        const existingForms = staticForms;
        const updatedForms = existingForms.map(form => 
          form.id === formId ? { ...form, ...updates } : form
        );
        localStorage.setItem(`static_forms_${user?.id}`, JSON.stringify(updatedForms));
      } catch (error) {
        console.error('Error updating in Supabase, using localStorage:', error);
        // Fallback to localStorage only
        const existingForms = staticForms;
        const updatedForms = existingForms.map(form => 
          form.id === formId ? { ...form, ...updates } : form
        );
        localStorage.setItem(`static_forms_${user?.id}`, JSON.stringify(updatedForms));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['static_forms'] });
      toast({
        title: "Form Deactivated",
        description: "Static form has been deactivated but preserved for future use."
      });
    }
  });

  return {
    staticForms: staticForms.filter(form => form.is_active), // Only show active forms
    allStaticForms: staticForms, // Include inactive forms for admin view
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
