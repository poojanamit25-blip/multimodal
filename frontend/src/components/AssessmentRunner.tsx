import React, { useState, useEffect } from 'react';
import {
  CheckSquare, Clock, AlertTriangle, ArrowRight, ArrowLeft,
  CheckCircle2, XCircle, Award, RefreshCw, BookOpen, ExternalLink,
  HelpCircle, ChevronRight, Calculator
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Assessment, Question, AssessmentResult, Citation } from '../types';
import { api } from '../api/client';
import { PerformanceReport } from './PerformanceReport';

interface AssessmentRunnerProps {
  courseId: string;
  initialTopic?: string;
  onOpenCitation: (citation: Citation) => void;
  onAssessmentCompleted?: () => void;
}

export const AssessmentRunner: React.FC<AssessmentRunnerProps> = ({
  courseId,
  initialTopic,
  onOpenCitation,
  onAssessmentCompleted,
}) => {
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [secondsRemaining, setSecondsRemaining] = useState<number>(900); // 15 mins
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);

  // Configuration form state
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  const [selectedTopic, setSelectedTopic] = useState(initialTopic || 'All Topics (Adaptive)');
  const [assessmentType, setAssessmentType] = useState<'topic_practice' | 'mock_exam'>('topic_practice');
  const [difficulty, setDifficulty] = useState('adaptive');
  const [questionCount, setQuestionCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);

  // Load active course topics dynamically from uploaded materials
  useEffect(() => {
    api.getCourseTopics(courseId)
      .then((topics) => {
        setAvailableTopics(topics);
        if (initialTopic && topics.includes(initialTopic)) {
          setSelectedTopic(initialTopic);
        }
      })
      .catch((err) => console.error('Failed to load course topics:', err));
  }, [courseId, initialTopic]);

  // Timer countdown
  useEffect(() => {
    let timer: any;
    if (assessment && assessment.status === 'in_progress' && !result && secondsRemaining > 0) {
      timer = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [assessment, result, secondsRemaining]);

  const handleStartQuiz = async () => {
    setIsGenerating(true);
    try {
      const targetTopics =
        selectedTopic === 'All Topics (Adaptive)'
          ? []
          : [selectedTopic];

      const res = await api.generateAssessment({
        course_id: courseId,
        assessment_type: assessmentType,
        target_topics: targetTopics,
        difficulty: difficulty,
        total_questions: questionCount,
        time_limit_minutes: assessmentType === 'mock_exam' ? 30 : 15,
      });

      setAssessment(res);
      setCurrentIndex(0);
      setSelectedAnswers({});
      setResult(null);
      setSecondsRemaining((res.time_limit_minutes || 15) * 60);
    } catch (err: any) {
      alert(`Error creating assessment: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectAnswer = (questionId: string, answer: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmit = async () => {
    if (!assessment || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const answersList = assessment.questions.map((q) => ({
        question_id: q.id,
        student_answer: selectedAnswers[q.id] || '',
      }));

      const res = await api.submitAssessment(assessment.id, answersList);
      setResult(res);

      if (onAssessmentCompleted) {
        onAssessmentCompleted();
      }

      // Trigger celebration confetti
      if (res.percentage >= 60) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err: any) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // If result is ready, show comprehensive report
  if (result) {
    return (
      <PerformanceReport
        result={result}
        onRetake={() => {
          setAssessment(null);
          setResult(null);
        }}
        onOpenCitation={onOpenCitation}
      />
    );
  }

  // Quiz Creator Configuration Screen
  if (!assessment) {
    return (
      <div style={{ padding: '2rem', maxWidth: '48rem', margin: '0 auto', overflowY: 'auto' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <CheckSquare size={22} style={{ color: 'var(--accent-indigo)' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Adaptive Assessment Generator</h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Generate targeted practice quizzes or full mock exams validated against your course textbooks and slides.
            Questions adapt to your Bayesian Knowledge Tracing learner model.
          </p>
        </div>

        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '0.75rem',
            padding: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          {/* Assessment Mode */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              Assessment Type
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setAssessmentType('topic_practice')}
                style={{
                  padding: '0.85rem',
                  borderRadius: '0.5rem',
                  backgroundColor: assessmentType === 'topic_practice' ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-app)',
                  border: `2px solid ${assessmentType === 'topic_practice' ? 'var(--accent-indigo)' : 'var(--border-subtle)'}`,
                  color: '#ffffff',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.2rem' }}>
                  Topic Practice Quiz
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Targeted questions focused on your weakest concepts.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setAssessmentType('mock_exam')}
                style={{
                  padding: '0.85rem',
                  borderRadius: '0.5rem',
                  backgroundColor: assessmentType === 'mock_exam' ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-app)',
                  border: `2px solid ${assessmentType === 'mock_exam' ? 'var(--accent-indigo)' : 'var(--border-subtle)'}`,
                  color: '#ffffff',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.2rem' }}>
                  Full Mock Exam
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Comprehensive exam covering consensus, 2PC, quorums, and CAP.
                </div>
              </button>
            </div>
          </div>

          {/* Topic Selection */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              Target Subject Topic
            </label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '0.5rem',
                color: 'var(--text-main)',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            >
              <option value="All Topics (Adaptive)">
                All Topics (Adaptive based on your mastery profile & uploaded materials)
              </option>
              {availableTopics.map((top) => (
                <option key={top} value={top}>
                  {top}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty & Question Count */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '0.5rem',
                  color: 'var(--text-main)',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              >
                <option value="adaptive">Adaptive (Auto-scales)</option>
                <option value="easy">Foundational (Easy)</option>
                <option value="medium">Standard University (Medium)</option>
                <option value="hard">Advanced / Numerical (Hard)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                Number of Questions
              </label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '0.5rem',
                  color: 'var(--text-main)',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              >
                <option value="3">3 Questions (Rapid Check ~5m)</option>
                <option value="5">5 Questions (Standard ~10m)</option>
                <option value="7">7 Questions (Deep Practice ~15m)</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleStartQuiz}
            disabled={isGenerating}
            className="btn-primary"
            style={{ padding: '0.75rem', fontSize: '0.95rem', marginTop: '0.5rem' }}
          >
            {isGenerating ? <RefreshCw className="spin" size={16} /> : <CheckSquare size={16} />}
            <span>{isGenerating ? 'Validating and Compiling Questions...' : 'Start Assessment'}</span>
          </button>
        </div>
      </div>
    );
  }

  // Active Quiz View
  const currentQuestion = assessment.questions[currentIndex];
  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--bg-panel)' }}>
      {/* Active Header with Timer & Progress */}
      <div
        style={{
          padding: '0.75rem 1.25rem',
          backgroundColor: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {assessment.title}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Question {currentIndex + 1} of {assessment.questions.length} • {answeredCount} answered
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: secondsRemaining < 180 ? 'rgba(244, 63, 94, 0.15)' : 'var(--bg-app)',
              border: `1px solid ${secondsRemaining < 180 ? 'var(--accent-rose)' : 'var(--border-subtle)'}`,
              color: secondsRemaining < 180 ? 'var(--accent-rose)' : '#ffffff',
              padding: '0.35rem 0.65rem',
              borderRadius: '0.375rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.825rem',
              fontWeight: 700,
            }}
          >
            <Clock size={14} />
            <span>{formatTimer(secondsRemaining)}</span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn-primary"
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
          >
            {isSubmitting ? 'Grading...' : 'Submit Assessment'}
          </button>
        </div>
      </div>

      {/* Question Canvas */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', maxWidth: '52rem', margin: '0 auto', width: '100%' }}>
        {/* Topic Tag & Difficulty */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <span className="badge badge-indigo">{currentQuestion.topic_tag}</span>
          <span className="badge badge-blue">{currentQuestion.difficulty}</span>
          <span className="badge badge-emerald">
            {currentQuestion.question_type === 'mcq'
              ? 'Multiple Choice'
              : currentQuestion.question_type === 'numerical'
              ? 'Numerical Calculation'
              : 'Short Answer'}
          </span>
        </div>

        {/* Question Text */}
        <h3
          style={{
            fontSize: '1.15rem',
            fontWeight: 700,
            lineHeight: 1.5,
            color: '#f8fafc',
            marginBottom: '1.5rem',
          }}
        >
          {currentQuestion.question_text}
        </h3>

        {/* Answer Options by Type */}
        {currentQuestion.question_type === 'mcq' && currentQuestion.options && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {currentQuestion.options.map((opt) => {
              const isSelected = selectedAnswers[currentQuestion.id] === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectAnswer(currentQuestion.id, opt.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.85rem',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-card)',
                    border: `1.5px solid ${isSelected ? 'var(--accent-indigo)' : 'var(--border-subtle)'}`,
                    color: '#ffffff',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      width: '1.6rem',
                      height: '1.6rem',
                      borderRadius: '50%',
                      backgroundColor: isSelected ? 'var(--accent-indigo)' : 'var(--bg-app)',
                      border: `1px solid ${isSelected ? 'var(--accent-indigo)' : 'var(--border-subtle)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      color: isSelected ? '#ffffff' : 'var(--text-muted)',
                      flexShrink: 0,
                    }}
                  >
                    {opt.id}
                  </div>
                  <div style={{ fontSize: '0.875rem', lineHeight: 1.4 }}>{opt.text}</div>
                </button>
              );
            })}
          </div>
        )}

        {currentQuestion.question_type === 'numerical' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div
              style={{
                padding: '0.85rem',
                backgroundColor: 'var(--bg-card)',
                borderRadius: '0.5rem',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
              }}
            >
              <Calculator size={16} style={{ color: 'var(--accent-cyan)' }} />
              <span>Enter the calculated numerical value (integer or decimal).</span>
            </div>

            <input
              type="text"
              value={selectedAnswers[currentQuestion.id] || ''}
              onChange={(e) => handleSelectAnswer(currentQuestion.id, e.target.value)}
              placeholder="e.g. 4 or 10..."
              style={{
                width: '100%',
                padding: '0.85rem 1rem',
                backgroundColor: 'var(--bg-card)',
                border: '1.5px solid var(--border-subtle)',
                borderRadius: '0.5rem',
                color: '#ffffff',
                fontSize: '1rem',
                fontWeight: 600,
                outline: 'none',
              }}
            />
          </div>
        )}

        {currentQuestion.question_type === 'short_answer' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <textarea
              rows={4}
              value={selectedAnswers[currentQuestion.id] || ''}
              onChange={(e) => handleSelectAnswer(currentQuestion.id, e.target.value)}
              placeholder="Explain the mechanism concisely using core concepts..."
              style={{
                width: '100%',
                padding: '0.85rem',
                backgroundColor: 'var(--bg-card)',
                border: '1.5px solid var(--border-subtle)',
                borderRadius: '0.5rem',
                color: '#ffffff',
                fontSize: '0.875rem',
                lineHeight: 1.5,
                outline: 'none',
                resize: 'vertical',
              }}
            />
          </div>
        )}

        {/* Question Footer Navigation */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '2rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <button
            onClick={() => setCurrentIndex((idx) => Math.max(0, idx - 1))}
            disabled={currentIndex === 0}
            className="btn-secondary"
            style={{ opacity: currentIndex === 0 ? 0.4 : 1 }}
          >
            <ArrowLeft size={15} />
            <span>Previous</span>
          </button>

          {currentIndex < assessment.questions.length - 1 ? (
            <button
              onClick={() => setCurrentIndex((idx) => Math.min(assessment.questions.length - 1, idx + 1))}
              className="btn-primary"
            >
              <span>Next Question</span>
              <ArrowRight size={15} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn-primary"
              style={{ backgroundColor: 'var(--accent-emerald)' }}
            >
              <CheckCircle2 size={15} />
              <span>Complete & Submit</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
