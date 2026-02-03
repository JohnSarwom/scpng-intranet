import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Define the input structure for a KPI during setup
interface KPIInput {
  id: string;
  name: string;
  target: string;
  actual: string;
  status: 'on-track' | 'at-risk' | 'behind' | 'completed';
  description: string;
  notes: string;
  department: string;
  responsible: string;
  startDate: string;
  endDate: string;
}

interface KPISetupProps {
  onComplete: (kpis: KPIInput[]) => void;
}

export const KPISetup: React.FC<KPISetupProps> = ({ onComplete }) => {
  const [kpis, setKpis] = useState<KPIInput[]>([]);
  const [expandedKpiId, setExpandedKpiId] = useState<string | null>(null);

  // Add a new KPI
  const addKpi = () => {
    const newKpi: KPIInput = {
      id: `kpi-${Date.now()}`,
      name: '',
      target: '',
      actual: '',
      status: 'on-track',
      description: '',
      notes: '',
      department: '',
      responsible: '',
      startDate: '',
      endDate: ''
    };
    setKpis([...kpis, newKpi]);
  };

  // Remove a KPI
  const removeKpi = (id: string) => {
    setKpis(kpis.filter(kpi => kpi.id !== id));
  };

  // Update a KPI
  const updateKpi = (id: string, field: keyof KPIInput, value: string) => {
    setKpis(kpis.map(kpi => 
      kpi.id === id 
        ? { ...kpi, [field]: value }
        : kpi
    ));
  };

  // Toggle KPI expansion
  const toggleKpiExpansion = (kpiId: string) => {
    setExpandedKpiId(expandedKpiId === kpiId ? null : kpiId);
  };

  // Handle completion
  const handleComplete = () => {
    onComplete(kpis);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Configure Key Performance Indicators (KPIs)</h3>
        <p className="text-sm text-muted-foreground">
          Define your unit's key performance indicators
        </p>
      </div>

      <div className="space-y-4">
        {kpis.map((kpi) => (
          <Card key={kpi.id} className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">KPI Details</h4>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleKpiExpansion(kpi.id)}
                  >
                    {expandedKpiId === kpi.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeKpi(kpi.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* KPI Name */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor={`name-${kpi.id}`}>KPI Name</Label>
                  <Input
                    id={`name-${kpi.id}`}
                    value={kpi.name}
                    onChange={(e) => updateKpi(kpi.id, 'name', e.target.value)}
                    placeholder="e.g., Customer Satisfaction Score"
                  />
                </div>

                {/* Department */}
                <div className="space-y-2">
                  <Label htmlFor={`department-${kpi.id}`}>Department</Label>
                  <Input
                    id={`department-${kpi.id}`}
                    value={kpi.department}
                    onChange={(e) => updateKpi(kpi.id, 'department', e.target.value)}
                    placeholder="e.g., Customer Service"
                  />
                </div>

                {/* Responsible */}
                <div className="space-y-2">
                  <Label htmlFor={`responsible-${kpi.id}`}>Responsible</Label>
                  <Input
                    id={`responsible-${kpi.id}`}
                    value={kpi.responsible}
                    onChange={(e) => updateKpi(kpi.id, 'responsible', e.target.value)}
                    placeholder="e.g., Jane Smith"
                  />
                </div>

                {/* Start Date */}
                <div className="space-y-2">
                  <Label htmlFor={`startDate-${kpi.id}`}>Start Date</Label>
                  <Input
                    id={`startDate-${kpi.id}`}
                    type="date"
                    value={kpi.startDate}
                    onChange={(e) => updateKpi(kpi.id, 'startDate', e.target.value)}
                  />
                </div>

                {/* End Date */}
                <div className="space-y-2">
                  <Label htmlFor={`endDate-${kpi.id}`}>End Date</Label>
                  <Input
                    id={`endDate-${kpi.id}`}
                    type="date"
                    value={kpi.endDate}
                    onChange={(e) => updateKpi(kpi.id, 'endDate', e.target.value)}
                  />
                </div>

                {/* Target */}
                <div className="space-y-2">
                  <Label htmlFor={`target-${kpi.id}`}>Target</Label>
                  <Input
                    id={`target-${kpi.id}`}
                    value={kpi.target}
                    onChange={(e) => updateKpi(kpi.id, 'target', e.target.value)}
                    placeholder="e.g., 90%"
                  />
                </div>

                {/* Actual */}
                <div className="space-y-2">
                  <Label htmlFor={`actual-${kpi.id}`}>Actual</Label>
                  <Input
                    id={`actual-${kpi.id}`}
                    value={kpi.actual}
                    onChange={(e) => updateKpi(kpi.id, 'actual', e.target.value)}
                    placeholder="e.g., 85%"
                  />
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor={`status-${kpi.id}`}>Status</Label>
                  <Select 
                    value={kpi.status} 
                    onValueChange={(value) => updateKpi(kpi.id, 'status', value)}
                  >
                    <SelectTrigger id={`status-${kpi.id}`}>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="on-track">On Track</SelectItem>
                      <SelectItem value="at-risk">At Risk</SelectItem>
                      <SelectItem value="behind">Behind</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor={`description-${kpi.id}`}>Description</Label>
                  <Input
                    id={`description-${kpi.id}`}
                    value={kpi.description}
                    onChange={(e) => updateKpi(kpi.id, 'description', e.target.value)}
                    placeholder="Describe the KPI"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor={`notes-${kpi.id}`}>Notes</Label>
                  <Input
                    id={`notes-${kpi.id}`}
                    value={kpi.notes}
                    onChange={(e) => updateKpi(kpi.id, 'notes', e.target.value)}
                    placeholder="Additional notes"
                  />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Button variant="outline" onClick={addKpi} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add KPI
      </Button>

      <Button onClick={handleComplete} className="w-full">
        Confirm and Continue
      </Button>
    </div>
  );
}; 