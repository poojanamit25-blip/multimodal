import React from 'react';
import { Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';

interface Assessment {
  summaryVerdict: string;
  keyStrengths: string[];
  areaForImprovement: string[];
  refactoredCodeSnippet?: string;
}

interface AiFeedbackCardProps {
  assessment: Assessment;
}

const AiFeedbackCard: React.FC<AiFeedbackCardProps> = ({ assessment }) => {
  return (
    <div className="border border-border bg-background-panel rounded p-6 font-mono space-y-4 relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-brand-violet" />
      <div className="flex items-center space-x-2 border-b border-border/40 pb-3">
        <Sparkles className="text-brand-violet animate-pulse" size={16} />
        <h3 className="text-xs font-bold text-zinc-200 uppercase">AI Evaluation Feedback Deck</h3>
      </div>

      <div className="space-y-4 text-xs leading-relaxed">
        <div className="space-y-1">
          <span className="text-[10px] text-zinc-500 uppercase">Verdict Summary</span>
          <p className="p-3 bg-zinc-950/40 border border-border/40 rounded text-zinc-300">
            {assessment.summaryVerdict}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-brand-emerald/5 border border-brand-emerald/10 rounded space-y-1.5">
            <span className="text-[9px] text-brand-emerald font-bold uppercase flex items-center gap-1">
              <CheckCircle2 size={12} /> Key Strengths
            </span>
            <ul className="list-disc list-inside space-y-1 text-zinc-300 text-[11px]">
              {assessment.keyStrengths.map((str, idx) => (
                <li key={idx}>{str}</li>
              ))}
            </ul>
          </div>

          <div className="p-3 bg-yellow-500/5 border border-yellow-500/10 rounded space-y-1.5">
            <span className="text-[9px] text-yellow-500 font-bold uppercase flex items-center gap-1">
              <ShieldAlert size={12} /> Areas to Improve
            </span>
            <ul className="list-disc list-inside space-y-1 text-zinc-300 text-[11px]">
              {assessment.areaForImprovement.map((imp, idx) => (
                <li key={idx}>{imp}</li>
              ))}
            </ul>
          </div>
        </div>

        {assessment.refactoredCodeSnippet && (
          <div className="space-y-1.5 pt-2">
            <span className="text-[10px] text-zinc-500 uppercase">Refactored Reference Code</span>
            <pre className="p-3 bg-zinc-950/80 border border-border/40 rounded text-[11px] text-zinc-300 overflow-x-auto select-text leading-relaxed">
              <code>{assessment.refactoredCodeSnippet}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiFeedbackCard;
