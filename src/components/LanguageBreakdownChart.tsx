import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface LanguageScore {
  name: string;
  score: number;
  fill?: string;
}

interface LanguageBreakdownChartProps {
  data?: LanguageScore[];
}

const LanguageBreakdownChart: React.FC<LanguageBreakdownChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-border rounded-lg font-mono">
        <p className="text-xs text-zinc-400">No language metrics recorded yet.</p>
        <p className="text-[10px] text-zinc-500 mt-1">Submit solutions in Java, Python, or C++ to generate comparative scores.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'monospace' }} />
          <YAxis domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'monospace' }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '6px' }}
            labelStyle={{ color: '#9ca3af', fontFamily: 'monospace' }}
            itemStyle={{ color: '#fff', fontFamily: 'monospace' }}
          />
          <Bar dataKey="score" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LanguageBreakdownChart;
