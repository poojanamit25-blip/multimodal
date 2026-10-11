import React from 'react';
import {
  Award, TrendingUp, AlertTriangle, BookOpen, ExternalLink,
  RotateCcw, CheckCircle2, XCircle, ArrowRight, Sparkles
} from 'lucide-react';
import { AssessmentResult, Citation } from '../types';

interface PerformanceReportProps {
  result: AssessmentResult;
  onRetake: () => void;
  onOpenCitation: (citation: Citation) => void;
}

export const PerformanceReport: React.FC<PerformanceReportProps> = ({
  result,
  onRetake,
  onOpenCitation,
}) => {
  const getScoreColor = (pct: number) => {
    if (pct >= 80) return '#34d399';
    if (pct >= 60) return '#60a5fa';
    if (pct >= 40) return '#fbbf24';
    return '#fb7185';
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', maxWidth: '52rem', margin: '0 auto', width: '100%' }}>
      {/* Header Banner */}
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '0.75rem',
          padding: '1.75rem',
          marginBottom: '1.5rem',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Award size={20} style={{ color: getScoreColor(result.percentage) }} />
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Assessment Performance Report</h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {result.summary_feedback}
          </p>
        </div>

        {/* Score Ring / Pill */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: '2.25rem',
              fontWeight: 800,
              color: getScoreColor(result.percentage),
              fontFamily: 'var(--font-mono)',
              lineHeight: 1,
            }}
          >
            {result.percentage}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
            {result.score} / {result.max_score} Score
          </div>
        </div>
      </div>

      {/* Grid: Weak Areas & Misconceptions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        {/* Misconceptions Box */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '0.75rem',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <AlertTriangle size={16} style={{ color: 'var(--accent-amber)' }} />
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Diagnosed Misconceptions</h4>
          </div>

          {result.misconceptions && result.misconceptions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {result.misconceptions.map((misc, idx) => (
                <div
                  key={idx}
                  style={{
                    fontSize: '0.78rem',
                    color: '#e2e8f0',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    borderLeft: '3px solid var(--accent-amber)',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0 0.25rem 0.25rem 0',
                    lineHeight: 1.4,
                  }}
                >
                  {misc}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={15} />
              <span>No major misconceptions detected in this session!</span>
            </div>
          )}
        </div>

        {/* Bayesian Mastery Update Box */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '0.75rem',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <TrendingUp size={16} style={{ color: 'var(--accent-emerald)' }} />
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Learner Model Updates (BKT)</h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {Object.entries(result.updated_mastery || {}).map(([top, val]) => (
              <div key={top} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>{top}</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
                  {Math.round(val * 100)}% Mastery
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Topic Breakdown Table */}
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '0.75rem',
          padding: '1.25rem',
          marginBottom: '1.5rem',
        }}
      >
        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem' }}>
          Topic-Wise Breakdown
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {result.topic_breakdown.map((tb, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 0.85rem',
                backgroundColor: 'var(--bg-app)',
                borderRadius: '0.5rem',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.825rem', color: '#ffffff' }}>{tb.topic}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {tb.correct} of {tb.total} correct ({tb.accuracy_percentage}%)
                </div>
              </div>

              <span
                className={`badge ${
                  tb.status === 'Mastered'
                    ? 'badge-emerald'
                    : tb.status === 'Needs Revision'
                    ? 'badge-amber'
                    : 'badge-rose'
                }`}
              >
                {tb.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Review Citations */}
      {result.recommended_citations && result.recommended_citations.length > 0 && (
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '0.75rem',
            padding: '1.25rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <BookOpen size={16} style={{ color: 'var(--accent-cyan)' }} />
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Recommended Source Materials for Review</h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {result.recommended_citations.map((cit, cIdx) => (
              <button
                key={cIdx}
                onClick={() => onOpenCitation(cit)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  backgroundColor: 'var(--bg-app)',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: 'var(--text-main)',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-indigo)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.825rem', color: '#ffffff' }}>
                    {cit.source_title}
                  </div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                    {cit.page_number && `Page ${cit.page_number}`}
                    {cit.slide_number && `Slide ${cit.slide_number}`}
                    {cit.timestamp_formatted && `Lecture Timestamp ${cit.timestamp_formatted}`}
                    {' • '}
                    <span style={{ fontStyle: 'italic' }}>"{cit.direct_quote.substring(0, 75)}..."</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-indigo)', fontSize: '0.75rem', fontWeight: 600 }}>
                  <span>Open in Reader</span>
                  <ExternalLink size={12} />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
        <button onClick={onRetake} className="btn-primary" style={{ padding: '0.65rem 1.25rem' }}>
          <RotateCcw size={15} />
          <span>Practice Another Topic</span>
        </button>
      </div>
    </div>
  );
};
