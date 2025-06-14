
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
    console.log('fetchPageData called with sessionId:', sessionId);
    
    if (!sessionId) {
      console.error('No session ID provided');
      setError('No session ID provided');
      setLoading(false);
      return;
    }

    try {
      console.log('Starting to fetch session data for:', sessionId);
      setLoading(true);
      setError(null);
      
      // First, get the session data
      console.log('Fetching session...');
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select('main_page_id, current_sub_page_id, active')
        .eq('id', sessionId)
        .maybeSingle();

      console.log('Session query result:', { sessionData, sessionError });

      if (sessionError) {
        console.error('Session query error:', sessionError);
        setError(`Failed to load session: ${sessionError.message}`);
        setLoading(false);
        return;
      }

      if (!sessionData) {
        console.error('Session not found for ID:', sessionId);
        setError('Session not found');
        setLoading(false);
        return;
      }

      if (!sessionData.active) {
        console.error('Session is not active:', sessionId);
        setError('Session is no longer active');
        setLoading(false);
        return;
      }

      console.log('Session is valid, fetching main page for ID:', sessionData.main_page_id);

      // Get the main page data
      const { data: mainPageData, error: mainPageError } = await supabase
        .from('main_pages')
        .select('id, name, description')
        .eq('id', sessionData.main_page_id)
        .maybeSingle();

      console.log('Main page query result:', { mainPageData, mainPageError });

      if (mainPageError) {
        console.error('Main page query error:', mainPageError);
        setError(`Failed to load main page: ${mainPageError.message}`);
        setLoading(false);
        return;
      }

      if (!mainPageData) {
        console.error('Main page not found for ID:', sessionData.main_page_id);
        setError('Main page not found');
        setLoading(false);
        return;
      }

      console.log('Main page found, fetching sub pages...');

      // Get sub pages for this main page
      const { data: subPagesData, error: subPagesError } = await supabase
        .from('sub_pages')
        .select('*')
        .eq('main_page_id', sessionData.main_page_id);

      console.log('Sub pages query result:', { subPagesData, subPagesError });

      if (subPagesError) {
        console.error('Sub pages query error:', subPagesError);
        setError(`Failed to load pages: ${subPagesError.message}`);
        setLoading(false);
        return;
      }

      if (!subPagesData || subPagesData.length === 0) {
        console.error('No sub pages found for main page:', sessionData.main_page_id);
        setError('No pages found for this session');
        setLoading(false);
        return;
      }

      console.log('All data loaded successfully, setting state...');

      // Set the data
      setMainPage(mainPageData as MainPageData);
      setSubPages(subPagesData as SubPageData[]);
      
      // Find current sub page or default to first
      const current = subPagesData.find(sp => sp.id === sessionData.current_sub_page_id) || subPagesData[0];
      setCurrentSubPage(current as SubPageData);
      
      console.log('Session data loaded successfully:', {
        mainPage: mainPageData,
        currentSubPage: current,
        totalSubPages: subPagesData.length
      });
      
    } catch (error) {
      console.error('Unexpected error fetching page data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to load page: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    console.log('useEffect triggered with sessionId:', sessionId);
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
