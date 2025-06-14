
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useStaticFormSubmissions } from '@/hooks/useStaticForms';
import { useInteractionTracking } from '@/hooks/useInteractionTracking';
import { StaticForm } from '@/hooks/useStaticForms';

const StaticFormPage = () => {
  const { formId } = useParams();
  const { submitForm } = useStaticFormSubmissions(formId);
  const { trackInteraction } = useInteractionTracking();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);

  // Fetch form data
  const { data: form, isLoading, error } = useQuery({
    queryKey: ['static_form', formId],
    queryFn: async () => {
      if (!formId) throw new Error('Form ID is required');
      
      const { data, error } = await supabase
        .from('static_forms')
        .select('*')
        .eq('id', formId)
        .eq('is_active', true)
        .single();
      
      if (error) throw error;
      return data as StaticForm;
    },
    enabled: !!formId,
  });

  // Set up interaction tracking
  useEffect(() => {
    if (!form) return;
    
    const cleanup = (() => {
      // Track page load
      trackInteraction({
        formId: form.id,
        interactionType: 'page_load',
        pageUrl: window.location.href
      });

      // Set up click tracking
      const handleClick = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        trackInteraction({
          formId: form.id,
          interactionType: 'click',
          elementSelector: getElementSelector(target),
          interactionData: {
            x: event.clientX,
            y: event.clientY,
            tagName: target.tagName
          }
        });
      };

      // Set up form field tracking
      const handleInputChange = (event: Event) => {
        const target = event.target as HTMLInputElement;
        trackInteraction({
          formId: form.id,
          interactionType: 'input_change',
          elementSelector: getElementSelector(target),
          interactionData: {
            fieldName: target.name || target.id,
            value: target.value,
            type: target.type
          }
        });
      };

      document.addEventListener('click', handleClick);
      document.addEventListener('input', handleInputChange);

      return () => {
        document.removeEventListener('click', handleClick);
        document.removeEventListener('input', handleInputChange);
      };
    })();

    return cleanup;
  }, [form, trackInteraction]);

  const getElementSelector = (element: HTMLElement): string => {
    if (element.id) return `#${element.id}`;
    const nameAttr = element.getAttribute('name');
    if (nameAttr) return `[name="${nameAttr}"]`;
    if (element.className) return `.${element.className.split(' ')[0]}`;
    return element.tagName.toLowerCase();
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form) return;

    // Track form submission
    trackInteraction({
      formId: form.id,
      interactionType: 'form_submit',
      interactionData: formData
    });

    submitForm({
      formId: form.id,
      submissionData: formData
    });

    setSubmitted(true);
  };

  const renderField = (field: any) => {
    const { id, type, label, required, placeholder, options } = field;

    switch (type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <div key={id} className="space-y-2">
            <Label htmlFor={id}>
              {label} {required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={id}
              name={id}
              type={type}
              placeholder={placeholder}
              required={required}
              value={formData[id] || ''}
              onChange={(e) => handleFieldChange(id, e.target.value)}
            />
          </div>
        );

      case 'textarea':
        return (
          <div key={id} className="space-y-2">
            <Label htmlFor={id}>
              {label} {required && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id={id}
              name={id}
              placeholder={placeholder}
              required={required}
              value={formData[id] || ''}
              onChange={(e) => handleFieldChange(id, e.target.value)}
            />
          </div>
        );

      case 'select':
        return (
          <div key={id} className="space-y-2">
            <Label htmlFor={id}>
              {label} {required && <span className="text-red-500">*</span>}
            </Label>
            <Select
              name={id}
              required={required}
              value={formData[id] || ''}
              onValueChange={(value) => handleFieldChange(id, value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={placeholder || 'Select an option'} />
              </SelectTrigger>
              <SelectContent>
                {options?.map((option: string, index: number) => (
                  <SelectItem key={index} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'checkbox':
        return (
          <div key={id} className="flex items-center space-x-2">
            <Checkbox
              id={id}
              name={id}
              required={required}
              checked={formData[id] || false}
              onCheckedChange={(checked) => handleFieldChange(id, checked)}
            />
            <Label htmlFor={id}>
              {label} {required && <span className="text-red-500">*</span>}
            </Label>
          </div>
        );

      case 'radio':
        return (
          <div key={id} className="space-y-2">
            <Label>
              {label} {required && <span className="text-red-500">*</span>}
            </Label>
            <RadioGroup
              name={id}
              required={required}
              value={formData[id] || ''}
              onValueChange={(value) => handleFieldChange(id, value)}
            >
              {options?.map((option: string, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${id}-${index}`} />
                  <Label htmlFor={`${id}-${index}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading form...</div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Form Not Found</h2>
            <p className="text-muted-foreground">
              The form you're looking for doesn't exist or has been deactivated.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">Thank You!</h2>
                <p className="text-muted-foreground">
                  Your response has been submitted successfully.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Custom CSS */}
      {form.css && (
        <style dangerouslySetInnerHTML={{ __html: form.css }} />
      )}

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>{form.name}</CardTitle>
            {form.description && (
              <p className="text-muted-foreground">{form.description}</p>
            )}
          </CardHeader>
          <CardContent>
            {/* Custom HTML */}
            {form.html && (
              <div 
                className="mb-6"
                dangerouslySetInnerHTML={{ __html: form.html }} 
              />
            )}

            {/* Dynamic Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {form.fields.map(renderField)}
              
              <Button type="submit" className="w-full">
                Submit
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Custom JavaScript */}
      {form.javascript && (
        <script dangerouslySetInnerHTML={{ __html: form.javascript }} />
      )}
    </div>
  );
};

export default StaticFormPage;
