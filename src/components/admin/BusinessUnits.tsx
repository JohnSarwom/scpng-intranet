
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Trash, Save, X } from 'lucide-react';
import { toast } from 'sonner';

// Mock business units
const initialUnits = [
  { id: 'finance', name: 'Finance Department', members: 12, headcount: 15 },
  { id: 'hr', name: 'Human Resources', members: 8, headcount: 10 },
  { id: 'it', name: 'IT Department', members: 15, headcount: 20 },
  { id: 'operations', name: 'Operations', members: 25, headcount: 30 },
  { id: 'legal', name: 'Legal', members: 6, headcount: 8 },
  { id: 'marketing', name: 'Marketing', members: 10, headcount: 12 },
  { id: 'sales', name: 'Sales', members: 18, headcount: 20 },
  { id: 'research', name: 'Research and Development', members: 14, headcount: 15 },
];

const BusinessUnits = () => {
  const [units, setUnits] = useState(initialUnits);
  const [editingUnit, setEditingUnit] = useState<typeof initialUnits[0] | null>(null);
  const [newUnit, setNewUnit] = useState<Omit<typeof initialUnits[0], 'id'> | null>(null);

  const handleEditUnit = (unit: typeof initialUnits[0]) => {
    setEditingUnit({ ...unit });
  };

  const saveUnitChanges = () => {
    if (editingUnit) {
      setUnits(units.map(u => u.id === editingUnit.id ? editingUnit : u));
      setEditingUnit(null);
      toast.success('Business unit updated successfully');
    }
  };

  const deleteUnit = (unitId: string) => {
    setUnits(units.filter(u => u.id !== unitId));
    toast.success('Business unit deleted successfully');
  };

  const startAddingUnit = () => {
    setNewUnit({
      name: '',
      members: 0,
      headcount: 0
    });
  };

  const saveNewUnit = () => {
    if (newUnit?.name) {
      const unitWithId = {
        ...newUnit,
        id: newUnit.name.toLowerCase().replace(/\s+/g, '-'),
      };
      
      setUnits([...units, unitWithId]);
      setNewUnit(null);
      toast.success('Business unit added successfully');
    } else {
      toast.error('Please provide a name for the business unit');
    }
  };

  const cancelEdit = () => {
    setEditingUnit(null);
    setNewUnit(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between">
          <span>Business Units</span>
          <Button onClick={startAddingUnit} size="sm" className="flex items-center gap-1">
            <span>Add Unit</span>
          </Button>
        </CardTitle>
        <CardDescription>
          Manage departments and business units
        </CardDescription>
      </CardHeader>
      <CardContent>
        {newUnit && (
          <div className="mb-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
            <h3 className="text-lg font-medium mb-3">Add New Business Unit</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input 
                  value={newUnit.name} 
                  onChange={e => setNewUnit({...newUnit, name: e.target.value})}
                  placeholder="Department Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Current Members</label>
                <Input 
                  type="number"
                  value={newUnit.members} 
                  onChange={e => setNewUnit({...newUnit, members: parseInt(e.target.value) || 0})}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Headcount</label>
                <Input 
                  type="number"
                  value={newUnit.headcount} 
                  onChange={e => setNewUnit({...newUnit, headcount: parseInt(e.target.value) || 0})}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={cancelEdit} className="flex items-center gap-1">
                <X size={16} />
                <span>Cancel</span>
              </Button>
              <Button onClick={saveNewUnit} className="flex items-center gap-1">
                <Save size={16} />
                <span>Save</span>
              </Button>
            </div>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Members</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Headcount</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
              {units.map(unit => (
                <tr key={unit.id}>
                  {editingUnit && editingUnit.id === unit.id ? (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Input 
                          value={editingUnit.name} 
                          onChange={e => setEditingUnit({...editingUnit, name: e.target.value})}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {unit.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <Input 
                          type="number"
                          className="text-center"
                          value={editingUnit.members} 
                          onChange={e => setEditingUnit({...editingUnit, members: parseInt(e.target.value) || 0})}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <Input 
                          type="number"
                          className="text-center"
                          value={editingUnit.headcount} 
                          onChange={e => setEditingUnit({...editingUnit, headcount: parseInt(e.target.value) || 0})}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button onClick={saveUnitChanges} size="sm" variant="ghost" className="text-green-600 dark:text-green-400 mr-2">
                          <Save size={16} />
                        </Button>
                        <Button onClick={cancelEdit} size="sm" variant="ghost" className="text-gray-600 dark:text-gray-400">
                          <X size={16} />
                        </Button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">{unit.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">{unit.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">{unit.members}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">{unit.members}/{unit.headcount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button onClick={() => handleEditUnit(unit)} size="sm" variant="ghost" className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-2">
                          <Pencil size={16} />
                        </Button>
                        <Button onClick={() => deleteUnit(unit.id)} size="sm" variant="ghost" className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                          <Trash size={16} />
                        </Button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessUnits;
