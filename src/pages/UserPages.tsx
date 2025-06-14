
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye, Copy } from 'lucide-react';
import { useSessionContext } from '@/contexts/SessionContext';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/sonner';
import FileUpload from '@/components/FileUpload';
import MainPageDialogContent from '@/components/user-pages/MainPageDialogContent';
import SubPageDialogContent from '@/components/user-pages/SubPageDialogContent';
import PreviewDialogContent from '@/components/user-pages/PreviewDialogContent';

const UserPages = () => {
  const { user } = useAuth();
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
  const [selectedMainPage, setSelectedMainPage] = useState<any>(null);
  const [selectedSubPage, setSelectedSubPage] = useState<any>(null);
  const [previewContent, setPreviewContent] = useState({ html: '', css: '', javascript: '' });

  // Form states
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

  const handlePreview = (subPage: any) => {
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

  const openEditMainPage = (mainPage: any) => {
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

  const openCreateSubPage = (mainPage: any) => {
    setSelectedMainPage(mainPage);
    setSelectedSubPage(null);
    resetSubPageForm();
    setIsSubPageDialogOpen(true);
  };

  const openEditSubPage = (mainPage: any, subPage: any) => {
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

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Please log in to manage your pages.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Custom Pages</h1>
        <Button onClick={openCreateMainPage}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Page
        </Button>
      </div>

      <div className="grid gap-6">
        {mainPages.map((mainPage) => (
          <Card key={mainPage.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{mainPage.name}</CardTitle>
                  {mainPage.description && (
                    <p className="text-muted-foreground mt-1">{mainPage.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEditMainPage(mainPage)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => openCreateSubPage(mainPage)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleDeleteMainPage(mainPage.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h4 className="font-semibold">Sub Pages ({mainPage.subPages?.length || 0})</h4>
                <div className="grid gap-4">
                  {mainPage.subPages?.map((subPage: any) => (
                    <Card key={subPage.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h5 className="font-medium">{subPage.name}</h5>
                            {subPage.description && (
                              <p className="text-sm text-muted-foreground mt-1">{subPage.description}</p>
                            )}
                            {subPage.fields && subPage.fields.length > 0 && (
                              <div className="mt-2">
                                <p className="text-sm font-medium">Form Fields:</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {subPage.fields.map((field: string) => (
                                    <Badge key={field} variant="secondary" className="text-xs">
                                      {field}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handlePreview(subPage)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => openEditSubPage(mainPage, subPage)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleCreateSession(mainPage.id, subPage.id)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDeleteSubPage(mainPage.id, subPage.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )) || (
                    <p className="text-muted-foreground text-center py-4">
                      No sub-pages yet. Click the + button to add one.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Main Page Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <MainPageDialogContent
            mainPageForm={mainPageForm}
            setMainPageForm={setMainPageForm}
            handleSubmit={handleCreateMainPage}
            closeDialog={() => setIsCreateDialogOpen(false)}
            isEditing={false}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Main Page Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <MainPageDialogContent
            mainPageForm={mainPageForm}
            setMainPageForm={setMainPageForm}
            handleSubmit={handleUpdateMainPage}
            closeDialog={() => setIsEditDialogOpen(false)}
            isEditing={true}
          />
        </DialogContent>
      </Dialog>

      {/* Create/Edit Sub Page Dialog */}
      <Dialog open={isSubPageDialogOpen} onOpenChange={setIsSubPageDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <SubPageDialogContent
            subPageForm={subPageForm}
            setSubPageForm={setSubPageForm}
            fieldInput={fieldInput}
            setFieldInput={setFieldInput}
            handleAddField={handleAddField}
            handleRemoveField={handleRemoveField}
            handleFileUpload={handleFileUpload}
            handleSubmit={selectedSubPage ? handleUpdateSubPage : handleCreateSubPage}
            closeDialog={() => setIsSubPageDialogOpen(false)}
            isEditing={!!selectedSubPage}
          />
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <PreviewDialogContent previewContent={previewContent} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserPages;
