import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ArrowUp, ArrowDown, X } from "lucide-react";

type SubPage = {
  id: string;
  name: string;
  main_page_id: string;
};

type FlowStep = {
  sub_page_id: string;
  action: "next" | "jump_to";
  jump_to_index?: number;
};

type PageFlow = {
  id: string;
  name: string;
  steps: FlowStep[];
  updated_at: string;
  created_at: string;
};

const fetchPageFlows = async (): Promise<PageFlow[]> => {
  const { data, error } = await supabase.from("page_flows").select("*").order("updated_at", { ascending: false });
  if (error) throw error;
  // Fix: Ensure steps is FlowStep[]
  return (data as any[]).map((row): PageFlow => ({
    ...row,
    steps: Array.isArray(row.steps)
      ? (row.steps as FlowStep[])
      : [],
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

const defaultStep: FlowStep = { sub_page_id: "", action: "next" };

const FlowsPage = () => {
  const queryClient = useQueryClient();
  const { data: flows = [], isLoading: flowsLoading } = useQuery({ queryKey: ["page_flows"], queryFn: fetchPageFlows });
  const { data: subPages = [], isLoading: subLoading } = useQuery({ queryKey: ["sub_pages_simple"], queryFn: fetchSubPages });

  // State for currently editing flow
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFlow, setEditingFlow] = useState<PageFlow | null>(null);
  const [localName, setLocalName] = useState("");
  const [localSteps, setLocalSteps] = useState<FlowStep[]>([]);

  // Start editing or creating a flow
  const handleEdit = (flow?: PageFlow) => {
    if (flow) {
      setEditingFlow(flow);
      setLocalName(flow.name);
      setLocalSteps(flow.steps || []);
    } else {
      setEditingFlow(null);
      setLocalName("");
      setLocalSteps([]);
    }
    setIsDialogOpen(true);
  };

  // Save (insert or update) a flow
  const { mutate: saveFlow, isPending: saving } = useMutation({
    mutationFn: async () => {
      // Validate: must have name+at least one step (with sub_page_id)
      if (!localName.trim() || localSteps.length === 0 || localSteps.some(step => !step.sub_page_id)) {
        throw new Error("Please enter a name and select at least one sub page for all steps.");
      }
      if (editingFlow) {
        // Update
        const { error } = await supabase
          .from("page_flows")
          .update({ name: localName, steps: localSteps, updated_at: new Date().toISOString() })
          .eq("id", editingFlow.id);
        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from("page_flows")
          .insert({
            name: localName,
            steps: localSteps,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page_flows"] });
      setIsDialogOpen(false);
    }
  });

  // Delete a flow
  const { mutate: deleteFlow } = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("page_flows").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page_flows"] });
    }
  });

  // Add/Remove/Reorder steps locally
  const handleAddStep = () => setLocalSteps([...localSteps, { ...defaultStep }]);
  const handleRemoveStep = (idx: number) => setLocalSteps(localSteps.filter((_, i) => i !== idx));
  const handleStepChange = (idx: number, key: keyof FlowStep, value: any) => {
    setLocalSteps(localSteps.map((step, i) => i === idx ? { ...step, [key]: value } : step));
  };
  const handleStepMove = (idx: number, dir: "up" | "down") => {
    const arr = [...localSteps];
    if (dir === "up" && idx > 0) [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
    if (dir === "down" && idx < arr.length - 1) [arr[idx + 1], arr[idx]] = [arr[idx], arr[idx + 1]];
    setLocalSteps(arr);
  };

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Manage Session Flows</h1>
        <Button onClick={() => handleEdit()} variant="default">
          <Plus className="h-4 w-4 mr-1" /> New Flow
        </Button>
      </div>
      {/* Flows List */}
      <div className="grid gap-6">
        {flowsLoading ? (
          <div>Loading flows...</div>
        ) : flows.length === 0 ? (
          <div className="text-center text-muted-foreground">No flows created yet.</div>
        ) : (
          flows.map(flow => (
            <Card key={flow.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>{flow.name}</CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(flow)}>Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteFlow(flow.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {flow.steps?.length > 0 && (
                <CardContent>
                  <ol className="space-y-2">
                    {flow.steps.map((step, idx) => {
                      const subPage = subPages.find(sp => sp.id === step.sub_page_id);
                      return (<li key={idx} className="flex gap-2 items-center">
                        <span className="rounded bg-muted px-2 py-0.5">{idx + 1}.</span>
                        <span>{subPage ? subPage.name : <span className="text-red-600">[Missing]</span>}</span>
                        <span className="text-xs text-muted-foreground ml-2">{step.action === "next"
                          ? "(Next)"
                          : step.action === "jump_to"
                            ? `(Jump to #${(step.jump_to_index ?? "")})`
                            : ""
                        }</span>
                      </li>);
                    })}
                  </ol>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
      {/* Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <form className="space-y-6" onSubmit={e => { e.preventDefault(); saveFlow(); }}>
            <div>
              <Label>Flow Name</Label>
              <input
                className="w-full border rounded px-2 py-1 mt-1"
                value={localName}
                onChange={e => setLocalName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Steps</Label>
              {localSteps.length === 0 && (
                <div className="text-xs mt-1 text-muted-foreground">No steps. Add sub-pages for session flow.</div>
              )}
              <ol className="space-y-4 mt-2">
                {localSteps.map((step, idx) => (
                  <li key={idx} className="flex gap-3 items-center">
                    <Select
                      value={step.sub_page_id}
                      onValueChange={val => handleStepChange(idx, "sub_page_id", val)}
                    >
                      <SelectTrigger className="min-w-[180px]">
                        <SelectValue placeholder="Select Sub Page" />
                      </SelectTrigger>
                      <SelectContent>
                        {subLoading
                          ? <SelectItem value="">Loading...</SelectItem>
                          : subPages.map(sp => (
                            <SelectItem key={sp.id} value={sp.id}>{sp.name}</SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={step.action}
                      onValueChange={val => handleStepChange(idx, "action", val as "next" | "jump_to")}
                    >
                      <SelectTrigger className="min-w-[100px]">
                        <SelectValue placeholder="Action" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="next">Next</SelectItem>
                        <SelectItem value="jump_to">Jump to...</SelectItem>
                      </SelectContent>
                    </Select>
                    {step.action === "jump_to" && (
                      <input
                        type="number"
                        min={0}
                        max={localSteps.length - 1}
                        value={step.jump_to_index ?? ""}
                        className="w-16 border rounded px-1 py-0.5 text-center"
                        placeholder="#"
                        onChange={e => handleStepChange(idx, "jump_to_index", e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    )}
                    <Button variant="ghost" size="icon" onClick={() => handleStepMove(idx, "up")} type="button" disabled={idx === 0}><ArrowUp className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleStepMove(idx, "down")} type="button" disabled={idx === localSteps.length - 1}><ArrowDown className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveStep(idx)} type="button"><X className="w-4 h-4" /></Button>
                  </li>
                ))}
              </ol>
              <Button type="button" onClick={handleAddStep} variant="outline" className="mt-2">
                <Plus className="h-4 w-4 mr-1" /> Add Step
              </Button>
            </div>
            <CardFooter className="flex justify-end gap-2 pt-2">
              <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button disabled={saving} type="submit">
                {saving ? "Saving..." : "Save Flow"}
              </Button>
            </CardFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FlowsPage;
