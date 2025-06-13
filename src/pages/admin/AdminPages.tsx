import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { Textarea } from '@/components/ui/textarea';
import { Plus, ChevronDown, ChevronRight, Edit, Trash2, Eye, Upload } from 'lucide-react';
import { useSessionContext } from '@/contexts/SessionContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { FileUpload } from '@/components/FileUpload';

const AdminPages = () => {
  const { mainPages, updateMainPage, updateSubPage, addMainPage, addSubPage, deleteMainPage, deleteSubPage } = useSessionContext();
  const [isAddingPage, setIsAddingPage] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [newPageDescription, setNewPageDescription] = useState('');
  const [newSubPages, setNewSubPages] = useState([{
    name: '',
    description: '',
    html: '',
    css: '',
    javascript: '',
    fields: []
  }]);
  
  // States for SubPage editing
  const [isEditingSubPage, setIsEditingSubPage] = useState(false);
  const [selectedSubPage, setSelectedSubPage] = useState<any>(null);
  const [selectedMainPageId, setSelectedMainPageId] = useState<string | null>(null);
  const [editSubPageName, setEditSubPageName] = useState('');
  const [editSubPageDescription, setEditSubPageDescription] = useState('');
  const [editSubPageHtml, setEditSubPageHtml] = useState('');
  const [editSubPageCss, setEditSubPageCss] = useState('');
  const [editSubPageJavascript, setEditSubPageJavascript] = useState('');
  const [editSubPageFields, setEditSubPageFields] = useState<string[]>([]);
  const [expandedPages, setExpandedPages] = useState<Record<string, boolean>>({});

  // Preview states
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState({ html: '', css: '', javascript: '' });

  // Function to add a new main page with sub pages
  const handleAddPage = async () => {
    if (!newPageName || !newPageDescription) {
      toast.error("Error", {
        description: "Please provide both a name and description"
      });
      return;
    }

    if (newSubPages.some(sp => !sp.name)) {
      toast.error("Error", {
        description: "All sub pages must have a name"
      });
      return;
    }
    
    try {
      console.log('Adding main page:', { newPageName, newPageDescription });
      const mainPageId = await addMainPage({
        name: newPageName,
        description: newPageDescription
      });

      console.log('Main page created with ID:', mainPageId);

      // Add sub pages
      for (const subPage of newSubPages) {
        if (subPage.name) {
          console.log('Adding sub page:', subPage);
          const subPageId = await addSubPage(mainPageId, {
            name: subPage.name,
            description: subPage.description,
            html: subPage.html,
            css: subPage.css,
            javascript: subPage.javascript,
            fields: subPage.fields
          });
          console.log('Sub page created with ID:', subPageId);
        }
      }

      // Reset form and show success message
      setNewPageName('');
      setNewPageDescription('');
      setNewSubPages([{ name: '', description: '', html: '', css: '', javascript: '', fields: [] }]);
      setIsAddingPage(false);
      
      toast.success("Page Added", {
        description: `${newPageName} has been created successfully with ${newSubPages.filter(sp => sp.name).length} sub-pages`
      });

      // Refresh the page data
      window.location.reload();
    } catch (error) {
      console.error('Error adding page:', error);
      toast.error("Error", {
        description: "Failed to add page: " + (error as Error).message
      });
    }
  };

  // Toggle expanded state for a page
  const toggleExpandPage = (pageId: string) => {
    setExpandedPages(prev => ({
      ...prev,
      [pageId]: !prev[pageId]
    }));
  };

  // Open sub page edit dialog
  const handleEditSubPage = (mainPageId: string, subPage: any) => {
    console.log('Editing sub page:', subPage);
    setSelectedMainPageId(mainPageId);
    setSelectedSubPage(subPage);
    setEditSubPageName(subPage.name || '');
    setEditSubPageDescription(subPage.description || '');
    setEditSubPageHtml(subPage.html || '');
    setEditSubPageCss(subPage.css || '');
    setEditSubPageJavascript(subPage.javascript || '');
    setEditSubPageFields(subPage.fields || []);
    setIsEditingSubPage(true);
  };

  // Save sub page edits
  const handleSaveSubPageEdits = async () => {
    if (!selectedMainPageId || !selectedSubPage) return;
    
    try {
      console.log('Saving sub page edits:', {
        name: editSubPageName,
        description: editSubPageDescription,
        html: editSubPageHtml,
        css: editSubPageCss,
        javascript: editSubPageJavascript,
        fields: editSubPageFields
      });

      await updateSubPage(selectedMainPageId, {
        id: selectedSubPage.id,
        name: editSubPageName,
        description: editSubPageDescription,
        html: editSubPageHtml,
        css: editSubPageCss,
        javascript: editSubPageJavascript,
        fields: editSubPageFields
      });

      setIsEditingSubPage(false);
      toast.success("Sub Page Updated", {
        description: `${editSubPageName} has been updated successfully`
      });

      // Refresh the page data
      window.location.reload();
    } catch (error) {
      console.error('Error updating sub page:', error);
      toast.error("Error", {
        description: "Failed to update sub page: " + (error as Error).message
      });
    }
  };

  // Add new sub page to form
  const addNewSubPageToForm = () => {
    setNewSubPages([...newSubPages, { name: '', description: '', html: '', css: '', javascript: '', fields: [] }]);
  };

  // Remove sub page from form
  const removeSubPageFromForm = (index: number) => {
    setNewSubPages(newSubPages.filter((_, i) => i !== index));
  };

  // Update sub page in form
  const updateSubPageInForm = (index: number, field: string, value: any) => {
    const updated = [...newSubPages];
    updated[index] = { ...updated[index], [field]: value };
    setNewSubPages(updated);
  };

  // Add field to sub page
  const addFieldToSubPage = (index: number) => {
    const updated = [...newSubPages];
    const fieldName = prompt('Enter field name:');
    if (fieldName) {
      updated[index].fields = [...updated[index].fields, fieldName];
      setNewSubPages(updated);
    }
  };

  // Remove field from sub page
  const removeFieldFromSubPage = (subPageIndex: number, fieldIndex: number) => {
    const updated = [...newSubPages];
    updated[subPageIndex].fields = updated[subPageIndex].fields.filter((_, i) => i !== fieldIndex);
    setNewSubPages(updated);
  };

  // Add field to edit form
  const addFieldToEdit = () => {
    const fieldName = prompt('Enter field name:');
    if (fieldName) {
      setEditSubPageFields([...editSubPageFields, fieldName]);
    }
  };

  // Remove field from edit form
  const removeFieldFromEdit = (index: number) => {
    setEditSubPageFields(editSubPageFields.filter((_, i) => i !== index));
  };

  // Preview content
  const handlePreview = (html: string, css: string = '', javascript: string = '') => {
    setPreviewContent({ html, css, javascript });
    setIsPreviewOpen(true);
  };

  // File upload handlers
  const handleFileUpload = (content: string, type: 'html' | 'css' | 'javascript', subPageIndex: number) => {
    const updated = [...newSubPages];
    updated[subPageIndex] = { ...updated[subPageIndex], [type]: content };
    setNewSubPages(updated);
  };

  const handleEditFileUpload = (content: string, type: 'html' | 'css' | 'javascript') => {
    if (type === 'html') setEditSubPageHtml(content);
    if (type === 'css') setEditSubPageCss(content);
    if (type === 'javascript') setEditSubPageJavascript(content);
  };

  return (
    <div className="container mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Page Management</h1>
          <p className="text-muted-foreground">Create and manage website pages with HTML, CSS, and JavaScript</p>
        </div>
        <Button onClick={() => setIsAddingPage(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Page
        </Button>
      </div>

      {isAddingPage && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add New Page</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div>
                <Label htmlFor="pageName">Page Name</Label>
                <Input
                  id="pageName"
                  value={newPageName}
                  onChange={(e) => setNewPageName(e.target.value)}
                  placeholder="Enter page name"
                />
              </div>
              <div>
                <Label htmlFor="pageDescription">Description</Label>
                <Textarea
                  id="pageDescription"
                  value={newPageDescription}
                  onChange={(e) => setNewPageDescription(e.target.value)}
                  placeholder="Enter page description"
                  rows={3}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Sub Pages</h3>
                  <Button type="button" onClick={() => setNewSubPages([...newSubPages, { name: '', description: '', html: '', css: '', javascript: '', fields: [] }])} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Sub Page
                  </Button>
                </div>

                {newSubPages.map((subPage, index) => (
                  <Card key={index} className="mb-4">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base">Sub Page {index + 1}</CardTitle>
                        {newSubPages.length > 1 && (
                          <Button
                            type="button"
                            onClick={() => setNewSubPages(newSubPages.filter((_, i) => i !== index))}
                            variant="outline"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Sub Page Name</Label>
                        <Input
                          value={subPage.name}
                          onChange={(e) => {
                            const updated = [...newSubPages];
                            updated[index] = { ...updated[index], name: e.target.value };
                            setNewSubPages(updated);
                          }}
                          placeholder="Enter sub page name"
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={subPage.description}
                          onChange={(e) => {
                            const updated = [...newSubPages];
                            updated[index] = { ...updated[index], description: e.target.value };
                            setNewSubPages(updated);
                          }}
                          placeholder="Enter sub page description"
                          rows={2}
                        />
                      </div>
                      
                      <FileUpload
                        onFileContent={(content, type) => handleFileUpload(content, type, index)}
                        acceptedTypes={['html', 'css', 'javascript']}
                        className="mb-4"
                      />

                      <Tabs defaultValue="html">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="html">HTML</TabsTrigger>
                          <TabsTrigger value="css">CSS</TabsTrigger>
                          <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                        </TabsList>
                        <TabsContent value="html" className="p-0">
                          <Textarea
                            value={subPage.html}
                            onChange={(e) => {
                              const updated = [...newSubPages];
                              updated[index] = { ...updated[index], html: e.target.value };
                              setNewSubPages(updated);
                            }}
                            placeholder="<div>HTML content goes here</div>"
                            className="font-mono text-sm"
                            rows={6}
                          />
                        </TabsContent>
                        <TabsContent value="css" className="p-0">
                          <Textarea
                            value={subPage.css}
                            onChange={(e) => {
                              const updated = [...newSubPages];
                              updated[index] = { ...updated[index], css: e.target.value };
                              setNewSubPages(updated);
                            }}
                            placeholder="/* CSS styles go here */"
                            className="font-mono text-sm"
                            rows={6}
                          />
                        </TabsContent>
                        <TabsContent value="javascript" className="p-0">
                          <Textarea
                            value={subPage.javascript}
                            onChange={(e) => {
                              const updated = [...newSubPages];
                              updated[index] = { ...updated[index], javascript: e.target.value };
                              setNewSubPages(updated);
                            }}
                            placeholder="// JavaScript code goes here"
                            className="font-mono text-sm"
                            rows={6}
                          />
                        </TabsContent>
                      </Tabs>

                      <div className="flex justify-between items-center">
                        <Button
                          type="button"
                          onClick={() => handlePreview(subPage.html, subPage.css, subPage.javascript)}
                          variant="outline"
                          size="sm"
                          disabled={!subPage.html}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddingPage(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddPage}>
                  Create Page
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {mainPages.map((page) => (
          <Card key={page.id} className="overflow-hidden">
            <CardHeader className="cursor-pointer" onClick={() => toggleExpandPage(page.id)}>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center">
                  {expandedPages[page.id] ? (
                    <ChevronDown className="mr-2 h-5 w-5" />
                  ) : (
                    <ChevronRight className="mr-2 h-5 w-5" />
                  )}
                  {page.name}
                </CardTitle>
                <span className="text-muted-foreground text-sm">
                  {page.subPages?.length || 0} sub-pages
                </span>
              </div>
              <p className="text-muted-foreground text-sm mt-1">{page.description}</p>
            </CardHeader>
            
            {expandedPages[page.id] && (
              <CardContent>
                <h3 className="text-sm font-medium mb-3">Sub Pages</h3>
                <div className="space-y-3">
                  {page.subPages?.map((subPage) => (
                    <div 
                      key={subPage.id} 
                      className="p-3 border rounded-md flex justify-between items-center hover:bg-secondary/50"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{subPage.name}</h4>
                        {subPage.description && (
                          <p className="text-sm text-muted-foreground">{subPage.description}</p>
                        )}
                        {subPage.fields && subPage.fields.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {subPage.fields.map((field, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {field}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        {subPage.html && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handlePreview(subPage.html)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Preview
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditSubPage(page.id, subPage)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  )) || (
                    <p className="text-muted-foreground text-sm">No sub-pages found</p>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Sub Page Edit Dialog */}
      <Dialog open={isEditingSubPage} onOpenChange={setIsEditingSubPage}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Sub Page: {selectedSubPage?.name}</DialogTitle>
            <DialogDescription>
              Modify the sub page content, files, and structure.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="subPageName">Name</Label>
              <Input
                id="subPageName"
                value={editSubPageName}
                onChange={(e) => setEditSubPageName(e.target.value)}
                placeholder="Sub Page Name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="subPageDescription">Description</Label>
              <Textarea
                id="subPageDescription"
                value={editSubPageDescription}
                onChange={(e) => setEditSubPageDescription(e.target.value)}
                placeholder="Sub Page Description"
                rows={2}
                className="mt-1"
              />
            </div>
            
            <FileUpload
              onFileContent={handleEditFileUpload}
              acceptedTypes={['html', 'css', 'javascript']}
              className="mb-4"
            />
            
            <Tabs defaultValue="html">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="html">HTML</TabsTrigger>
                <TabsTrigger value="css">CSS</TabsTrigger>
                <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="html" className="p-0">
                <Textarea
                  value={editSubPageHtml}
                  onChange={(e) => setEditSubPageHtml(e.target.value)}
                  placeholder="<div>HTML content goes here</div>"
                  className="font-mono text-sm h-[300px]"
                />
              </TabsContent>
              <TabsContent value="css" className="p-0">
                <Textarea
                  value={editSubPageCss}
                  onChange={(e) => setEditSubPageCss(e.target.value)}
                  placeholder="/* CSS styles go here */"
                  className="font-mono text-sm h-[300px]"
                />
              </TabsContent>
              <TabsContent value="javascript" className="p-0">
                <Textarea
                  value={editSubPageJavascript}
                  onChange={(e) => setEditSubPageJavascript(e.target.value)}
                  placeholder="// JavaScript code goes here"
                  className="font-mono text-sm h-[300px]"
                />
              </TabsContent>
              <TabsContent value="preview" className="bg-white border h-[300px] overflow-auto">
                <div>
                  <style dangerouslySetInnerHTML={{ __html: editSubPageCss }} />
                  <div dangerouslySetInnerHTML={{ __html: editSubPageHtml }} />
                  <script dangerouslySetInnerHTML={{ __html: editSubPageJavascript }} />
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingSubPage(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSubPageEdits}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Page Preview</DialogTitle>
            <DialogDescription>
              Preview of how the page will appear to users.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-white border rounded-md max-h-[500px] overflow-auto">
            <style dangerouslySetInnerHTML={{ __html: previewContent.css }} />
            <div dangerouslySetInnerHTML={{ __html: previewContent.html }} />
            <script dangerouslySetInnerHTML={{ __html: previewContent.javascript }} />
          </div>
          <DialogFooter>
            <Button onClick={() => setIsPreviewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPages;
