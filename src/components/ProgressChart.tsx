import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface HistoryItem {
  id: string;
  date: string;
  title: string;
  language: string;
  score: number;
  timeComp: string;
  testPass: string;
}

interface ProgressChartProps {
  history: HistoryItem[];
}

const ProgressChart: React.FC<ProgressChartProps> = ({ history }) => {
  if (!history || history.length === 0) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-border rounded-lg font-mono">
        <p className="text-xs text-zinc-400">No session trajectory data recorded yet.</p>
        <p className="text-[10px] text-zinc-500 mt-1">Complete assessment sessions to view score progression over time.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'monospace' }} />
          <YAxis domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'monospace' }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '6px' }}
            labelStyle={{ color: '#9ca3af', fontFamily: 'monospace' }}
            itemStyle={{ color: '#22d3ee', fontFamily: 'monospace' }}
          />
          <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProgressChart;
