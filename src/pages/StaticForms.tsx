
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Edit, Trash2, ExternalLink, BarChart3 } from 'lucide-react';
import { useStaticForms } from '@/hooks/useStaticForms';
import StaticFormBuilder from '@/components/StaticFormBuilder';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const StaticForms = () => {
  const { staticForms, isLoading, deleteStaticForm } = useStaticForms();
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingForm, setEditingForm] = useState(null);

  const handleEdit = (form: any) => {
    setEditingForm(form);
    setShowBuilder(true);
  };

  const handleCreate = () => {
    setEditingForm(null);
    setShowBuilder(true);
  };

  const handleCloseBuilder = () => {
    setShowBuilder(false);
    setEditingForm(null);
  };

  const getFormUrl = (formId: string) => {
    return `${window.location.origin}/form/${formId}`;
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    // You could add a toast notification here to confirm the copy.
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
        <Button onClick={handleCreate}>
          <Plus />
          Create Static Form
        </Button>
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
                  {form.is_active ? "Active" : "Inactive"}
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
                        <ExternalLink />
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
                  <Eye />
                  View
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(form)}
                >
                  <Edit />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                >
                  <BarChart3 />
                  Analytics
                </Button>
                <div className="flex-grow" />
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteStaticForm(form.id)}
                  aria-label="Delete form"
                >
                  <Trash2 />
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
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold">No static forms yet</h3>
                <p className="text-muted-foreground mt-2">
                  Create your first static form to start collecting data.
                </p>
              </div>
              <Button onClick={handleCreate} className="mt-4">
                <Plus />
                Create Your First Form
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
