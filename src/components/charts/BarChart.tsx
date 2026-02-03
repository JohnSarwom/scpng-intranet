import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BarChartProps {
  data: {
    name: string;
    value: number;
  }[];
}

const COLORS = ['#4BC0C0', '#FFCE56', '#FF6384'];

const BarChart: React.FC<BarChartProps> = ({ data }) => {
  const formattedData = data.map(item => ({
    name: item.name,
    value: item.value
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsBarChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill={COLORS[0]} />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

export default BarChart; 