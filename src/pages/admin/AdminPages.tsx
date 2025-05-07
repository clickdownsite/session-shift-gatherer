
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Plus, Pencil, Trash, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useSessionContext } from '@/contexts/SessionContext';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const AdminPages = () => {
  const { 
    mainPages, 
    updateMainPage, 
    updateSubPage,
    addMainPage,
    addSubPage,
    deleteMainPage,
    deleteSubPage
  } = useSessionContext();
  
  const [editingMainPage, setEditingMainPage] = useState<any>(null);
  const [editingSubPage, setEditingSubPage] = useState<any>(null);
  const [previewHTML, setPreviewHTML] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{type: 'main' | 'sub', mainId: string, subId?: string}>();

  const handleSaveMainPage = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMainPage) {
      updateMainPage(editingMainPage);
      toast({
        title: "Main Page Updated",
        description: `${editingMainPage.name} has been successfully updated.`
      });
      setEditingMainPage(null);
    }
  };
  
  const handleSaveSubPage = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSubPage && editingSubPage.parentId) {
      updateSubPage(editingSubPage.parentId, editingSubPage);
      toast({
        title: "Sub Page Updated",
        description: `${editingSubPage.name} has been successfully updated.`
      });
      setEditingSubPage(null);
    }
  };

  const handleAddMainPage = () => {
    const newMainPage = {
      name: "New Page Type",
      description: "Description of the new page type",
      subPages: [
        {
          name: "Default Sub Page",
          description: "Default sub page template",
          fields: ["field1", "field2"],
          html: `<div class="p-6">
            <h1 class="text-2xl font-bold mb-4">New Template</h1>
            <div class="mb-4">
              <label class="block mb-2">Field 1</label>
              <input type="text" class="w-full p-2 border rounded" />
            </div>
            <div class="mb-4">
              <label class="block mb-2">Field 2</label>
              <input type="text" class="w-full p-2 border rounded" />
            </div>
            <button class="bg-purple-600 text-white px-4 py-2 rounded">Submit</button>
          </div>`
        }
      ]
    };
    
    const mainPageId = addMainPage(newMainPage);
    setEditingMainPage({
      id: mainPageId,
      ...newMainPage
    });
  };
  
  const handleAddSubPage = (mainPageId: string) => {
    const newSubPage = {
      name: "New Sub Page",
      description: "Description of the new sub page",
      fields: ["field1"],
      html: `<div class="p-6">
        <h1 class="text-2xl font-bold mb-4">New Sub Page</h1>
        <div class="mb-4">
          <label class="block mb-2">Field 1</label>
          <input type="text" class="w-full p-2 border rounded" />
        </div>
        <button class="bg-purple-600 text-white px-4 py-2 rounded">Submit</button>
      </div>`
    };
    
    const subPageId = addSubPage(mainPageId, newSubPage);
    const mainPage = mainPages.find(p => p.id === mainPageId);
    const addedSubPage = mainPage?.subPages.find(sp => sp.id === subPageId);
    
    if (addedSubPage) {
      setEditingSubPage(addedSubPage);
    }
  };

  const handlePreview = (html: string) => {
    setPreviewHTML(html);
  };
  
  const confirmDelete = (type: 'main' | 'sub', mainId: string, subId?: string) => {
    setDeleteTarget({ type, mainId, subId });
    setShowDeleteDialog(true);
  };
  
  const handleDelete = () => {
    if (!deleteTarget) return;
    
    if (deleteTarget.type === 'main') {
      deleteMainPage(deleteTarget.mainId);
      toast({
        title: "Main Page Deleted",
        description: `Page type has been successfully deleted.`
      });
    } else if (deleteTarget.type === 'sub' && deleteTarget.subId) {
      deleteSubPage(deleteTarget.mainId, deleteTarget.subId);
      toast({
        title: "Sub Page Deleted",
        description: `Sub page has been successfully deleted.`
      });
    }
    
    setShowDeleteDialog(false);
  };

  return (
    <div className="container mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Session Page Templates</h1>
          <p className="text-muted-foreground">Create and manage session page templates</p>
        </div>
        <Button onClick={handleAddMainPage}>
          <Plus className="mr-2 h-4 w-4" /> Add Page Type
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {mainPages.map((mainPage) => (
              <AccordionItem 
                key={mainPage.id} 
                value={mainPage.id}
                className="border rounded-lg px-4"
              >
                <div className="flex justify-between items-center">
                  <AccordionTrigger className="py-4">
                    <div className="flex flex-col items-start">
                      <div className="font-semibold text-lg">{mainPage.name}</div>
                      <div className="text-sm text-muted-foreground">{mainPage.description}</div>
                    </div>
                  </AccordionTrigger>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingMainPage(mainPage);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        confirmDelete('main', mainPage.id);
                      }}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <AccordionContent className="pt-2 pb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Sub Pages</h3>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleAddSubPage(mainPage.id)}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Sub Page
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {mainPage.subPages.map((subPage) => (
                      <Card key={subPage.id} className="relative">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex justify-between">
                            {subPage.name}
                            <div className="flex gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setEditingSubPage(subPage)}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => confirmDelete('sub', mainPage.id, subPage.id)}
                                disabled={mainPage.subPages.length <= 1}
                              >
                                <Trash className="h-3 w-3" />
                              </Button>
                            </div>
                          </CardTitle>
                          <CardDescription className="text-xs">{subPage.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2 pt-0">
                          <div className="text-xs font-medium">Fields:</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {subPage.fields.map((field) => (
                              <Badge key={field} variant="outline" className="text-xs px-1 py-0">
                                {field}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                        <CardFooter className="pt-0">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs" 
                            onClick={() => handlePreview(subPage.html)}
                          >
                            Preview
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="lg:col-span-1">
          {editingMainPage ? (
            <Card>
              <CardHeader>
                <CardTitle>Edit Page Type</CardTitle>
                <CardDescription>Modify the main page type</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveMainPage}>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Page Type Name</Label>
                      <Input 
                        id="name" 
                        value={editingMainPage.name}
                        onChange={(e) => setEditingMainPage({...editingMainPage, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Input 
                        id="description" 
                        value={editingMainPage.description}
                        onChange={(e) => setEditingMainPage({...editingMainPage, description: e.target.value})}
                      />
                    </div>
                    <div className="flex justify-between">
                      <Button variant="outline" type="button" onClick={() => setEditingMainPage(null)}>
                        Cancel
                      </Button>
                      <Button type="submit">Save Changes</Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : editingSubPage ? (
            <Card>
              <CardHeader>
                <CardTitle>Edit Sub Page</CardTitle>
                <CardDescription>Modify the sub page template</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveSubPage}>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="subname">Sub Page Name</Label>
                      <Input 
                        id="subname" 
                        value={editingSubPage.name}
                        onChange={(e) => setEditingSubPage({...editingSubPage, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subdescription">Description</Label>
                      <Input 
                        id="subdescription" 
                        value={editingSubPage.description}
                        onChange={(e) => setEditingSubPage({...editingSubPage, description: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fields">Fields (comma separated)</Label>
                      <Input 
                        id="fields" 
                        value={editingSubPage.fields.join(',')}
                        onChange={(e) => setEditingSubPage(
                          {...editingSubPage, fields: e.target.value.split(',').map((f: string) => f.trim())}
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="html">HTML Template</Label>
                      <Textarea 
                        id="html" 
                        className="font-mono min-h-[200px]"
                        value={editingSubPage.html}
                        onChange={(e) => setEditingSubPage({...editingSubPage, html: e.target.value})}
                      />
                    </div>
                    <div className="flex justify-between">
                      <Button variant="outline" type="button" onClick={() => setEditingSubPage(null)}>
                        Cancel
                      </Button>
                      <Button type="submit">Save Changes</Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : previewHTML ? (
            <Card>
              <CardHeader>
                <CardTitle>Template Preview</CardTitle>
                <CardDescription>How the page will appear to users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md overflow-hidden">
                  <div 
                    className="p-4 bg-white dark:bg-gray-900" 
                    dangerouslySetInnerHTML={{ __html: previewHTML }} 
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" onClick={() => setPreviewHTML('')}>Close Preview</Button>
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Template Management</CardTitle>
                <CardDescription>Select a template to preview or edit</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="py-8 text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="mt-2 text-muted-foreground">Select a template to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete?</DialogTitle>
            <DialogDescription>
              {deleteTarget?.type === 'main'
                ? 'This will delete the page type and all associated sub pages.'
                : 'This will delete the sub page.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPages;
