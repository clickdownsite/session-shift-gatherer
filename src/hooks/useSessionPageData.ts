
import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided');
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchPageData = async () => {
      try {
        console.log('Fetching session data for:', sessionId);
        setLoading(true);
        setError(null);
        
        // First, get the session data
        const { data: sessionData, error: sessionError } = await supabase
          .from('sessions')
          .select('main_page_id, current_sub_page_id, active')
          .eq('id', sessionId)
          .single();

        if (!isMounted) return;

        if (sessionError) {
          console.error('Session query error:', sessionError);
          if (sessionError.code === 'PGRST116') {
            setError('Session not found. The session may have been deleted or the ID is incorrect.');
          } else {
            setError(`Database error: ${sessionError.message}`);
          }
          setLoading(false);
          return;
        }

        if (!sessionData) {
          setError('Session not found. The session may have been deleted.');
          setLoading(false);
          return;
        }

        if (!sessionData.active) {
          setError('Session is no longer active. It may have been closed.');
          setLoading(false);
          return;
        }

        const { main_page_id, current_sub_page_id } = sessionData;
        
        // Get main page data
        const { data: mainPageData, error: mainPageError } = await supabase
          .from('main_pages')
          .select('*')
          .eq('id', main_page_id)
          .single();

        if (!isMounted) return;

        if (mainPageError) {
          console.error('Main page query error:', mainPageError);
          setError(`Main page not found: ${mainPageError.message}`);
          setLoading(false);
          return;
        }

        // Get all sub pages for this main page
        const { data: allSubPages, error: subPagesError } = await supabase
          .from('sub_pages')
          .select('*')
          .eq('main_page_id', main_page_id);

        if (!isMounted) return;

        if (subPagesError) {
          console.error('Sub pages query error:', subPagesError);
          setError(`Sub pages error: ${subPagesError.message}`);
          setLoading(false);
          return;
        }

        if (!allSubPages || allSubPages.length === 0) {
          setError('No sub-pages found for this session.');
          setLoading(false);
          return;
        }

        setMainPage(mainPageData as MainPageData);
        setSubPages(allSubPages as SubPageData[]);
        
        const current = allSubPages.find(sp => sp.id === current_sub_page_id);
        if (current) {
          setCurrentSubPage(current as SubPageData);
        } else {
          // Fallback to first sub page
          setCurrentSubPage(allSubPages[0] as SubPageData);
        }

      } catch (error) {
        if (!isMounted) return;
        console.error('Error fetching page data:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setError(`Failed to load page: ${errorMessage}`);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPageData();

    return () => {
      isMounted = false;
    };
  }, [sessionId]);

  return { mainPage, subPages, currentSubPage, loading, error, setCurrentSubPage };
};
