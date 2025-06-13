
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Eye, Save, Upload } from 'lucide-react';
import { useSessionContext } from '@/contexts/SessionContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { FileUpload } from '@/components/FileUpload';

const UserPages = () => {
  const { addMainPage, addSubPage } = useSessionContext();
  const [isCreatingPage, setIsCreatingPage] = useState(false);
  const [pageName, setPageName] = useState('');
  const [pageDescription, setPageDescription] = useState('');
  const [subPages, setSubPages] = useState([{
    name: '',
    description: '',
    html: '',
    css: '',
    javascript: '',
    fields: []
  }]);

  // Preview states
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState({ html: '', css: '', javascript: '' });

  const handleCreatePage = async () => {
    if (!pageName || !pageDescription) {
      toast.error("Error", {
        description: "Please provide both a name and description"
      });
      return;
    }

    if (subPages.some(sp => !sp.name)) {
      toast.error("Error", {
        description: "All sub pages must have a name"
      });
      return;
    }
    
    try {
      console.log('Creating user page:', { pageName, pageDescription });
      const mainPageId = await addMainPage({
        name: pageName,
        description: pageDescription
      });

      console.log('Main page created with ID:', mainPageId);

      // Add sub pages
      for (const subPage of subPages) {
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
      setPageName('');
      setPageDescription('');
      setSubPages([{ name: '', description: '', html: '', css: '', javascript: '', fields: [] }]);
      setIsCreatingPage(false);
      
      toast.success("Page Created", {
        description: `${pageName} has been created successfully with ${subPages.filter(sp => sp.name).length} sub-pages`
      });
    } catch (error) {
      console.error('Error creating page:', error);
      toast.error("Error", {
        description: "Failed to create page: " + (error as Error).message
      });
    }
  };

  const handlePreview = (html: string, css: string = '', javascript: string = '') => {
    setPreviewContent({ html, css, javascript });
    setIsPreviewOpen(true);
  };

  const handleFileUpload = (content: string, type: 'html' | 'css' | 'javascript', subPageIndex: number) => {
    const updated = [...subPages];
    updated[subPageIndex] = { ...updated[subPageIndex], [type]: content };
    setSubPages(updated);
  };

  const addField = (subPageIndex: number) => {
    const fieldName = prompt('Enter field name:');
    if (fieldName) {
      const updated = [...subPages];
      updated[subPageIndex].fields = [...updated[subPageIndex].fields, fieldName];
      setSubPages(updated);
    }
  };

  const removeField = (subPageIndex: number, fieldIndex: number) => {
    const updated = [...subPages];
    updated[subPageIndex].fields = updated[subPageIndex].fields.filter((_, i) => i !== fieldIndex);
    setSubPages(updated);
  };

  return (
    <div className="container mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Create Custom Pages</h1>
          <p className="text-muted-foreground">Build your own custom pages with HTML, CSS, and JavaScript</p>
        </div>
        <Button onClick={() => setIsCreatingPage(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Page
        </Button>
      </div>

      {!isCreatingPage ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="mb-6">
              <Upload className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Create Your First Custom Page</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Build interactive forms and pages using HTML, CSS, and JavaScript. 
                Upload files or write code directly in the editor.
              </p>
            </div>
            <Button onClick={() => setIsCreatingPage(true)} size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Get Started
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Create New Page</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div>
                <Label htmlFor="pageName">Page Name</Label>
                <Input
                  id="pageName"
                  value={pageName}
                  onChange={(e) => setPageName(e.target.value)}
                  placeholder="Enter page name"
                />
              </div>
              <div>
                <Label htmlFor="pageDescription">Description</Label>
                <Textarea
                  id="pageDescription"
                  value={pageDescription}
                  onChange={(e) => setPageDescription(e.target.value)}
                  placeholder="Enter page description"
                  rows={3}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Sub Pages</h3>
                  <Button 
                    type="button" 
                    onClick={() => setSubPages([...subPages, { name: '', description: '', html: '', css: '', javascript: '', fields: [] }])} 
                    variant="outline" 
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Sub Page
                  </Button>
                </div>

                {subPages.map((subPage, index) => (
                  <Card key={index} className="mb-4">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base">Sub Page {index + 1}</CardTitle>
                        {subPages.length > 1 && (
                          <Button
                            type="button"
                            onClick={() => setSubPages(subPages.filter((_, i) => i !== index))}
                            variant="outline"
                            size="sm"
                          >
                            Remove
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
                            const updated = [...subPages];
                            updated[index] = { ...updated[index], name: e.target.value };
                            setSubPages(updated);
                          }}
                          placeholder="Enter sub page name"
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={subPage.description}
                          onChange={(e) => {
                            const updated = [...subPages];
                            updated[index] = { ...updated[index], description: e.target.value };
                            setSubPages(updated);
                          }}
                          placeholder="Enter sub page description"
                          rows={2}
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label>Form Fields (Data to Collect)</Label>
                          <Button
                            type="button"
                            onClick={() => addField(index)}
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
                                onClick={() => removeField(index, fieldIndex)}
                                className="ml-1 text-xs"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
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
                              const updated = [...subPages];
                              updated[index] = { ...updated[index], html: e.target.value };
                              setSubPages(updated);
                            }}
                            placeholder="<div>HTML content goes here</div>"
                            className="font-mono text-sm"
                            rows={8}
                          />
                        </TabsContent>
                        <TabsContent value="css" className="p-0">
                          <Textarea
                            value={subPage.css}
                            onChange={(e) => {
                              const updated = [...subPages];
                              updated[index] = { ...updated[index], css: e.target.value };
                              setSubPages(updated);
                            }}
                            placeholder="/* CSS styles go here */"
                            className="font-mono text-sm"
                            rows={8}
                          />
                        </TabsContent>
                        <TabsContent value="javascript" className="p-0">
                          <Textarea
                            value={subPage.javascript}
                            onChange={(e) => {
                              const updated = [...subPages];
                              updated[index] = { ...updated[index], javascript: e.target.value };
                              setSubPages(updated);
                            }}
                            placeholder="// JavaScript code goes here"
                            className="font-mono text-sm"
                            rows={8}
                          />
                        </TabsContent>
                      </Tabs>

                      <div className="flex justify-center">
                        <Button
                          type="button"
                          onClick={() => handlePreview(subPage.html, subPage.css, subPage.javascript)}
                          variant="outline"
                          size="sm"
                          disabled={!subPage.html}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Preview Sub Page
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreatingPage(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePage}>
                  <Save className="h-4 w-4 mr-2" />
                  Create Page
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Page Preview</DialogTitle>
            <DialogDescription>
              Preview of how your page will appear to users.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-white border rounded-md max-h-[500px] overflow-auto p-4">
            <style dangerouslySetInnerHTML={{ __html: previewContent.css }} />
            <div dangerouslySetInnerHTML={{ __html: previewContent.html }} />
            <script dangerouslySetInnerHTML={{ __html: previewContent.javascript }} />
          </div>
          <DialogFooter>
            <Button onClick={() => setIsPreviewOpen(false)}>
              Close Preview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserPages;
