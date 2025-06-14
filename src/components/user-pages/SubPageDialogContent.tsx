
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import FileUpload from '@/components/FileUpload';

interface SubPageDialogContentProps {
  subPageForm: {
    name: string;
    description: string;
    fields: string[];
    html: string;
    css: string;
    javascript: string;
  };
  setSubPageForm: React.Dispatch<React.SetStateAction<any>>;
  fieldInput: string;
  setFieldInput: React.Dispatch<React.SetStateAction<string>>;
  handleAddField: () => void;
  handleRemoveField: (field: string) => void;
  handleFileUpload: (content: string, type: 'html' | 'css' | 'javascript') => void;
  handleSubmit: () => void;
  closeDialog: () => void;
  isEditing: boolean;
}

const SubPageDialogContent: React.FC<SubPageDialogContentProps> = ({
  subPageForm,
  setSubPageForm,
  fieldInput,
  setFieldInput,
  handleAddField,
  handleRemoveField,
  handleFileUpload,
  handleSubmit,
  closeDialog,
  isEditing,
}) => {
  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {isEditing ? 'Edit Sub Page' : 'Create New Sub Page'}
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
                  onFileUpload={(content) => handleFileUpload(content, 'html')}
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
                  onFileUpload={(content) => handleFileUpload(content, 'css')}
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
                  onFileUpload={(content) => handleFileUpload(content, 'javascript')}
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
        <Button onClick={handleSubmit}>
          {isEditing ? 'Update Sub Page' : 'Create Sub Page'}
        </Button>
        <Button variant="outline" onClick={closeDialog}>
          Cancel
        </Button>
      </div>
    </>
  );
};

export default SubPageDialogContent;
