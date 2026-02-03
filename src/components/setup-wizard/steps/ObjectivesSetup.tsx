import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

// Define the input structure for an Objective during setup
interface ObjectiveInput {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
}

interface ObjectivesSetupProps {
  onComplete: (objectives: ObjectiveInput[]) => void;
  initialObjectives?: ObjectiveInput[];
}

export const ObjectivesSetup: React.FC<ObjectivesSetupProps> = ({ onComplete, initialObjectives = [] }) => {
  const [objectives, setObjectives] = useState<ObjectiveInput[]>(initialObjectives);
  const [expandedObjectiveId, setExpandedObjectiveId] = useState<string | null>(null);

  // Add a new objective
  const addObjective = () => {
    const newObjective: ObjectiveInput = {
      id: `objective-${Date.now()}`,
      name: '',
      description: '',
      startDate: '',
      endDate: ''
    };
    setObjectives([...objectives, newObjective]);
  };

  // Remove an objective
  const removeObjective = (id: string) => {
    setObjectives(objectives.filter(objective => objective.id !== id));
  };

  // Update an objective
  const updateObjective = (id: string, field: keyof ObjectiveInput, value: string) => {
    setObjectives(objectives.map(objective => 
      objective.id === id 
        ? { ...objective, [field]: value }
        : objective
    ));
  };

  // Toggle objective expansion
  const toggleObjectiveExpansion = (objectiveId: string) => {
    setExpandedObjectiveId(expandedObjectiveId === objectiveId ? null : objectiveId);
  };

  // Handle completion
  const handleComplete = () => {
    onComplete(objectives);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Configure Objectives</h3>
        <p className="text-sm text-muted-foreground">
          Define your unit's strategic objectives
        </p>
      </div>

      <div className="space-y-4">
        {objectives.map((objective) => (
          <Card key={objective.id} className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Objective Details</h4>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleObjectiveExpansion(objective.id)}
                  >
                    {expandedObjectiveId === objective.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeObjective(objective.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Objective Name */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor={`name-${objective.id}`}>Objective Name</Label>
                  <Input
                    id={`name-${objective.id}`}
                    value={objective.name}
                    onChange={(e) => updateObjective(objective.id, 'name', e.target.value)}
                    placeholder="e.g., Enhance User Experience"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor={`description-${objective.id}`}>Description</Label>
                  <Input
                    id={`description-${objective.id}`}
                    value={objective.description}
                    onChange={(e) => updateObjective(objective.id, 'description', e.target.value)}
                    placeholder="Describe the objective"
                  />
                </div>

                {/* Start Date */}
                <div className="space-y-2">
                  <Label htmlFor={`startDate-${objective.id}`}>Start Date</Label>
                  <Input
                    id={`startDate-${objective.id}`}
                    type="date"
                    value={objective.startDate}
                    onChange={(e) => updateObjective(objective.id, 'startDate', e.target.value)}
                  />
                </div>

                {/* End Date */}
                <div className="space-y-2">
                  <Label htmlFor={`endDate-${objective.id}`}>End Date</Label>
                  <Input
                    id={`endDate-${objective.id}`}
                    type="date"
                    value={objective.endDate}
                    onChange={(e) => updateObjective(objective.id, 'endDate', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Button variant="outline" onClick={addObjective} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Objective
      </Button>

      <Button onClick={handleComplete} className="w-full">
        {objectives.length > 0 ? 'Continue to KRAs' : 'Skip Objectives'}
      </Button>
    </div>
  );
}; 