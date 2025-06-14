
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
    return `${window.location.origin}/static-form/${formId}`;
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Static Forms</h1>
          <p className="text-muted-foreground">
            Create standalone forms that collect data without requiring live sessions
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Static Form
        </Button>
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staticForms.map((form) => (
          <Card key={form.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{form.name}</CardTitle>
                  {form.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {form.description}
                    </p>
                  )}
                </div>
                <Badge variant={form.is_active ? "default" : "secondary"}>
                  {form.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Form Stats */}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fields: {form.fields.length}</span>
                  <span className="text-muted-foreground">
                    Created: {new Date(form.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Form URL */}
                {form.is_active && (
                  <div className="p-2 bg-muted rounded text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">URL:</span>
                      <code className="flex-1 truncate">{getFormUrl(form.id)}</code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(getFormUrl(form.id))}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(getFormUrl(form.id), '_blank')}
                    disabled={!form.is_active}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(form)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                  >
                    <BarChart3 className="h-4 w-4 mr-1" />
                    Analytics
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteStaticForm(form.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {staticForms.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">No static forms yet</h3>
                <p className="text-muted-foreground">
                  Create your first static form to start collecting data
                </p>
              </div>
              <Button onClick={handleCreate}>
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
