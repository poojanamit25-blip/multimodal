import React, { useState } from 'react';
import {
  Sparkles, BookOpen, Target, Calendar, Clock, ArrowRight,
  CheckCircle2, Layers, Flame, FileText, Upload, ChevronRight,
  GraduationCap, Cpu, Binary, Compass, CheckSquare
} from 'lucide-react';
import { Course } from '../types';
import { api } from '../api/client';

interface PreparationSetupPageProps {
  userName: string;
  userEmail: string;
  studentId: string;
  courses: Course[];
  onCompleteSetup: (config: {
    courseId: string;
    goal: string;
    examDate: string;
    hoursPerWeek: number;
    experienceLevel: string;
  }) => void;
}

export const PreparationSetupPage: React.FC<PreparationSetupPageProps> = ({
  userName,
  userEmail,
  studentId,
  courses,
  onCompleteSetup,
}) => {
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || 'course_cs401');
  const [selectedGoal, setSelectedGoal] = useState<'diagnostic_mock_test' | 'exam_prep' | 'quick_revision' | 'concept_mastery'>('diagnostic_mock_test');
  const [examDate, setExamDate] = useState('2026-11-20');
  const [studyHours, setStudyHours] = useState(10);
  const [experienceLevel, setExperienceLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subjectOptions = [
    {
      id: 'course_cs401',
      title: 'Distributed Systems & Cloud Computing',
      code: 'CS401',
      description: 'Consensus (Raft), CAP Theorem, Two-Phase Commit, Replication, Fault Tolerance',
      materials: 'Textbook (DDIA) • Lecture Slides • Verified Transcripts',
      icon: Cpu,
      color: '#38bdf8',
    },
    {
      id: 'course_math',
      title: 'Linear Algebra & Engineering Mathematics',
      code: 'MATH204',
      description: 'Matrices & Vectors, Gauss Elimination, Rank, Vector Spaces, Eigenvalues & Eigenvectors',
      materials: 'Kreyszig Advanced Engineering Mathematics (48 units indexed)',
      icon: Binary,
      color: '#e07a5f',
    },
  ];

  const goalOptions = [
    {
      id: 'diagnostic_mock_test',
      title: 'Attend Initial Diagnostic Mock Test',
      subtitle: 'Evaluate your current baseline knowledge, detect weak areas, and generate fresh topic progress',
      badge: 'Recommended for New Students',
      badgeColor: 'rgba(224, 122, 95, 0.2)',
      badgeTextColor: '#f4a261',
      icon: CheckSquare,
    },
    {
      id: 'exam_prep',
      title: 'Upcoming Final Exam Preparation',
      subtitle: 'Timed full mock exams, adaptive problem-solving quizzes, and Bayesian mastery tracking',
      badge: 'High Priority',
      badgeColor: 'rgba(244, 63, 94, 0.15)',
      badgeTextColor: '#fb7185',
      icon: Target,
    },
    {
      id: 'quick_revision',
      title: 'Rapid Revision & Memory Retention',
      subtitle: 'SuperMemo-2 spaced repetition flashcards and 2-minute audio synthesized briefings',
      badge: 'Memory Boost',
      badgeColor: 'rgba(245, 158, 11, 0.15)',
      badgeTextColor: '#f59e0b',
      icon: Flame,
    },
    {
      id: 'concept_mastery',
      title: 'Deep Concept Understanding',
      subtitle: 'Grounded AI tutor explanations, step-by-step proofs, and side-by-side textbook inspector',
      badge: 'Comprehensive',
      badgeColor: 'rgba(162, 89, 255, 0.15)',
      badgeTextColor: '#c084fc',
      icon: Compass,
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Save onboarding baseline to backend
      await api.onboardLearner({
        student_id: studentId,
        name: userName,
        preferred_language: 'en',
        study_goal_hours_per_week: studyHours,
        exam_date: examDate,
        prior_experience_level: experienceLevel,
      });
    } catch (err) {
      console.warn('Backend onboarding sync notice:', err);
    } finally {
      setIsSubmitting(false);
      onCompleteSetup({
        courseId: selectedCourseId,
        goal: selectedGoal,
        examDate,
        hoursPerWeek: studyHours,
        experienceLevel,
      });
    }
  };

  return (
    <div
      style={{
        height: '100vh',
        maxHeight: '100vh',
        width: '100vw',
        backgroundColor: '#07090e',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflowY: 'auto',
        fontFamily: 'var(--font-sans)',
        padding: '2rem 1.5rem 7rem 1.5rem',
      }}
    >
      {/* Background Glow */}
      <div
        style={{
          position: 'fixed',
          top: '-20%',
          right: '10%',
          width: '50rem',
          height: '50rem',
          background: 'radial-gradient(circle, rgba(0, 245, 155, 0.08) 0%, rgba(99, 102, 241, 0.06) 50%, transparent 75%)',
          filter: 'blur(90px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div style={{ maxWidth: '48rem', width: '100%', margin: '0 auto', position: 'relative', zIndex: 5 }}>
        {/* Header Greeting */}
        <div style={{ marginBottom: '2.25rem', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.25rem 0.75rem',
              borderRadius: '1rem',
              backgroundColor: 'rgba(0, 245, 155, 0.1)',
              border: '1px solid rgba(0, 245, 155, 0.25)',
              color: '#00f59b',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.75rem',
            }}
          >
            <Sparkles size={13} />
            Step 1 of 1 • Learning Intake
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
            What would you like to prepare for, {userName}?
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '34rem', margin: '0 auto' }}>
            Select your target course, primary study goal, and timeline. Synapse will tailor your knowledge graph, diagnostic quizzes, and AI tutor.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* SECTION 1: Subject / Topic Material Selection */}
          <div
            style={{
              backgroundColor: 'rgba(17, 22, 34, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '1rem',
              padding: '1.5rem',
              backdropFilter: 'blur(20px)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.25rem' }}>
              1. Choose Subject Area & Curriculum
            </label>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '1rem' }}>
              All tutor explanations and assessments will be grounded in these uploaded textbooks and slide decks.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(20rem, 1fr))', gap: '0.85rem' }}>
              {subjectOptions.map((sub) => {
                const isSelected = selectedCourseId === sub.id;
                const IconComponent = sub.icon;
                return (
                  <div
                    key={sub.id}
                    onClick={() => setSelectedCourseId(sub.id)}
                    style={{
                      padding: '1.15rem',
                      borderRadius: '0.75rem',
                      backgroundColor: isSelected ? 'rgba(0, 245, 155, 0.08)' : 'rgba(10, 14, 23, 0.6)',
                      border: `2px solid ${isSelected ? '#00f59b' : 'rgba(255, 255, 255, 0.08)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      position: 'relative',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '2.5rem',
                          height: '2.5rem',
                          borderRadius: '0.5rem',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: sub.color,
                          flexShrink: 0,
                        }}
                      >
                        <IconComponent size={20} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: sub.color }}>
                            {sub.code}
                          </span>
                          {isSelected && <CheckCircle2 size={16} color="#00f59b" />}
                        </div>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.35rem' }}>
                          {sub.title}
                        </h3>
                        <p style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.4, marginBottom: '0.5rem' }}>
                          {sub.description}
                        </p>
                        <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                          {sub.materials}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: Preparation Goal */}
          <div
            style={{
              backgroundColor: 'rgba(17, 22, 34, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '1rem',
              padding: '1.5rem',
              backdropFilter: 'blur(20px)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.25rem' }}>
              2. What is your primary learning goal?
            </label>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '1rem' }}>
              This sets your default workspace launcher and recommendation strategy.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {goalOptions.map((goal) => {
                const isSelected = selectedGoal === goal.id;
                const IconComp = goal.icon;
                return (
                  <div
                    key={goal.id}
                    onClick={() => setSelectedGoal(goal.id as any)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1rem 1.25rem',
                      borderRadius: '0.75rem',
                      backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'rgba(10, 14, 23, 0.6)',
                      border: `2px solid ${isSelected ? '#6366f1' : 'rgba(255, 255, 255, 0.08)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div
                        style={{
                          width: '2.25rem',
                          height: '2.25rem',
                          borderRadius: '0.5rem',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: isSelected ? '#a5b4fc' : '#94a3b8',
                        }}
                      >
                        <IconComp size={18} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                            {goal.title}
                          </span>
                          <span
                            style={{
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              padding: '0.15rem 0.5rem',
                              borderRadius: '0.35rem',
                              backgroundColor: goal.badgeColor,
                              color: goal.badgeTextColor,
                            }}
                          >
                            {goal.badge}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          {goal.subtitle}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        width: '1.25rem',
                        height: '1.25rem',
                        borderRadius: '50%',
                        border: `2px solid ${isSelected ? '#6366f1' : 'rgba(255, 255, 255, 0.2)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isSelected ? '#6366f1' : 'transparent',
                      }}
                    >
                      {isSelected && <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', backgroundColor: '#ffffff' }} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 3: Pace & Baseline */}
          <div
            style={{
              backgroundColor: 'rgba(17, 22, 34, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '1rem',
              padding: '1.5rem',
              backdropFilter: 'blur(20px)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(13rem, 1fr))',
              gap: '1.25rem',
            }}
          >
            {/* Target Exam Date */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.4rem' }}>
                <Calendar size={14} style={{ display: 'inline', marginRight: '0.35rem', verticalAlign: '-2px' }} />
                Target Exam Date
              </label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  backgroundColor: 'rgba(10, 14, 23, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '0.5rem',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />
            </div>

            {/* Weekly Target Study Hours */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.4rem' }}>
                <Clock size={14} style={{ display: 'inline', marginRight: '0.35rem', verticalAlign: '-2px' }} />
                Weekly Study Commitment
              </label>
              <select
                value={studyHours}
                onChange={(e) => setStudyHours(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  backgroundColor: 'rgba(10, 14, 23, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '0.5rem',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              >
                <option value={5}>5 Hours / Week (Casual)</option>
                <option value={10}>10 Hours / Week (Recommended)</option>
                <option value={15}>15 Hours / Week (Intensive Exam Prep)</option>
                <option value={20}>20+ Hours / Week (Cram Mode)</option>
              </select>
            </div>

            {/* Prior Experience Level */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.4rem' }}>
                <GraduationCap size={14} style={{ display: 'inline', marginRight: '0.35rem', verticalAlign: '-2px' }} />
                Baseline Comfort Level
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  backgroundColor: 'rgba(10, 14, 23, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '0.5rem',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              >
                <option value="beginner">Beginner (Start with core intuition)</option>
                <option value="intermediate">Intermediate (Standard syllabus level)</option>
                <option value="advanced">Advanced (Deep problem-solving)</option>
              </select>
            </div>
          </div>

          {/* Sticky Floating Launch Bar for Fast Access */}
          <div
            style={{
              position: 'sticky',
              bottom: '1rem',
              left: 0,
              right: 0,
              backgroundColor: 'rgba(10, 14, 23, 0.95)',
              border: '1px solid rgba(0, 245, 155, 0.35)',
              borderRadius: '0.85rem',
              padding: '0.9rem 1.25rem',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 12px 35px rgba(0, 0, 0, 0.8), 0 0 25px rgba(0, 245, 155, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              zIndex: 40,
              marginTop: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ffffff' }}>
                Preparing:{' '}
                <span style={{ color: '#00f59b' }}>
                  {selectedCourseId === 'course_math'
                    ? 'MATH204 • Linear Algebra & Engineering Mathematics'
                    : 'CS401 • Distributed Systems & Cloud Computing'}
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                Goal: <strong style={{ color: '#e2e8f0' }}>{goalOptions.find((g) => g.id === selectedGoal)?.title}</strong> ({studyHours} hrs/wk • {experienceLevel.toUpperCase()})
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '0.85rem 1.6rem',
                borderRadius: '0.65rem',
                backgroundColor: '#00f59b',
                color: '#07090e',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 20px rgba(0, 245, 155, 0.4)',
                transition: 'all 0.2s ease',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.backgroundColor = '#00df8c';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#00f59b';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <span>{isSubmitting ? 'Configuring Your Workspace...' : 'Launch Personalized Study Workspace'}</span>
              <ArrowRight size={17} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
