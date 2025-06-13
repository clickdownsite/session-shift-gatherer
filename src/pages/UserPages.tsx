
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { Textarea } from '@/components/ui/textarea';
import { Plus, ChevronDown, ChevronRight, Edit, Trash2, Eye, Copy } from 'lucide-react';
import { useSessionContext } from '@/contexts/SessionContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const UserPages = () => {
  const { 
    mainPages, 
    sessions,
    updateSubPage, 
    addMainPage, 
    addSubPage, 
    deleteMainPage, 
    deleteSubPage,
    addSession 
  } = useSessionContext();
  
  const [isAddingPage, setIsAddingPage] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [newPageDescription, setNewPageDescription] = useState('');
  const [newSubPages, setNewSubPages] = useState([{
    name: '',
    description: '',
    html: '',
    fields: []
  }]);
  
  // States for SubPage editing
  const [isEditingSubPage, setIsEditingSubPage] = useState(false);
  const [selectedSubPage, setSelectedSubPage] = useState<any>(null);
  const [selectedMainPageId, setSelectedMainPageId] = useState<string | null>(null);
  const [editSubPageName, setEditSubPageName] = useState('');
  const [editSubPageDescription, setEditSubPageDescription] = useState('');
  const [editSubPageHtml, setEditSubPageHtml] = useState('');
  const [editSubPageFields, setEditSubPageFields] = useState<string[]>([]);
  const [expandedPages, setExpandedPages] = useState<Record<string, boolean>>({});

  // Preview states
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');

  // Session creation
  const [selectedPageForSession, setSelectedPageForSession] = useState<string | null>(null);
  const [selectedSubPageForSession, setSelectedSubPageForSession] = useState<string | null>(null);

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
      console.log('Creating user page:', { newPageName, newPageDescription });
      const mainPageId = await addMainPage({
        name: newPageName,
        description: newPageDescription
      });

      // Add sub pages
      for (const subPage of newSubPages) {
        if (subPage.name) {
          await addSubPage(mainPageId, {
            name: subPage.name,
            description: subPage.description,
            html: subPage.html,
            fields: subPage.fields
          });
        }
      }

      // Reset form and show success message
      setNewPageName('');
      setNewPageDescription('');
      setNewSubPages([{ name: '', description: '', html: '', fields: [] }]);
      setIsAddingPage(false);
      
      toast.success("Page Created", {
        description: `${newPageName} has been created successfully with ${newSubPages.filter(sp => sp.name).length} sub-pages`
      });

      // Refresh the page data
      window.location.reload();
    } catch (error) {
      console.error('Error adding page:', error);
      toast.error("Error", {
        description: "Failed to create page: " + (error as Error).message
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
    setSelectedMainPageId(mainPageId);
    setSelectedSubPage(subPage);
    setEditSubPageName(subPage.name || '');
    setEditSubPageDescription(subPage.description || '');
    setEditSubPageHtml(subPage.html || '');
    setEditSubPageFields(subPage.fields || []);
    setIsEditingSubPage(true);
  };

  // Save sub page edits
  const handleSaveSubPageEdits = async () => {
    if (!selectedMainPageId || !selectedSubPage) return;
    
    try {
      await updateSubPage(selectedMainPageId, {
        id: selectedSubPage.id,
        name: editSubPageName,
        description: editSubPageDescription,
        html: editSubPageHtml,
        fields: editSubPageFields
      });

      setIsEditingSubPage(false);
      toast.success("Page Updated", {
        description: `${editSubPageName} has been updated successfully`
      });

      // Refresh the page data
      window.location.reload();
    } catch (error) {
      console.error('Error updating sub page:', error);
      toast.error("Error", {
        description: "Failed to update page: " + (error as Error).message
      });
    }
  };

  // Create session for a page
  const handleCreateSession = (mainPageId: string, subPageId: string) => {
    addSession(mainPageId, subPageId);
    toast.success("Session Created", {
      description: "A new session has been created for this page"
    });
  };

  // Copy session link
  const getSessionLink = (sessionId: string) => {
    return `${window.location.origin}/page/${sessionId}`;
  };

  const copySessionLink = (sessionId: string) => {
    navigator.clipboard.writeText(getSessionLink(sessionId));
    toast.success("Link Copied", {
      description: "Session link copied to clipboard"
    });
  };

  // Add new sub page to form
  const addNewSubPageToForm = () => {
    setNewSubPages([...newSubPages, { name: '', description: '', html: '', fields: [] }]);
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
    const fieldName = prompt('Enter field name:');
    if (fieldName) {
      const updated = [...newSubPages];
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

  // Preview HTML
  const handlePreview = (html: string) => {
    setPreviewHtml(html);
    setIsPreviewOpen(true);
  };

  // Get active sessions for a sub page
  const getActiveSessionsForSubPage = (subPageId: string) => {
    return sessions.filter(session => session.currentSubPageId === subPageId && session.active);
  };

  return (
    <div className="container mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Pages</h1>
          <p className="text-muted-foreground">Create and manage your custom pages and forms</p>
        </div>
        <Button onClick={() => setIsAddingPage(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Page
        </Button>
      </div>

      <Alert className="mb-6">
        <AlertDescription>
          Create custom pages with forms to collect data from users. You can create sessions for each page and share the links with others.
        </AlertDescription>
      </Alert>

      {isAddingPage && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create New Page</CardTitle>
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
                  <Button type="button" onClick={addNewSubPageToForm} variant="outline" size="sm">
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
                            onClick={() => removeSubPageFromForm(index)}
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
                          onChange={(e) => updateSubPageInForm(index, 'name', e.target.value)}
                          placeholder="Enter sub page name"
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={subPage.description}
                          onChange={(e) => updateSubPageInForm(index, 'description', e.target.value)}
                          placeholder="Enter sub page description"
                          rows={2}
                        />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label>Form Fields</Label>
                          <Button
                            type="button"
                            onClick={() => addFieldToSubPage(index)}
                            variant="outline"
                            size="sm"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Field
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {subPage.fields.map((field, fieldIndex) => (
                            <Badge key={fieldIndex} variant="secondary" className="flex items-center gap-1">
                              {field}
                              <button
                                type="button"
                                onClick={() => removeFieldFromSubPage(index, fieldIndex)}
                                className="ml-1 text-xs"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label>HTML Content (Optional)</Label>
                          {subPage.html && (
                            <Button
                              type="button"
                              onClick={() => handlePreview(subPage.html)}
                              variant="outline"
                              size="sm"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Preview
                            </Button>
                          )}
                        </div>
                        <Textarea
                          value={subPage.html}
                          onChange={(e) => updateSubPageInForm(index, 'html', e.target.value)}
                          placeholder="<div>Custom HTML content (optional)</div>"
                          className="font-mono text-sm"
                          rows={6}
                        />
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
                  {page.subPages?.map((subPage) => {
                    const activeSessions = getActiveSessionsForSubPage(subPage.id);
                    return (
                      <div 
                        key={subPage.id} 
                        className="p-3 border rounded-md hover:bg-secondary/50"
                      >
                        <div className="flex justify-between items-start">
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
                            {activeSessions.length > 0 && (
                              <div className="mt-2">
                                <p className="text-sm font-medium">Active Sessions:</p>
                                <div className="space-y-1">
                                  {activeSessions.map(session => (
                                    <div key={session.id} className="flex items-center gap-2 text-sm">
                                      <span className="font-mono bg-muted px-2 py-1 rounded">
                                        {session.id}
                                      </span>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => copySessionLink(session.id)}
                                      >
                                        <Copy className="h-3 w-3 mr-1" />
                                        Copy Link
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleCreateSession(page.id, subPage.id)}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              New Session
                            </Button>
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
                      </div>
                    );
                  }) || (
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
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Sub Page: {selectedSubPage?.name}</DialogTitle>
            <DialogDescription>
              Modify the sub page content, fields, and HTML structure.
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
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Form Fields</Label>
                <Button type="button" onClick={addFieldToEdit} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Field
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {editSubPageFields.map((field, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {field}
                    <button
                      type="button"
                      onClick={() => removeFieldFromEdit(index)}
                      className="ml-1 text-xs"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
            
            <Tabs defaultValue="code">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="code">HTML</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="code" className="p-0">
                <Textarea
                  value={editSubPageHtml}
                  onChange={(e) => setEditSubPageHtml(e.target.value)}
                  placeholder="<div>HTML content goes here</div>"
                  className="font-mono text-sm h-[300px]"
                />
              </TabsContent>
              <TabsContent value="preview" className="bg-white p-4 border h-[300px] overflow-auto">
                <div dangerouslySetInnerHTML={{ __html: editSubPageHtml }} />
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
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>HTML Preview</DialogTitle>
            <DialogDescription>
              Preview of the HTML content as it will appear to users.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-white p-4 border rounded-md max-h-[400px] overflow-auto">
            <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
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

export default UserPages;
