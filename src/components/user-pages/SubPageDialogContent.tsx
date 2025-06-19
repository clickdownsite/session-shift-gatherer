
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X, Plus, Upload, Zap, Eye } from 'lucide-react';
import { connectCodeWithAI } from '@/services/aiCodeConnection';
import { toast } from '@/hooks/use-toast';

interface SubPageDialogContentProps {
  subPageForm: any;
  setSubPageForm: (form: any) => void;
  fieldInput: string;
  setFieldInput: (value: string) => void;
  handleAddField: () => void;
  handleRemoveField: (index: number) => void;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  closeDialog: () => void;
  isEditing: boolean;
}

const SubPageDialogContent = ({
  subPageForm,
  setSubPageForm,
  fieldInput,
  setFieldInput,
  handleAddField,
  handleRemoveField,
  handleFileUpload,
  handleSubmit,
  closeDialog,
  isEditing
}: SubPageDialogContentProps) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Load existing data when editing
  useEffect(() => {
    if (isEditing && subPageForm.id) {
      console.log('Loading existing sub page data:', subPageForm);
    }
  }, [isEditing, subPageForm.id]);

  const handleConnectWithAI = async () => {
    const apiKey = localStorage.getItem('gemini_api_key');
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please set your Gemini API key in Settings first.",
        variant: "destructive"
      });
      return;
    }

    if (!subPageForm.html?.trim() && (!subPageForm.fields || subPageForm.fields.length === 0)) {
      toast({
        title: "Content Required",
        description: "Please add HTML content or specify form fields before connecting with AI.",
        variant: "destructive"
      });
      return;
    }

    setIsConnecting(true);
    try {
      const result = await connectCodeWithAI({
        html: subPageForm.html || '',
        css: subPageForm.css || '',
        javascript: subPageForm.javascript || '',
        fields: subPageForm.fields || []
      });

      if (result.success) {
        setSubPageForm({
          ...subPageForm,
          html: result.html,
          css: result.css,
          javascript: result.javascript
        });
        toast({
          title: "AI Connection Successful",
          description: "Your code has been enhanced to capture form data automatically.",
        });
      } else {
        throw new Error(result.error || 'AI connection failed');
      }
    } catch (error) {
      toast({
        title: "AI Connection Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEditing ? 'Edit Sub Page' : 'Create New Sub Page'}</DialogTitle>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4">
          <div>
            <Label htmlFor="name">Page Name</Label>
            <Input
              id="name"
              value={subPageForm.name || ''}
              onChange={(e) => setSubPageForm({ ...subPageForm, name: e.target.value })}
              placeholder="Enter page name"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={subPageForm.description || ''}
              onChange={(e) => setSubPageForm({ ...subPageForm, description: e.target.value })}
              placeholder="Enter page description"
              rows={2}
            />
          </div>
        </div>

        <div>
          <Label>Form Fields</Label>
          <div className="space-y-2">
            {(subPageForm.fields || []).map((field: string, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <Input value={field} readOnly />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleRemoveField(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <div className="flex gap-2">
              <Input
                value={fieldInput}
                onChange={(e) => setFieldInput(e.target.value)}
                placeholder="Add a field name"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddField();
                  }
                }}
              />
              <Button type="button" onClick={handleAddField} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="html">HTML Content</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={togglePreview}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleConnectWithAI}
                  disabled={isConnecting}
                  className="flex items-center gap-2"
                >
                  <Zap className="h-4 w-4" />
                  {isConnecting ? 'Connecting...' : 'Connect with AI'}
                </Button>
              </div>
            </div>
            <Textarea
              id="html"
              value={subPageForm.html || ''}
              onChange={(e) => setSubPageForm({ ...subPageForm, html: e.target.value })}
              placeholder="Enter your HTML code here"
              rows={showPreview ? 4 : 8}
              className="font-mono text-sm"
            />
          </div>

          {showPreview && (
            <div className="border rounded-lg p-4 min-h-[200px] bg-white">
              <style dangerouslySetInnerHTML={{ __html: subPageForm.css || '' }} />
              <div dangerouslySetInnerHTML={{ __html: subPageForm.html || '' }} />
              {subPageForm.javascript && (
                <script dangerouslySetInnerHTML={{ __html: subPageForm.javascript }} />
              )}
            </div>
          )}

          <div>
            <Label htmlFor="css">CSS Styles</Label>
            <Textarea
              id="css"
              value={subPageForm.css || ''}
              onChange={(e) => setSubPageForm({ ...subPageForm, css: e.target.value })}
              placeholder="Enter your CSS code here"
              rows={6}
              className="font-mono text-sm"
            />
          </div>

          <div>
            <Label htmlFor="javascript">JavaScript</Label>
            <Textarea
              id="javascript"
              value={subPageForm.javascript || ''}
              onChange={(e) => setSubPageForm({ ...subPageForm, javascript: e.target.value })}
              placeholder="Enter your JavaScript code here"
              rows={6}
              className="font-mono text-sm"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="file-upload">Upload HTML File</Label>
          <Input
            id="file-upload"
            type="file"
            accept=".html,.htm"
            onChange={handleFileUpload}
            className="mt-1"
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={closeDialog}>
            Cancel
          </Button>
          <Button type="submit">
            {isEditing ? 'Update' : 'Create'} Sub Page
          </Button>
        </div>
      </form>
    </>
  );
};

export default SubPageDialogContent;
