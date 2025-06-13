
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Edit, Eye, FileText, Palette, Code } from 'lucide-react';
import { useSessionContext } from '@/contexts/SessionContext';
import { FileUpload } from '@/components/FileUpload';
import { toast } from '@/components/ui/sonner';

const UserPages = () => {
  const { mainPages, addMainPage, addSubPage, updateMainPage, updateSubPage, deleteMainPage, deleteSubPage } = useSessionContext();
  
  const [isAddPageOpen, setIsAddPageOpen] = useState(false);
  const [isAddSubPageOpen, setIsAddSubPageOpen] = useState(false);
  const [isEditPageOpen, setIsEditPageOpen] = useState(false);
  const [isEditSubPageOpen, setIsEditSubPageOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedMainPageId, setSelectedMainPageId] = useState('');
  const [selectedPage, setSelectedPage] = useState<any>(null);
  const [selectedSubPage, setSelectedSubPage] = useState<any>(null);
  const [previewContent, setPreviewContent] = useState({ html: '', css: '', javascript: '' });

  // Form states
  const [newPageName, setNewPageName] = useState('');
  const [newPageDescription, setNewPageDescription] = useState('');
  const [newSubPageName, setNewSubPageName] = useState('');
  const [newSubPageDescription, setNewSubPageDescription] = useState('');
  const [newSubPageHtml, setNewSubPageHtml] = useState('');
  const [newSubPageCss, setNewSubPageCss] = useState('');
  const [newSubPageJs, setNewSubPageJs] = useState('');
  const [newSubPageFields, setNewSubPageFields] = useState<string[]>([]);
  const [fieldInput, setFieldInput] = useState('');

  // Edit form states
  const [editPageName, setEditPageName] = useState('');
  const [editPageDescription, setEditPageDescription] = useState('');
  const [editSubPageName, setEditSubPageName] = useState('');
  const [editSubPageDescription, setEditSubPageDescription] = useState('');
  const [editSubPageHtml, setEditSubPageHtml] = useState('');
  const [editSubPageCss, setEditSubPageCss] = useState('');
  const [editSubPageJs, setEditSubPageJs] = useState('');
  const [editSubPageFields, setEditSubPageFields] = useState<string[]>([]);

  const resetNewPageForm = () => {
    setNewPageName('');
    setNewPageDescription('');
  };

  const resetNewSubPageForm = () => {
    setNewSubPageName('');
    setNewSubPageDescription('');
    setNewSubPageHtml('');
    setNewSubPageCss('');
    setNewSubPageJs('');
    setNewSubPageFields([]);
    setFieldInput('');
  };

  const handleAddMainPage = async () => {
    if (!newPageName.trim()) {
      toast.error("Please enter a page name");
      return;
    }

    try {
      await addMainPage({
        name: newPageName,
        description: newPageDescription
      });
      
      resetNewPageForm();
      setIsAddPageOpen(false);
    } catch (error) {
      console.error('Error adding main page:', error);
    }
  };

  const handleAddSubPage = async () => {
    if (!newSubPageName.trim() || !selectedMainPageId) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      await addSubPage(selectedMainPageId, {
        name: newSubPageName,
        description: newSubPageDescription,
        html: newSubPageHtml,
        css: newSubPageCss,
        javascript: newSubPageJs,
        fields: newSubPageFields
      });
      
      resetNewSubPageForm();
      setIsAddSubPageOpen(false);
      setSelectedMainPageId('');
    } catch (error) {
      console.error('Error adding sub page:', error);
    }
  };

  const handleEditMainPage = async () => {
    if (!editPageName.trim() || !selectedPage) {
      toast.error("Please enter a page name");
      return;
    }

    try {
      await updateMainPage({
        ...selectedPage,
        name: editPageName,
        description: editPageDescription
      });
      
      setIsEditPageOpen(false);
      setSelectedPage(null);
    } catch (error) {
      console.error('Error updating main page:', error);
    }
  };

  const handleEditSubPage = async () => {
    if (!editSubPageName.trim() || !selectedSubPage) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      await updateSubPage(selectedSubPage.parentId, {
        ...selectedSubPage,
        name: editSubPageName,
        description: editSubPageDescription,
        html: editSubPageHtml,
        css: editSubPageCss,
        javascript: editSubPageJs,
        fields: editSubPageFields
      });
      
      setIsEditSubPageOpen(false);
      setSelectedSubPage(null);
    } catch (error) {
      console.error('Error updating sub page:', error);
    }
  };

  const handleDeleteMainPage = async (pageId: string) => {
    if (window.confirm('Are you sure you want to delete this page and all its sub-pages?')) {
      try {
        await deleteMainPage(pageId);
      } catch (error) {
        console.error('Error deleting main page:', error);
      }
    }
  };

  const handleDeleteSubPage = async (mainPageId: string, subPageId: string) => {
    if (window.confirm('Are you sure you want to delete this sub-page?')) {
      try {
        await deleteSubPage(mainPageId, subPageId);
      } catch (error) {
        console.error('Error deleting sub page:', error);
      }
    }
  };

  const openEditPage = (page: any) => {
    setSelectedPage(page);
    setEditPageName(page.name);
    setEditPageDescription(page.description || '');
    setIsEditPageOpen(true);
  };

  const openEditSubPage = (subPage: any) => {
    setSelectedSubPage(subPage);
    setEditSubPageName(subPage.name);
    setEditSubPageDescription(subPage.description || '');
    setEditSubPageHtml(subPage.html || '');
    setEditSubPageCss(subPage.css || '');
    setEditSubPageJs(subPage.javascript || '');
    setEditSubPageFields(subPage.fields || []);
    setIsEditSubPageOpen(true);
  };

  const openPreview = (subPage: any) => {
    setPreviewContent({
      html: subPage.html || '',
      css: subPage.css || '',
      javascript: subPage.javascript || ''
    });
    setIsPreviewOpen(true);
  };

  const addField = () => {
    if (fieldInput.trim() && !newSubPageFields.includes(fieldInput.trim())) {
      setNewSubPageFields([...newSubPageFields, fieldInput.trim()]);
      setFieldInput('');
    }
  };

  const removeField = (field: string) => {
    setNewSubPageFields(newSubPageFields.filter(f => f !== field));
  };

  const addEditField = () => {
    if (fieldInput.trim() && !editSubPageFields.includes(fieldInput.trim())) {
      setEditSubPageFields([...editSubPageFields, fieldInput.trim()]);
      setFieldInput('');
    }
  };

  const removeEditField = (field: string) => {
    setEditSubPageFields(editSubPageFields.filter(f => f !== field));
  };

  const handleFileUpload = (content: string, type: 'html' | 'css' | 'javascript') => {
    if (type === 'html') {
      setNewSubPageHtml(content);
    } else if (type === 'css') {
      setNewSubPageCss(content);
    } else if (type === 'javascript') {
      setNewSubPageJs(content);
    }
  };

  const handleEditFileUpload = (content: string, type: 'html' | 'css' | 'javascript') => {
    if (type === 'html') {
      setEditSubPageHtml(content);
    } else if (type === 'css') {
      setEditSubPageCss(content);
    } else if (type === 'javascript') {
      setEditSubPageJs(content);
    }
  };

  return (
    <div className="container mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Custom Pages</h1>
          <p className="text-muted-foreground">Create and manage your custom pages</p>
        </div>
        <Dialog open={isAddPageOpen} onOpenChange={setIsAddPageOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Page
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Page</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="pageName">Page Name *</Label>
                <Input
                  id="pageName"
                  value={newPageName}
                  onChange={(e) => setNewPageName(e.target.value)}
                  placeholder="Enter page name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pageDescription">Description</Label>
                <Textarea
                  id="pageDescription"
                  value={newPageDescription}
                  onChange={(e) => setNewPageDescription(e.target.value)}
                  placeholder="Enter page description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddPageOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddMainPage}>Add Page</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {mainPages.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No pages created yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first custom page to get started
            </p>
            <Button onClick={() => setIsAddPageOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Create Page
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {mainPages.map((page) => (
            <Card key={page.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{page.name}</CardTitle>
                    <p className="text-muted-foreground mt-1">{page.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditPage(page)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteMainPage(page.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" onClick={() => setSelectedMainPageId(page.id)}>
                          <Plus className="mr-2 h-4 w-4" /> Add Sub Page
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Add Sub Page to {page.name}</DialogTitle>
                        </DialogHeader>
                        <Tabs defaultValue="basic" className="w-full">
                          <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="basic">Basic Info</TabsTrigger>
                            <TabsTrigger value="content">Content</TabsTrigger>
                            <TabsTrigger value="fields">Form Fields</TabsTrigger>
                            <TabsTrigger value="files">File Upload</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="basic" className="space-y-4">
                            <div className="grid gap-2">
                              <Label htmlFor="subPageName">Sub Page Name *</Label>
                              <Input
                                id="subPageName"
                                value={newSubPageName}
                                onChange={(e) => setNewSubPageName(e.target.value)}
                                placeholder="Enter sub page name"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="subPageDescription">Description</Label>
                              <Textarea
                                id="subPageDescription"
                                value={newSubPageDescription}
                                onChange={(e) => setNewSubPageDescription(e.target.value)}
                                placeholder="Enter sub page description"
                              />
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="content" className="space-y-4">
                            <div className="grid gap-2">
                              <Label>HTML Content</Label>
                              <Textarea
                                value={newSubPageHtml}
                                onChange={(e) => setNewSubPageHtml(e.target.value)}
                                placeholder="Enter HTML content"
                                rows={6}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label>CSS Styles</Label>
                              <Textarea
                                value={newSubPageCss}
                                onChange={(e) => setNewSubPageCss(e.target.value)}
                                placeholder="Enter CSS styles"
                                rows={4}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label>JavaScript</Label>
                              <Textarea
                                value={newSubPageJs}
                                onChange={(e) => setNewSubPageJs(e.target.value)}
                                placeholder="Enter JavaScript code"
                                rows={4}
                              />
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="fields" className="space-y-4">
                            <div className="grid gap-2">
                              <Label>Form Fields</Label>
                              <div className="flex gap-2">
                                <Input
                                  value={fieldInput}
                                  onChange={(e) => setFieldInput(e.target.value)}
                                  placeholder="Enter field name"
                                  onKeyPress={(e) => e.key === 'Enter' && addField()}
                                />
                                <Button onClick={addField}>Add</Button>
                              </div>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {newSubPageFields.map((field) => (
                                  <Badge key={field} variant="secondary" className="gap-1">
                                    {field}
                                    <button onClick={() => removeField(field)}>×</button>
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="files" className="space-y-4">
                            <FileUpload
                              onFileContent={handleFileUpload}
                              acceptedTypes={['html', 'css', 'javascript']}
                            />
                          </TabsContent>
                        </Tabs>
                        
                        <DialogFooter>
                          <Button variant="outline" onClick={() => {
                            setIsAddSubPageOpen(false);
                            resetNewSubPageForm();
                          }}>
                            Cancel
                          </Button>
                          <Button onClick={handleAddSubPage}>Add Sub Page</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              
              {page.subPages && page.subPages.length > 0 && (
                <CardContent>
                  <Separator className="mb-4" />
                  <h4 className="font-medium mb-3">Sub Pages</h4>
                  <div className="grid gap-3">
                    {page.subPages.map((subPage: any) => (
                      <div key={subPage.id} className="flex justify-between items-center p-3 border rounded">
                        <div>
                          <h5 className="font-medium">{subPage.name}</h5>
                          <p className="text-sm text-muted-foreground">{subPage.description}</p>
                          {subPage.fields && subPage.fields.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {subPage.fields.map((field: string) => (
                                <Badge key={field} variant="outline" className="text-xs">
                                  {field}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => openPreview(subPage)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openEditSubPage(subPage)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteSubPage(page.id, subPage.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Edit Page Dialog */}
      <Dialog open={isEditPageOpen} onOpenChange={setIsEditPageOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Page</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editPageName">Page Name *</Label>
              <Input
                id="editPageName"
                value={editPageName}
                onChange={(e) => setEditPageName(e.target.value)}
                placeholder="Enter page name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editPageDescription">Description</Label>
              <Textarea
                id="editPageDescription"
                value={editPageDescription}
                onChange={(e) => setEditPageDescription(e.target.value)}
                placeholder="Enter page description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditPageOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditMainPage}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Sub Page Dialog */}
      <Dialog open={isEditSubPageOpen} onOpenChange={setIsEditSubPageOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Sub Page</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="fields">Form Fields</TabsTrigger>
              <TabsTrigger value="files">File Upload</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="editSubPageName">Sub Page Name *</Label>
                <Input
                  id="editSubPageName"
                  value={editSubPageName}
                  onChange={(e) => setEditSubPageName(e.target.value)}
                  placeholder="Enter sub page name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editSubPageDescription">Description</Label>
                <Textarea
                  id="editSubPageDescription"
                  value={editSubPageDescription}
                  onChange={(e) => setEditSubPageDescription(e.target.value)}
                  placeholder="Enter sub page description"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="content" className="space-y-4">
              <div className="grid gap-2">
                <Label>HTML Content</Label>
                <Textarea
                  value={editSubPageHtml}
                  onChange={(e) => setEditSubPageHtml(e.target.value)}
                  placeholder="Enter HTML content"
                  rows={6}
                />
              </div>
              <div className="grid gap-2">
                <Label>CSS Styles</Label>
                <Textarea
                  value={editSubPageCss}
                  onChange={(e) => setEditSubPageCss(e.target.value)}
                  placeholder="Enter CSS styles"
                  rows={4}
                />
              </div>
              <div className="grid gap-2">
                <Label>JavaScript</Label>
                <Textarea
                  value={editSubPageJs}
                  onChange={(e) => setEditSubPageJs(e.target.value)}
                  placeholder="Enter JavaScript code"
                  rows={4}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="fields" className="space-y-4">
              <div className="grid gap-2">
                <Label>Form Fields</Label>
                <div className="flex gap-2">
                  <Input
                    value={fieldInput}
                    onChange={(e) => setFieldInput(e.target.value)}
                    placeholder="Enter field name"
                    onKeyPress={(e) => e.key === 'Enter' && addEditField()}
                  />
                  <Button onClick={addEditField}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {editSubPageFields.map((field) => (
                    <Badge key={field} variant="secondary" className="gap-1">
                      {field}
                      <button onClick={() => removeEditField(field)}>×</button>
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="files" className="space-y-4">
              <FileUpload
                onFileContent={handleEditFileUpload}
                acceptedTypes={['html', 'css', 'javascript']}
              />
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditSubPageOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSubPage}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Preview</DialogTitle>
          </DialogHeader>
          <div className="border rounded-lg overflow-hidden" style={{ height: '500px' }}>
            <iframe
              srcDoc={`
                <!DOCTYPE html>
                <html>
                  <head>
                    <style>${previewContent.css}</style>
                  </head>
                  <body>
                    ${previewContent.html}
                    <script>${previewContent.javascript}</script>
                  </body>
                </html>
              `}
              className="w-full h-full"
              title="Preview"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserPages;
