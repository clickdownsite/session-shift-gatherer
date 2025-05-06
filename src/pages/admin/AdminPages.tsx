
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Plus, Pencil, Trash } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const pageTemplates = [
  {
    id: "login1",
    name: "Email & Password Login",
    description: "Standard email and password login form",
    fields: ["email", "password"],
    html: `<div class="p-6">
      <h1 class="text-2xl font-bold mb-4">Login</h1>
      <div class="mb-4">
        <label class="block mb-2">Email</label>
        <input type="email" class="w-full p-2 border rounded" />
      </div>
      <div class="mb-4">
        <label class="block mb-2">Password</label>
        <input type="password" class="w-full p-2 border rounded" />
      </div>
      <button class="bg-purple-600 text-white px-4 py-2 rounded">Submit</button>
    </div>`
  },
  {
    id: "login2",
    name: "Authentication Code",
    description: "Single auth code input form",
    fields: ["auth_code"],
    html: `<div class="p-6">
      <h1 class="text-2xl font-bold mb-4">Enter Authentication Code</h1>
      <div class="mb-4">
        <label class="block mb-2">Auth Code</label>
        <input type="text" class="w-full p-2 border rounded" />
      </div>
      <button class="bg-purple-600 text-white px-4 py-2 rounded">Submit</button>
    </div>`
  },
  {
    id: "login3",
    name: "OTP Verification",
    description: "One-time password verification form",
    fields: ["otp"],
    html: `<div class="p-6">
      <h1 class="text-2xl font-bold mb-4">OTP Verification</h1>
      <div class="mb-4">
        <label class="block mb-2">Enter One-Time Password</label>
        <input type="text" class="w-full p-2 border rounded" />
      </div>
      <button class="bg-purple-600 text-white px-4 py-2 rounded">Verify</button>
    </div>`
  },
  {
    id: "login4",
    name: "Social Login",
    description: "Social media login options",
    fields: ["provider"],
    html: `<div class="p-6">
      <h1 class="text-2xl font-bold mb-4">Login with Social Media</h1>
      <div class="flex flex-col gap-4">
        <button class="bg-blue-600 text-white px-4 py-2 rounded">Login with Facebook</button>
        <button class="bg-cyan-500 text-white px-4 py-2 rounded">Login with Twitter</button>
        <button class="bg-red-500 text-white px-4 py-2 rounded">Login with Google</button>
      </div>
    </div>`
  }
];

const AdminPages = () => {
  const [templates, setTemplates] = useState(pageTemplates);
  const [editingTemplate, setEditingTemplate] = useState<typeof pageTemplates[0] | null>(null);
  const [previewHTML, setPreviewHTML] = useState('');

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTemplate) {
      const updatedTemplates = templates.map(t => 
        t.id === editingTemplate.id ? editingTemplate : t
      );
      setTemplates(updatedTemplates);
      toast({
        title: "Template Updated",
        description: `${editingTemplate.name} has been successfully updated.`
      });
      setEditingTemplate(null);
    }
  };

  const handleAddTemplate = () => {
    const newId = `login${templates.length + 1}`;
    const newTemplate = {
      id: newId,
      name: "New Template",
      description: "New page template description",
      fields: [],
      html: `<div class="p-6">
        <h1 class="text-2xl font-bold mb-4">New Template</h1>
        <div class="mb-4">
          <label class="block mb-2">Enter Information</label>
          <input type="text" class="w-full p-2 border rounded" />
        </div>
        <button class="bg-purple-600 text-white px-4 py-2 rounded">Submit</button>
      </div>`
    };
    
    setTemplates([...templates, newTemplate]);
    setEditingTemplate(newTemplate);
  };

  const handlePreview = (html: string) => {
    setPreviewHTML(html);
  };

  return (
    <div className="container mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Session Page Templates</h1>
          <p className="text-muted-foreground">Create and manage session page templates</p>
        </div>
        <Button onClick={handleAddTemplate}>
          <Plus className="mr-2 h-4 w-4" /> Add New Template
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {templates.map((template) => (
              <Card key={template.id} className="session-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex items-center text-muted-foreground">
                    <FileText className="h-4 w-4 mr-2" />
                    <span>Template ID: {template.id}</span>
                  </div>
                  <div className="mt-2">
                    <div className="text-sm font-medium">Fields:</div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {template.fields.map((field) => (
                        <div key={field} className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs">
                          {field}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2 flex justify-between">
                  <Button variant="outline" size="sm" onClick={() => handlePreview(template.html)}>
                    Preview
                  </Button>
                  <div>
                    <Button variant="ghost" size="icon" onClick={() => setEditingTemplate(template)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          {editingTemplate ? (
            <Card>
              <CardHeader>
                <CardTitle>Edit Template</CardTitle>
                <CardDescription>Modify the template properties</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveTemplate}>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Template Name</Label>
                      <Input 
                        id="name" 
                        value={editingTemplate.name}
                        onChange={(e) => setEditingTemplate({...editingTemplate, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Input 
                        id="description" 
                        value={editingTemplate.description}
                        onChange={(e) => setEditingTemplate({...editingTemplate, description: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fields">Fields (comma separated)</Label>
                      <Input 
                        id="fields" 
                        value={editingTemplate.fields.join(',')}
                        onChange={(e) => setEditingTemplate(
                          {...editingTemplate, fields: e.target.value.split(',').map(f => f.trim())}
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="html">HTML Template</Label>
                      <Textarea 
                        id="html" 
                        className="font-mono min-h-[200px]"
                        value={editingTemplate.html}
                        onChange={(e) => setEditingTemplate({...editingTemplate, html: e.target.value})}
                      />
                    </div>
                    <div className="flex justify-between">
                      <Button variant="outline" type="button" onClick={() => setEditingTemplate(null)}>
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
    </div>
  );
};

export default AdminPages;
