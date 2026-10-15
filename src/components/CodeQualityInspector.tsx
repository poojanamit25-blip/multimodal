import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface CodeSmell {
  lineNumber: number;
  severity: string;
  smellType: string;
  description: string;
  recommendation: string;
}

interface CodeQualityInspectorProps {
  code: string;
  codeSmells: CodeSmell[];
  cyclomaticComplexity: number;
}

const CodeQualityInspector: React.FC<CodeQualityInspectorProps> = ({ code, codeSmells = [], cyclomaticComplexity }) => {
  return (
    <div className="border border-border bg-background-panel rounded p-6 font-mono space-y-4 relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-brand-cyan" />
      <div className="flex justify-between items-center border-b border-border/40 pb-3">
        <h3 className="text-xs font-bold text-zinc-200 uppercase">Code Quality Inspector</h3>
        <span className="text-[10px] text-zinc-400">
          Complexity index: <strong className="text-brand-cyan">{cyclomaticComplexity}</strong>
        </span>
      </div>

      <div className="space-y-3">
        <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Static Analysis Reports</div>
        {codeSmells && codeSmells.length > 0 ? (
          <div className="space-y-2">
            {codeSmells.map((smell, idx) => (
              <div key={idx} className="p-3 bg-zinc-950/40 border border-border/40 rounded text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold text-yellow-500">
                    <ShieldAlert size={12} />
                    {smell.smellType}
                  </span>
                  <span className="text-[9px] text-zinc-500">Line {smell.lineNumber} | {smell.severity}</span>
                </div>
                <p className="text-zinc-300 leading-relaxed">{smell.description}</p>
                {smell.recommendation && (
                  <p className="text-zinc-500 text-[10px] italic">Rec: {smell.recommendation}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-zinc-500">
            No critical code smells detected. Excellent code standards!
          </div>
        )}
      </div>

      <div className="space-y-1.5 pt-2">
        <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Source code draft</div>
        <pre className="p-3 bg-zinc-950/80 border border-border/40 rounded text-[11px] text-zinc-300 overflow-x-auto select-text leading-relaxed">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

export default CodeQualityInspector;
