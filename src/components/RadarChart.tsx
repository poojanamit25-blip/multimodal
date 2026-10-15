import React from 'react';
import { Radar, RadarChart as RechartsRadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface FactorScore {
  factorName: string;
  score: number;
  weight?: string;
  status?: string;
  observation?: string;
}

interface RadarChartProps {
  factorScores: FactorScore[];
}

const RadarChart: React.FC<RadarChartProps> = ({ factorScores }) => {
  const data = factorScores.map(f => ({
    subject: f.factorName,
    A: f.score,
    fullMark: 100,
  }));

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#374151" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'monospace' }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#4b5563' }} />
          <Radar name="Readiness" dataKey="A" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.3} />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RadarChart;
