
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Edit, Archive, ExternalLink, BarChart3, Copy } from 'lucide-react';
import { useStaticForms } from '@/hooks/useStaticForms';
import { useMainPages, useSubPages } from '@/hooks/usePageTemplates';
import StaticFormBuilder from '@/components/StaticFormBuilder';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

const StaticForms = () => {
  const { staticForms, isLoading, deleteStaticForm } = useStaticForms();
  const { data: mainPages = [] } = useMainPages();
  const { data: subPages = [] } = useSubPages();
  
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingForm, setEditingForm] = useState(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  const handleEdit = (form: any) => {
    setEditingForm(form);
    setShowBuilder(true);
  };

  const handleCreate = () => {
    setEditingForm(null);
    setShowBuilder(true);
  };

  const handleCreateFromTemplate = () => {
    setShowTemplateSelector(true);
  };

  const handleCloseBuilder = () => {
    setShowBuilder(false);
    setEditingForm(null);
  };

  const handleSelectTemplate = (mainPage: any, subPage: any) => {
    // Convert template to static form format
    setEditingForm({
      name: subPage.name,
      description: subPage.description,
      fields: subPage.fields || [],
      html: subPage.html || '',
      css: subPage.css || '',
      javascript: subPage.javascript || '',
      is_active: true
    });
    setShowTemplateSelector(false);
    setShowBuilder(true);
  };

  const getFormUrl = (formId: string) => {
    return `${window.location.origin}/form/${formId}`;
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Copied!",
      description: "Form URL copied to clipboard"
    });
  };

  if (isLoading) {
    return <div className="p-4 sm:p-6 lg:p-8">Loading...</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Static Forms</h1>
          <p className="text-muted-foreground">
            Create standalone forms that collect data without requiring live sessions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCreateFromTemplate}>
            <Copy className="h-4 w-4 mr-2" />
            Use Template
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Create Form
          </Button>
        </div>
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staticForms.map((form) => (
          <Card key={form.id} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <CardTitle className="text-lg">{form.name}</CardTitle>
                  {form.description && (
                    <p className="text-sm text-muted-foreground mt-1 break-words">
                      {form.description}
                    </p>
                  )}
                </div>
                <Badge variant={form.is_active ? "default" : "secondary"} className="shrink-0">
                  {form.is_active ? "Active" : "Archived"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
              <div className="space-y-4 flex-grow">
                {/* Form Stats */}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fields: {form.fields.length}</span>
                  <span className="text-muted-foreground">
                    Created: {new Date(form.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Form URL */}
                {form.is_active && (
                  <div className="p-2 bg-muted rounded text-sm break-all">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">URL:</span>
                      <code className="flex-1 truncate">{getFormUrl(form.id)}</code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(getFormUrl(form.id))}
                        aria-label="Copy URL"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-wrap items-center mt-4 pt-4 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(getFormUrl(form.id), '_blank')}
                  disabled={!form.is_active}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(form)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                >
                  <BarChart3 className="h-3 w-3 mr-1" />
                  Stats
                </Button>
                <div className="flex-grow" />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => deleteStaticForm(form.id)}
                  aria-label="Archive form"
                >
                  <Archive className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {staticForms.length === 0 && (
        <Card>
          <CardContent className="text-center py-20">
            <div className="space-y-4 max-w-sm mx-auto">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">No static forms yet</h3>
                <p className="text-muted-foreground mt-2">
                  Create your first static form to start collecting data.
                </p>
              </div>
              <div className="flex gap-2 justify-center">
                <Button onClick={handleCreateFromTemplate} variant="outline">
                  <Copy className="h-4 w-4 mr-2" />
                  Use Template
                </Button>
                <Button onClick={handleCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Form
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Template Selector Dialog */}
      <Dialog open={showTemplateSelector} onOpenChange={setShowTemplateSelector}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Choose a Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {mainPages.map((mainPage) => {
              const pageSubPages = subPages.filter(sp => sp.main_page_id === mainPage.id);
              if (pageSubPages.length === 0) return null;
              
              return (
                <div key={mainPage.id}>
                  <h3 className="text-lg font-semibold mb-3">{mainPage.name}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pageSubPages.map((subPage) => (
                      <Card key={subPage.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleSelectTemplate(mainPage, subPage)}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">{subPage.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{subPage.description}</p>
                        </CardHeader>
                        <CardContent>
                          <div className="text-xs text-muted-foreground">
                            Fields: {subPage.fields?.length || 0}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Form Builder Dialog */}
      <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <StaticFormBuilder
            onClose={handleCloseBuilder}
            editingForm={editingForm}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaticForms;
