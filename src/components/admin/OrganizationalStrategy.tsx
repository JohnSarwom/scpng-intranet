import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Save, X, Plus, Trash, BarChart3, FileText, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Define types for our data model
type Objective = {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
};

type KeyResultArea = {
  id: string;
  objectiveId: string;
  title: string;
  description: string;
  assignedTo: string;
};

type KPI = {
  id: string;
  kraId: string;
  title: string;
  description: string;
  target: string;
  current: number;
  assignedTo: string;
};

const OrganizationalStrategy = () => {
  // Sample data
  const [objectives, setObjectives] = useState<Objective[]>([
    { 
      id: 'obj1', 
      title: 'Increase Digital Presence', 
      description: 'Expand our online services and digital platforms to better serve our customers.',
      assignedTo: 'Sarah Johnson'
    },
    { 
      id: 'obj2', 
      title: 'Operational Excellence', 
      description: 'Streamline core operations and reduce costs while maintaining quality.',
      assignedTo: 'Michael Chen'
    }
  ]);

  const [kras, setKras] = useState<KeyResultArea[]>([
    { 
      id: 'kra1', 
      objectiveId: 'obj1', 
      title: 'Web Platform Enhancement', 
      description: 'Improve web platform functionality and user experience.',
      assignedTo: 'Robert Brown'
    },
    { 
      id: 'kra2', 
      objectiveId: 'obj1', 
      title: 'Mobile App Development', 
      description: 'Launch a fully functional mobile application for customers.',
      assignedTo: 'Sarah Johnson'
    },
    { 
      id: 'kra3', 
      objectiveId: 'obj2', 
      title: 'Process Automation', 
      description: 'Automate key business processes to reduce manual work.',
      assignedTo: 'David Thompson'
    }
  ]);

  const [kpis, setKpis] = useState<KPI[]>([
    { 
      id: 'kpi1', 
      kraId: 'kra1', 
      title: 'Page Load Time', 
      description: 'Average loading time of web pages',
      target: '< 2 seconds',
      current: 2.4,
      assignedTo: 'Robert Brown' 
    },
    { 
      id: 'kpi2', 
      kraId: 'kra1', 
      title: 'User Satisfaction', 
      description: 'Rating from user feedback survey',
      target: '> 4.5/5',
      current: 4.2,
      assignedTo: 'Jessica Lee'
    },
    { 
      id: 'kpi3', 
      kraId: 'kra2', 
      title: 'App Downloads', 
      description: 'Number of app downloads in first month',
      target: '10,000',
      current: 8500,
      assignedTo: 'Lisa Wang'
    },
    { 
      id: 'kpi4', 
      kraId: 'kra3', 
      title: 'Process Efficiency', 
      description: 'Reduction in process completion time',
      target: '30%',
      current: 22,
      assignedTo: 'David Thompson'
    }
  ]);

  // State for editing
  const [selectedObjective, setSelectedObjective] = useState<Objective | null>(null);
  const [selectedKra, setSelectedKra] = useState<KeyResultArea | null>(null);
  const [selectedKpi, setSelectedKpi] = useState<KPI | null>(null);
  
  // State for new items
  const [newObjective, setNewObjective] = useState<Partial<Objective> | null>(null);
  const [newKra, setNewKra] = useState<Partial<KeyResultArea> | null>(null);
  const [newKpi, setNewKpi] = useState<Partial<KPI> | null>(null);

  // Handle editing functions
  const startEditingObjective = (objective: Objective) => {
    setSelectedObjective({...objective});
  };

  const startEditingKra = (kra: KeyResultArea) => {
    setSelectedKra({...kra});
  };

  const startEditingKpi = (kpi: KPI) => {
    setSelectedKpi({...kpi});
  };

  // Add new item functions
  const startAddingObjective = () => {
    setNewObjective({
      title: '',
      description: '',
      assignedTo: ''
    });
  };

  const startAddingKra = (objectiveId: string) => {
    setNewKra({
      objectiveId,
      title: '',
      description: '',
      assignedTo: ''
    });
  };

  const startAddingKpi = (kraId: string) => {
    setNewKpi({
      kraId,
      title: '',
      description: '',
      target: '',
      current: 0,
      assignedTo: ''
    });
  };

  // Save functions
  const saveObjective = () => {
    if (selectedObjective) {
      setObjectives(objectives.map(obj => 
        obj.id === selectedObjective.id ? selectedObjective : obj
      ));
      setSelectedObjective(null);
      toast.success('Objective updated successfully');
    }
  };

  const saveKra = () => {
    if (selectedKra) {
      setKras(kras.map(kra => 
        kra.id === selectedKra.id ? selectedKra : kra
      ));
      setSelectedKra(null);
      toast.success('Key Result Area updated successfully');
    }
  };

  const saveKpi = () => {
    if (selectedKpi) {
      setKpis(kpis.map(kpi => 
        kpi.id === selectedKpi.id ? selectedKpi : kpi
      ));
      setSelectedKpi(null);
      toast.success('KPI updated successfully');
    }
  };

  // Save new item functions
  const saveNewObjective = () => {
    if (newObjective?.title && newObjective.description) {
      const id = `obj${objectives.length + 1}`;
      setObjectives([...objectives, { id, ...newObjective as Omit<Objective, 'id'> }]);
      setNewObjective(null);
      toast.success('Objective added successfully');
    } else {
      toast.error('Please fill all required fields');
    }
  };

  const saveNewKra = () => {
    if (newKra?.title && newKra.description && newKra.objectiveId) {
      const id = `kra${kras.length + 1}`;
      setKras([...kras, { id, ...newKra as Omit<KeyResultArea, 'id'> }]);
      setNewKra(null);
      toast.success('Key Result Area added successfully');
    } else {
      toast.error('Please fill all required fields');
    }
  };

  const saveNewKpi = () => {
    if (newKpi?.title && newKpi.description && newKpi.target && newKpi.kraId) {
      const id = `kpi${kpis.length + 1}`;
      setKpis([...kpis, { id, ...newKpi as Omit<KPI, 'id'> }]);
      setNewKpi(null);
      toast.success('KPI added successfully');
    } else {
      toast.error('Please fill all required fields');
    }
  };

  // Delete functions
  const deleteObjective = (id: string) => {
    setObjectives(objectives.filter(obj => obj.id !== id));
    // Also delete associated KRAs and KPIs
    const kraIds = kras.filter(kra => kra.objectiveId === id).map(kra => kra.id);
    setKras(kras.filter(kra => kra.objectiveId !== id));
    setKpis(kpis.filter(kpi => !kraIds.includes(kpi.kraId)));
    toast.success('Objective and associated items deleted');
  };

  const deleteKra = (id: string) => {
    setKras(kras.filter(kra => kra.id !== id));
    // Also delete associated KPIs
    setKpis(kpis.filter(kpi => kpi.kraId !== id));
    toast.success('KRA and associated KPIs deleted');
  };

  const deleteKpi = (id: string) => {
    setKpis(kpis.filter(kpi => kpi.id !== id));
    toast.success('KPI deleted');
  };

  // Cancel functions
  const cancelEdit = () => {
    setSelectedObjective(null);
    setSelectedKra(null);
    setSelectedKpi(null);
    setNewObjective(null);
    setNewKra(null);
    setNewKpi(null);
  };

  return (
    <div>
      <Tabs defaultValue="unit">
        <TabsList className="mb-6">
          <TabsTrigger value="unit" className="flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Unit Objectives & KPIs
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center">
            <BarChart3 className="w-4 h-4 mr-2" />
            Dashboard Stats
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="unit">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>Strategic Objectives</span>
                    <Button 
                      size="sm" 
                      onClick={startAddingObjective}
                      className="flex items-center gap-1"
                    >
                      <Plus size={16} />
                      Add Objective
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Organizational objectives, key result areas, and KPIs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* New Objective Form */}
                  {newObjective && (
                    <div className="mb-6 p-4 border rounded-lg bg-muted">
                      <h3 className="text-lg font-medium mb-3">Add New Objective</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Title</label>
                          <Input 
                            value={newObjective.title} 
                            onChange={e => setNewObjective({...newObjective, title: e.target.value})}
                            placeholder="Objective title"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Description</label>
                          <Textarea 
                            value={newObjective.description} 
                            onChange={e => setNewObjective({...newObjective, description: e.target.value})}
                            placeholder="Detailed description of the objective"
                            rows={3}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Assigned To</label>
                          <Input 
                            value={newObjective.assignedTo} 
                            onChange={e => setNewObjective({...newObjective, assignedTo: e.target.value})}
                            placeholder="Person responsible"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={cancelEdit} className="flex items-center gap-1">
                            <X size={16} />
                            Cancel
                          </Button>
                          <Button onClick={saveNewObjective} className="flex items-center gap-1">
                            <Save size={16} />
                            Save
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Objectives Table */}
                  <div className="space-y-6">
                    {objectives.map(objective => (
                      <div key={objective.id} className="border rounded-lg">
                        <div className="bg-muted p-4 rounded-t-lg flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold">
                              {selectedObjective?.id === objective.id ? (
                                <Input 
                                  value={selectedObjective.title} 
                                  onChange={e => setSelectedObjective({...selectedObjective, title: e.target.value})}
                                  className="font-semibold"
                                />
                              ) : (
                                objective.title
                              )}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {selectedObjective?.id === objective.id ? (
                                <Textarea 
                                  value={selectedObjective.description} 
                                  onChange={e => setSelectedObjective({...selectedObjective, description: e.target.value})}
                                  className="mt-2"
                                  rows={2}
                                />
                              ) : (
                                objective.description
                              )}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {selectedObjective?.id === objective.id ? (
                              <>
                                <Button size="sm" variant="ghost" onClick={cancelEdit}>
                                  <X size={16} />
                                </Button>
                                <Button size="sm" variant="default" onClick={saveObjective}>
                                  <Save size={16} />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button size="sm" variant="ghost" onClick={() => startEditingObjective(objective)}>
                                  <Pencil size={16} />
                                </Button>
                                <Button size="sm" variant="ghost" className="text-red-500" onClick={() => deleteObjective(objective.id)}>
                                  <Trash size={16} />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="font-medium">Key Result Areas</h4>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => startAddingKra(objective.id)}
                              className="flex items-center gap-1"
                            >
                              <Plus size={14} />
                              Add KRA
                            </Button>
                          </div>
                          
                          {/* New KRA Form */}
                          {newKra?.objectiveId === objective.id && (
                            <div className="mb-4 p-3 border rounded-lg bg-muted/50">
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-sm font-medium mb-1">Title</label>
                                  <Input 
                                    value={newKra.title} 
                                    onChange={e => setNewKra({...newKra, title: e.target.value})}
                                    placeholder="KRA title"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-1">Description</label>
                                  <Input 
                                    value={newKra.description} 
                                    onChange={e => setNewKra({...newKra, description: e.target.value})}
                                    placeholder="KRA description"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-1">Assigned To</label>
                                  <Input 
                                    value={newKra.assignedTo} 
                                    onChange={e => setNewKra({...newKra, assignedTo: e.target.value})}
                                    placeholder="Person responsible"
                                  />
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button size="sm" variant="outline" onClick={cancelEdit}>
                                    <X size={14} />
                                  </Button>
                                  <Button size="sm" onClick={saveNewKra}>
                                    <Save size={14} />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* KRAs Table */}
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Key Result Area</TableHead>
                                <TableHead>Assigned To</TableHead>
                                <TableHead className="w-[100px]">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {kras
                                .filter(kra => kra.objectiveId === objective.id)
                                .map(kra => (
                                <TableRow key={kra.id}>
                                  <TableCell>
                                    {selectedKra?.id === kra.id ? (
                                      <div className="space-y-2">
                                        <Input 
                                          value={selectedKra.title} 
                                          onChange={e => setSelectedKra({...selectedKra, title: e.target.value})}
                                        />
                                        <Input 
                                          value={selectedKra.description} 
                                          onChange={e => setSelectedKra({...selectedKra, description: e.target.value})}
                                        />
                                      </div>
                                    ) : (
                                      <>
                                        <div className="font-medium">{kra.title}</div>
                                        <div className="text-sm text-muted-foreground">{kra.description}</div>
                                      </>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {selectedKra?.id === kra.id ? (
                                      <Input 
                                        value={selectedKra.assignedTo} 
                                        onChange={e => setSelectedKra({...selectedKra, assignedTo: e.target.value})}
                                      />
                                    ) : kra.assignedTo}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1">
                                      {selectedKra?.id === kra.id ? (
                                        <>
                                          <Button size="sm" variant="ghost" onClick={cancelEdit}>
                                            <X size={14} />
                                          </Button>
                                          <Button size="sm" variant="ghost" onClick={saveKra}>
                                            <Save size={14} />
                                          </Button>
                                        </>
                                      ) : (
                                        <>
                                          <Button size="sm" variant="ghost" onClick={() => startEditingKra(kra)}>
                                            <Pencil size={14} />
                                          </Button>
                                          <Button size="sm" variant="ghost" className="text-red-500" onClick={() => deleteKra(kra.id)}>
                                            <Trash size={14} />
                                          </Button>
                                        </>
                                      )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                          
                          {/* Display KPIs for this objective's KRAs */}
                          <div className="mt-6">
                            <div className="flex justify-between items-center mb-4">
                              <h4 className="font-medium">Key Performance Indicators</h4>
                            </div>
                            
                            {kras
                              .filter(kra => kra.objectiveId === objective.id)
                              .map(kra => (
                              <div key={kra.id} className="mb-4 border-l-4 border-primary/30 pl-4">
                                <div className="flex justify-between items-center mb-2">
                                  <h5 className="font-medium text-sm">{kra.title} KPIs</h5>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => startAddingKpi(kra.id)}
                                    className="flex items-center gap-1 text-xs h-7"
                                  >
                                    <Plus size={12} />
                                    Add KPI
                                  </Button>
                                </div>
                                
                                {/* New KPI Form */}
                                {newKpi?.kraId === kra.id && (
                                  <div className="mb-4 p-3 border rounded-lg bg-muted/50">
                                    <div className="space-y-2">
                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <label className="block text-xs font-medium mb-1">Title</label>
                                          <Input 
                                            value={newKpi.title} 
                                            onChange={e => setNewKpi({...newKpi, title: e.target.value})}
                                            placeholder="KPI title"
                                            className="text-sm"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-xs font-medium mb-1">Target</label>
                                          <Input 
                                            value={newKpi.target} 
                                            onChange={e => setNewKpi({...newKpi, target: e.target.value})}
                                            placeholder="Target value"
                                            className="text-sm"
                                          />
                                        </div>
                                      </div>
                                      <div>
                                        <label className="block text-xs font-medium mb-1">Description</label>
                                        <Input 
                                          value={newKpi.description} 
                                          onChange={e => setNewKpi({...newKpi, description: e.target.value})}
                                          placeholder="Brief description"
                                          className="text-sm"
                                        />
                                      </div>
                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <label className="block text-xs font-medium mb-1">Current Value</label>
                                          <Input 
                                            type="number"
                                            value={newKpi.current?.toString()} 
                                            onChange={e => setNewKpi({...newKpi, current: Number(e.target.value)})}
                                            placeholder="Current value"
                                            className="text-sm"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-xs font-medium mb-1">Assigned To</label>
                                          <Input 
                                            value={newKpi.assignedTo} 
                                            onChange={e => setNewKpi({...newKpi, assignedTo: e.target.value})}
                                            placeholder="Person responsible"
                                            className="text-sm"
                                          />
                                        </div>
                                      </div>
                                      <div className="flex justify-end gap-2">
                                        <Button size="sm" variant="outline" onClick={cancelEdit} className="h-7 text-xs">
                                          <X size={12} className="mr-1" />
                                          Cancel
                                        </Button>
                                        <Button size="sm" onClick={saveNewKpi} className="h-7 text-xs">
                                          <Save size={12} className="mr-1" />
                                          Save
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>KPI</TableHead>
                                      <TableHead>Target</TableHead>
                                      <TableHead>Current</TableHead>
                                      <TableHead>Assigned To</TableHead>
                                      <TableHead className="w-[80px]">Actions</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {kpis
                                      .filter(kpi => kpi.kraId === kra.id)
                                      .map(kpi => (
                                      <TableRow key={kpi.id}>
                                        <TableCell>
                                          {selectedKpi?.id === kpi.id ? (
                                            <div className="space-y-2">
                                              <Input 
                                                value={selectedKpi.title} 
                                                onChange={e => setSelectedKpi({...selectedKpi, title: e.target.value})}
                                                className="text-sm"
                                              />
                                              <Input 
                                                value={selectedKpi.description} 
                                                onChange={e => setSelectedKpi({...selectedKpi, description: e.target.value})}
                                                className="text-sm"
                                              />
                                            </div>
                                          ) : (
                                            <>
                                              <div className="font-medium text-sm">{kpi.title}</div>
                                              <div className="text-xs text-muted-foreground">{kpi.description}</div>
                                            </>
                                          )}
                                        </TableCell>
                                        <TableCell>
                                          {selectedKpi?.id === kpi.id ? (
                                            <Input 
                                              value={selectedKpi.target} 
                                              onChange={e => setSelectedKpi({...selectedKpi, target: e.target.value})}
                                              className="text-sm"
                                            />
                                          ) : kpi.target}
                                        </TableCell>
                                        <TableCell>
                                          {selectedKpi?.id === kpi.id ? (
                                            <Input 
                                              type="number"
                                              value={selectedKpi.current?.toString()} 
                                              onChange={e => setSelectedKpi({...selectedKpi, current: Number(e.target.value)})}
                                              className="text-sm"
                                            />
                                          ) : (
                                            <div className={cn(
                                              "font-medium",
                                              Number(kpi.target.replace(/[^0-9.]/g, '')) <= kpi.current ? "text-green-600" : "text-amber-600"
                                            )}>
                                              {kpi.current}
                                            </div>
                                          )}
                                        </TableCell>
                                        <TableCell>
                                          {selectedKpi?.id === kpi.id ? (
                                            <Input 
                                              value={selectedKpi.assignedTo} 
                                              onChange={e => setSelectedKpi({...selectedKpi, assignedTo: e.target.value})}
                                              className="text-sm"
                                            />
                                          ) : kpi.assignedTo}
                                        </TableCell>
                                        <TableCell>
                                          <div className="flex items-center gap-1">
                                            {selectedKpi?.id === kpi.id ? (
                                              <>
                                                <Button size="sm" variant="ghost" onClick={cancelEdit} className="h-7 w-7 p-0">
                                                  <X size={14} />
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={saveKpi} className="h-7 w-7 p-0">
                                                  <Save size={14} />
                                                </Button>
                                              </>
                                            ) : (
                                              <>
                                                <Button size="sm" variant="ghost" onClick={() => startEditingKpi(kpi)} className="h-7 w-7 p-0">
                                                  <Pencil size={14} />
                                                </Button>
                                                <Button size="sm" variant="ghost" className="text-red-500 h-7 w-7 p-0" onClick={() => deleteKpi(kpi.id)}>
                                                  <Trash size={14} />
                                                </Button>
                                              </>
                                            )}
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Right sidebar for form input */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Data Entry</CardTitle>
                  <CardDescription>
                    Select an item from the left to edit or add new data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedObjective ? (
                    <div className="space-y-4">
                      <h3 className="font-medium">Editing Objective</h3>
                      <div>
                        <label className="block text-sm font-medium mb-1">Title</label>
                        <Input 
                          value={selectedObjective.title} 
                          onChange={e => setSelectedObjective({...selectedObjective, title: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <Textarea 
                          value={selectedObjective.description} 
                          onChange={e => setSelectedObjective({...selectedObjective, description: e.target.value})}
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Assigned To</label>
                        <Input 
                          value={selectedObjective.assignedTo} 
                          onChange={e => setSelectedObjective({...selectedObjective, assignedTo: e.target.value})}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={cancelEdit}>Cancel</Button>
                        <Button onClick={saveObjective}>Save Changes</Button>
                      </div>
                    </div>
                  ) : selectedKra ? (
                    <div className="space-y-4">
                      <h3 className="font-medium">Editing Key Result Area</h3>
                      <div>
                        <label className="block text-sm font-medium mb-1">Title</label>
                        <Input 
                          value={selectedKra.title} 
                          onChange={e => setSelectedKra({...selectedKra, title: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <Textarea 
                          value={selectedKra.description} 
                          onChange={e => setSelectedKra({...selectedKra, description: e.target.value})}
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Assigned To</label>
                        <Input 
                          value={selectedKra.assignedTo} 
                          onChange={e => setSelectedKra({...selectedKra, assignedTo: e.target.value})}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={cancelEdit}>Cancel</Button>
                        <Button onClick={saveKra}>Save Changes</Button>
                      </div>
                    </div>
                  ) : selectedKpi ? (
                    <div className="space-y-4">
                      <h3 className="font-medium">Editing KPI</h3>
                      <div>
                        <label className="block text-sm font-medium mb-1">Title</label>
                        <Input 
                          value={selectedKpi.title} 
                          onChange={e => setSelectedKpi({...selectedKpi, title: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <Textarea 
                          value={selectedKpi.description} 
                          onChange={e => setSelectedKpi({...selectedKpi, description: e.target.value})}
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Target</label>
                          <Input 
                            value={selectedKpi.target} 
                            onChange={e => setSelectedKpi({...selectedKpi, target: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Current Value</label>
                          <Input 
                            type="number"
                            value={selectedKpi.current?.toString()} 
                            onChange={e => setSelectedKpi({...selectedKpi, current: Number(e.target.value)})}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Assigned To</label>
                        <Input 
                          value={selectedKpi.assignedTo} 
                          onChange={e => setSelectedKpi({...selectedKpi, assignedTo: e.target.value})}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={cancelEdit}>Cancel</Button>
                        <Button onClick={saveKpi}>Save Changes</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-center p-4 border-2 border-dashed rounded-lg">
                      <Activity size={36} className="mb-2 text-muted-foreground" />
                      <h3 className="font-medium mb-1">No item selected</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Select an item from the left to edit or use the "Add" buttons to create new entries
                      </p>
                      <Button onClick={startAddingObjective} className="flex items-center gap-1">
                        <Plus size={16} />
                        Add New Objective
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="dashboard">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>KPI Dashboard</CardTitle>
                  <CardDescription>
                    Visual representation of organizational performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* This is where dashboard stats would go - simplified version for now */}
                  <div className="h-[400px] w-full bg-muted/30 border rounded-lg flex items-center justify-center p-6">
                    <div className="text-center">
                      <BarChart3 className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">Dashboard Visualization</h3>
                      <p className="text-muted-foreground max-w-md mx-auto mb-6">
                        In a production environment, this would display interactive charts showing KPI progress,
                        trends, and performance metrics based on the data from your objectives and KPIs.
                      </p>
                      <Button variant="outline">Generate Reports</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* AI Insights sidebar */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className="h-5 w-5"
                    >
                      <path d="M12 2a8 8 0 0 0-8 8c0 1.5.5 3 1.5 5.2a22 22 0 0 0 5 7.7 3 3 0 0 0 4.3 0 22 22 0 0 0 5-7.7A14 14 0 0 0 20 10a8 8 0 0 0-8-8z"></path>
                      <circle cx="12" cy="10" r="2"></circle>
                    </svg>
                    AI Insights
                  </CardTitle>
                  <CardDescription>
                    AI-generated analysis and recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-l-4 border-blue-500 pl-3 py-1">
                      <h4 className="font-medium text-sm">Performance Trend</h4>
                      <p className="text-sm text-muted-foreground">
                        Web platform KPIs are showing a 15% improvement over the last quarter.
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-amber-500 pl-3 py-1">
                      <h4 className="font-medium text-sm">Attention Required</h4>
                      <p className="text-sm text-muted-foreground">
                        App download targets are currently 15% below target. Consider increasing marketing efforts.
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-green-500 pl-3 py-1">
                      <h4 className="font-medium text-sm">Goal Achievement</h4>
                      <p className="text-sm text-muted-foreground">
                        Process automation initiatives have reduced manual workload by 22% against a target of 30%.
                      </p>
                    </div>
                    
                    <div className="mt-6">
                      <h4 className="font-medium text-sm mb-2">Recommendations</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mt-0.5 text-green-500">
                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                          </svg>
                          Focus resources on mobile app marketing to improve download metrics.
                        </li>
                        <li className="flex items-start gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mt-0.5 text-green-500">
                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                          </svg>
                          Consider revising Process Automation KPI targets to align with current progress.
                        </li>
                        <li className="flex items-start gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mt-0.5 text-green-500">
                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                          </svg>
                          Web platform improvements are on track. Maintain current strategy.
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrganizationalStrategy;
