
import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { defaultMainPages, defaultSubPages } from '@/data/defaultPages';

export const useMainPages = () => {
  const { user } = useAuth();
  const [mainPages] = useState(() => defaultMainPages);
  
  return {
    data: mainPages,
    isLoading: false,
    error: null,
  };
};

export const useSubPages = () => {
  const { user } = useAuth();
  const [subPages] = useState(() => 
    defaultSubPages.map(page => ({
      ...page,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }))
  );
  
  return {
    data: subPages,
    isLoading: false,
    error: null,
  };
};

export const useCreateDefaultPages = () => {
  return {
    mutate: () => {
      console.log('Default pages already loaded in mock mode');
    },
    isLoading: false,
    error: null,
  };
};
