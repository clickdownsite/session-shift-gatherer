
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { toast } from 'sonner';
import VisualFlowBuilder from "@/components/flows/VisualFlowBuilder";

type SubPage = {
  id: string;
  name: string;
  main_page_id: string;
};

type FlowStep = {
  id: string;
  sub_page_id: string;
  name: string;
  action: "next" | "jump_to" | "end";
  jump_to_index?: number;
  position: { x: number; y: number };
};

type PageFlow = {
  id: string;
  name: string;
  steps: FlowStep[];
  updated_at: string;
  created_at: string;
};

const fetchPageFlows = async (): Promise<PageFlow[]> => {
  const { data, error } = await supabase
    .from("page_flows")
    .select("*")
    .order("updated_at", { ascending: false });
  
  if (error) throw error;
  
  return (data as any[]).map((row): PageFlow => ({
    ...row,
    steps: Array.isArray(row.steps) ? row.steps : [],
  }));
};

const fetchSubPages = async (): Promise<SubPage[]> => {
  const { data, error } = await supabase
    .from("sub_pages")
    .select("id, name, main_page_id")
    .order("name");
  if (error) throw error;
  return data as SubPage[];
};

const FlowsPage = () => {
  const queryClient = useQueryClient();
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingFlow, setEditingFlow] = useState<PageFlow | null>(null);

  const { data: flows = [], isLoading: flowsLoading } = useQuery({ 
    queryKey: ["page_flows"], 
    queryFn: fetchPageFlows 
  });
  
  const { data: subPages = [], isLoading: subLoading } = useQuery({ 
    queryKey: ["sub_pages_simple"], 
    queryFn: fetchSubPages 
  });

  const { mutate: saveFlow, isPending: saving } = useMutation({
    mutationFn: async (flowData: { name: string; steps: FlowStep[] }) => {
      if (editingFlow) {
        const { error } = await supabase
          .from("page_flows")
          .update({ 
            name: flowData.name, 
            steps: flowData.steps, 
            updated_at: new Date().toISOString() 
          })
          .eq("id", editingFlow.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("page_flows")
          .insert({
            name: flowData.name,
            steps: flowData.steps,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page_flows"] });
      setIsBuilderOpen(false);
      setEditingFlow(null);
      toast.success(editingFlow ? 'Flow updated successfully' : 'Flow created successfully');
    },
    onError: (error) => {
      toast.error('Failed to save flow: ' + error.message);
    }
  });

  const { mutate: deleteFlow } = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("page_flows").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page_flows"] });
      toast.success('Flow deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete flow: ' + error.message);
    }
  });

  const handleCreateFlow = () => {
    setEditingFlow(null);
    setIsBuilderOpen(true);
  };

  const handleEditFlow = (flow: PageFlow) => {
    setEditingFlow(flow);
    setIsBuilderOpen(true);
  };

  const handleDeleteFlow = (flow: PageFlow) => {
    if (confirm(`Are you sure you want to delete "${flow.name}"?`)) {
      deleteFlow(flow.id);
    }
  };

  const handleSaveFlow = (flowData: { name: string; steps: FlowStep[] }) => {
    saveFlow(flowData);
  };

  return (
    <div className="container mx-auto max-w-6xl py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Session Flows</h1>
          <p className="text-muted-foreground mt-2">
            Create visual flows to guide users through multi-step experiences
          </p>
        </div>
        <Button onClick={handleCreateFlow} size="lg">
          <Plus className="h-4 w-4 mr-2" />
          Create Flow
        </Button>
      </div>

      {flowsLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : flows.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-muted-foreground mb-4">
              <Plus className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <h3 className="text-lg font-medium">No flows created yet</h3>
              <p>Create your first flow to guide users through multi-step experiences</p>
            </div>
            <Button onClick={handleCreateFlow}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Flow
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {flows.map((flow) => (
            <Card key={flow.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{flow.name}</CardTitle>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditFlow(flow)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteFlow(flow)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    {flow.steps?.length || 0} steps
                  </div>
                  {flow.steps?.slice(0, 3).map((step, index) => {
                    const subPage = subPages.find(sp => sp.id === step.sub_page_id);
                    return (
                      <div key={step.id} className="flex items-center gap-2 text-sm">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <span className="truncate">
                          {subPage ? subPage.name : 'Missing page'}
                        </span>
                      </div>
                    );
                  })}
                  {(flow.steps?.length || 0) > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{(flow.steps?.length || 0) - 3} more steps
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Visual Flow Builder Dialog */}
      <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] p-0">
          <VisualFlowBuilder
            initialFlow={editingFlow || undefined}
            subPages={subPages}
            onSave={handleSaveFlow}
            onCancel={() => setIsBuilderOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FlowsPage;
