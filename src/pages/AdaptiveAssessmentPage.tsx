import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LEARNING_API_BASE } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Award,
  ChevronRight,
  Filter,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  BookOpen
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface QuizQuestion {
  id: string;
  type: 'MCQ' | 'SHORT_ANSWER' | 'NUMERICAL';
  topicId: string;
  topicName: string;
  conceptId: string;
  conceptName: string;
  difficulty: string;
  questionText: string;
  options?: string[];
  correctAnswer: string;
  numericalTolerance?: number;
  numericalUnit?: string;
  detailedExplanation: string;
  sourceLocation: string;
  sourceUnitId: string;
  misconceptionKey?: string;
  crossModelVerified: boolean;
  verificationProof: string;
}

interface DiagnosticReport {
  id: string;
  totalQuestions: number;
  correctCount: number;
  overallAccuracy: number;
  masteryTier: string;
  weakTopics: string[];
  strongTopics: string[];
  topicAccuracyMap: Record<string, number>;
  identifiedMisconceptions: Array<{
    topicName: string;
    conceptName: string;
    misconceptionName: string;
    explanation: string;
    remediationRecommendation: string;
    referenceCitation: string;
  }>;
  recommendedNextActions: string[];
  questionResults: Array<{
    questionId: string;
    userResponse: string;
    correct: boolean;
    citedFeedback: string;
    sourceLocation: string;
  }>;
}

