
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Settings, TrendingUp } from 'lucide-react';
import { useABTesting } from '@/hooks/useABTesting';
import { toast } from '@/hooks/use-toast';

const ABTestManager = () => {
  const { userTests, createTest } = useABTesting();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTest, setNewTest] = useState({
    name: '',
    description: '',
    variants: [
      { id: 'control', name: 'Control', config: {} },
      { id: 'variant_a', name: 'Variant A', config: {} }
    ],
    traffic_split: { control: 50, variant_a: 50 },
    target_pages: ['*']
  });

  const handleCreateTest = () => {
    if (!newTest.name.trim()) {
      toast({
        title: "Error",
        description: "Test name is required",
        variant: "destructive"
      });
      return;
    }

    createTest(newTest);
    setShowCreateForm(false);
    setNewTest({
      name: '',
      description: '',
      variants: [
        { id: 'control', name: 'Control', config: {} },
        { id: 'variant_a', name: 'Variant A', config: {} }
      ],
      traffic_split: { control: 50, variant_a: 50 },
      target_pages: ['*']
    });
    
    toast({
      title: "Success",
      description: "A/B test created successfully"
    });
  };

  const addVariant = () => {
    const variantId = `variant_${String.fromCharCode(65 + newTest.variants.length - 1)}`;
    const newVariant = {
      id: variantId,
      name: `Variant ${String.fromCharCode(65 + newTest.variants.length - 1)}`,
      config: {}
    };
    
    setNewTest(prev => ({
      ...prev,
      variants: [...prev.variants, newVariant],
      traffic_split: {
        ...prev.traffic_split,
        [variantId]: 0
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">A/B Testing</h2>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Test
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New A/B Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="test-name">Test Name</Label>
                <Input
                  id="test-name"
                  value={newTest.name}
                  onChange={(e) => setNewTest(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Homepage Hero Test"
                />
              </div>
              <div>
                <Label htmlFor="target-pages">Target Pages</Label>
                <Input
                  id="target-pages"
                  value={newTest.target_pages.join(', ')}
                  onChange={(e) => setNewTest(prev => ({ 
                    ...prev, 
                    target_pages: e.target.value.split(',').map(p => p.trim()) 
                  }))}
                  placeholder="/, /home, /landing"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newTest.description}
                onChange={(e) => setNewTest(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Testing different hero section layouts..."
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Variants & Traffic Split</Label>
                <Button size="sm" variant="outline" onClick={addVariant}>
                  Add Variant
                </Button>
              </div>
              
              <div className="space-y-2">
                {newTest.variants.map((variant) => (
                  <div key={variant.id} className="flex items-center gap-4 p-3 border rounded">
                    <div className="flex-1">
                      <Input
                        value={variant.name}
                        onChange={(e) => {
                          const updatedVariants = newTest.variants.map(v =>
                            v.id === variant.id ? { ...v, name: e.target.value } : v
                          );
                          setNewTest(prev => ({ ...prev, variants: updatedVariants }));
                        }}
                        placeholder="Variant name"
                      />
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={newTest.traffic_split[variant.id] || 0}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          setNewTest(prev => ({
                            ...prev,
                            traffic_split: {
                              ...prev.traffic_split,
                              [variant.id]: value
                            }
                          }));
                        }}
                        placeholder="50"
                      />
                      <div className="text-xs text-muted-foreground mt-1">%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreateTest}>Create Test</Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {userTests.map((test) => (
          <Card key={test.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {test.name}
                    <Badge variant={test.is_active ? "default" : "secondary"}>
                      {test.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </CardTitle>
                  {test.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {test.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <TrendingUp className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="variants">
                <TabsList>
                  <TabsTrigger value="variants">Variants</TabsTrigger>
                  <TabsTrigger value="targeting">Targeting</TabsTrigger>
                  <TabsTrigger value="results">Results</TabsTrigger>
                </TabsList>
                
                <TabsContent value="variants" className="space-y-2">
                  {test.variants.map((variant: any) => (
                    <div key={variant.id} className="flex justify-between items-center p-2 border rounded">
                      <span className="font-medium">{variant.name}</span>
                      <Badge variant="outline">
                        {test.traffic_split[variant.id] || 0}%
                      </Badge>
                    </div>
                  ))}
                </TabsContent>
                
                <TabsContent value="targeting">
                  <div className="text-sm">
                    <strong>Target Pages:</strong> {test.target_pages.join(', ')}
                  </div>
                </TabsContent>
                
                <TabsContent value="results">
                  <div className="text-sm text-muted-foreground">
                    Results data will be available here once the test starts collecting data.
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ))}
      </div>

      {userTests.length === 0 && !showCreateForm && (
        <Card>
          <CardContent className="p-12 text-center">
            <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No A/B Tests Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first A/B test to start optimizing your conversion rates.
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Test
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ABTestManager;
