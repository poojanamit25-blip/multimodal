import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Play, RefreshCw, CheckCircle2, XCircle,
  AlertTriangle, BarChart2, Users, FileText, ExternalLink,
  ChevronDown, ChevronUp, Layers, Award
} from 'lucide-react';
import { EvaluationReport, EvaluationItemResult, StudentArchetypeSimulation } from '../types';
import { api } from '../api/client';

export const EvaluationSuite: React.FC = () => {
  const [report, setReport] = useState<EvaluationReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  useEffect(() => {
    loadLatestReport();
  }, []);

  const loadLatestReport = async () => {
    try {
      const res = await api.getLatestEvaluation();
      setReport(res);
    } catch (err: any) {
      console.error('Failed to load evaluation report:', err);
    }
  };

  const handleRunEvaluation = async () => {
    setIsRunning(true);
    try {
      const res = await api.runEvaluation('course_cs401');
      setReport(res);
    } catch (err: any) {
      alert(`Evaluation run failed: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const getScoreBadge = (score: number) => {
    const pct = Math.round(score * 100);
    let color = '#34d399'; // green
    if (pct < 70) color = '#fbbf24'; // yellow
    if (pct < 50) color = '#fb7185'; // red
    return (
      <span style={{ fontWeight: 800, color, fontFamily: 'var(--font-mono)' }}>
        {pct}%
      </span>
    );
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', maxWidth: '56rem', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '0.75rem',
          padding: '1.75rem',
          marginBottom: '1.75rem',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <ShieldCheck size={22} style={{ color: 'var(--accent-rose)' }} />
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
              System Quality Assurance & RAGAS Benchmark
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Live evaluation suite testing retrieval precision, factual faithfulness, citation integrity,
            curriculum boundary refusals, and multi-session learner trajectory convergence.
          </p>
        </div>

        <button
          onClick={handleRunEvaluation}
          disabled={isRunning}
          className="btn-primary"
          style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}
        >
          {isRunning ? <RefreshCw className="spin" size={16} /> : <Play size={16} />}
          <span>{isRunning ? 'Executing Real Benchmark...' : 'Run Test Suite'}</span>
        </button>
      </div>

      {report && (
        <>
          {/* Top Metric Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '0.5rem', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.35rem' }}>
                FAITHFULNESS SCORE
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                {Math.round(report.faithfulness_score * 100)}%
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Strict factual support from retrieved source chunks
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '0.5rem', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.35rem' }}>
                ANSWER RELEVANCY
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#60a5fa', fontFamily: 'var(--font-mono)' }}>
                {Math.round(report.relevancy_score * 100)}%
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Semantic answer alignment to student questions
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '0.5rem', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.35rem' }}>
                BOUNDARY REFUSAL ACCURACY
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#a855f7', fontFamily: 'var(--font-mono)' }}>
                {Math.round(report.refusal_accuracy_score * 100)}%
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Zero-hallucination out-of-scope refusal rate
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '0.5rem', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.35rem' }}>
                CONTEXT PRECISION
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                {Math.round(report.precision_score * 100)}%
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Relevance density of top-k retrieved units
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '0.5rem', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.35rem' }}>
                CONTEXT RECALL
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b', fontFamily: 'var(--font-mono)' }}>
                {Math.round(report.recall_score * 100)}%
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Gold source passage retrieval coverage
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '0.5rem', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.35rem' }}>
                CITATION INTEGRITY
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                {Math.round(report.citation_accuracy_score * 100)}%
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Zero fabricated pages or false timestamps
              </div>
            </div>
          </div>

          {/* Section: Student Archetype Multi-Session Personalization Simulation */}
          {report.details?.student_archetype_simulation && (
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                marginBottom: '1.75rem',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Users size={17} style={{ color: 'var(--accent-indigo)' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>
                  Multi-Session Student Archetype Personalization Simulation
                </h3>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
                Simulates 3 distinct learner profiles over 5 consecutive sessions (15 questions each),
                measuring Bayesian Knowledge Tracing convergence and question deduplication efficiency.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                {Object.entries(report.details.student_archetype_simulation).map(([k, arch]) => (
                  <div
                    key={k}
                    style={{
                      backgroundColor: 'var(--bg-app)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '0.5rem',
                      padding: '1rem',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#ffffff', marginBottom: '0.5rem' }}>
                      {arch.name}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                      <span style={{ color: 'var(--text-dim)' }}>Initial Prior:</span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        {Math.round(arch.initial_mastery * 100)}%
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                      <span style={{ color: 'var(--text-dim)' }}>Final Mastery (S5):</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                        {Math.round(arch.final_mastery * 100)}%
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                      <span style={{ color: 'var(--text-dim)' }}>Accuracy:</span>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>{arch.accuracy}%</span>
                    </div>

                    {/* Progression Sparkline representation */}
                    <div style={{ marginTop: '0.5rem' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>
                        Trajectory: {arch.mastery_progression.map((v) => Math.round(v * 100)).join(' → ')}%
                      </div>
                      <div style={{ height: '4px', backgroundColor: 'var(--bg-card)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${Math.round(arch.final_mastery * 100)}%`,
                            height: '100%',
                            backgroundColor: 'var(--accent-indigo)',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Test Items Table */}
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={17} style={{ color: 'var(--accent-cyan)' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>
                  Benchmark Test Cases & Factual Evidence Audit
                </h3>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                {report.total_samples} Verified Test Items
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {report.details?.test_items?.map((item: EvaluationItemResult, idx: number) => {
                const isExpanded = expandedItemId === item.test_id;
                return (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: 'var(--bg-app)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '0.5rem',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      onClick={() => setExpandedItemId(isExpanded ? null : item.test_id)}
                      style={{
                        padding: '0.85rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {item.passed ? (
                          <CheckCircle2 size={16} style={{ color: '#34d399', flexShrink: 0 }} />
                        ) : (
                          <XCircle size={16} style={{ color: '#fb7185', flexShrink: 0 }} />
                        )}
                        <div>
                          <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#ffffff' }}>
                            {item.question}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                            Category: {item.category} • {item.expected_unanswerable ? 'Unanswerable (Must Refuse)' : 'Answerable'}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ fontSize: '0.75rem' }}>
                          Faithfulness: {getScoreBadge(item.metrics.faithfulness)}
                        </div>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div
                        style={{
                          padding: '1rem',
                          borderTop: '1px solid var(--border-subtle)',
                          backgroundColor: 'var(--bg-card)',
                          fontSize: '0.78rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.6rem',
                        }}
                      >
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                          <div>Precision: {getScoreBadge(item.metrics.context_precision)}</div>
                          <div>Recall: {getScoreBadge(item.metrics.context_recall)}</div>
                          <div>Relevancy: {getScoreBadge(item.metrics.answer_relevancy)}</div>
                          <div>Refusal Check: {getScoreBadge(item.metrics.refusal_correctness)}</div>
                        </div>

                        {item.citations_returned && item.citations_returned.length > 0 && (
                          <div style={{ color: 'var(--text-muted)' }}>
                            Verified Citations: {item.citations_returned.filter(Boolean).join(', ')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
