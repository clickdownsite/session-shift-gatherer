
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';

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
  const [pages, setPages] = useState<MainPage[]>(initialPages);
  const [isAddingPage, setIsAddingPage] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [newPageDescription, setNewPageDescription] = useState('');

  // Function to add a new main page
  const addMainPage = (pageData: Omit<MainPage, 'id'>) => {
    const newId = `page${pages.length + 1}`;
    const newPage: MainPage = {
      id: newId,
      ...pageData
    };
    
    setPages([...pages, newPage]);
    return newId;
  };
  
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
    // The actual SubPage objects will be added separately
    const newPageId = addMainPage({
      name: newPageName,
      description: newPageDescription,
      subPages: []  // This correctly matches the type
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pages.map((page) => (
          <Card key={page.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>{page.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{page.description}</p>
              <div>
                <h4 className="font-semibold mb-2">Sub Pages</h4>
                {page.subPages.length > 0 ? (
                  <ul className="space-y-1">
                    {page.subPages.map((subPage) => (
                      <li key={subPage.id} className="bg-secondary p-2 rounded-md text-sm">
                        {subPage.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No sub pages created yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminPages;
