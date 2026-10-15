import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { withFastTimeout } from '../lib/api';
import { Play, Settings, BrainCircuit, Lock, Unlock, Sparkles, Code2, Radio, ArrowUpRight } from 'lucide-react';

const StartInterview: React.FC = () => {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState<string>('MEDIUM');
  const [language, setLanguage] = useState<string>('PYTHON');
  const [duration, setDuration] = useState<number>(45);
  const [mode, setMode] = useState<string>('AI Interview');
  const [loading, setLoading] = useState<boolean>(false);

  const handleStart = async () => {
    setLoading(true);
    try {
      const response = await withFastTimeout(
        axios.post('/api/interviews', {
          difficulty,
          language,
          durationMinutes: duration,
          interviewMode: mode
        }),
        2500,
        'Interview initialization'
      );
      const session = response.data;
      navigate(`/interview/${session.id}`);
    } catch (error) {
      console.warn('Backend server offline or high latency. Launching Demo Interview Room instantly...');
      sessionStorage.setItem('kodexis_offline_pref', JSON.stringify({ difficulty, language, duration, mode }));
      navigate('/interview/1');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'BEGINNER': return 'text-zinc-400';
      case 'EASY': return 'text-emerald-400';
      case 'MEDIUM': return 'text-brand-cyan';
      case 'HARD': return 'text-brand-violet';
      default: return 'text-rose-400';
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8 font-sans">
      
      {/* Header */}
      <div className="border-b border-border pb-6">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Start Interview Session</h2>
        <p className="text-sm text-zinc-400 mt-1">Configure parameters for entering the KODEXIS Technical Interview Sandbox.</p>
      </div>

      {/* STARK FEATURE HIGHLIGHT BANNER */}
      <div className="p-5 rounded-2xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/30 via-background to-purple-950/20 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 shrink-0">
            <Radio size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
                RECOMMENDED • REAL INTERVIEW SIMULATION
              </span>
              <span className="px-2 py-0.2 rounded-full text-[9px] font-mono font-bold bg-cyan-500/20 border border-cyan-500/30 text-cyan-300">
                LIVE VIDEO & AUDIO TTS
              </span>
            </div>
            <h3 className="text-sm font-bold font-mono text-zinc-100 mt-0.5">
              Elsa AI Tech Lead Interview (10 CS Categories)
            </h3>
            <p className="text-xs text-zinc-400">
              Want a real-time conversational interview with camera on, voice recognition, and Elsa female TTS? Practice across DSA, OS, CN, AI, ML, and more.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/elsa')}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-mono text-xs font-bold transition flex items-center justify-center gap-2 shrink-0 shadow-md"
        >
          <span>Launch Elsa Interview</span>
          <ArrowUpRight size={13} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* CONFIG OPTIONS */}
        <div className="md:col-span-7 border border-border bg-background-panel rounded-xl p-6 space-y-6">
          <div className="flex items-center space-x-2 border-b border-border/60 pb-3">
            <Settings size={18} className="text-brand-cyan" />
            <h3 className="text-sm font-semibold tracking-wide text-zinc-200">Configuration Panel</h3>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-zinc-400">Evaluation Difficulty</label>
                <span className={`text-xs font-semibold ${getDifficultyColor(difficulty)}`}>{difficulty}</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {['BEGINNER', 'EASY', 'MEDIUM', 'HARD', 'EXPERT'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`py-2 text-xs font-medium border rounded-lg transition ${
                      difficulty === d
                        ? 'bg-brand-cyan/15 border-brand-cyan text-brand-cyan font-semibold shadow-sm'
                        : 'border-border bg-background text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    {d.substring(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">Programming Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-medium text-zinc-200 focus:outline-none focus:border-brand-cyan transition"
                >
                  <option value="JAVA">Java</option>
                  <option value="PYTHON">Python</option>
                  <option value="JAVASCRIPT">JavaScript</option>
                  <option value="CPP">C++</option>
                  <option value="C">C</option>
                  <option value="CSHARP">C#</option>
                  <option value="GO">Go</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">Duration Allocation</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-medium text-zinc-200 focus:outline-none focus:border-brand-cyan transition"
                >
                  <option value={15}>15 Min (Speed Check)</option>
                  <option value={30}>30 Min (Standard)</option>
                  <option value={45}>45 Min (Standard L3+)</option>
                  <option value={60}>60 Min (Rigor Check)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-zinc-400">Assessment Protocol Mode</label>
                <span className="text-xs text-zinc-500">Select interview style</span>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {/* Mode 1: AI Interview */}
                <button
                  type="button"
                  onClick={() => setMode('AI Interview')}
                  className={`p-4 border rounded-xl text-left transition relative overflow-hidden ${
                    mode === 'AI Interview'
                      ? 'bg-brand-violet/10 border-brand-violet shadow-[0_0_20px_rgba(139,92,246,0.15)] ring-1 ring-brand-violet/50'
                      : 'border-border bg-background/50 hover:bg-zinc-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-brand-violet/20 text-brand-violet">
                        <Lock size={15} />
                      </div>
                      <span className="text-sm font-semibold text-zinc-100">AI Interview</span>
                    </div>
                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-brand-violet/20 border border-brand-violet/30 text-brand-violet">
                      2-Phase Gated Logic
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed mb-3">
                    <strong className="text-brand-violet font-semibold">Strict Logic Gate:</strong> Editor is locked in Phase 1. You must defend your conceptual approach, data structures, and Big-O runtime with the AI Interviewer. The code editor unlocks only after your logic is approved.
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs text-zinc-400">
                    <span className="flex items-center gap-1.5 bg-zinc-950/70 px-2.5 py-1 rounded-md border border-zinc-800 text-[11px] font-medium text-zinc-300">
                      <Sparkles size={12} className="text-brand-violet" /> Socratic AI Feedback
                    </span>
                    <span className="flex items-center gap-1.5 bg-zinc-950/70 px-2.5 py-1 rounded-md border border-zinc-800 text-[11px] font-medium text-zinc-300">
                      <Lock size={12} className="text-amber-400" /> Editor Locked Until Approved
                    </span>
                  </div>
                </button>

                {/* Mode 2: Full Simulation */}
                <button
                  type="button"
                  onClick={() => setMode('Full Simulation')}
                  className={`p-4 border rounded-xl text-left transition relative overflow-hidden ${
                    mode === 'Full Simulation'
                      ? 'bg-brand-cyan/10 border-brand-cyan shadow-[0_0_20px_rgba(34,211,238,0.15)] ring-1 ring-brand-cyan/50'
                      : 'border-border bg-background/50 hover:bg-zinc-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-brand-cyan/20 text-brand-cyan">
                        <Unlock size={15} />
                      </div>
                      <span className="text-sm font-semibold text-zinc-100">Full Simulation</span>
                    </div>
                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-brand-cyan/20 border border-brand-cyan/30 text-brand-cyan">
                      Timed OA Sandbox
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed mb-3">
                    <strong className="text-brand-cyan font-semibold">Immediate Sandbox:</strong> Editor is unlocked from second 0 (LeetCode / Online Assessment style). Code freely, execute against public/hidden tests, with optional chat assistance.
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs text-zinc-400">
                    <span className="flex items-center gap-1.5 bg-zinc-950/70 px-2.5 py-1 rounded-md border border-zinc-800 text-[11px] font-medium text-zinc-300">
                      <Code2 size={12} className="text-brand-cyan" /> Instant Code Access
                    </span>
                    <span className="flex items-center gap-1.5 bg-zinc-950/70 px-2.5 py-1 rounded-md border border-zinc-800 text-[11px] font-medium text-zinc-300">
                      <Unlock size={12} className="text-emerald-400" /> Multi-Test Suite Runner
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* DETAILS READOUT */}
        <div className="md:col-span-5 border border-border bg-background-panel rounded-xl p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 border-b border-border/60 pb-3">
              <BrainCircuit size={18} className="text-brand-violet" />
              <h3 className="text-sm font-semibold tracking-wide text-zinc-200">Assessment Metrics</h3>
            </div>
            
            <p className="text-xs text-zinc-400 leading-relaxed">
              Your technical assessment is derived from nine weighted metrics computed dynamically inside the sandbox telemetry.
            </p>

            <div className="space-y-2 text-xs">
              {[
                { name: 'Code Correctness', weight: '30%', desc: 'Passed test cases (hidden & public)' },
                { name: 'Problem Solving Approach', weight: '20%', desc: 'Optimal model formulation' },
                { name: 'Complexity Optimization', weight: '15%', desc: 'Time & auxiliary space Big-O comparison' },
                { name: 'Defensive Edge Cases', weight: '10%', desc: 'Checks on null, empty, boundary inputs' },
                { name: 'Debugging Resilience', weight: '10%', desc: 'Compile crash recovery speed' },
                { name: 'Communication Quality', weight: '5%', desc: 'Concept clarity explanations' }
              ].map((metric) => (
                <div key={metric.name} className="p-2.5 border border-border bg-background/50 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-zinc-200">{metric.name}</p>
                    <p className="text-[11px] text-zinc-400">{metric.desc}</p>
                  </div>
                  <span className="text-xs font-semibold text-brand-cyan">{metric.weight}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={loading}
            className="w-full mt-6 py-3 rounded-lg bg-brand-cyan text-zinc-950 font-semibold text-sm hover:bg-brand-cyan/90 active:scale-[0.99] transition shadow-lg shadow-brand-cyan/10 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span>Launching Simulator...</span>
            ) : (
              <>
                <span>Enter Laboratory</span>
                <Play size={14} fill="currentColor" />
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
};

export default StartInterview;
