
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

    const fetchPageData = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data: sessionData, error: sessionError } = await supabase
          .from('sessions')
          .select('main_page_id, current_sub_page_id')
          .eq('id', sessionId)
          .maybeSingle();

        if (sessionError) throw sessionError;

        if (!sessionData) {
          setError('Session not found. It may have been closed or never existed.');
          setLoading(false);
          return;
        }

        const { main_page_id, current_sub_page_id } = sessionData;

        const [mainPageRes, subPagesRes] = await Promise.all([
          supabase.from('main_pages').select('*').eq('id', main_page_id).single(),
          supabase.from('sub_pages').select('*').eq('main_page_id', main_page_id)
        ]);

        const { data: mainPageData, error: mainPageError } = mainPageRes;
        if (mainPageError) throw mainPageError;
        setMainPage(mainPageData as MainPageData);

        const { data: subPagesData, error: subPagesError } = subPagesRes;
        if (subPagesError) throw subPagesError;

        if (subPagesData && subPagesData.length > 0) {
          setSubPages(subPagesData as SubPageData[]);
          
          const current = subPagesData.find(sp => sp.id === current_sub_page_id);
          if (current) {
            setCurrentSubPage(current as SubPageData);
          } else {
            setCurrentSubPage(subPagesData[0] as SubPageData); // Fallback
          }
        } else {
          setError('No sub-pages found for this session.');
        }

      } catch (error) {
        console.error('Error fetching page:', error);
        setError(`Failed to load page: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, [sessionId]);

  return { mainPage, subPages, currentSubPage, loading, error, setCurrentSubPage };
};
