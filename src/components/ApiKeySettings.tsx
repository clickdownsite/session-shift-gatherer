
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Key } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ApiKeySettings = () => {
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      setGeminiApiKey(savedKey);
    }
  }, []);

  const handleSaveApiKey = () => {
    if (!geminiApiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid API key",
        variant: "destructive"
      });
      return;
    }

    localStorage.setItem('gemini_api_key', geminiApiKey);
    toast({
      title: "API Key Saved",
      description: "Gemini API key has been saved successfully",
    });
  };

  const handleTestApiKey = async () => {
    if (!geminiApiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter an API key first",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiApiKey}`);
      if (response.ok) {
        toast({
          title: "Success",
          description: "API key is valid and working",
        });
      } else {
        throw new Error('Invalid API key');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "API key is invalid or there was a connection error",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          AI Integration Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="gemini-key">Gemini 2.0 Flash API Key</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="gemini-key"
                type={showKey ? "text" : "password"}
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="Enter your Gemini API key"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Get your API key from{' '}
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Google AI Studio
            </a>
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSaveApiKey}>Save API Key</Button>
          <Button variant="outline" onClick={handleTestApiKey}>Test Connection</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiKeySettings;
