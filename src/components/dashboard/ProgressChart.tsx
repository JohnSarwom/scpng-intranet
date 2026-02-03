
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface ProgressItem {
  label: string;
  value: number;
  color: string;
}

interface ProgressChartProps {
  title: string;
  items: ProgressItem[];
}

const ProgressChart: React.FC<ProgressChartProps> = ({ title, items }) => {
  return (
    <div className="bg-gradient-to-br from-card to-muted/80 rounded-xl shadow-sm p-4 animate-fade-in dark:bg-gray-800 transition-all duration-300">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm">{item.label}</span>
              <span className="text-sm font-medium">{item.value}%</span>
            </div>
            <Progress 
              value={item.value} 
              className="h-2"
              style={{ backgroundColor: '#f1f1f1' }}
              indicatorClassName={`bg-[${item.color}]`}
            />
          </div>
        ))}
      </div>
      
      <div className="flex justify-center mt-6">
        <Button className="text-intranet-primary text-sm border border-intranet-primary rounded-lg py-2 px-4 hover:bg-intranet-primary hover:text-white transition-all duration-300 btn-hover-effect flex items-center gap-1 dark:hover:bg-intranet-primary/80">
          <span>Add plan</span>
          <Plus size={16} />
        </Button>
      </div>
    </div>
  );
};

export default ProgressChart;
