
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ABTest {
  id: string;
  name: string;
  description: string | null;
  variants: Array<{
    id: string;
    name: string;
    config: Record<string, any>;
  }>;
  traffic_split: Record<string, number>;
  target_pages: string[];
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ABTestAssignment {
  id: string;
  test_id: string;
  session_id: string;
  variant_id: string;
  assigned_at: string;
}

export const useABTesting = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeVariants, setActiveVariants] = useState<Record<string, string>>({});

  // Fetch active A/B tests
  const { data: activeTests = [] } = useQuery({
    queryKey: ['active_ab_tests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ab_tests')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      return data as ABTest[];
    }
  });

  // Fetch user's A/B tests
  const { data: userTests = [] } = useQuery({
    queryKey: ['user_ab_tests', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('ab_tests')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ABTest[];
    },
    enabled: !!user
  });

  // Create A/B test
  const createTestMutation = useMutation({
    mutationFn: async (testData: {
      name: string;
      description?: string;
      variants: Array<{ id: string; name: string; config: Record<string, any> }>;
      traffic_split: Record<string, number>;
      target_pages: string[];
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('ab_tests')
        .insert({
          name: testData.name,
          description: testData.description,
          variants: testData.variants,
          traffic_split: testData.traffic_split,
          target_pages: testData.target_pages,
          created_by: user.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_ab_tests'] });
    }
  });

  // Assign variant to session
  const assignVariantMutation = useMutation({
    mutationFn: async ({ testId, sessionId, variantId }: {
      testId: string;
      sessionId: string;
      variantId: string;
    }) => {
      const { data, error } = await supabase
        .from('ab_test_assignments')
        .insert({
          test_id: testId,
          session_id: sessionId,
          variant_id: variantId
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  // Get or assign variant for current session
  const getVariantForTest = async (testId: string, sessionId: string): Promise<string> => {
    // Check if already assigned
    const existingAssignment = activeVariants[testId];
    if (existingAssignment) return existingAssignment;

    // Find the test
    const test = activeTests.find(t => t.id === testId);
    if (!test) throw new Error('Test not found');

    // Check if current page matches target pages
    const currentPath = window.location.pathname;
    const matchesTarget = test.target_pages.some(page => 
      currentPath.includes(page) || page === '*'
    );
    
    if (!matchesTarget) return 'control';

    // Randomly assign variant based on traffic split
    const random = Math.random();
    let cumulativeProbability = 0;
    
    for (const [variantId, percentage] of Object.entries(test.traffic_split)) {
      cumulativeProbability += percentage / 100;
      if (random <= cumulativeProbability) {
        // Store assignment
        setActiveVariants(prev => ({ ...prev, [testId]: variantId }));
        
        // Save to database
        assignVariantMutation.mutate({ testId, sessionId, variantId });
        
        return variantId;
      }
    }
    
    return 'control';
  };

  // Get variant configuration
  const getVariantConfig = (testId: string, variantId: string) => {
    const test = activeTests.find(t => t.id === testId);
    if (!test) return {};
    
    const variant = test.variants.find(v => v.id === variantId);
    return variant?.config || {};
  };

  return {
    activeTests,
    userTests,
    activeVariants,
    createTest: createTestMutation.mutate,
    getVariantForTest,
    getVariantConfig,
    isLoading: assignVariantMutation.isPending
  };
};
