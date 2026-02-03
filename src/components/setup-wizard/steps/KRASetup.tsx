import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

// Define the input structure for a KRA during setup
interface KRAInput {
  id: string;
  name: string;
  department: string;
  responsible: string;
  startDate: string;
  endDate: string;
  objectiveId?: string;
  objectiveName?: string;
}

interface KRASetupProps {
  onComplete: (kras: KRAInput[]) => void;
  objectives?: any[]; // Optional objectives to link
}

export const KRASetup: React.FC<KRASetupProps> = ({ onComplete, objectives = [] }) => {
  const [kras, setKras] = useState<KRAInput[]>([]);
  const [expandedKraId, setExpandedKraId] = useState<string | null>(null);

  // Add a new KRA
  const addKra = () => {
    const newKra: KRAInput = {
      id: `kra-${Date.now()}`,
      name: '',
      department: '',
      responsible: '',
      startDate: '',
      endDate: '',
      objectiveId: objectives.length > 0 ? objectives[0].id : undefined,
      objectiveName: objectives.length > 0 ? objectives[0].name : undefined
    };
    setKras([...kras, newKra]);
  };

  // Remove a KRA
  const removeKra = (id: string) => {
    setKras(kras.filter(kra => kra.id !== id));
  };

  // Update a KRA
  const updateKra = (id: string, field: keyof KRAInput, value: string) => {
    setKras(kras.map(kra => 
      kra.id === id 
        ? { ...kra, [field]: value }
        : kra
    ));
  };

  // Toggle KRA expansion
  const toggleKraExpansion = (kraId: string) => {
    setExpandedKraId(expandedKraId === kraId ? null : kraId);
  };

  // Handle completion
  const handleComplete = () => {
    onComplete(kras);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Configure Key Result Areas (KRAs)</h3>
        <p className="text-sm text-muted-foreground">
          Define your unit's key result areas
        </p>
      </div>

      <div className="space-y-4">
        {kras.map((kra) => (
          <Card key={kra.id} className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">KRA Details</h4>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleKraExpansion(kra.id)}
                  >
                    {expandedKraId === kra.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeKra(kra.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* KRA Name */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor={`name-${kra.id}`}>KRA Name</Label>
                  <Input
                    id={`name-${kra.id}`}
                    value={kra.name}
                    onChange={(e) => updateKra(kra.id, 'name', e.target.value)}
                    placeholder="e.g., Improve Customer Satisfaction"
                  />
                </div>

                {/* Department */}
                <div className="space-y-2">
                  <Label htmlFor={`department-${kra.id}`}>Department</Label>
                  <Input
                    id={`department-${kra.id}`}
                    value={kra.department}
                    onChange={(e) => updateKra(kra.id, 'department', e.target.value)}
                    placeholder="e.g., Customer Service"
                  />
                </div>

                {/* Responsible */}
                <div className="space-y-2">
                  <Label htmlFor={`responsible-${kra.id}`}>Responsible</Label>
                  <Input
                    id={`responsible-${kra.id}`}
                    value={kra.responsible}
                    onChange={(e) => updateKra(kra.id, 'responsible', e.target.value)}
                    placeholder="e.g., Jane Smith"
                  />
                </div>

                {/* Start Date */}
                <div className="space-y-2">
                  <Label htmlFor={`startDate-${kra.id}`}>Start Date</Label>
                  <Input
                    id={`startDate-${kra.id}`}
                    type="date"
                    value={kra.startDate}
                    onChange={(e) => updateKra(kra.id, 'startDate', e.target.value)}
                  />
                </div>

                {/* End Date */}
                <div className="space-y-2">
                  <Label htmlFor={`endDate-${kra.id}`}>End Date</Label>
                  <Input
                    id={`endDate-${kra.id}`}
                    type="date"
                    value={kra.endDate}
                    onChange={(e) => updateKra(kra.id, 'endDate', e.target.value)}
                  />
                </div>

                {/* Objective (if objectives are provided) */}
                {objectives.length > 0 && (
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={`objective-${kra.id}`}>Linked to Objective</Label>
                    <select
                      id={`objective-${kra.id}`}
                      value={kra.objectiveId || ''}
                      onChange={(e) => {
                        const selectedObjective = objectives.find(obj => obj.id === e.target.value);
                        updateKra(kra.id, 'objectiveId', e.target.value);
                        if (selectedObjective) {
                          updateKra(kra.id, 'objectiveName', selectedObjective.name);
                        }
                      }}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">-- Select an Objective --</option>
                      {objectives.map((obj) => (
                        <option key={obj.id} value={obj.id}>
                          {obj.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Button variant="outline" onClick={addKra} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add KRA
      </Button>

      <Button onClick={handleComplete} className="w-full">
        Confirm and Continue
      </Button>
    </div>
  );
}; 