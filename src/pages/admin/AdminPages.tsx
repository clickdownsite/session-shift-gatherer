import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye, Loader2 } from 'lucide-react';
import { useMainPages, useSubPages } from '@/hooks/usePageTemplates';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import FileUpload from '@/components/FileUpload';
import type { MainPage, SubPage } from '@/types/session';

type MainPageWithSubPages = MainPage & { subPages: SubPage[] };

const AdminPages = () => {
  const queryClient = useQueryClient();
  const { data: mainPagesData, isLoading: isLoadingMainPages } = useMainPages();
  const { data: subPagesData, isLoading: isLoadingSubPages } = useSubPages();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubPageDialogOpen, setIsSubPageDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [selectedMainPage, setSelectedMainPage] = useState<MainPageWithSubPages | null>(null);
  const [selectedSubPage, setSelectedSubPage] = useState<SubPage | null>(null);
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

  const mainPages: MainPageWithSubPages[] = useMemo(() => {
    if (!mainPagesData || !subPagesData) return [];
    return mainPagesData.map(mp => ({
      ...mp,
      subPages: subPagesData.filter(sp => sp.main_page_id === mp.id).sort((a,b) => a.name.localeCompare(b.name))
    }));
  }, [mainPagesData, subPagesData]);

  const { mutate: addMainPage } = useMutation({
    mutationFn: async (pageData: { name: string, description: string }) => {
      const { data, error } = await supabase.from('main_pages').insert({
          id: `main_page_${Math.random().toString(36).substring(2, 9)}`,
          name: pageData.name,
          description: pageData.description
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['main_pages'] });
        toast.success('Main page created successfully');
        setIsCreateDialogOpen(false);
        resetMainPageForm();
    },
    onError: (error) => {
        toast.error(`Failed to create main page: ${error.message}`);
    }
  });

  const { mutate: updateMainPage } = useMutation({
    mutationFn: async (pageData: Partial<MainPage>) => {
      const { id, ...updates } = pageData;
      if (!id) throw new Error("ID is required for update");
      const { data, error } = await supabase.from('main_pages').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['main_pages'] });
      toast.success('Main page updated successfully');
      setIsEditDialogOpen(false);
      resetMainPageForm();
    },
    onError: (error) => {
      toast.error(`Failed to update main page: ${error.message}`);
    }
  });

  const { mutate: deleteMainPage } = useMutation({
    mutationFn: async (mainPageId: string) => {
      const { error: subPageError } = await supabase.from('sub_pages').delete().eq('main_page_id', mainPageId);
      if (subPageError) throw subPageError;
      const { error: mainPageError } = await supabase.from('main_pages').delete().eq('id', mainPageId);
      if (mainPageError) throw mainPageError;
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['main_pages'] });
        queryClient.invalidateQueries({ queryKey: ['sub_pages'] });
        toast.success('Main page and its sub-pages deleted.');
    },
    onError: (error) => {
        toast.error(`Failed to delete main page: ${error.message}`);
    }
  });

  const { mutate: addSubPage } = useMutation({
    mutationFn: async ({ mainPageId, subPageData }: { mainPageId: string, subPageData: typeof subPageForm }) => {
      const { data, error } = await supabase.from('sub_pages').insert({
        id: `sub_page_${Math.random().toString(36).substring(2, 9)}`,
        main_page_id: mainPageId,
        ...subPageData
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sub_pages'] });
      toast.success('Sub page created successfully');
      setIsSubPageDialogOpen(false);
      resetSubPageForm();
    },
    onError: (error) => {
      toast.error(`Failed to create sub page: ${error.message}`);
    }
  });

  const { mutate: updateSubPage } = useMutation({
    mutationFn: async ({ subPageData }: { subPageData: Partial<SubPage> & {id: string} }) => {
      const { id, main_page_id, created_at, ...updates } = subPageData;
      const { data, error } = await supabase.from('sub_pages').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sub_pages'] });
      toast.success('Sub page updated successfully');
      setIsSubPageDialogOpen(false);
      resetSubPageForm();
    },
    onError: (error) => {
      toast.error(`Failed to update sub page: ${error.message}`);
    }
  });

  const { mutate: deleteSubPage } = useMutation({
    mutationFn: async ({ subPageId }: { mainPageId: string, subPageId: string }) => {
      const { error } = await supabase.from('sub_pages').delete().eq('id', subPageId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sub_pages'] });
      toast.success('Sub page deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete sub page: ${error.message}`);
    }
  });

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
    addMainPage(mainPageForm);
  };

  const handleUpdateMainPage = async () => {
    if (!selectedMainPage || !mainPageForm.name.trim()) {
      toast.error('Please enter a page name');
      return;
    }
    updateMainPage({
      id: selectedMainPage.id,
      ...mainPageForm
    });
  };

  const handleDeleteMainPage = async (mainPageId: string) => {
    if (!confirm('Are you sure you want to delete this page and all its sub-pages?')) return;
    deleteMainPage(mainPageId);
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
    addSubPage({ mainPageId: selectedMainPage.id, subPageData: subPageForm });
  };

  const handleUpdateSubPage = async () => {
    if (!selectedMainPage || !selectedSubPage || !subPageForm.name.trim()) {
      toast.error('Please enter a sub-page name');
      return;
    }
    updateSubPage({
      subPageData: {
        id: selectedSubPage.id,
        ...subPageForm
      }
    });
  };

  const handleDeleteSubPage = async (mainPageId: string, subPageId: string) => {
    if (!confirm('Are you sure you want to delete this sub-page?')) return;
    deleteSubPage({ mainPageId, subPageId });
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

  const openEditMainPage = (mainPage: any) => {
    setSelectedMainPage(mainPage);
    setMainPageForm({
      name: mainPage.name,
      description: mainPage.description || ''
    });
    setIsEditDialogOpen(true);
  };

  const openCreateSubPage = (mainPage: any) => {
    setSelectedMainPage(mainPage);
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

  if (isLoadingMainPages || isLoadingSubPages) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Page Management</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Page
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Main Page</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Page Name</Label>
                <Input
                  id="name"
                  value={mainPageForm.name}
                  onChange={(e) => setMainPageForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter page name"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={mainPageForm.description}
                  onChange={(e) => setMainPageForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter page description"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateMainPage}>Create Page</Button>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
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
                  {mainPage.subPages?.map((subPage: SubPage) => (
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

      {/* Edit Main Page Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Main Page</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Page Name</Label>
              <Input
                id="edit-name"
                value={mainPageForm.name}
                onChange={(e) => setMainPageForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter page name"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={mainPageForm.description}
                onChange={(e) => setMainPageForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter page description"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdateMainPage}>Update Page</Button>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Sub Page Dialog */}
      <Dialog open={isSubPageDialogOpen} onOpenChange={setIsSubPageDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedSubPage ? 'Edit Sub Page' : 'Create New Sub Page'}
            </DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="fields">Form Fields</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div>
                <Label htmlFor="sub-name">Sub Page Name</Label>
                <Input
                  id="sub-name"
                  value={subPageForm.name}
                  onChange={(e) => setSubPageForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter sub page name"
                />
              </div>
              <div>
                <Label htmlFor="sub-description">Description</Label>
                <Textarea
                  id="sub-description"
                  value={subPageForm.description}
                  onChange={(e) => setSubPageForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter sub page description"
                />
              </div>
            </TabsContent>

            <TabsContent value="fields" className="space-y-4">
              <div>
                <Label>Form Fields</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={fieldInput}
                    onChange={(e) => setFieldInput(e.target.value)}
                    placeholder="Enter field name (e.g., email, password)"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddField()}
                  />
                  <Button onClick={handleAddField}>Add Field</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {subPageForm.fields.map((field) => (
                    <Badge key={field} variant="secondary" className="cursor-pointer">
                      {field}
                      <button
                        onClick={() => handleRemoveField(field)}
                        className="ml-2 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label htmlFor="html">HTML Content</Label>
                    <FileUpload
                      onFileUpload={handleFileUpload}
                      acceptedTypes={['html']}
                      className="text-xs"
                    />
                  </div>
                  <Textarea
                    id="html"
                    value={subPageForm.html}
                    onChange={(e) => setSubPageForm(prev => ({ ...prev, html: e.target.value }))}
                    placeholder="Enter HTML content"
                    className="font-mono text-sm min-h-[200px]"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label htmlFor="css">CSS Styles</Label>
                    <FileUpload
                      onFileUpload={handleFileUpload}
                      acceptedTypes={['css']}
                      className="text-xs"
                    />
                  </div>
                  <Textarea
                    id="css"
                    value={subPageForm.css}
                    onChange={(e) => setSubPageForm(prev => ({ ...prev, css: e.target.value }))}
                    placeholder="Enter CSS styles"
                    className="font-mono text-sm min-h-[150px]"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label htmlFor="javascript">JavaScript</Label>
                    <FileUpload
                      onFileUpload={handleFileUpload}
                      acceptedTypes={['javascript']}
                      className="text-xs"
                    />
                  </div>
                  <Textarea
                    id="javascript"
                    value={subPageForm.javascript}
                    onChange={(e) => setSubPageForm(prev => ({ ...prev, javascript: e.target.value }))}
                    placeholder="Enter JavaScript code"
                    className="font-mono text-sm min-h-[150px]"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              <div className="border rounded-lg p-4 min-h-[400px] bg-white">
                <style dangerouslySetInnerHTML={{ __html: subPageForm.css }} />
                <div dangerouslySetInnerHTML={{ __html: subPageForm.html }} />
                <script dangerouslySetInnerHTML={{ __html: subPageForm.javascript }} />
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex gap-2 mt-6">
            <Button onClick={selectedSubPage ? handleUpdateSubPage : handleCreateSubPage}>
              {selectedSubPage ? 'Update Sub Page' : 'Create Sub Page'}
            </Button>
            <Button variant="outline" onClick={() => setIsSubPageDialogOpen(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Preview</DialogTitle>
          </DialogHeader>
          <div className="border rounded-lg p-4 min-h-[500px] bg-white overflow-auto">
            <style dangerouslySetInnerHTML={{ __html: previewContent.css }} />
            <div dangerouslySetInnerHTML={{ __html: previewContent.html }} />
            <script dangerouslySetInnerHTML={{ __html: previewContent.javascript }} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPages;
