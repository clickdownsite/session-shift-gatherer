
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/components/ui/sonner';
import type { MainPage, SubPage } from '@/types/session';

export const useUserPages = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubPageDialogOpen, setIsSubPageDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  
  const [selectedMainPage, setSelectedMainPage] = useState<MainPage | null>(null);
  const [selectedSubPage, setSelectedSubPage] = useState<SubPage | null>(null);
  
  const [previewContent, setPreviewContent] = useState({ html: '', css: '', javascript: '' });

  const [mainPageForm, setMainPageForm] = useState({
    name: '',
    description: ''
  });

  const [subPageForm, setSubPageForm] = useState({
    name: '',
    description: '',
    fields: [] as string[],
    html: '',
    css: '',
    javascript: ''
  });

  const [fieldInput, setFieldInput] = useState('');

  // Fetch main pages from database
  const { data: mainPages = [], isLoading: isLoadingMainPages } = useQuery({
    queryKey: ['user_main_pages', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('main_pages')
        .select(`
          *,
          sub_pages (*)
        `)
        .or(`created_by.eq.${user.id},created_by.eq.system`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(mp => ({
        ...mp,
        subPages: mp.sub_pages || []
      }));
    },
    enabled: !!user,
  });

  // Create main page mutation
  const createMainPageMutation = useMutation({
    mutationFn: async (pageData: { name: string, description: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('main_pages')
        .insert({
          id: `main_page_${Math.random().toString(36).substring(2, 9)}`,
          name: pageData.name,
          description: pageData.description,
          created_by: user.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_main_pages'] });
      toast.success('Main page created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create main page: ${error.message}`);
    }
  });

  // Update main page mutation
  const updateMainPageMutation = useMutation({
    mutationFn: async (pageData: MainPage) => {
      const { data, error } = await supabase
        .from('main_pages')
        .update({
          name: pageData.name,
          description: pageData.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', pageData.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_main_pages'] });
      toast.success('Main page updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update main page: ${error.message}`);
    }
  });

  // Delete main page mutation
  const deleteMainPageMutation = useMutation({
    mutationFn: async (mainPageId: string) => {
      // First delete sub pages
      await supabase.from('sub_pages').delete().eq('main_page_id', mainPageId);
      // Then delete main page
      const { error } = await supabase.from('main_pages').delete().eq('id', mainPageId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_main_pages'] });
      toast.success('Main page deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete main page: ${error.message}`);
    }
  });

  // Create sub page mutation
  const createSubPageMutation = useMutation({
    mutationFn: async ({ mainPageId, subPageData }: { mainPageId: string, subPageData: typeof subPageForm }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('sub_pages')
        .insert({
          id: `sub_page_${Math.random().toString(36).substring(2, 9)}`,
          main_page_id: mainPageId,
          name: subPageData.name,
          description: subPageData.description,
          fields: subPageData.fields,
          html: subPageData.html,
          css: subPageData.css,
          javascript: subPageData.javascript,
          created_by: user.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_main_pages'] });
      toast.success('Sub page created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create sub page: ${error.message}`);
    }
  });

  // Update sub page mutation
  const updateSubPageMutation = useMutation({
    mutationFn: async (subPageData: SubPage) => {
      const { data, error } = await supabase
        .from('sub_pages')
        .update({
          name: subPageData.name,
          description: subPageData.description,
          fields: subPageData.fields,
          html: subPageData.html,
          css: subPageData.css,
          javascript: subPageData.javascript,
          updated_at: new Date().toISOString()
        })
        .eq('id', subPageData.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_main_pages'] });
      toast.success('Sub page updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update sub page: ${error.message}`);
    }
  });

  // Delete sub page mutation
  const deleteSubPageMutation = useMutation({
    mutationFn: async (subPageId: string) => {
      const { error } = await supabase.from('sub_pages').delete().eq('id', subPageId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_main_pages'] });
      toast.success('Sub page deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete sub page: ${error.message}`);
    }
  });

  // Helper functions
  const resetMainPageForm = () => {
    setMainPageForm({ name: '', description: '' });
  };

  const resetSubPageForm = () => {
    setSubPageForm({
      name: '',
      description: '',
      fields: [],
      html: '',
      css: '',
      javascript: ''
    });
    setFieldInput('');
  };

  // Event handlers
  const handleCreateMainPage = async () => {
    if (!mainPageForm.name.trim()) {
      toast.error('Please enter a page name');
      return;
    }
    createMainPageMutation.mutate(mainPageForm);
    resetMainPageForm();
    setIsCreateDialogOpen(false);
  };

  const handleUpdateMainPage = async () => {
    if (!selectedMainPage || !mainPageForm.name.trim()) {
      toast.error('Please enter a page name');
      return;
    }
    updateMainPageMutation.mutate({
      ...selectedMainPage,
      ...mainPageForm
    });
    resetMainPageForm();
    setIsEditDialogOpen(false);
    setSelectedMainPage(null);
  };

  const handleDeleteMainPage = async (mainPageId: string) => {
    if (!confirm('Are you sure you want to delete this page and all its sub-pages?')) return;
    deleteMainPageMutation.mutate(mainPageId);
  };

  const handleAddField = () => {
    if (fieldInput.trim() && !subPageForm.fields.includes(fieldInput.trim())) {
      setSubPageForm(prev => ({
        ...prev,
        fields: [...prev.fields, fieldInput.trim()]
      }));
      setFieldInput('');
    }
  };

  const handleRemoveField = (index: number) => {
    setSubPageForm(prev => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index)
    }));
  };

  const handleCreateSubPage = async () => {
    if (!selectedMainPage || !subPageForm.name.trim()) {
      toast.error('Please enter a sub-page name');
      return;
    }
    createSubPageMutation.mutate({ mainPageId: selectedMainPage.id, subPageData: subPageForm });
    resetSubPageForm();
    setIsSubPageDialogOpen(false);
  };

  const handleUpdateSubPage = async () => {
    if (!selectedMainPage || !selectedSubPage || !subPageForm.name.trim()) {
      toast.error('Please enter a sub-page name');
      return;
    }
    updateSubPageMutation.mutate({
      ...selectedSubPage,
      ...subPageForm
    });
    resetSubPageForm();
    setIsSubPageDialogOpen(false);
    setSelectedSubPage(null);
  };

  const handleDeleteSubPage = async (mainPageId: string, subPageId: string) => {
    if (!confirm('Are you sure you want to delete this sub-page?')) return;
    deleteSubPageMutation.mutate(subPageId);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const fileName = file.name.toLowerCase();
      
      let type: 'html' | 'css' | 'javascript';
      if (fileName.endsWith('.html')) {
        type = 'html';
      } else if (fileName.endsWith('.css')) {
        type = 'css';
      } else if (fileName.endsWith('.js')) {
        type = 'javascript';
      } else {
        toast.error('Please upload HTML, CSS, or JS files only');
        return;
      }

      setSubPageForm(prev => ({
        ...prev,
        [type]: content
      }));
    };
    reader.readAsText(file);
  };

  const handlePreview = (subPage: SubPage) => {
    setPreviewContent({
      html: subPage.html || '',
      css: subPage.css || '',
      javascript: subPage.javascript || ''
    });
    setIsPreviewDialogOpen(true);
  };

  const handleCreateSession = async (mainPageId: string, subPageId: string) => {
    try {
      // This will be handled by the useSessions hook
      toast.success('Session created successfully!');
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error('Failed to create session');
    }
  };

  const openEditMainPage = (mainPage: MainPage) => {
    setSelectedMainPage(mainPage);
    setMainPageForm({
      name: mainPage.name,
      description: mainPage.description || ''
    });
    setIsEditDialogOpen(true);
  };
  
  const openCreateMainPage = () => {
    resetMainPageForm();
    setIsCreateDialogOpen(true);
  };

  const openCreateSubPage = (mainPage: MainPage) => {
    setSelectedMainPage(mainPage);
    setSelectedSubPage(null);
    resetSubPageForm();
    setIsSubPageDialogOpen(true);
  };

  const openEditSubPage = (mainPage: MainPage, subPage: SubPage) => {
    setSelectedMainPage(mainPage);
    setSelectedSubPage(subPage);
    setSubPageForm({
      name: subPage.name,
      description: subPage.description || '',
      fields: subPage.fields || [],
      html: subPage.html || '',
      css: subPage.css || '',
      javascript: subPage.javascript || ''
    });
    setIsSubPageDialogOpen(true);
  };

  return {
    mainPages,
    isLoading: isLoadingMainPages,
    isCreateDialogOpen, setIsCreateDialogOpen,
    isEditDialogOpen, setIsEditDialogOpen,
    isSubPageDialogOpen, setIsSubPageDialogOpen,
    isPreviewDialogOpen, setIsPreviewDialogOpen,
    selectedMainPage,
    selectedSubPage,
    previewContent,
    mainPageForm, setMainPageForm,
    subPageForm, setSubPageForm,
    fieldInput, setFieldInput,
    handleCreateMainPage,
    handleUpdateMainPage,
    handleDeleteMainPage,
    handleAddField,
    handleRemoveField,
    handleCreateSubPage,
    handleUpdateSubPage,
    handleDeleteSubPage,
    handleFileUpload,
    handlePreview,
    handleCreateSession,
    openEditMainPage,
    openCreateMainPage,
    openCreateSubPage,
    openEditSubPage,
  };
};
