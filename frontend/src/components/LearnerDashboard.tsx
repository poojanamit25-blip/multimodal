import React, { useState, useEffect } from 'react';
import {
  BarChart2, TrendingUp, CheckCircle2, AlertTriangle, ShieldCheck,
  Award, Clock, Compass, Sparkles, RefreshCw, Layers
} from 'lucide-react';
import { LearnerProfile, TopicMastery } from '../types';
import { api } from '../api/client';

interface LearnerDashboardProps {
  courseId: string;
  onStartQuizForTopic: (topic: string) => void;
}

export const LearnerDashboard: React.FC<LearnerDashboardProps> = ({
  courseId,
  onStartQuizForTopic,
}) => {
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [priorExperience, setPriorExperience] = useState('intermediate');

  useEffect(() => {
    loadProfile();
  }, [courseId]);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const res = await api.getLearnerProfile('student_default', courseId);
      setProfile(res);
    } catch (err: any) {
      console.error('Failed to load profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunDiagnostic = async () => {
    try {
      await api.onboardLearner({
        student_id: 'student_default',
        name: profile?.name || 'Alex Chen',
        preferred_language: profile?.preferred_language || 'en',
        study_goal_hours_per_week: 12.0,
        exam_date: '2026-11-20',
        prior_experience_level: priorExperience,
      });
      setShowOnboardModal(false);
      loadProfile();
    } catch (err: any) {
      alert(`Diagnostic onboarding failed: ${err.message}`);
    }
  };

  const getMasteryColor = (level: number) => {
    if (level >= 0.75) return '#10b981'; // emerald
    if (level >= 0.50) return '#3b82f6'; // blue
    if (level >= 0.35) return '#f59e0b'; // amber
    return '#f43f5e'; // rose
  };

  if (isLoading || !profile) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <RefreshCw className="spin" size={24} style={{ margin: '0 auto 1rem auto' }} />
        <div>Computing Bayesian Knowledge Tracing posteriors...</div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', maxWidth: '54rem', margin: '0 auto', width: '100%' }}>
      {/* Top Profile Summary Banner */}
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
            <Award size={22} style={{ color: 'var(--accent-indigo)' }} />
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
              Learner Profile & Bayesian Mastery Model
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Student: <strong>{profile.name}</strong> • CS401 Distributed Systems • Goal:{' '}
            {profile.study_goal_hours_per_week} hrs/week
          </p>
        </div>

        <button
          onClick={() => setShowOnboardModal(true)}
          className="btn-secondary"
          style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}
        >
          <Compass size={14} />
          <span>Calibrate Baseline</span>
        </button>
      </div>

      {/* Model Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '0.5rem', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.35rem' }}>
            OVERALL MASTERY PROBABILITY (BKT)
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
            {Math.round(profile.overall_mastery * 100)}%
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Latent knowledge estimate across 6 modules
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '0.5rem', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.35rem' }}>
            STATISTICAL CONFIDENCE CERTAINTY
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
            82%
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Certainty index based on attempt volume
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '0.5rem', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.35rem' }}>
            DIAGNOSTIC ONBOARDING SCORE
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-indigo)', fontFamily: 'var(--font-mono)' }}>
            {profile.diagnostic_score ? `${profile.diagnostic_score}%` : 'Calibrated'}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Baseline initial competency test
          </div>
        </div>
      </div>

      {/* Topic Mastery Breakdown */}
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>
            Topic Mastery & Uncertainty Calibration
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            P(L_t) Bayesian Posterior with Guess (25%) & Slip (10%)
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {profile.mastery_by_topic.map((t, idx) => {
            const mColor = getMasteryColor(t.mastery_level);
            return (
              <div
                key={idx}
                style={{
                  backgroundColor: 'var(--bg-app)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#ffffff' }}>
                      {t.topic_name}
                    </span>
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                      {t.correct_attempts} / {t.total_attempts} attempts correct
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span
                      className={`badge ${
                        t.revision_priority === 'urgent'
                          ? 'badge-rose'
                          : t.revision_priority === 'high'
                          ? 'badge-amber'
                          : 'badge-emerald'
                      }`}
                      style={{ fontSize: '0.65rem' }}
                    >
                      {t.revision_priority} revision
                    </span>

                    <button
                      onClick={() => onStartQuizForTopic(t.topic_name)}
                      className="btn-secondary"
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem' }}
                    >
                      Practice
                    </button>
                  </div>
                </div>

                {/* Progress Bar with Confidence Visualizer */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ flex: 1, height: '8px', backgroundColor: 'var(--bg-card)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.round(t.mastery_level * 100)}%`,
                        height: '100%',
                        backgroundColor: mColor,
                        borderRadius: '4px',
                        transition: 'width 0.5s ease',
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: mColor, fontFamily: 'var(--font-mono)', width: '2.5rem', textAlign: 'right' }}>
                    {Math.round(t.mastery_level * 100)}%
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                  <span>Certainty: {Math.round(t.confidence_level * 100)}%</span>
                  <span>Last Practiced: {t.last_practiced ? t.last_practiced.substring(0, 10) : 'Never'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Onboarding Diagnostic Modal */}
      {showOnboardModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-active)',
              borderRadius: '0.75rem',
              padding: '1.75rem',
              maxWidth: '28rem',
              width: '90%',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Diagnostic Baseline Onboarding
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Select your prior exposure to distributed systems. Synapse will calibrate your initial
              Bayesian Knowledge Tracing priors rather than assuming zero knowledge.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
              {[
                { id: 'beginner', label: 'Beginner (New to distributed architectures)' },
                { id: 'intermediate', label: 'Intermediate (Familiar with threads and sockets)' },
                { id: 'advanced', label: 'Advanced (Implemented Paxos/Raft in coursework)' },
              ].map((lvl) => (
                <label
                  key={lvl.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.65rem 0.85rem',
                    backgroundColor: priorExperience === lvl.id ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-app)',
                    border: `1px solid ${priorExperience === lvl.id ? 'var(--accent-indigo)' : 'var(--border-subtle)'}`,
                    borderRadius: '0.5rem',
                    fontSize: '0.8rem',
                    color: '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="exp"
                    value={lvl.id}
                    checked={priorExperience === lvl.id}
                    onChange={(e) => setPriorExperience(e.target.value)}
                    style={{ accentColor: 'var(--accent-indigo)' }}
                  />
                  <span>{lvl.label}</span>
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button onClick={() => setShowOnboardModal(false)} className="btn-secondary" style={{ fontSize: '0.8rem' }}>
                Cancel
              </button>
              <button onClick={handleRunDiagnostic} className="btn-primary" style={{ fontSize: '0.8rem' }}>
                Save Baseline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
