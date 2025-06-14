
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface MainPageData {
  id: string;
  name: string;
  description: string;
}

export interface SubPageData {
  id: string;
  name: string;
  description: string;
  html: string;
  css: string;
  javascript: string;
  fields: string[];
  main_page_id: string;
}

export const useSessionPageData = (sessionId: string | undefined) => {
  const [mainPage, setMainPage] = useState<MainPageData | null>(null);
  const [currentSubPage, setCurrentSubPage] = useState<SubPageData | null>(null);
  const [subPages, setSubPages] = useState<SubPageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPageData = useCallback(async () => {
    if (!sessionId) {
      setError('No session ID provided');
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching session data for:', sessionId);
      setLoading(true);
      setError(null);
      
      // First, get the session data
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select('main_page_id, current_sub_page_id, active')
        .eq('id', sessionId)
        .maybeSingle();

      if (sessionError) {
        console.error('Session query error:', sessionError);
        setError(`Failed to load session: ${sessionError.message}`);
        setLoading(false);
        return;
      }

      if (!sessionData) {
        setError('Session not found');
        setLoading(false);
        return;
      }

      if (!sessionData.active) {
        setError('Session is no longer active');
        setLoading(false);
        return;
      }

      // Get the main page data
      const { data: mainPageData, error: mainPageError } = await supabase
        .from('main_pages')
        .select('id, name, description')
        .eq('id', sessionData.main_page_id)
        .maybeSingle();

      if (mainPageError) {
        console.error('Main page query error:', mainPageError);
        setError(`Failed to load main page: ${mainPageError.message}`);
        setLoading(false);
        return;
      }

      if (!mainPageData) {
        setError('Main page not found');
        setLoading(false);
        return;
      }

      // Get sub pages for this main page
      const { data: subPagesData, error: subPagesError } = await supabase
        .from('sub_pages')
        .select('*')
        .eq('main_page_id', sessionData.main_page_id);

      if (subPagesError) {
        console.error('Sub pages query error:', subPagesError);
        setError(`Failed to load pages: ${subPagesError.message}`);
        setLoading(false);
        return;
      }

      if (!subPagesData || subPagesData.length === 0) {
        setError('No pages found for this session');
        setLoading(false);
        return;
      }

      // Set the data
      setMainPage(mainPageData as MainPageData);
      setSubPages(subPagesData as SubPageData[]);
      
      // Find current sub page or default to first
      const current = subPagesData.find(sp => sp.id === sessionData.current_sub_page_id) || subPagesData[0];
      setCurrentSubPage(current as SubPageData);
      
      console.log('Session data loaded successfully');
      
    } catch (error) {
      console.error('Error fetching page data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to load page: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchPageData();
  }, [fetchPageData]);

  return { 
    mainPage, 
    subPages, 
    currentSubPage, 
    loading, 
    error, 
    setCurrentSubPage,
    refetch: fetchPageData
  };
};