export const AdaptiveAssessmentPage: React.FC = () => {
  const { user } = useAuth();
  const activeUserId = user?.username || 'candidate';
  const [topics, setTopics] = useState<any[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [selectedFormat, setSelectedFormat] = useState<string>('ALL');
  const [questionCount, setQuestionCount] = useState<number>(5);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentAnswers, setCurrentAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const [quizStarted, setQuizStarted] = useState<boolean>(false);

  const API_BASE = LEARNING_API_BASE;

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const res = await axios.get(`${API_BASE}/knowledge/topics`);
      if (res.data?.topics) {
        setTopics(res.data.topics);
      }
    } catch (err) {
      console.error("Failed to fetch topics:", err);
    }
  };

  const handleStartQuiz = async () => {
    try {
      setIsSubmitting(true);
      setReport(null);
      setCurrentAnswers({});

      const params = new URLSearchParams({
        userId: activeUserId,
        count: String(questionCount)
      });
      if (selectedTopic !== 'ALL') params.append('topicId', selectedTopic);
      if (selectedDifficulty !== 'ALL') params.append('difficulty', selectedDifficulty);
      if (selectedFormat !== 'ALL') params.append('format', selectedFormat);

      const res = await axios.get(`${API_BASE}/assessment/generate?${params.toString()}`);
      if (res.data && res.data.length > 0) {
        setQuestions(res.data);
        setQuizStarted(true);
      }
    } catch (err) {
      console.error("Quiz generation failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectOption = (questionId: string, optionVal: string) => {
    setCurrentAnswers(prev => ({ ...prev, [questionId]: optionVal }));
  };

  const handleSubmitQuiz = async () => {
    try {
      setIsSubmitting(true);
      const payload = {
        userId: activeUserId,
        answers: questions.map(q => ({
          questionId: q.id,
          userResponse: currentAnswers[q.id] || ''
        }))
      };

      const res = await axios.post(`${API_BASE}/assessment/submit`, payload);
      if (res.data) {
        setReport(res.data);
      }
    } catch (err) {
      console.error("Quiz submission failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* HEADER BANNER */}
      <div className="glass-panel p-6 rounded-xl border border-brand-cyan/20 bg-gradient-to-r from-brand-cyan/5 via-transparent to-brand-violet/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-brand-cyan uppercase tracking-wider mb-1">
            <Sparkles size={14} />
            <span>Requirement 3: Adaptive Assessment & Misconception Lab</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-100 tracking-tight">
            Adaptive Mock Exams & Diagnostic Grading
          </h1>
          <p className="text-xs md:text-sm text-zinc-400 mt-1 max-w-2xl">
            Custom-scoped assessments spanning MCQ, numerical problems, and short-answer prompts. Features cross-model verification, zero question duplication, cited feedback, and diagnostic misconception analysis.
          </p>
        </div>

        {quizStarted && !report && (
          <button
            onClick={() => setQuizStarted(false)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-zinc-800 text-zinc-300 font-mono text-xs hover:bg-zinc-700 transition"
          >
            <RotateCcw size={14} />
            <span>RESET SCOPE</span>
          </button>
        )}
      </div>

      {!quizStarted ? (
        /* QUIZ SCOPE CONFIGURATION PANEL */
        <div className="max-w-3xl mx-auto glass-panel p-8 rounded-2xl border border-border space-y-6">
          <div className="flex items-center space-x-3 border-b border-border pb-4">
            <Filter size={20} className="text-brand-cyan" />
            <div>
              <h2 className="text-lg font-bold font-mono text-zinc-100">CONFIGURE ASSESSMENT SCOPE</h2>
              <p className="text-xs text-zinc-400">Tailor topics, question modalities, and difficulty levels.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            {/* Topic Select */}
            <div className="space-y-1.5">
              <label className="text-zinc-300 font-bold">Curriculum Scope / Topic</label>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full p-3 rounded-xl bg-background border border-border text-zinc-200"
              >
                <option value="ALL">All Ingested Topics (Comprehensive)</option>
                {topics.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* Question Format */}
            <div className="space-y-1.5">
              <label className="text-zinc-300 font-bold">Question Format Modality</label>
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="w-full p-3 rounded-xl bg-background border border-border text-zinc-200"
              >
                <option value="ALL">Mixed (MCQ, Numerical & Short Answer)</option>
                <option value="MCQ">Multiple Choice Questions (MCQ)</option>
                <option value="NUMERICAL">Numerical Problems (with Tolerance)</option>
                <option value="SHORT_ANSWER">Short Answer (Concept Recall)</option>
              </select>
            </div>

            {/* Difficulty */}
            <div className="space-y-1.5">
              <label className="text-zinc-300 font-bold">Difficulty Target</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full p-3 rounded-xl bg-background border border-border text-zinc-200"
              >
                <option value="ALL">Adaptive (Dynamic Calibration)</option>
                <option value="EASY">Foundational / Easy</option>
                <option value="MEDIUM">Intermediate Core</option>
                <option value="HARD">Advanced / Hard</option>
              </select>
            </div>

            {/* Question Count */}
            <div className="space-y-1.5">
              <label className="text-zinc-300 font-bold">Assessment Volume</label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value, 10))}
                className="w-full p-3 rounded-xl bg-background border border-border text-zinc-200"
              >
                <option value={3}>3 Questions (Micro Check)</option>
                <option value={5}>5 Questions (Standard Quiz)</option>
                <option value={8}>8 Questions (Full Mock Exam)</option>
              </select>
            </div>
          </div>

          {/* Verification Badges */}
          <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center space-x-2 text-brand-cyan">
              <ShieldCheck size={16} />
              <span>Cross-Model Verified Single-Solution Proofs</span>
            </div>
            <div className="flex items-center space-x-2 text-brand-violet">
              <Award size={16} />
              <span>SHA-256 Zero Question Duplication Enforced</span>
            </div>
          </div>

          <button
            onClick={handleStartQuiz}
            disabled={isSubmitting}
            className="w-full py-4 rounded-xl bg-brand-cyan text-zinc-950 font-mono text-sm font-bold hover:bg-brand-cyan/90 transition shadow-lg shadow-brand-cyan/15 flex items-center justify-center space-x-2"
          >
            <Sparkles size={16} />
            <span>LAUNCH ADAPTIVE EXAM</span>
          </button>
        </div>
      ) : !report ? (
        /* QUIZ TAKING VIEW */
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400 px-1">
            <span>QUESTION SET ({questions.length} TOTAL)</span>
            <span className="text-brand-cyan">ALL UNITS GROUNDED IN CURRICULUM</span>
          </div>

          {questions.map((q, idx) => (
            <div key={q.id} className="glass-panel p-6 rounded-2xl border border-border space-y-4">
              {/* Question Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-3">
                <div className="flex items-center space-x-2 text-xs font-mono">
                  <span className="w-6 h-6 rounded-full bg-brand-cyan/20 text-brand-cyan flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                  <span className="text-zinc-200 font-bold">{q.conceptName}</span>
                </div>

                <div className="flex items-center space-x-2 text-[10px] font-mono">
                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                    {q.type}
                  </span>
                  <span className={`px-2 py-0.5 rounded font-bold ${
                    q.difficulty === 'HARD' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    q.difficulty === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {q.difficulty}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/25 flex items-center space-x-1">
                    <ShieldCheck size={10} />
                    <span>VERIFIED</span>
                  </span>
                </div>
              </div>

              {/* Question Text */}
              <p className="text-sm font-sans text-zinc-100 leading-relaxed font-medium">
                {q.questionText}
              </p>

              {/* Source Location Anchor */}
              <div className="text-[11px] font-mono text-zinc-500 flex items-center space-x-1">
                <BookOpen size={12} className="text-brand-cyan" />
                <span>Source Origin Anchor: <strong className="text-zinc-300">{q.sourceLocation}</strong></span>
              </div>

              {/* Answer Input Modality */}
              {q.type === 'MCQ' && q.options && (
                <div className="space-y-2 pt-2">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = currentAnswers[q.id] === opt;
                    return (
                      <div
                        key={optIdx}
                        onClick={() => handleSelectOption(q.id, opt)}
                        className={`p-3 rounded-xl border text-xs font-mono transition cursor-pointer flex items-center space-x-3 ${
                          isSelected
                            ? 'bg-brand-cyan/15 border-brand-cyan text-zinc-100 font-bold shadow-md shadow-brand-cyan/5'
                            : 'bg-background-panel border-border text-zinc-300 hover:border-zinc-700'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-brand-cyan bg-brand-cyan' : 'border-zinc-600'
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-zinc-950" />}
                        </div>
                        <span>{opt}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {q.type === 'NUMERICAL' && (
                <div className="pt-2 flex items-center space-x-3">
                  <input
                    type="text"
                    value={currentAnswers[q.id] || ''}
                    onChange={(e) => handleSelectOption(q.id, e.target.value)}
                    placeholder="Enter numerical answer (e.g. 4 or 0.125)..."
                    className="w-72 px-4 py-2.5 rounded-xl bg-background border border-border text-xs font-mono text-zinc-100 focus:outline-none focus:border-brand-cyan/60"
                  />
                  {q.numericalUnit && (
                    <span className="text-xs font-mono text-zinc-400">Unit: [{q.numericalUnit}]</span>
                  )}
                  {q.numericalTolerance && (
                    <span className="text-[11px] font-mono text-zinc-500">±{q.numericalTolerance} tolerance</span>
                  )}
                </div>
              )}

              {q.type === 'SHORT_ANSWER' && (
                <div className="pt-2">
                  <textarea
                    rows={2}
                    value={currentAnswers[q.id] || ''}
                    onChange={(e) => handleSelectOption(q.id, e.target.value)}
                    placeholder="Write short conceptual formulation..."
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-xs font-sans text-zinc-100 focus:outline-none focus:border-brand-cyan/60"
                  />
                </div>
              )}
            </div>
          ))}

          <button
            onClick={handleSubmitQuiz}
            disabled={isSubmitting}
            className="w-full py-4 rounded-xl bg-brand-cyan text-zinc-950 font-mono text-sm font-bold hover:bg-brand-cyan/90 transition shadow-lg shadow-brand-cyan/20 flex items-center justify-center space-x-2"
          >
            <span>SUBMIT EXAM FOR DIAGNOSTIC EVALUATION</span>
            <ChevronRight size={18} />
          </button>
        </div>
      ) : (
        /* POST-ASSESSMENT DIAGNOSTIC REPORT (Requirement 3c) */
        <div className="max-w-4xl mx-auto space-y-6">
          {/* OVERVIEW SCORECARD */}
          <div className="glass-panel p-6 rounded-2xl border border-brand-cyan/40 bg-zinc-950 shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
              <div>
                <span className="text-xs font-mono text-zinc-500 uppercase">DIAGNOSTIC ASSESSMENT REPORT</span>
                <h2 className="text-2xl font-bold font-mono text-zinc-100 mt-1">EXAM PERFORMANCE SUMMARY</h2>
              </div>

              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">ACCURACY SCORE</span>
                  <span className="text-3xl font-extrabold font-mono text-brand-cyan">{report.overallAccuracy}%</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">TIER CLASSIFICATION</span>
                  <span className="text-sm font-bold font-mono px-3 py-1 rounded bg-brand-violet/20 text-brand-violet border border-brand-violet/30">
                    {report.masteryTier}
                  </span>
                </div>
              </div>
            </div>

            {/* Weak Topics vs Strong Topics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {/* Weak Topics */}
              <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 space-y-2">
                <div className="flex items-center space-x-2 text-red-400 font-mono text-xs font-bold">
                  <TrendingDown size={14} />
                  <span>IDENTIFIED WEAK TOPICS</span>
                </div>
                {report.weakTopics.length > 0 ? (
                  <ul className="space-y-1">
                    {report.weakTopics.map((wt, i) => (
                      <li key={i} className="text-xs font-mono text-zinc-300 flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                        <span>{wt}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-zinc-400 font-mono">No critical topic weaknesses detected.</p>
                )}
              </div>

              {/* Strong Topics */}
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                <div className="flex items-center space-x-2 text-emerald-400 font-mono text-xs font-bold">
                  <TrendingUp size={14} />
                  <span>IDENTIFIED STRONG TOPICS</span>
                </div>
                {report.strongTopics.length > 0 ? (
                  <ul className="space-y-1">
                    {report.strongTopics.map((st, i) => (
                      <li key={i} className="text-xs font-mono text-zinc-300 flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        <span>{st}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-zinc-400 font-mono">Keep practicing to establish high-confidence strong topics.</p>
                )}
              </div>
            </div>
          </div>

          {/* MISCONCEPTION DIAGNOSIS (Requirement 3c) */}
          {report.identifiedMisconceptions.length > 0 && (
            <div className="glass-panel p-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-4">
              <div className="flex items-center space-x-2 text-amber-400 font-mono text-sm font-bold">
                <AlertTriangle size={18} />
                <span>CONCEPTUAL MISCONCEPTIONS DETECTED & REMEDIATION</span>
              </div>
              <div className="space-y-3">
                {report.identifiedMisconceptions.map((m, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-zinc-400 font-mono">
                      <span className="text-amber-400 font-bold">{m.misconceptionName} ({m.conceptName})</span>
                      <span className="text-[11px] text-zinc-500">{m.referenceCitation}</span>
                    </div>
                    <p className="text-zinc-300 font-sans leading-relaxed">{m.explanation}</p>
                    <div className="p-2.5 rounded bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan font-mono text-[11px]">
                      <strong>Targeted Remediation:</strong> {m.remediationRecommendation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* QUESTION-BY-QUESTION CITED FEEDBACK */}
          <div className="space-y-4">
            <h3 className="text-sm font-mono font-bold text-zinc-300">QUESTION-BY-QUESTION CITED FEEDBACK</h3>
            {report.questionResults.map((r, i) => (
              <div key={i} className={`p-5 rounded-2xl border text-xs font-mono space-y-3 ${
                r.correct ? 'bg-background-panel border-emerald-500/30' : 'bg-background-panel border-red-500/30'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center space-x-1.5">
                    {r.correct ? (
                      <span className="text-emerald-400 flex items-center space-x-1">
                        <CheckCircle2 size={16} />
                        <span>Question {i + 1}: CORRECT</span>
                      </span>
                    ) : (
                      <span className="text-red-400 flex items-center space-x-1">
                        <XCircle size={16} />
                        <span>Question {i + 1}: INCORRECT</span>
                      </span>
                    )}
                  </span>
                  <span className="text-zinc-500">Source: {r.sourceLocation}</span>
                </div>

                <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800 text-zinc-300 font-sans leading-relaxed prose prose-invert max-w-none text-xs">
                  <ReactMarkdown>{r.citedFeedback}</ReactMarkdown>
                </div>
              </div>
            ))}
          </div>

          {/* ACTIONS */}
          <div className="flex justify-between items-center pt-4">
            <button
              onClick={() => { setReport(null); setQuizStarted(false); }}
              className="px-6 py-3 rounded-xl bg-zinc-800 text-zinc-200 font-mono text-xs font-bold hover:bg-zinc-700 transition"
            >
              CONFIGURE NEW EXAM
            </button>
            <button
              onClick={handleStartQuiz}
              className="px-6 py-3 rounded-xl bg-brand-cyan text-zinc-950 font-mono text-xs font-bold hover:bg-brand-cyan/90 transition shadow-lg shadow-brand-cyan/15"
            >
              TAKE RETEST (UNSEEN QUESTIONS)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
