import React from 'react';
import { Copy, ShieldCheck } from 'lucide-react';

const IntegrationGuide: React.FC = () => {
  const codeSnippet = `curl -fsSL https://kodexis.io/install-telemetry.sh | sh`;

  return (
    <div className="border border-border bg-background-panel rounded p-6 font-mono space-y-6 relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-brand-violet" />
      <div className="border-b border-border/40 pb-3">
        <h3 className="text-xs font-bold text-zinc-200 uppercase">KODEXIS Laboratory Integration Hub</h3>
        <span className="text-[10px] text-zinc-500">Inject telemetry signals straight from your local environment</span>
      </div>

      <div className="space-y-4 text-xs leading-relaxed">
        <div className="space-y-2">
          <p className="text-zinc-300 font-bold">1. Install Local CLI Daemon</p>
          <p className="text-zinc-400">Run this shell command to install the background compiler process hook which streams live file changes directly into the assessment sandbox.</p>
          <div className="p-3 bg-zinc-950/80 border border-border/40 rounded flex items-center justify-between">
            <span className="text-zinc-300 font-mono text-[11px] select-text">{codeSnippet}</span>
            <button
              onClick={() => navigator.clipboard.writeText(codeSnippet)}
              className="text-zinc-500 hover:text-zinc-300 transition duration-150 p-1 hover:bg-zinc-800 rounded"
              title="Copy shell installation link"
            >
              <Copy size={14} />
            </button>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <p className="text-zinc-300 font-bold">2. Initialize Project Scope</p>
          <p className="text-zinc-400">Generate a local `.kodexis.json` scope config in the root of your DSA repository to authenticate environment pipelines:</p>
          <pre className="p-3 bg-zinc-950/80 border border-border/40 rounded text-[11px] text-brand-cyan select-text leading-relaxed">
{`{
  "token": "kdx_live_sample_token_abc123",
  "project": "dsa-sandbox-profile",
  "autoGrading": true
}`}
          </pre>
        </div>

        <div className="p-3 border border-brand-emerald/10 bg-brand-emerald/5 rounded flex items-start gap-3 mt-4">
          <ShieldCheck className="text-brand-emerald shrink-0 mt-0.5" size={16} />
          <div>
            <p className="text-brand-emerald font-bold text-[11px] uppercase">Secure Sandboxed Communication</p>
            <p className="text-zinc-400 text-[10px] leading-relaxed mt-0.5">CLI traffic is strictly restricted to locally parsed AST code statistics (variables, cyclomatic branches, time complex benchmarks). No private repository variables or sensitive file trees are transmitted.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationGuide;
