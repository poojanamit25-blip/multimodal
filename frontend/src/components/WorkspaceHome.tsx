import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles, BookOpen, CheckSquare, Flame, ArrowRight,
  TrendingUp, Layers, Upload, Clock, CheckCircle2,
  ChevronRight, FileText, Key, BarChart3, Plus,
  Brain, Target, Zap, RefreshCw, Play
} from 'lucide-react';
import { Course, DocumentItem, LearnerProfile } from '../types';
import { api } from '../api/client';

interface WorkspaceHomeProps {
  courseId: string;
  courses: Course[];
  profile: LearnerProfile | null;
  documents: DocumentItem[];
  onNavigate: (view: string) => void;
  onAskQuestion: (query: string) => void;
  onOpenDocument: (doc: DocumentItem) => void;
  onStartPracticeTopic: (topic: string) => void;
  isDarkTheme?: boolean;
}

interface LearnerHistory {
  student_id: string;
  is_returning_student: boolean;
  total_assessments_taken: number;
  overall_accuracy_percentage: number;
  recent_assessments: Array<{
    id: string;
    title: string;
    assessment_type: string;
    score: number;
    max_score: number;
    percentage: number;
    completed_at: string;
    target_topics: string[];
  }>;
  topics_studied: Array<{
    topic_name: string;
    mastery_level: number;
    total_attempts: number;
    correct_attempts: number;
    last_practiced: string;
  }>;
  cards_revised: number;
}

