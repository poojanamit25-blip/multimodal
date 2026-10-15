import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LEARNING_API_BASE } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import {
  Brain,
  Sparkles,
  GitBranch,
  CheckCircle2,
  Lock,
  Play,
  Zap,
  Award
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

interface LearnerMastery {
  userId: string;
  coldStartComplete: boolean;
  topicMastery: Record<string, number>;
  conceptMastery: Record<string, number>;
  topicOpportunityCount?: Record<string, number>;
  topicCorrectCount?: Record<string, number>;
  history: Array<{
    timestamp: number;
    topicId: string;
    topicName: string;
    conceptId: string;
    correct: boolean;
    priorMastery: number;
    updatedMastery: number;
  }>;
}

interface CourseGraph {
  nodes: Array<{
    id: string;
    label: string;
    category: string;
    mastery: number;
    status: 'LOCKED' | 'AVAILABLE' | 'IN_PROGRESS' | 'MASTERED';
    x: number;
    y: number;
    unitCount: number;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    relationship: string;
  }>;
}

export const LearnerModelPage: React.FC = () => {
  const { user } = useAuth();
  const activeUserId = user?.username || 'candidate';

  const [mastery, setMastery] = useState<LearnerMastery | null>(null);
  const [courseGraph, setCourseGraph] = useState<CourseGraph | null>(null);
  const [activeTab, setActiveTab] = useState<'BKT_METRICS' | 'COURSE_FLOW_DAG'>('COURSE_FLOW_DAG');

  // Cold Start Modal State (Requirement 4b)
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);
  const [intakeQuestions, setIntakeQuestions] = useState<any[]>([]);
  const [intakeAnswers, setIntakeAnswers] = useState<Record<string, string>>({});
  const [intakeResult, setIntakeResult] = useState<any>(null);

  const API_BASE = LEARNING_API_BASE;

  useEffect(() => {
    fetchLearnerData();
  }, [activeUserId]);

  const fetchLearnerData = async () => {
    try {
      const [masteryRes, graphRes] = await Promise.all([
        axios.get(`${API_BASE}/learner/mastery?userId=${encodeURIComponent(activeUserId)}`),
        axios.get(`${API_BASE}/course-map?userId=${encodeURIComponent(activeUserId)}`)
      ]);
      setMastery(masteryRes.data);
      setCourseGraph(graphRes.data);
    } catch (err) {
      console.error("Failed to load learner model data:", err);
    }
  };

  const handleStartIntake = async () => {
    try {
      const res = await axios.get(`${API_BASE}/learner/intake/quiz`);
      setIntakeQuestions(res.data);
      setIntakeAnswers({});
      setIntakeResult(null);
      setIsIntakeModalOpen(true);
    } catch (err) {
      console.error("Intake quiz fetch error:", err);
    }
  };

  const handleSubmitIntake = async () => {
    try {
      const res = await axios.post(`${API_BASE}/learner/intake/submit?userId=${encodeURIComponent(activeUserId)}`, intakeAnswers);
      setIntakeResult(res.data);
      setTimeout(() => {
        setIsIntakeModalOpen(false);
        fetchLearnerData();
      }, 1500);
    } catch (err) {
      console.error("Intake submission error:", err);
    }
  };

  const chartData = mastery?.history?.map((h, idx) => ({
    event: `Event ${idx + 1}`,
    topic: h.topicName.split(' ')[0],
    mastery: Math.round(h.updatedMastery * 100),
    correct: h.correct
  })) || [
    { event: 'Prior', topic: 'Consensus', mastery: 20 },
    { event: 'Q1', topic: 'Consensus', mastery: 35 },
    { event: 'Q2', topic: 'Consensus', mastery: 52 },
    { event: 'Q3', topic: 'Consensus', mastery: 74 }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* HEADER BANNER */}
      <div className="glass-panel p-6 rounded-xl border border-brand-violet/20 bg-gradient-to-r from-brand-violet/5 via-transparent to-brand-cyan/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-brand-violet uppercase tracking-wider mb-1">
            <Sparkles size={14} />
            <span>Requirements 4 & 6A: BKT Learner Model & Visual Course Flow Map</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-100 tracking-tight">
            Bayesian Knowledge Tracing & Prerequisite DAG
          </h1>
          <p className="text-xs md:text-sm text-zinc-400 mt-1 max-w-2xl">
            Real-time tracking of per-topic mastery probabilities P(Lt) using Bayesian inference formulas. Includes diagnostic intake for cold-start learners and an interactive course flow DAG.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={handleStartIntake}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-zinc-800 text-zinc-200 border border-zinc-700 font-mono text-xs font-bold hover:bg-zinc-700 transition"
          >
            <Zap size={14} className="text-brand-cyan" />
            <span>CALIBRATE DIAGNOSTIC INTAKE</span>
          </button>
        </div>
      </div>

      {/* VIEW TABS */}
      <div className="flex space-x-2 border-b border-border pb-3">
        <button
          onClick={() => setActiveTab('COURSE_FLOW_DAG')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-mono transition ${
            activeTab === 'COURSE_FLOW_DAG'
              ? 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40 font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <GitBranch size={14} />
          <span>VISUAL COURSE FLOW MAP (DAG)</span>
        </button>

        <button
          onClick={() => setActiveTab('BKT_METRICS')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-mono transition ${
            activeTab === 'BKT_METRICS'
              ? 'bg-brand-violet/20 text-brand-violet border border-brand-violet/40 font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Brain size={14} />
          <span>BAYESIAN MASTERY GAUGES & TRAJECTORY</span>
        </button>
      </div>

      {activeTab === 'COURSE_FLOW_DAG' ? (
        /* VISUAL COURSE FLOW MAP (Requirement 6a) */
        <div className="glass-panel p-6 rounded-2xl border border-border space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>PREREQUISITE DIRECTED ACYCLIC GRAPH (DAG)</span>
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1 text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-400"></span><span>Mastered</span></span>
              <span className="flex items-center space-x-1 text-brand-cyan"><span className="w-2 h-2 rounded-full bg-brand-cyan"></span><span>In Progress</span></span>
              <span className="flex items-center space-x-1 text-zinc-400"><span className="w-2 h-2 rounded-full bg-zinc-400"></span><span>Available</span></span>
              <span className="flex items-center space-x-1 text-zinc-600"><span className="w-2 h-2 rounded-full bg-zinc-600"></span><span>Locked</span></span>
            </div>
          </div>

          {/* INTERACTIVE SVG CANVAS FOR THE COURSE MAP */}
          <div className="relative w-full h-[520px] rounded-xl bg-zinc-950/80 border border-zinc-800 overflow-auto p-8 flex items-center justify-center">
            <svg viewBox="0 0 1150 420" className="w-full h-full min-w-[900px]">
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
                </marker>
                <linearGradient id="edge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.4" />
                </linearGradient>
              </defs>

              {/* Render Graph Edges */}
              {courseGraph?.edges?.map(edge => {
                const srcNode = courseGraph.nodes.find(n => n.id === edge.source);
                const tgtNode = courseGraph.nodes.find(n => n.id === edge.target);
                if (!srcNode || !tgtNode) return null;
                return (
                  <g key={edge.id}>
                    <line
                      x1={srcNode.x + 90}
                      y1={srcNode.y + 35}
                      x2={tgtNode.x - 10}
                      y2={tgtNode.y + 35}
                      stroke="url(#edge-grad)"
                      strokeWidth="2"
                      strokeDasharray={edge.relationship === 'PREREQUISITE_FOR' ? 'none' : '4 4'}
                      markerEnd="url(#arrow)"
                    />
                    <text
                      x={(srcNode.x + tgtNode.x) / 2 + 35}
                      y={(srcNode.y + tgtNode.y) / 2 + 25}
                      fill="#64748b"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {edge.relationship === 'PREREQUISITE_FOR' ? 'PREREQ' : 'NEXT'}
                    </text>
                  </g>
                );
              })}

              {/* Render Graph Nodes */}
              {courseGraph?.nodes?.map(node => {
                const isMastered = node.status === 'MASTERED';
                const isInProgress = node.status === 'IN_PROGRESS';
                const isLocked = node.status === 'LOCKED';

                const strokeColor = isMastered ? '#10b981' : isInProgress ? '#22d3ee' : isLocked ? '#334155' : '#8b5cf6';
                const bgColor = isMastered ? '#064e3b' : isInProgress ? '#083344' : isLocked ? '#0f172a' : '#1e1b4b';

                return (
                  <g key={node.id} transform={`translate(${node.x}, ${node.y})`} className="cursor-pointer">
                    <rect
                      width="180"
                      height="80"
                      rx="12"
                      fill={bgColor}
                      stroke={strokeColor}
                      strokeWidth="2"
                      className="filter drop-shadow-md"
                    />

                    {/* Status Badge Icon */}
                    <circle cx="25" cy="25" r="10" fill={strokeColor} opacity="0.2" />
                    {isMastered && <CheckCircle2 x="17" y="17" size="16" className="text-emerald-400" />}
                    {isInProgress && <Play x="17" y="17" size="16" className="text-brand-cyan" />}
                    {isLocked && <Lock x="17" y="17" size="16" className="text-zinc-500" />}
                    {!isMastered && !isInProgress && !isLocked && <Sparkles x="17" y="17" size="16" className="text-brand-violet" />}

                    <text x="44" y="28" fill="#e2e8f0" fontSize="10" fontFamily="monospace" fontWeight="bold">
                      {node.category.toUpperCase().slice(0, 15)}
                    </text>

                    <text x="16" y="50" fill="#f8fafc" fontSize="11" fontFamily="sans-serif" fontWeight="bold">
                      {node.label.length > 22 ? node.label.slice(0, 22) + '...' : node.label}
                    </text>

                    {/* Progress Bar inside Node */}
                    <rect x="16" y="62" width="148" height="6" rx="3" fill="#1e293b" />
                    <rect x="16" y="62" width={Math.max(6, 148 * node.mastery)} height="6" rx="3" fill={strokeColor} />

                    <text x="164" y="58" fill={strokeColor} fontSize="9" fontFamily="monospace" textAnchor="end">
                      {Math.round(node.mastery * 100)}%
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      ) : (
        /* BKT MASTERY METRICS & TRAJECTORY (Requirement 4a) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* PER-TOPIC BKT GAUGES */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-xs font-mono text-zinc-400 uppercase font-bold">
              BAYESIAN KNOWLEDGE TRACING P(Lt) PER TOPIC
            </h3>

            <div className="space-y-3">
              {mastery && Object.entries(mastery.topicMastery).map(([topicId, pVal]) => {
                const percent = Math.round(pVal * 100);
                const isHigh = percent >= 75;
                const isMed = percent >= 50 && percent < 75;
                return (
                  <div key={topicId} className="p-4 rounded-xl bg-background-panel border border-border space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-zinc-200">
                        {topicId.replace('topic-', '').replace(/-/g, ' ').toUpperCase()}
                      </span>
                      <span className={`font-bold ${isHigh ? 'text-emerald-400' : isMed ? 'text-brand-cyan' : 'text-amber-400'}`}>
                        P(Lt) = {pVal.toFixed(2)} ({percent}%)
                      </span>
                    </div>

                    <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isHigh ? 'bg-emerald-500' : isMed ? 'bg-brand-cyan' : 'bg-amber-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 pt-1">
                      <span>Opportunity Count: {mastery.topicOpportunityCount?.[topicId] || 0}</span>
                      <span>Correct: {mastery.topicCorrectCount?.[topicId] || 0}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* HISTORICAL MASTERY TRAJECTORY CHART */}
          <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-border space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-mono font-bold text-zinc-200 uppercase">
                  BKT MASTERY LEARNING CURVE OVER TIME
                </h3>
                <p className="text-xs text-zinc-400 font-sans">
                  Real-time updates following each assessment opportunity based on P(L_t|Obs).
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-brand-cyan/15 text-brand-cyan font-mono text-xs font-bold border border-brand-cyan/30">
                P(T)=0.15, P(S)=0.10, P(G)=0.20
              </span>
            </div>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="event" stroke="#71717a" fontSize={11} />
                  <YAxis stroke="#71717a" fontSize={11} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#090d16', border: '1px solid #27272a', borderRadius: '8px' }}
                    labelStyle={{ color: '#22d3ee', fontFamily: 'monospace' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="mastery"
                    name="Mastery %"
                    stroke="#22d3ee"
                    strokeWidth={2.5}
                    dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* COLD START INTAKE MODAL (Requirement 4b) */}
      {isIntakeModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-xl w-full p-6 rounded-2xl border border-brand-cyan/40 bg-zinc-950 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center space-x-2">
                <Brain size={18} className="text-brand-cyan" />
                <h3 className="text-base font-bold font-mono text-zinc-100">DIAGNOSTIC INTAKE QUIZ (COLD-START)</h3>
              </div>
              <button onClick={() => setIsIntakeModalOpen(false)} className="text-zinc-500 hover:text-zinc-200 font-mono">✕</button>
            </div>

            {intakeResult ? (
              <div className="p-6 text-center space-y-3">
                <Award size={40} className="text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold font-mono text-zinc-100">Intake Calibration Complete!</h4>
                <p className="text-xs text-zinc-300 font-mono">
                  Calibrated starting tier: <strong className="text-brand-cyan">{intakeResult.assignedStartingTier}</strong>
                </p>
                <p className="text-xs text-zinc-400">
                  Baseline P(L0) set to {(intakeResult.calibratedBaselineMastery * 100).toFixed(0)}%.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                  Welcome! Because you are a new student without historical telemetry, answer these 3 diagnostic baseline questions so our BKT engine can calibrate your initial knowledge state.
                </p>

                {intakeQuestions.map((q, idx) => (
                  <div key={q.id} className="p-4 rounded-xl bg-background border border-border space-y-2 text-xs">
                    <p className="font-bold text-zinc-200 font-mono">Q{idx + 1}: {q.questionText}</p>
                    {q.options?.map((opt: string, optI: number) => (
                      <div
                        key={optI}
                        onClick={() => setIntakeAnswers(prev => ({ ...prev, [q.id]: opt }))}
                        className={`p-2.5 rounded-lg border cursor-pointer font-mono text-[11px] ${
                          intakeAnswers[q.id] === opt
                            ? 'bg-brand-cyan/20 border-brand-cyan text-brand-cyan font-bold'
                            : 'bg-background-panel border-border text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                ))}

                <button
                  onClick={handleSubmitIntake}
                  className="w-full py-3 rounded-xl bg-brand-cyan text-zinc-950 font-mono text-xs font-bold hover:bg-brand-cyan/90 transition shadow-lg shadow-brand-cyan/15"
                >
                  CALIBRATE PRIOR MASTERY
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
