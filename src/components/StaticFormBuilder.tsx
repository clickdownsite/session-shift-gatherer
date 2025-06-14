import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { useStaticForms } from '@/hooks/useStaticForms';
import FileUpload from './FileUpload';

interface FormField {
  id: string;
  type: string;
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
}

interface StaticFormBuilderProps {
  onClose: () => void;
  editingForm?: any;
}

const StaticFormBuilder: React.FC<StaticFormBuilderProps> = ({ onClose, editingForm }) => {
  const { createStaticForm, updateStaticForm } = useStaticForms();
  const [formData, setFormData] = useState({
    name: editingForm?.name || '',
    description: editingForm?.description || '',
    fields: editingForm?.fields || [],
    html: editingForm?.html || '',
    css: editingForm?.css || '',
    javascript: editingForm?.javascript || '',
    is_active: editingForm?.is_active !== undefined ? editingForm.is_active : true
  });

  const [newField, setNewField] = useState<Partial<FormField>>({
    type: 'text',
    label: '',
    required: false,
    placeholder: ''
  });

  const addField = () => {
    if (!newField.label) return;
    
    const field: FormField = {
      id: Math.random().toString(36).substring(7),
      type: newField.type || 'text',
      label: newField.label,
      required: newField.required || false,
      placeholder: newField.placeholder,
      options: newField.type === 'select' ? ['Option 1', 'Option 2'] : undefined
    };
    
    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, field]
    }));
    
    setNewField({ type: 'text', label: '', required: false, placeholder: '' });
  };

  const removeField = (fieldId: string) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter((f: FormField) => f.id !== fieldId)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingForm) {
      updateStaticForm({ formId: editingForm.id, updates: formData });
    } else {
      createStaticForm(formData);
    }
    
    onClose();
  };

  const handleFileUpload = (content: string, type: 'html' | 'css' | 'javascript') => {
    setFormData(prev => ({
      ...prev,
      [type]: content
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {editingForm ? 'Edit Static Form' : 'Create New Static Form'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Form Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label>Active</Label>
                {formData.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Form Fields</h3>
              
              {/* Add New Field */}
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label>Field Type</Label>
                      <select
                        value={newField.type}
                        onChange={(e) => setNewField(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full p-2 border rounded"
                      >
                        <option value="text">Text</option>
                        <option value="email">Email</option>
                        <option value="number">Number</option>
                        <option value="textarea">Textarea</option>
                        <option value="select">Select</option>
                        <option value="checkbox">Checkbox</option>
                        <option value="radio">Radio</option>
                      </select>
                    </div>
                    <div>
                      <Label>Label</Label>
                      <Input
                        value={newField.label}
                        onChange={(e) => setNewField(prev => ({ ...prev, label: e.target.value }))}
                        placeholder="Field label"
                      />
                    </div>
                    <div>
                      <Label>Placeholder</Label>
                      <Input
                        value={newField.placeholder}
                        onChange={(e) => setNewField(prev => ({ ...prev, placeholder: e.target.value }))}
                        placeholder="Placeholder text"
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={newField.required}
                          onCheckedChange={(checked) => setNewField(prev => ({ ...prev, required: checked }))}
                        />
                        <Label>Required</Label>
                      </div>
                      <Button type="button" onClick={addField} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Existing Fields */}
              <div className="space-y-2">
                {formData.fields.map((field: FormField) => (
                  <Card key={field.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{field.type}</Badge>
                          <span className="font-medium">{field.label}</span>
                          {field.required && <Badge variant="secondary">Required</Badge>}
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeField(field.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Custom HTML/CSS/JS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Custom HTML</Label>
                <div className="space-y-2">
                  <FileUpload
                    onFileUpload={handleFileUpload}
                    acceptedTypes={['html']}
                    className="mb-2"
                  />
                  <Textarea
                    value={formData.html}
                    onChange={(e) => setFormData(prev => ({ ...prev, html: e.target.value }))}
                    placeholder="Custom HTML content..."
                    rows={6}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Custom CSS</Label>
                <div className="space-y-2">
                  <FileUpload
                    onFileUpload={handleFileUpload}
                    acceptedTypes={['css']}
                    className="mb-2"
                  />
                  <Textarea
                    value={formData.css}
                    onChange={(e) => setFormData(prev => ({ ...prev, css: e.target.value }))}
                    placeholder="Custom CSS styles..."
                    rows={6}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Custom JavaScript</Label>
                <div className="space-y-2">
                  <FileUpload
                    onFileUpload={handleFileUpload}
                    acceptedTypes={['javascript']}
                    className="mb-2"
                  />
                  <Textarea
                    value={formData.javascript}
                    onChange={(e) => setFormData(prev => ({ ...prev, javascript: e.target.value }))}
                    placeholder="Custom JavaScript code..."
                    rows={6}
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {editingForm ? 'Update Form' : 'Create Form'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaticFormBuilder;
