
import React from 'react';
import { 
  LineChart, 
  Line, 
  ResponsiveContainer 
} from 'recharts';

interface MetricCardProps {
  title: string;
  value: number;
  subtitle: string;
  trend: number;
  data: Array<{ value: number }>;
  trendType: 'increase' | 'decrease';
  trendLabel: string;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  data,
  trendType,
  trendLabel,
  color
}) => {
  const trendColor = trendType === 'increase' 
    ? 'text-intranet-success bg-green-50' 
    : 'text-intranet-danger bg-red-50';
    
  const trendSign = trendType === 'increase' ? '+' : '-';

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm h-full animate-fade-in border">
      <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">{title}</h3>
      
      <div className="flex justify-between items-start">
        <div>
          <span className="text-3xl font-bold block">{value}</span>
          <span className="text-sm text-gray-500">{subtitle}</span>
        </div>
        
        <div className="w-24 h-12">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={color} 
                strokeWidth={2} 
                dot={false} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="mt-4">
        <span className={`inline-block px-2 py-1 rounded-full text-xs ${trendColor}`}>
          {trendSign}{Math.abs(trend)}% {trendLabel}
        </span>
      </div>
    </div>
  );
};

export default MetricCard;
