import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LEARNING_API_BASE } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import {
  RotateCw,
  Headphones,
  Calendar,
  Sparkles,
  Play,
  Pause,
  Layers,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  CalendarDays
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from 'recharts';

interface Flashcard {
  id: string;
  topicName: string;
  conceptName: string;
  frontPrompt: string;
  backExplanation: string;
  keyFormulaOrCode: string;
  sourceCitation: string;
  intervalDays: number;
}

interface AudioBrief {
  id: string;
  topicName: string;
  title: string;
  durationFormatted: string;
  transcript: string;
  sourceCitation: string;
}

interface SlideSummary {
  topicName: string;
  title: string;
  sourceCitation: string;
  keyBulletPoints: string[];
  diagramCaption?: string;
  visualDataUrl?: string;
}

interface StudySchedule {
  examName: string;
  daysRemainingUntilExam: number;
  currentOverallMastery: number;
  projectedExamDayRetention: number;
  dailyPlans: Array<{
    dayNumber: number;
    dateString: string;
    focusTopic: string;
    focusTopicCategory: string;
    currentMastery: number;
    estimatedMinutes: number;
    recommendedFormat: string;
    highYieldConcepts: string[];
  }>;
  retentionCurve: Array<{
    day: number;
    baselineRetentionWithoutReview: number;
    optimizedRetentionWithSpacedReview: number;
  }>;
}

export const RevisionStudioPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'FLASHCARDS' | 'AUDIO_BRIEFS' | 'STUDY_SCHEDULE' | 'SLIDE_SUMMARIES'>('FLASHCARDS');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const [audioBriefs, setAudioBriefs] = useState<AudioBrief[]>([]);
  const [activeAudioIdx, setActiveAudioIdx] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const [slideSummaries, setSlideSummaries] = useState<SlideSummary[]>([]);
  const [schedule, setSchedule] = useState<StudySchedule | null>(null);

  const [examDays] = useState(14);
  const [examName] = useState('Distributed Systems & Algorithms Final Assessment');

  const navigate = useNavigate();
  const { user } = useAuth();
  const activeUserId = user?.username || 'candidate';
  const API_BASE = LEARNING_API_BASE;

  useEffect(() => {
    fetchRevisionData();
  }, [activeUserId]);

  const fetchRevisionData = async () => {
    try {
      const [revRes, schedRes] = await Promise.all([
        axios.get(`${API_BASE}/revision/material?userId=${encodeURIComponent(activeUserId)}`),
        axios.get(`${API_BASE}/revision/schedule?userId=${encodeURIComponent(activeUserId)}&days=${examDays}&examName=${encodeURIComponent(examName)}`)
      ]);

      if (revRes.data) {
        setFlashcards(revRes.data.flashcards || []);
        setAudioBriefs(revRes.data.audioBriefs || []);
        setSlideSummaries(revRes.data.slideSummaries || []);
      }
      if (schedRes.data) {
        setSchedule(schedRes.data);
      }
    } catch (err) {
      console.error("Failed to load revision materials:", err);
    }
  };

  const handleNextCard = () => {
    setIsFlipped(false);
    setCurrentCardIdx((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setCurrentCardIdx((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const handlePlayAudio = (brief: AudioBrief) => {
    if ('speechSynthesis' in window) {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(brief.transcript);
      utterance.rate = 1.05;
      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const activeCard = flashcards[currentCardIdx];
  const activeAudio = audioBriefs[activeAudioIdx];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* HEADER BANNER */}
      <div className="glass-panel p-6 rounded-xl border border-brand-cyan/20 bg-gradient-to-r from-brand-cyan/5 via-transparent to-brand-violet/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-brand-cyan uppercase tracking-wider mb-1">
            <Sparkles size={14} />
            <span>Requirements 6B & 6C: Targeted Revision & Forgetting Curves</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-100 tracking-tight">
            Targeted Revision Studio & Spaced Schedule
          </h1>
          <p className="text-xs md:text-sm text-zinc-400 mt-1 max-w-2xl">
            Custom-generated flashcards, slide summaries, and audio briefs calibrated to your weakest topics. Powered by Ebbinghaus forgetting curve modeling before exam dates.
          </p>
        </div>

        {/* REVISION MODALITY SELECTOR */}
        <div className="flex items-center space-x-1.5 bg-background-panel border border-border p-1.5 rounded-xl shrink-0">
          <button
            onClick={() => setActiveTab('FLASHCARDS')}
            className={`px-3 py-2 rounded-lg text-xs font-mono transition flex items-center space-x-1.5 ${
              activeTab === 'FLASHCARDS'
                ? 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40 font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <RotateCw size={14} />
            <span>Flashcards</span>
          </button>

          <button
            onClick={() => setActiveTab('AUDIO_BRIEFS')}
            className={`px-3 py-2 rounded-lg text-xs font-mono transition flex items-center space-x-1.5 ${
              activeTab === 'AUDIO_BRIEFS'
                ? 'bg-brand-violet/20 text-brand-violet border border-brand-violet/40 font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Headphones size={14} />
            <span>Audio Briefs</span>
          </button>

          <button
            onClick={() => setActiveTab('SLIDE_SUMMARIES')}
            className={`px-3 py-2 rounded-lg text-xs font-mono transition flex items-center space-x-1.5 ${
              activeTab === 'SLIDE_SUMMARIES'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers size={14} />
            <span>Slide Summaries</span>
          </button>

          <button
            onClick={() => setActiveTab('STUDY_SCHEDULE')}
            className={`px-3 py-2 rounded-lg text-xs font-mono transition flex items-center space-x-1.5 ${
              activeTab === 'STUDY_SCHEDULE'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Calendar size={14} />
            <span>Study Calendar</span>
          </button>
        </div>
      </div>

      {/* 1. FLASHCARDS STUDIO (Requirement 6b) */}
      {activeTab === 'FLASHCARDS' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>WEAK TOPIC REVISION DECK</span>
            <span>CARD {flashcards.length > 0 ? currentCardIdx + 1 : 0} OF {flashcards.length}</span>
          </div>

          {activeCard ? (
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="relative h-96 w-full cursor-pointer perspective-1000 group"
            >
              <div className={`w-full h-full glass-panel rounded-2xl border p-8 flex flex-col justify-between transition-all duration-500 transform ${
                isFlipped
                  ? 'border-brand-violet/50 bg-gradient-to-br from-zinc-950 via-zinc-900 to-brand-violet/10'
                  : 'border-brand-cyan/40 bg-zinc-950 hover:border-brand-cyan'
              }`}>
                {/* Card Header */}
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <span className="text-xs font-mono text-brand-cyan font-bold">{activeCard.topicName}</span>
                  <span className="text-[10px] font-mono text-zinc-500">{activeCard.sourceCitation}</span>
                </div>

                {/* Card Content (Front vs Back) */}
                <div className="py-6 text-center space-y-4">
                  {!isFlipped ? (
                    <div className="space-y-3">
                      <span className="text-[11px] font-mono text-brand-cyan uppercase tracking-wider block">PROMPT / CHALLENGE</span>
                      <h3 className="text-lg md:text-xl font-bold font-sans text-zinc-100 leading-relaxed">
                        {activeCard.frontPrompt}
                      </h3>
                      <p className="text-xs font-mono text-zinc-500 pt-4">Click anywhere to flip and reveal answer</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <span className="text-[11px] font-mono text-brand-violet uppercase tracking-wider block">VERIFIED EXPLANATION & INVARIANT</span>
                      <p className="text-sm font-sans text-zinc-200 leading-relaxed">
                        {activeCard.backExplanation}
                      </p>
                      <div className="p-3 rounded-lg bg-brand-violet/10 border border-brand-violet/20 font-mono text-xs text-brand-violet">
                        Key Invariant: {activeCard.keyFormulaOrCode}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between text-xs font-mono text-zinc-500 pt-3 border-t border-border/50">
                  <span>Concept: {activeCard.conceptName}</span>
                  <span>{isFlipped ? 'Click to flip to front' : 'Click to inspect back'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-12 rounded-xl text-center text-zinc-500 font-mono text-xs">
              No flashcards available. Complete a diagnostic assessment to generate weak-topic cards.
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handlePrevCard}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 font-mono text-xs hover:bg-zinc-700 transition"
            >
              <ChevronLeft size={16} />
              <span>PREVIOUS</span>
            </button>

            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="px-6 py-2.5 rounded-xl bg-brand-cyan/20 border border-brand-cyan/40 text-brand-cyan font-mono text-xs font-bold hover:bg-brand-cyan/30 transition"
            >
              {isFlipped ? 'SHOW QUESTION' : 'FLIP CARD'}
            </button>

            <button
              onClick={handleNextCard}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 font-mono text-xs hover:bg-zinc-700 transition"
            >
              <span>NEXT</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* 2. AUDIO BRIEFS & PODCASTS (Requirement 6b) */}
      {activeTab === 'AUDIO_BRIEFS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-3">
            <span className="text-xs font-mono text-zinc-400 uppercase font-bold block">
              AVAILABLE 60-SECOND REVISION BRIEFS ({audioBriefs.length})
            </span>
            <div className="space-y-2.5">
              {audioBriefs.map((b, idx) => (
                <div
                  key={b.id}
                  onClick={() => { setActiveAudioIdx(idx); setIsPlayingAudio(false); }}
                  className={`p-4 rounded-xl border transition cursor-pointer text-left ${
                    activeAudioIdx === idx
                      ? 'bg-background-panel border-brand-violet text-zinc-100 shadow-md shadow-brand-violet/10'
                      : 'bg-background-panel/50 border-border text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mb-1">
                    <span className="text-brand-violet font-bold">{b.topicName}</span>
                    <span>{b.durationFormatted}</span>
                  </div>
                  <h4 className="text-xs font-bold text-zinc-200">{b.title}</h4>
                  <p className="text-[11px] text-zinc-500 mt-1">{b.sourceCitation}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7">
            {activeAudio ? (
              <div className="glass-panel p-6 rounded-2xl border border-border space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <span className="text-xs font-mono text-brand-violet font-bold">{activeAudio.topicName}</span>
                    <h3 className="text-lg font-bold text-zinc-100 mt-1">{activeAudio.title}</h3>
                    <p className="text-xs font-mono text-zinc-500 mt-0.5">{activeAudio.sourceCitation}</p>
                  </div>
                  <span className="text-xs font-mono text-zinc-400 bg-zinc-900 px-3 py-1 rounded border border-zinc-800">
                    {activeAudio.durationFormatted}
                  </span>
                </div>

                {/* Animated Waveform Visualizer */}
                <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col items-center justify-center space-y-4">
                  <div className="flex items-end justify-center h-14 space-x-1 w-full max-w-md">
                    {[30, 60, 45, 80, 95, 60, 40, 75, 90, 50, 65, 85, 40, 30, 55, 70, 90, 60, 45, 30].map((h, i) => (
                      <div
                        key={i}
                        className={`w-2 rounded-t transition-all duration-300 ${
                          isPlayingAudio ? 'bg-brand-violet animate-pulse' : 'bg-zinc-700'
                        }`}
                        style={{ height: isPlayingAudio ? `${h}%` : '20%' }}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => handlePlayAudio(activeAudio)}
                    className="flex items-center space-x-2 px-6 py-3 rounded-full bg-brand-violet text-white font-mono text-xs font-bold hover:bg-brand-violet/90 transition shadow-lg shadow-brand-violet/20"
                  >
                    {isPlayingAudio ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                    <span>{isPlayingAudio ? 'PAUSE NARRATION' : 'PLAY AUDIO BRIEF'}</span>
                  </button>
                </div>

                {/* Transcript */}
                <div className="space-y-2">
                  <span className="text-xs font-mono text-zinc-400 uppercase font-bold block">
                    AUDIO BRIEF NARRATION TRANSCRIPT
                  </span>
                  <div className="p-4 rounded-xl bg-background-panel border border-border text-xs text-zinc-300 font-sans leading-relaxed">
                    {activeAudio.transcript}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* 3. SLIDE SUMMARIES (Requirement 6b) */}
      {activeTab === 'SLIDE_SUMMARIES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {slideSummaries.map((ss, idx) => (
            <div key={idx} className="glass-panel p-6 rounded-2xl border border-border space-y-4 text-xs font-sans">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="font-mono text-emerald-400 font-bold">{ss.topicName}</span>
                <span className="font-mono text-zinc-500 text-[11px]">{ss.sourceCitation}</span>
              </div>

              <h4 className="text-sm font-bold text-zinc-100 font-mono">{ss.title}</h4>

              {ss.visualDataUrl && (
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex justify-center">
                  <img src={ss.visualDataUrl} alt="Diagram" className="max-h-40 w-auto rounded" />
                </div>
              )}

              <ul className="space-y-2 text-zinc-300">
                {ss.keyBulletPoints.map((bp, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>{bp}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* 4. EBBINGHAUS SPACING STUDY SCHEDULE (Requirement 6c) */}
      {activeTab === 'STUDY_SCHEDULE' && schedule && (
        <div className="space-y-6">
          {/* INTERACTIVE CALENDAR LAUNCH BANNER */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-cyan/15 via-brand-violet/15 to-transparent border border-brand-cyan/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-brand-cyan/20 border border-brand-cyan/40 text-brand-cyan">
                <CalendarDays size={24} />
              </div>
              <div>
                <h4 className="text-sm font-bold font-mono text-zinc-100">
                  Full Interactive Study Calendar & Milestone Planner
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Click any date to view scheduled events, add sessions, and track spaced repetition milestones.
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/calendar')}
              className="px-4 py-2 rounded-xl bg-brand-cyan text-zinc-950 font-mono text-xs font-bold hover:bg-brand-cyan/90 transition shadow-lg shadow-brand-cyan/20 flex items-center space-x-2 shrink-0"
            >
              <Calendar size={14} />
              <span>Open Study Calendar</span>
            </button>
          </div>

          {/* RETENTION DECAY VS SPACED REVISION CHART */}
          <div className="glass-panel p-6 rounded-2xl border border-border space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono text-amber-400 font-bold uppercase">
                  EBBINGHAUS FORGETTING CURVE RETENTION MODEL (R = e^-t/S)
                </span>
                <h3 className="text-lg font-bold font-mono text-zinc-100 mt-0.5">
                  Retention Decay vs Spaced Review Milestones
                </h3>
              </div>

              <div className="flex items-center space-x-6 text-xs font-mono">
                <div>
                  <span className="text-zinc-500 block">DAYS UNTIL EXAM</span>
                  <span className="text-lg font-bold text-zinc-200">{schedule.daysRemainingUntilExam} Days</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">EXAM DAY RETENTION</span>
                  <span className="text-lg font-bold text-emerald-400">
                    {(schedule.projectedExamDayRetention * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={schedule.retentionCurve}>
                  <defs>
                    <linearGradient id="optColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="baseColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="day" stroke="#71717a" fontSize={11} label={{ value: 'Days Passed', position: 'insideBottom', offset: -4, fill: '#71717a' }} />
                  <YAxis stroke="#71717a" fontSize={11} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#090d16', border: '1px solid #27272a', borderRadius: '8px' }}
                    labelStyle={{ color: '#22d3ee', fontFamily: 'monospace' }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="optimizedRetentionWithSpacedReview"
                    name="Spaced Repetition Review (%)"
                    stroke="#10b981"
                    fill="url(#optColor)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="baselineRetentionWithoutReview"
                    name="Passive Decay Without Review (%)"
                    stroke="#ef4444"
                    fill="url(#baseColor)"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* DAY-BY-DAY MILESTONE SCHEDULE */}
          <div className="space-y-3">
            <span className="text-xs font-mono text-zinc-400 uppercase font-bold block">
              TARGETED STUDY MILESTONES (EXAM: {schedule.examName.toUpperCase()})
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {schedule.dailyPlans.map((plan) => (
                <div key={plan.dayNumber} className="glass-panel p-4 rounded-xl border border-border space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between text-zinc-500">
                    <span className="font-bold text-brand-cyan">DAY {plan.dayNumber} • {plan.dateString}</span>
                    <span className="flex items-center space-x-1 text-zinc-400">
                      <Clock size={12} />
                      <span>{plan.estimatedMinutes} mins</span>
                    </span>
                  </div>

                  <h4 className="text-zinc-200 font-bold truncate">{plan.focusTopic}</h4>

                  <div className="flex items-center justify-between pt-1">
                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-300">
                      Format: {plan.recommendedFormat}
                    </span>
                    <span className="text-[10px] text-amber-400">
                      Prior: {(plan.currentMastery * 100).toFixed(0)}%
                    </span>
                  </div>

                  <div className="pt-2 border-t border-border/50 text-[11px] text-zinc-400 font-sans">
                    <span className="font-mono text-zinc-500 text-[10px] block">High-Yield Concept:</span>
                    <span>{plan.highYieldConcepts[0]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
