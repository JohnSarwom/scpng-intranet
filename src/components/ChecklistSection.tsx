import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trash2, Plus } from 'lucide-react';

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

interface ChecklistSectionProps {
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
}

const ChecklistSection: React.FC<ChecklistSectionProps> = ({ items, onChange }) => {
  const [newItemText, setNewItemText] = useState('');

  const handleAddItem = () => {
    if (!newItemText.trim()) return;
    
    const newItem: ChecklistItem = {
      id: `item-${Date.now()}`,
      text: newItemText.trim(),
      checked: false
    };
    
    onChange([...items, newItem]);
    setNewItemText('');
  };

  const handleToggleCheck = (id: string) => {
    const updatedItems = items.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    onChange(updatedItems);
  };

  const handleDeleteItem = (id: string) => {
    const updatedItems = items.filter(item => item.id !== id);
    onChange(updatedItems);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddItem();
    }
  };

  const calculateProgress = (): number => {
    if (items.length === 0) return 0;
    const completedItems = items.filter(item => item.checked).length;
    return Math.round((completedItems / items.length) * 100);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Checklist</h4>
        <span className="text-sm text-muted-foreground">{calculateProgress()}% complete</span>
      </div>
      
      <Progress value={calculateProgress()} className="h-2" />
      
      <div className="space-y-2 max-h-[200px] overflow-y-auto">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-2 group">
            <Checkbox 
              id={`check-${item.id}`} 
              checked={item.checked} 
              onCheckedChange={() => handleToggleCheck(item.id)}
            />
            <label 
              htmlFor={`check-${item.id}`} 
              className={`text-sm flex-grow ${item.checked ? 'line-through text-muted-foreground' : ''}`}
            >
              {item.text}
            </label>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" 
              onClick={() => handleDeleteItem(item.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
      
      <div className="flex gap-2">
        <Input 
          placeholder="Add new checklist item" 
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-grow"
        />
        <Button size="sm" onClick={handleAddItem} disabled={!newItemText.trim()}>
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>
    </div>
  );
};

export default ChecklistSection; 