
import { useState } from 'react';
import { useSessionContext } from '@/contexts/SessionContext';
import { toast } from '@/components/ui/sonner';
import type { MainPage, SubPage } from '@/types/session';

export const useUserPages = () => {
  const {
    mainPages,
    addMainPage,
    addSubPage,
    updateMainPage,
    updateSubPage,
    deleteMainPage,
    deleteSubPage,
    addSession
  } = useSessionContext();

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

  const handleCreateMainPage = async () => {
    if (!mainPageForm.name.trim()) {
      toast.error('Please enter a page name');
      return;
    }
    try {
      await addMainPage(mainPageForm);
      resetMainPageForm();
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating main page:', error);
    }
  };

  const handleUpdateMainPage = async () => {
    if (!selectedMainPage || !mainPageForm.name.trim()) {
      toast.error('Please enter a page name');
      return;
    }
    try {
      await updateMainPage({
        ...selectedMainPage,
        ...mainPageForm
      });
      resetMainPageForm();
      setIsEditDialogOpen(false);
      setSelectedMainPage(null);
    } catch (error) {
      console.error('Error updating main page:', error);
    }
  };

  const handleDeleteMainPage = async (mainPageId: string) => {
    if (!confirm('Are you sure you want to delete this page and all its sub-pages?')) return;
    try {
      await deleteMainPage(mainPageId);
    } catch (error) {
      console.error('Error deleting main page:', error);
    }
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

  const handleRemoveField = (field: string) => {
    setSubPageForm(prev => ({
      ...prev,
      fields: prev.fields.filter(f => f !== field)
    }));
  };

  const handleCreateSubPage = async () => {
    if (!selectedMainPage || !subPageForm.name.trim()) {
      toast.error('Please enter a sub-page name');
      return;
    }
    try {
      await addSubPage(selectedMainPage.id, subPageForm);
      resetSubPageForm();
      setIsSubPageDialogOpen(false);
    } catch (error) {
      console.error('Error creating sub page:', error);
    }
  };

  const handleUpdateSubPage = async () => {
    if (!selectedMainPage || !selectedSubPage || !subPageForm.name.trim()) {
      toast.error('Please enter a sub-page name');
      return;
    }
    try {
      await updateSubPage(selectedMainPage.id, {
        ...selectedSubPage,
        ...subPageForm
      });
      resetSubPageForm();
      setIsSubPageDialogOpen(false);
      setSelectedSubPage(null);
    } catch (error) {
      console.error('Error updating sub page:', error);
    }
  };

  const handleDeleteSubPage = async (mainPageId: string, subPageId: string) => {
    if (!confirm('Are you sure you want to delete this sub-page?')) return;
    try {
      await deleteSubPage(mainPageId, subPageId);
    } catch (error) {
      console.error('Error deleting sub page:', error);
    }
  };

  const handleFileUpload = (content: string, type: 'html' | 'css' | 'javascript') => {
    setSubPageForm(prev => ({
      ...prev,
      [type]: content
    }));
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
      addSession(mainPageId, subPageId);
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
