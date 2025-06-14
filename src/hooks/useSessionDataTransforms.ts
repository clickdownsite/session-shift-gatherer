
import React from 'react';

export const useSessionDataTransforms = (mainPages: any[], subPages: any[], sessions: any[]) => {
  // Optimized data transformation with better memoization
  const transformedMainPages = React.useMemo(() => {
    if (!mainPages?.length || !subPages?.length) {
      return [];
    }

    // Create lookup map for better performance
    const subPageMap = subPages.reduce((acc, subPage) => {
      if (subPage.main_page_id) {
        if (!acc[subPage.main_page_id]) {
          acc[subPage.main_page_id] = [];
        }
        acc[subPage.main_page_id].push({
          ...subPage,
          parentId: subPage.main_page_id,
          fields: subPage.fields || []
        });
      }
      return acc;
    }, {} as Record<string, any[]>);

    return mainPages.map(page => ({
      ...page,
      subPages: subPageMap[page.id] || []
    }));
  }, [mainPages, subPages]);

  const mainPagesById = React.useMemo(() => {
    return transformedMainPages.reduce((acc, page) => {
      acc[page.id] = page;
      return acc;
    }, {} as Record<string, any>);
  }, [transformedMainPages]);

  const transformedSessions = React.useMemo(() => {
    if (!sessions?.length) {
      return [];
    }

    return sessions.map(session => ({
      ...session,
      mainPageId: session.main_page_id,
      currentSubPageId: session.current_sub_page_id,
      pageType: session.page_type,
      createdAt: session.created_at,
      hasNewData: session.has_new_data,
      data: []
    }));
  }, [sessions]);

  return {
    transformedMainPages,
    mainPagesById,
    transformedSessions
  };
};
