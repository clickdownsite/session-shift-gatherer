
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Plus, ChevronDown, ChevronRight, Eye, Code, Edit } from 'lucide-react';
import { useSessionContext } from '@/contexts/SessionContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MainPage {
  id: string;
  name: string;
  description: string;
  subPages: SubPage[];
}

interface SubPage {
  id: string;
  parentId: string;
  name: string;
  description?: string;
  html?: string;
  fields?: string[];
}

// Mock data for pages
const initialPages: MainPage[] = [
  {
    id: 'page1',
    name: 'Landing Page',
    description: 'Main entry point for users',
    subPages: [
      { id: 'subpage1', parentId: 'page1', name: 'Welcome Screen' },
      { id: 'subpage2', parentId: 'page1', name: 'Features Overview' }
    ]
  },
  {
    id: 'page2',
    name: 'Authentication Page',
    description: 'User login and registration',
    subPages: [
      { id: 'subpage3', parentId: 'page2', name: 'Login Form' },
      { id: 'subpage4', parentId: 'page2', name: 'Registration Form' }
    ]
  }
];

const AdminPages = () => {
  const { mainPages, addMainPage, addSubPage, updateSubPage } = useSessionContext();
  const [pages, setPages] = useState<MainPage[]>(initialPages);
  const [isAddingPage, setIsAddingPage] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [newPageDescription, setNewPageDescription] = useState('');
  
  // States for SubPage editing
  const [isEditingSubPage, setIsEditingSubPage] = useState(false);
  const [selectedSubPage, setSelectedSubPage] = useState<SubPage | null>(null);
  const [selectedMainPageId, setSelectedMainPageId] = useState<string | null>(null);
  const [editSubPageName, setEditSubPageName] = useState('');
  const [editSubPageDescription, setEditSubPageDescription] = useState('');
  const [editSubPageHtml, setEditSubPageHtml] = useState('');
  const [expandedPages, setExpandedPages] = useState<Record<string, boolean>>({});

  // Function to add a new main page
  const handleAddPage = () => {
    if (!newPageName || !newPageDescription) {
      toast({
        title: "Error",
        description: "Please provide both a name and description",
        variant: "destructive"
      });
      return;
    }
    
    // Create the new page with empty subPages array
    const newPageId = addMainPage({
      name: newPageName,
      description: newPageDescription,
      subPages: []
    });
    
    // Reset form and show success message
    setNewPageName('');
    setNewPageDescription('');
    setIsAddingPage(false);
    
    toast({
      title: "Page Added",
      description: `${newPageName} has been created successfully`
    });
  };

  // Toggle expanded state for a page
  const toggleExpandPage = (pageId: string) => {
    setExpandedPages(prev => ({
      ...prev,
      [pageId]: !prev[pageId]
    }));
  };

  // Open sub page edit dialog
  const handleEditSubPage = (mainPageId: string, subPage: SubPage) => {
    setSelectedMainPageId(mainPageId);
    setSelectedSubPage(subPage);
    setEditSubPageName(subPage.name || '');
    setEditSubPageDescription(subPage.description || '');
    setEditSubPageHtml(subPage.html || '');
    setIsEditingSubPage(true);
  };

  // Save sub page edits
  const handleSaveSubPageEdits = () => {
    if (!selectedMainPageId || !selectedSubPage) return;
    
    const updatedSubPage = {
      ...selectedSubPage,
      name: editSubPageName,
      description: editSubPageDescription,
      html: editSubPageHtml,
    };
    
    updateSubPage(selectedMainPageId, updatedSubPage);
    
    setIsEditingSubPage(false);
    toast({
      title: "Sub Page Updated",
      description: `${editSubPageName} has been updated successfully`
    });
  };

  return (
    <div className="container mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Page Management</h1>
          <p className="text-muted-foreground">Create and manage website pages</p>
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
            <div className="grid gap-4">
              <div>
                <label htmlFor="pageName" className="block text-sm font-medium mb-1">
                  Page Name
                </label>
                <Input
                  id="pageName"
                  value={newPageName}
                  onChange={(e) => setNewPageName(e.target.value)}
                  placeholder="Enter page name"
                />
              </div>
              <div>
                <label htmlFor="pageDescription" className="block text-sm font-medium mb-1">
                  Description
                </label>
                <Textarea
                  id="pageDescription"
                  value={newPageDescription}
                  onChange={(e) => setNewPageDescription(e.target.value)}
                  placeholder="Enter page description"
                  rows={3}
                />
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
                  {page.subPages.length} sub-pages
                </span>
              </div>
              <p className="text-muted-foreground text-sm mt-1">{page.description}</p>
            </CardHeader>
            
            {expandedPages[page.id] && (
              <CardContent>
                <h3 className="text-sm font-medium mb-3">Sub Pages</h3>
                <div className="space-y-3">
                  {page.subPages.map((subPage) => (
                    <div 
                      key={subPage.id} 
                      className="p-3 border rounded-md flex justify-between items-center hover:bg-secondary/50"
                    >
                      <div>
                        <h4 className="font-medium">{subPage.name}</h4>
                        {subPage.description && (
                          <p className="text-sm text-muted-foreground">{subPage.description}</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
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
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Sub Page Edit Dialog */}
      <Dialog open={isEditingSubPage} onOpenChange={setIsEditingSubPage}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Edit Sub Page: {selectedSubPage?.name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <label htmlFor="subPageName" className="text-sm font-medium">Name</label>
              <Input
                id="subPageName"
                value={editSubPageName}
                onChange={(e) => setEditSubPageName(e.target.value)}
                placeholder="Sub Page Name"
                className="mt-1"
              />
            </div>
            <div>
              <label htmlFor="subPageDescription" className="text-sm font-medium">Description</label>
              <Textarea
                id="subPageDescription"
                value={editSubPageDescription}
                onChange={(e) => setEditSubPageDescription(e.target.value)}
                placeholder="Sub Page Description"
                rows={2}
                className="mt-1"
              />
            </div>
            
            <Tabs defaultValue="code">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="code">
                  <Code className="h-4 w-4 mr-2" />
                  HTML
                </TabsTrigger>
                <TabsTrigger value="preview">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </TabsTrigger>
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
    </div>
  );
};

export default AdminPages;