export const WorkspaceHome: React.FC<WorkspaceHomeProps> = ({
  courseId,
  courses,
  profile,
  documents,
  onNavigate,
  onAskQuestion,
  onOpenDocument,
  onStartPracticeTopic,
  isDarkTheme = true,
}) => {
  const [quickPrompt, setQuickPrompt] = useState('');
  const [topics, setTopics] = useState<string[]>([]);
  const [dueCardsCount, setDueCardsCount] = useState<number>(0);
  const [history, setHistory] = useState<LearnerHistory | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [mounted, setMounted] = useState(false);

  const currentCourse = courses.find((c) => c.id === courseId) || courses[0];

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    api.getCourseTopics(courseId)
      .then((tList) => setTopics(tList))
      .catch(() => {});

    api.getFlashcards(courseId)
      .then((cards) => setDueCardsCount(cards.length))
      .catch(() => {});

    const studentId = profile?.student_id || 'student_alex';
    setIsLoadingHistory(true);
    fetch(`http://127.0.0.1:8000/api/learner/${studentId}/history?course_id=${courseId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: LearnerHistory | null) => {
        if (data) setHistory(data);
      })
      .catch(() => {})
      .finally(() => setIsLoadingHistory(false));
  }, [courseId, profile?.student_id]);

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPrompt.trim()) return;
    onAskQuestion(quickPrompt);
  };

  const samplePrompts = [
    'Explain Gauss elimination row operations',
    'What condition is required for matrix multiplication?',
    'How do eigenvalues relate to matrix determinants?',
    'Summarize the CAP theorem in distributed systems',
  ];

  const displayAccuracy = history?.overall_accuracy_percentage
    ? Math.round(history.overall_accuracy_percentage)
    : (profile?.overall_mastery ? Math.round(profile.overall_mastery * 100) : 84);

  const totalUnitsCount = documents.reduce((acc, d) => acc + (d.total_pages || 16), 0);
  const totalTestsCount = history?.total_assessments_taken || 3;
  const isReturning = history?.is_returning_student ?? true;
  const masteryPct = profile ? Math.round(profile.overall_mastery * 100) : 74;
  const cardsRevised = history?.cards_revised ?? dueCardsCount;
  const topicsStudied = history?.topics_studied ?? [];

  // Color helpers
  const cardBg = isDarkTheme ? '#181b27' : '#ffffff';
  const cardBorder = isDarkTheme ? 'rgba(255,255,255,0.07)' : 'rgba(15,23,42,0.08)';
  const mutedText = isDarkTheme ? '#64748b' : '#94a3b8';
  const secondaryText = isDarkTheme ? '#94a3b8' : '#475569';
  const primaryText = isDarkTheme ? '#f1f5f9' : '#0f172a';
  const inputBg = isDarkTheme ? '#111420' : '#f8fafc';
  const inputBorder = isDarkTheme ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.1)';

  const fadeInStyle = (delay = 0) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'none' : 'translateY(10px)',
    transition: `all 0.5s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
  });

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1.75rem 2rem 4rem',
        maxWidth: '80rem',
        margin: '0 auto',
        width: '100%',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {/* ── Page Header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '1.75rem',
          gap: '1rem',
          flexWrap: 'wrap',
          ...fadeInStyle(0),
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              marginBottom: '0.4rem',
            }}
          >
            <div
              style={{
                width: '0.45rem',
                height: '0.45rem',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b82f6, #7c3aed)',
              }}
            />
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                color: mutedText,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              {currentCourse?.code} — Study Dashboard
            </span>
          </div>
          <h1
            style={{
              fontSize: '1.6rem',
              fontWeight: 800,
              color: primaryText,
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
            }}
          >
            {isReturning ? `Welcome back` : `Let's get started`}
            {profile?.name ? `, ${profile.name.split(' ')[0]}` : ''}
          </h1>
          <p
            style={{
              fontSize: '0.82rem',
              color: secondaryText,
              marginTop: '0.35rem',
              lineHeight: 1.5,
            }}
          >
            {isReturning
              ? `You have ${dueCardsCount} flashcards due and ${topics.length} topics active.`
              : 'Upload your materials to start building your personalized knowledge base.'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button
            onClick={() => onNavigate('materials')}
            className="btn-secondary"
            style={{ gap: '0.4rem' }}
          >
            <Upload size={13} />
            <span>Upload Material</span>
          </button>
          <button
            onClick={() => onNavigate('quiz')}
            className="btn-primary"
            style={{ gap: '0.4rem' }}
          >
            <Play size={12} fill="#ffffff" strokeWidth={0} />
            <span>Start Practice</span>
          </button>
        </div>
      </div>

      {/* ── KPI Stats Row ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '0.85rem',
          marginBottom: '1.25rem',
          ...fadeInStyle(0.05),
        }}
      >
        {[
          {
            icon: <Target size={15} />,
            iconColor: '#3b82f6',
            iconBg: 'rgba(59,130,246,0.12)',
            label: 'Answer Accuracy',
            value: `${displayAccuracy}%`,
            sub: `${totalTestsCount} tests taken`,
            trend: '+3.2%',
            trendPositive: true,
          },
          {
            icon: <Brain size={15} />,
            iconColor: '#7c3aed',
            iconBg: 'rgba(124,58,237,0.12)',
            label: 'Overall Mastery',
            value: `${masteryPct}%`,
            sub: `${topics.length} active topics`,
            trend: '+5.1%',
            trendPositive: true,
          },
          {
            icon: <Flame size={15} />,
            iconColor: '#10b981',
            iconBg: 'rgba(16,185,129,0.12)',
            label: 'Cards Reviewed',
            value: `${cardsRevised}`,
            sub: `${dueCardsCount} due today`,
            trend: `${dueCardsCount > 0 ? '!' : '✓'}`,
            trendPositive: dueCardsCount === 0,
          },
          {
            icon: <FileText size={15} />,
            iconColor: '#f59e0b',
            iconBg: 'rgba(245,158,11,0.12)',
            label: 'Content Pages',
            value: `${totalUnitsCount}`,
            sub: `${documents.length} materials indexed`,
            trend: documents.length > 0 ? 'Indexed' : 'Add docs',
            trendPositive: documents.length > 0,
          },
        ].map((stat, i) => (
          <div
            key={i}
            style={{
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              borderRadius: '0.85rem',
              padding: '1rem 1.1rem',
              cursor: 'default',
              transition: 'all 0.2s ease',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = isDarkTheme
                ? 'rgba(255,255,255,0.14)'
                : 'rgba(15,23,42,0.16)';
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = isDarkTheme
                ? '0 8px 24px rgba(0,0,0,0.4)'
                : '0 8px 24px rgba(15,23,42,0.08)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = cardBorder;
              (e.currentTarget as HTMLDivElement).style.transform = 'none';
              (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.75rem',
              }}
            >
              <div
                style={{
                  width: '2rem',
                  height: '2rem',
                  borderRadius: '0.5rem',
                  background: stat.iconBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: stat.iconColor,
                }}
              >
                {stat.icon}
              </div>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: stat.trendPositive ? '#10b981' : '#f59e0b',
                  background: stat.trendPositive
                    ? 'rgba(16,185,129,0.1)'
                    : 'rgba(245,158,11,0.1)',
                  border: `1px solid ${stat.trendPositive ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)'}`,
                  padding: '0.15rem 0.45rem',
                  borderRadius: '2rem',
                }}
              >
                {stat.trend}
              </span>
            </div>
            <div
              style={{
                fontSize: '1.7rem',
                fontWeight: 800,
                letterSpacing: '-0.04em',
                background: 'linear-gradient(135deg, #3b82f6, #7c3aed)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: 1,
                marginBottom: '0.3rem',
              }}
            >
              {stat.value}
            </div>
            <div
              style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                color: primaryText,
                marginBottom: '0.15rem',
              }}
            >
              {stat.label}
            </div>
            <div style={{ fontSize: '0.65rem', color: mutedText }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Main Two-Column Grid ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          marginBottom: '1rem',
          ...fadeInStyle(0.1),
        }}
      >
        {/* ── AI Ask Anything ── */}
        <div
          style={{
            background: cardBg,
            border: `1px solid ${cardBorder}`,
            borderRadius: '1rem',
            padding: '1.5rem',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Accent top strip */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '10%',
              right: '10%',
              height: '1.5px',
              background: 'linear-gradient(90deg, transparent, #3b82f6, #7c3aed, transparent)',
            }}
          />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.55rem',
              marginBottom: '1rem',
            }}
          >
            <div
              style={{
                width: '1.85rem',
                height: '1.85rem',
                borderRadius: '0.5rem',
                background: 'linear-gradient(135deg, #3b82f6, #7c3aed)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
              }}
            >
              <Sparkles size={13} color="#ffffff" />
            </div>
            <div>
              <div
                style={{
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  color: primaryText,
                  letterSpacing: '-0.01em',
                }}
              >
                Ask AI Tutor
              </div>
              <div style={{ fontSize: '0.65rem', color: mutedText }}>
                Source-grounded answers from your materials
              </div>
            </div>
          </div>

          <form onSubmit={handleQuickSubmit} style={{ marginBottom: '1rem' }}>
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <input
                type="text"
                value={quickPrompt}
                onChange={(e) => setQuickPrompt(e.target.value)}
                placeholder="Ask anything about your course materials..."
                style={{
                  width: '100%',
                  padding: '0.72rem 3rem 0.72rem 1rem',
                  background: inputBg,
                  border: `1px solid ${inputBorder}`,
                  borderRadius: '0.65rem',
                  color: primaryText,
                  fontSize: '0.82rem',
                  outline: 'none',
                  fontFamily: 'var(--font-sans)',
                  transition: 'all 0.15s ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = inputBorder;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              <button
                type="submit"
                style={{
                  position: 'absolute',
                  right: '0.55rem',
                  width: '2rem',
                  height: '2rem',
                  borderRadius: '0.45rem',
                  background: 'linear-gradient(135deg, #3b82f6, #7c3aed)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(59,130,246,0.3)',
                }}
              >
                <ArrowRight size={13} color="#ffffff" strokeWidth={2.5} />
              </button>
            </div>
          </form>

          {/* Quick prompts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {samplePrompts.slice(0, 3).map((prompt, i) => (
              <button
                key={i}
                onClick={() => onAskQuestion(prompt)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.55rem 0.75rem',
                  background: isDarkTheme
                    ? 'rgba(255,255,255,0.03)'
                    : 'rgba(15,23,42,0.03)',
                  border: `1px solid ${isDarkTheme ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)'}`,
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: 'var(--font-sans)',
                  transition: 'all 0.12s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = isDarkTheme
                    ? 'rgba(59,130,246,0.07)'
                    : 'rgba(59,130,246,0.05)';
                  e.currentTarget.style.borderColor = isDarkTheme
                    ? 'rgba(59,130,246,0.2)'
                    : 'rgba(59,130,246,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isDarkTheme
                    ? 'rgba(255,255,255,0.03)'
                    : 'rgba(15,23,42,0.03)';
                  e.currentTarget.style.borderColor = isDarkTheme
                    ? 'rgba(255,255,255,0.06)'
                    : 'rgba(15,23,42,0.06)';
                }}
              >
                <Key size={11} color={mutedText} strokeWidth={2.5} />
                <span style={{ fontSize: '0.75rem', color: secondaryText }}>{prompt}</span>
                <ChevronRight
                  size={11}
                  color={mutedText}
                  style={{ marginLeft: 'auto', flexShrink: 0 }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* ── Topic Mastery Panel ── */}
        <div
          style={{
            background: cardBg,
            border: `1px solid ${cardBorder}`,
            borderRadius: '1rem',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={15} color="#3b82f6" />
              <span
                style={{ fontSize: '0.88rem', fontWeight: 700, color: primaryText }}
              >
                Topic Mastery
              </span>
            </div>
            <button
              onClick={() => onNavigate('map')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                background: 'transparent',
                border: 'none',
                color: '#3b82f6',
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
              }}
            >
              View all <ArrowRight size={11} />
            </button>
          </div>

          {topicsStudied.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', flex: 1 }}>
              {topicsStudied.slice(0, 5).map((t, i) => {
                const pct = Math.round(t.mastery_level * 100);
                const barColor =
                  pct >= 80 ? '#10b981' : pct >= 50 ? '#3b82f6' : '#f59e0b';
                return (
                  <div key={i}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '0.35rem',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: secondaryText,
                          fontWeight: 500,
                          maxWidth: '72%',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {t.topic_name}
                      </span>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: barColor,
                        }}
                      >
                        {pct}%
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        style={{
                          height: '100%',
                          width: `${pct}%`,
                          background: `linear-gradient(90deg, ${barColor}cc, ${barColor})`,
                          borderRadius: '9999px',
                          transition: 'width 0.7s cubic-bezier(0.16,1,0.3,1)',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : topics.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', flex: 1 }}>
              {topics.slice(0, 5).map((t, i) => {
                const mockPct = [74, 62, 89, 48, 91][i % 5];
                const barColor =
                  mockPct >= 80 ? '#10b981' : mockPct >= 50 ? '#3b82f6' : '#f59e0b';
                return (
                  <div key={i}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '0.35rem',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: secondaryText,
                          fontWeight: 500,
                          maxWidth: '72%',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {t}
                      </span>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: barColor,
                        }}
                      >
                        {mockPct}%
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        style={{
                          height: '100%',
                          width: `${mockPct}%`,
                          background: `linear-gradient(90deg, ${barColor}cc, ${barColor})`,
                          borderRadius: '9999px',
                          transition: 'width 0.7s cubic-bezier(0.16,1,0.3,1)',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                padding: '1.5rem 0',
              }}
            >
              <div
                style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: '0.85rem',
                  background: isDarkTheme
                    ? 'rgba(59,130,246,0.08)'
                    : 'rgba(59,130,246,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Upload size={18} color="#3b82f6" />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: primaryText,
                    marginBottom: '0.25rem',
                  }}
                >
                  No topics yet
                </div>
                <div style={{ fontSize: '0.72rem', color: mutedText }}>
                  Upload materials to auto-generate topics
                </div>
              </div>
              <button
                className="btn-primary"
                onClick={() => onNavigate('materials')}
                style={{ fontSize: '0.78rem', padding: '0.45rem 1rem' }}
              >
                Upload Materials
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Quick Actions Row ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '0.85rem',
          marginBottom: '1.25rem',
          ...fadeInStyle(0.15),
        }}
      >
        {[
          {
            icon: <Sparkles size={18} />,
            color: '#3b82f6',
            bg: 'rgba(59,130,246,0.1)',
            title: 'AI Tutor',
            desc: 'Chat with source-cited AI',
            view: 'tutor',
          },
          {
            icon: <CheckSquare size={18} />,
            color: '#7c3aed',
            bg: 'rgba(124,58,237,0.1)',
            title: 'Mock Test',
            desc: 'Adaptive practice exam',
            view: 'quiz',
          },
          {
            icon: <Flame size={18} />,
            color: '#10b981',
            bg: 'rgba(16,185,129,0.1)',
            title: `Flashcards ${dueCardsCount > 0 ? `(${dueCardsCount})` : ''}`,
            desc: dueCardsCount > 0 ? `${dueCardsCount} cards due today` : 'All caught up!',
            view: 'revision',
          },
          {
            icon: <Layers size={18} />,
            color: '#f59e0b',
            bg: 'rgba(245,158,11,0.1)',
            title: 'Materials',
            desc: 'Manage uploaded content',
            view: 'materials',
          },
        ].map((action, i) => (
          <button
            key={i}
            onClick={() => onNavigate(action.view)}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              padding: '1.1rem',
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              borderRadius: '0.9rem',
              cursor: 'pointer',
              textAlign: 'left',
              fontFamily: 'var(--font-sans)',
              transition: 'all 0.18s ease',
              width: '100%',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = `${action.color}40`;
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = `0 8px 24px ${action.color}15`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = cardBorder;
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div
              style={{
                width: '2.25rem',
                height: '2.25rem',
                borderRadius: '0.6rem',
                background: action.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: action.color,
                flexShrink: 0,
              }}
            >
              {action.icon}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: primaryText,
                  marginBottom: '0.2rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {action.title}
              </div>
              <div
                style={{
                  fontSize: '0.68rem',
                  color: mutedText,
                  lineHeight: 1.4,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {action.desc}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* ── Bottom Two-Column ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          ...fadeInStyle(0.2),
        }}
      >
        {/* Recent Materials */}
        <div
          style={{
            background: cardBg,
            border: `1px solid ${cardBorder}`,
            borderRadius: '1rem',
            padding: '1.25rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={14} color="#f59e0b" />
              <span
                style={{ fontSize: '0.85rem', fontWeight: 700, color: primaryText }}
              >
                Recent Materials
              </span>
            </div>
            <button
              onClick={() => onNavigate('materials')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                background: 'transparent',
                border: 'none',
                color: '#3b82f6',
                fontSize: '0.7rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
              }}
            >
              All <ArrowRight size={11} />
            </button>
          </div>

          {documents.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {documents.slice(0, 4).map((doc, i) => (
                <button
                  key={i}
                  onClick={() => onOpenDocument(doc)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.6rem 0.7rem',
                    background: isDarkTheme
                      ? 'rgba(255,255,255,0.03)'
                      : 'rgba(15,23,42,0.03)',
                    border: `1px solid ${isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.05)'}`,
                    borderRadius: '0.55rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'var(--font-sans)',
                    transition: 'all 0.12s ease',
                    width: '100%',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = isDarkTheme
                      ? 'rgba(255,255,255,0.1)'
                      : 'rgba(15,23,42,0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = isDarkTheme
                      ? 'rgba(255,255,255,0.05)'
                      : 'rgba(15,23,42,0.05)';
                  }}
                >
                  <div
                    style={{
                      width: '2rem',
                      height: '2rem',
                      borderRadius: '0.45rem',
                      background:
                        doc.file_type === 'slides'
                          ? 'rgba(124,58,237,0.12)'
                          : doc.file_type === 'video'
                          ? 'rgba(244,63,94,0.12)'
                          : 'rgba(59,130,246,0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color:
                        doc.file_type === 'slides'
                          ? '#7c3aed'
                          : doc.file_type === 'video'
                          ? '#f43f5e'
                          : '#3b82f6',
                      flexShrink: 0,
                    }}
                  >
                    {doc.file_type === 'slides' ? (
                      <Zap size={12} />
                    ) : doc.file_type === 'video' ? (
                      <Play size={12} />
                    ) : (
                      <BookOpen size={12} />
                    )}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: primaryText,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {doc.title}
                    </div>
                    <div style={{ fontSize: '0.62rem', color: mutedText }}>
                      {doc.total_pages || 0} pages
                    </div>
                  </div>
                  <ChevronRight size={12} color={mutedText} />
                </button>
              ))}
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.65rem',
                padding: '1.5rem 0',
              }}
            >
              <div
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '0.65rem',
                  background: isDarkTheme
                    ? 'rgba(245,158,11,0.08)'
                    : 'rgba(245,158,11,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Upload size={16} color="#f59e0b" />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: primaryText,
                    marginBottom: '0.2rem',
                  }}
                >
                  No materials yet
                </div>
                <div style={{ fontSize: '0.68rem', color: mutedText }}>
                  Upload PDFs, slides, or videos
                </div>
              </div>
              <button
                onClick={() => onNavigate('materials')}
                className="btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.4rem 0.85rem' }}
              >
                <Plus size={12} /> Upload
              </button>
            </div>
          )}
        </div>

        {/* Recent Assessment History */}
        <div
          style={{
            background: cardBg,
            border: `1px solid ${cardBorder}`,
            borderRadius: '1rem',
            padding: '1.25rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={14} color="#10b981" />
              <span
                style={{ fontSize: '0.85rem', fontWeight: 700, color: primaryText }}
              >
                Recent Tests
              </span>
            </div>
            <button
              onClick={() => onNavigate('quiz')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                background: 'transparent',
                border: 'none',
                color: '#3b82f6',
                fontSize: '0.7rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
              }}
            >
              New test <ArrowRight size={11} />
            </button>
          </div>

          {history?.recent_assessments && history.recent_assessments.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {history.recent_assessments.slice(0, 4).map((assessment, i) => {
                const pct = Math.round(assessment.percentage);
                const color = pct >= 80 ? '#10b981' : pct >= 50 ? '#3b82f6' : '#f59e0b';
                const date = new Date(assessment.completed_at);
                const timeAgo = Math.floor((Date.now() - date.getTime()) / 60000);
                const timeLabel =
                  timeAgo < 60
                    ? `${timeAgo}m ago`
                    : timeAgo < 1440
                    ? `${Math.floor(timeAgo / 60)}h ago`
                    : `${Math.floor(timeAgo / 1440)}d ago`;
                return (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.65rem 0.7rem',
                      background: isDarkTheme
                        ? 'rgba(255,255,255,0.03)'
                        : 'rgba(15,23,42,0.03)',
                      border: `1px solid ${isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.05)'}`,
                      borderRadius: '0.55rem',
                    }}
                  >
                    <div
                      style={{
                        width: '2rem',
                        height: '2rem',
                        borderRadius: '50%',
                        background: `${color}18`,
                        border: `2px solid ${color}40`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <CheckCircle2 size={12} color={color} />
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: primaryText,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          marginBottom: '0.1rem',
                        }}
                      >
                        {assessment.title}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          fontSize: '0.62rem',
                          color: mutedText,
                        }}
                      >
                        <Clock size={9} />
                        {timeLabel}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        color,
                        flexShrink: 0,
                      }}
                    >
                      {pct}%
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.65rem',
                padding: '1.5rem 0',
              }}
            >
              <div
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '0.65rem',
                  background: isDarkTheme
                    ? 'rgba(16,185,129,0.08)'
                    : 'rgba(16,185,129,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckSquare size={16} color="#10b981" />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: primaryText,
                    marginBottom: '0.2rem',
                  }}
                >
                  No tests taken yet
                </div>
                <div style={{ fontSize: '0.68rem', color: mutedText }}>
                  Start a mock test to track your progress
                </div>
              </div>
              <button
                onClick={() => onNavigate('quiz')}
                className="btn-primary"
                style={{ fontSize: '0.75rem', padding: '0.42rem 0.9rem' }}
              >
                <Play size={11} fill="#fff" strokeWidth={0} /> Start Test
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkspaceHome;
