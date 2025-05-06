
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, Edit, Plus, Trash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

// Mock data
const defaultPlans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 9.99,
    interval: 'monthly',
    features: ['Create up to 5 sessions', 'Basic analytics', 'Export data'],
    active: true
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 19.99,
    interval: 'monthly',
    features: ['Unlimited sessions', 'Advanced analytics', 'Priority support', 'Custom branding'],
    active: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 49.99,
    interval: 'monthly',
    features: ['All Premium features', 'Dedicated support', 'API access', 'SLA guarantees', 'Team management'],
    active: true
  },
  {
    id: 'basic-annual',
    name: 'Basic',
    price: 99.99,
    interval: 'annual',
    features: ['Create up to 5 sessions', 'Basic analytics', 'Export data'],
    active: true
  },
  {
    id: 'premium-annual',
    name: 'Premium',
    price: 199.99,
    interval: 'annual',
    features: ['Unlimited sessions', 'Advanced analytics', 'Priority support', 'Custom branding'],
    active: true
  },
  {
    id: 'enterprise-annual',
    name: 'Enterprise',
    price: 499.99,
    interval: 'annual',
    features: ['All Premium features', 'Dedicated support', 'API access', 'SLA guarantees', 'Team management'],
    active: true
  }
];

const AdminSubscriptions = () => {
  const [plans, setPlans] = useState(defaultPlans);
  const [editingPlan, setEditingPlan] = useState<typeof defaultPlans[0] | null>(null);
  const [activeTab, setActiveTab] = useState('monthly');
  
  const filteredPlans = plans.filter(plan => plan.interval === activeTab);

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    
    const updatedPlans = plans.map(plan => 
      plan.id === editingPlan.id ? editingPlan : plan
    );
    
    setPlans(updatedPlans);
    toast({
      title: "Plan Updated",
      description: `${editingPlan.name} plan has been successfully updated.`
    });
    setEditingPlan(null);
  };

  const handleAddPlan = () => {
    const newId = `new-plan-${Date.now()}`;
    const newPlan = {
      id: newId,
      name: "New Plan",
      price: 0,
      interval: activeTab,
      features: ["New feature"],
      active: true
    };
    
    setPlans([...plans, newPlan]);
    setEditingPlan(newPlan);
  };

  const handleTogglePlanStatus = (planId: string) => {
    const updatedPlans = plans.map(plan => 
      plan.id === planId ? {...plan, active: !plan.active} : plan
    );
    setPlans(updatedPlans);
    
    const plan = plans.find(p => p.id === planId);
    toast({
      title: plan?.active ? "Plan Disabled" : "Plan Enabled",
      description: `${plan?.name} plan is now ${plan?.active ? 'disabled' : 'enabled'}.`
    });
  };

  const handleDeletePlan = (planId: string) => {
    const updatedPlans = plans.filter(plan => plan.id !== planId);
    setPlans(updatedPlans);
    
    const plan = plans.find(p => p.id === planId);
    toast({
      title: "Plan Deleted",
      description: `${plan?.name} plan has been deleted.`,
      variant: "destructive"
    });
  };

  const handleAddFeature = () => {
    if (!editingPlan) return;
    setEditingPlan({
      ...editingPlan,
      features: [...editingPlan.features, "New feature"]
    });
  };

  const handleUpdateFeature = (index: number, value: string) => {
    if (!editingPlan) return;
    const updatedFeatures = [...editingPlan.features];
    updatedFeatures[index] = value;
    setEditingPlan({
      ...editingPlan,
      features: updatedFeatures
    });
  };

  const handleRemoveFeature = (index: number) => {
    if (!editingPlan) return;
    const updatedFeatures = editingPlan.features.filter((_, i) => i !== index);
    setEditingPlan({
      ...editingPlan,
      features: updatedFeatures
    });
  };

  return (
    <div className="container mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Subscription Plans</h1>
          <p className="text-muted-foreground">Manage subscription plans and pricing</p>
        </div>
      </div>

      <Tabs defaultValue="monthly" value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="monthly">Monthly Plans</TabsTrigger>
            <TabsTrigger value="annual">Annual Plans</TabsTrigger>
          </TabsList>
          <Button onClick={handleAddPlan}>
            <Plus className="mr-2 h-4 w-4" /> Add New Plan
          </Button>
        </div>

        <TabsContent value="monthly" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredPlans.map(plan => (
              <Card key={plan.id} className={`relative overflow-hidden ${!plan.active ? 'opacity-60' : ''}`}>
                {!plan.active && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary">Disabled</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>
                    <div className="flex items-end gap-1 mt-2">
                      <span className="text-3xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2 text-green-500">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="flex justify-between pt-2">
                  <div className="flex items-center">
                    <Switch 
                      checked={plan.active}
                      onCheckedChange={() => handleTogglePlanStatus(plan.id)}
                      id={`status-${plan.id}`}
                    />
                    <Label htmlFor={`status-${plan.id}`} className="ml-2">
                      {plan.active ? "Active" : "Disabled"}
                    </Label>
                  </div>
                  <div>
                    <Button variant="ghost" size="icon" onClick={() => setEditingPlan(plan)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive"
                      onClick={() => handleDeletePlan(plan.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="annual" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredPlans.map(plan => (
              <Card key={plan.id} className={`relative overflow-hidden ${!plan.active ? 'opacity-60' : ''}`}>
                {!plan.active && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary">Disabled</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>
                    <div className="flex items-end gap-1 mt-2">
                      <span className="text-3xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground">/year</span>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2 text-green-500">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="flex justify-between pt-2">
                  <div className="flex items-center">
                    <Switch 
                      checked={plan.active}
                      onCheckedChange={() => handleTogglePlanStatus(plan.id)}
                      id={`status-${plan.id}`}
                    />
                    <Label htmlFor={`status-${plan.id}`} className="ml-2">
                      {plan.active ? "Active" : "Disabled"}
                    </Label>
                  </div>
                  <div>
                    <Button variant="ghost" size="icon" onClick={() => setEditingPlan(plan)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive"
                      onClick={() => handleDeletePlan(plan.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {editingPlan && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>
              {editingPlan.id.startsWith('new-plan') ? 'Add New Plan' : 'Edit Plan'}
            </CardTitle>
            <CardDescription>
              {editingPlan.id.startsWith('new-plan') ? 'Create a new subscription plan' : 'Modify the existing plan details'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSavePlan} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Plan Name</Label>
                  <Input 
                    id="name" 
                    value={editingPlan.name}
                    onChange={(e) => setEditingPlan({...editingPlan, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                    <Input 
                      id="price" 
                      type="number" 
                      step="0.01" 
                      min="0"
                      className="pl-8" 
                      value={editingPlan.price}
                      onChange={(e) => setEditingPlan({...editingPlan, price: parseFloat(e.target.value)})}
                      required
                    />
                  </div>
                </div>
              </div>
            
              <div className="space-y-2">
                <Label>Features</Label>
                <div className="space-y-3">
                  {editingPlan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input 
                        value={feature}
                        onChange={(e) => handleUpdateFeature(index, e.target.value)}
                      />
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive shrink-0"
                        onClick={() => handleRemoveFeature(index)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full mt-2"
                    onClick={handleAddFeature}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Feature
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="plan-active" 
                  checked={editingPlan.active}
                  onCheckedChange={(checked) => setEditingPlan({...editingPlan, active: checked})}
                />
                <Label htmlFor="plan-active">Active</Label>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditingPlan(null)}>
                  Cancel
                </Button>
                <Button type="submit">Save Plan</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminSubscriptions;
