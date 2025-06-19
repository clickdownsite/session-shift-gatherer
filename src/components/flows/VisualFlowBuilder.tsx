
import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, ArrowRight, Save, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface FlowStep {
  id: string;
  sub_page_id: string;
  name: string;
  action: 'next' | 'jump_to' | 'end';
  jump_to_index?: number;
  position: { x: number; y: number };
}

interface VisualFlowBuilderProps {
  initialFlow?: {
    id?: string;
    name: string;
    steps: FlowStep[];
  };
  subPages: Array<{ id: string; name: string; main_page_id: string }>;
  onSave: (flow: { name: string; steps: FlowStep[] }) => void;
  onCancel: () => void;
}

const VisualFlowBuilder: React.FC<VisualFlowBuilderProps> = ({
  initialFlow,
  subPages,
  onSave,
  onCancel
}) => {
  const [flowName, setFlowName] = useState(initialFlow?.name || '');
  const [steps, setSteps] = useState<FlowStep[]>(
    initialFlow?.steps || []
  );
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [draggedStep, setDraggedStep] = useState<string | null>(null);

  const addStep = useCallback(() => {
    const newStep: FlowStep = {
      id: `step_${Date.now()}`,
      sub_page_id: '',
      name: `Step ${steps.length + 1}`,
      action: 'next',
      position: { x: 100 + steps.length * 200, y: 100 }
    };
    setSteps([...steps, newStep]);
    setSelectedStep(newStep.id);
  }, [steps]);

  const updateStep = useCallback((stepId: string, updates: Partial<FlowStep>) => {
    setSteps(steps.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ));
  }, [steps]);

  const deleteStep = useCallback((stepId: string) => {
    setSteps(steps.filter(step => step.id !== stepId));
    if (selectedStep === stepId) {
      setSelectedStep(null);
    }
  }, [steps, selectedStep]);

  const handleStepDrag = useCallback((stepId: string, newPosition: { x: number; y: number }) => {
    updateStep(stepId, { position: newPosition });
  }, [updateStep]);

  const handleSave = useCallback(() => {
    if (!flowName.trim()) {
      toast.error('Please enter a flow name');
      return;
    }
    if (steps.length === 0) {
      toast.error('Please add at least one step');
      return;
    }
    if (steps.some(step => !step.sub_page_id)) {
      toast.error('Please select a page for all steps');
      return;
    }

    onSave({ name: flowName, steps });
  }, [flowName, steps, onSave]);

  const selectedStepData = useMemo(() => 
    steps.find(step => step.id === selectedStep)
  , [steps, selectedStep]);

  return (
    <div className="flex h-[600px] bg-gray-50 rounded-lg overflow-hidden">
      {/* Canvas Area */}
      <div className="flex-1 relative overflow-auto bg-white">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        
        {/* Flow Steps */}
        {steps.map((step, index) => {
          const subPage = subPages.find(sp => sp.id === step.sub_page_id);
          return (
            <div
              key={step.id}
              className={`absolute w-48 bg-white border-2 rounded-lg shadow-md cursor-move transition-all ${
                selectedStep === step.id ? 'border-blue-500 shadow-lg' : 'border-gray-300'
              }`}
              style={{
                left: step.position.x,
                top: step.position.y,
                transform: draggedStep === step.id ? 'scale(1.05)' : 'scale(1)'
              }}
              onClick={() => setSelectedStep(step.id)}
              onMouseDown={(e) => {
                setDraggedStep(step.id);
                const startX = e.clientX - step.position.x;
                const startY = e.clientY - step.position.y;

                const handleMouseMove = (e: MouseEvent) => {
                  handleStepDrag(step.id, {
                    x: e.clientX - startX,
                    y: e.clientY - startY
                  });
                };

                const handleMouseUp = () => {
                  setDraggedStep(null);
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };

                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
            >
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500">Step {index + 1}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-red-500 hover:bg-red-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteStep(step.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <div className="text-sm font-medium text-gray-900 mb-1">
                  {step.name}
                </div>
                <div className="text-xs text-gray-600 mb-2">
                  {subPage ? subPage.name : 'No page selected'}
                </div>
                <div className="flex items-center justify-center">
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    step.action === 'next' ? 'bg-blue-100 text-blue-800' :
                    step.action === 'jump_to' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {step.action === 'next' ? 'Next' :
                     step.action === 'jump_to' ? `Jump to ${step.jump_to_index}` :
                     'End'}
                  </div>
                </div>
              </div>
              
              {/* Connection Arrow */}
              {step.action === 'next' && index < steps.length - 1 && (
                <ArrowRight className="absolute -right-8 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
              )}
            </div>
          );
        })}

        {/* Add Step Button */}
        <Button
          onClick={addStep}
          className="absolute bottom-4 right-4 rounded-full shadow-lg"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Step
        </Button>
      </div>

      {/* Properties Panel */}
      <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-auto">
        <div className="space-y-4">
          <div>
            <Label htmlFor="flowName">Flow Name</Label>
            <Input
              id="flowName"
              value={flowName}
              onChange={(e) => setFlowName(e.target.value)}
              placeholder="Enter flow name"
            />
          </div>

          {selectedStepData && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Step Properties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Step Name</Label>
                  <Input
                    value={selectedStepData.name}
                    onChange={(e) => updateStep(selectedStepData.id, { name: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Page</Label>
                  <Select
                    value={selectedStepData.sub_page_id}
                    onValueChange={(value) => updateStep(selectedStepData.id, { sub_page_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a page" />
                    </SelectTrigger>
                    <SelectContent>
                      {subPages.map((page) => (
                        <SelectItem key={page.id} value={page.id}>
                          {page.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Action</Label>
                  <Select
                    value={selectedStepData.action}
                    onValueChange={(value: 'next' | 'jump_to' | 'end') => 
                      updateStep(selectedStepData.id, { action: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="next">Next Step</SelectItem>
                      <SelectItem value="jump_to">Jump To Step</SelectItem>
                      <SelectItem value="end">End Flow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedStepData.action === 'jump_to' && (
                  <div>
                    <Label>Jump to Step</Label>
                    <Select
                      value={selectedStepData.jump_to_index?.toString() || ''}
                      onValueChange={(value) => 
                        updateStep(selectedStepData.id, { jump_to_index: parseInt(value) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select step" />
                      </SelectTrigger>
                      <SelectContent>
                        {steps.map((step, index) => (
                          <SelectItem key={step.id} value={index.toString()}>
                            Step {index + 1}: {step.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex flex-col gap-2 pt-4">
            <Button onClick={handleSave} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Save Flow
            </Button>
            <Button onClick={onCancel} variant="outline" className="w-full">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualFlowBuilder;
