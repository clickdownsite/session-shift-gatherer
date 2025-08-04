
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';
import type { MainPage, SubPage } from '@/types/session';

// Mock data for demonstration
const mockMainPages: (MainPage & { subPages: SubPage[] })[] = [
  {
    id: 'contact_form',
    name: 'Contact Form',
    description: 'Simple contact form page',
    subPages: [
      {
        id: 'contact_basic',
        main_page_id: 'contact_form',
        name: 'Basic Contact',
        description: 'Basic contact form',
        fields: ['name', 'email', 'message'],
        html: '<div class="form-container"><h2>Contact Us</h2><form><input name="name" placeholder="Name" required /><input name="email" type="email" placeholder="Email" required /><textarea name="message" placeholder="Message" required></textarea><button type="submit">Send</button></form></div>',
        css: '.form-container { max-width: 500px; margin: 0 auto; padding: 20px; }',
        javascript: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
  }
];

export const useUserPages = () => {
  const { user } = useAuth();

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

  // Use mock data for now
  const mainPages = mockMainPages;
  const isLoading = false;

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

  // Event handlers (mock implementations)
  const handleCreateMainPage = async () => {
    if (!mainPageForm.name.trim()) {
      toast.error('Please enter a page name');
      return;
    }
    toast.success('Main page created successfully (demo mode)');
    resetMainPageForm();
    setIsCreateDialogOpen(false);
  };

  const handleUpdateMainPage = async () => {
    if (!selectedMainPage || !mainPageForm.name.trim()) {
      toast.error('Please enter a page name');
      return;
    }
    toast.success('Main page updated successfully (demo mode)');
    resetMainPageForm();
    setIsEditDialogOpen(false);
    setSelectedMainPage(null);
  };

  const handleDeleteMainPage = async (mainPageId: string) => {
    if (!confirm('Are you sure you want to delete this page and all its sub-pages?')) return;
    toast.success('Main page deleted successfully (demo mode)');
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
    toast.success('Sub page created successfully (demo mode)');
    resetSubPageForm();
    setIsSubPageDialogOpen(false);
  };

  const handleUpdateSubPage = async () => {
    if (!selectedMainPage || !selectedSubPage || !subPageForm.name.trim()) {
      toast.error('Please enter a sub-page name');
      return;
    }
    toast.success('Sub page updated successfully (demo mode)');
    resetSubPageForm();
    setIsSubPageDialogOpen(false);
    setSelectedSubPage(null);
  };

  const handleDeleteSubPage = async (mainPageId: string, subPageId: string) => {
    if (!confirm('Are you sure you want to delete this sub-page?')) return;
    toast.success('Sub page deleted successfully (demo mode)');
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
      toast.success('Session created successfully! (demo mode)');
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
    isLoading,
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
