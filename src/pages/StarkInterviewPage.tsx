import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CS_CATEGORIES,
  generateStarkInterviewPlan,
  generateNextDynamicQuestion,
  evaluateCandidateSpeechAnswer,
  generateFinalStarkReport,
  type StarkInterviewSession,
  type StarkEvaluation
} from '../lib/starkInterviewService';
import {
  generateElsaAiIntro,
  generateElsaAiNextQuestion,
  evaluateElsaAiAnswer,
  generateElsaAiFinalReport
} from '../lib/elsaAiEngine';
import { speakElsa } from '../lib/elsaVoice';
import { StarkSplineView } from '../components/stark/StarkSplineView';
import { StarkDiagnostics } from '../components/stark/StarkDiagnostics';
import { recordStreakActivity } from '../lib/streakService';
import { useAuth } from '../context/AuthContext';
import {
  Binary,
  Cpu,
  Network,
  Database,
  LayoutGrid,
  BrainCircuit,
  Sparkles,
  Layers,
  Cloud,
  Shield,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Volume2,
  VolumeX,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Flame,
  Award,
  Activity,
  FileText,
  Clock,
  Radio,
  Send,
  HelpCircle,
  BarChart3,
  Maximize2,
  AlertTriangle,
  Calculator,
  Hash,
  UserCheck
} from 'lucide-react';
import {
  mongoService,
  computeScoreFormulaBreakdown,
  type FormulaBreakdown,
  type MongoInterviewAutopsy
} from '../lib/mongoService';

export const StarkInterviewPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Candidate Display Name Configuration (Adapts uniquely to active user)
  const [candidateDisplayName, setCandidateDisplayName] = useState<string>(
    user?.fullName || user?.username || 'Candidate'
  );
  const [scoreFormulaBreakdown, setScoreFormulaBreakdown] = useState<FormulaBreakdown | null>(null);

  useEffect(() => {
    if (user?.fullName || user?.username) {
      setCandidateDisplayName(user.fullName || user.username);
    }
  }, [user]);

  // Workflow Stages: 'setup' | 'diagnostics' | 'interview' | 'report'
  const [stage, setStage] = useState<'setup' | 'diagnostics' | 'interview' | 'report'>('setup');

  // Configuration State
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([
    'dsa',
    'os',
    'cn',
    'system_design'
  ]);
  const [experienceLevel, setExperienceLevel] = useState<'junior' | 'mid' | 'senior' | 'staff'>('mid');
  const [durationMinutes, setDurationMinutes] = useState<number>(15);

  // Active Media Stream
  const [activeMediaStream, setActiveMediaStream] = useState<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState<boolean>(true);
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Fullscreen Enforcement State
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showFullscreenWarning, setShowFullscreenWarning] = useState<boolean>(false);

  // Interview Engine State
  const [session, setSession] = useState<StarkInterviewSession | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isStarkSpeaking, setIsStarkSpeaking] = useState<boolean>(false);
  const [isStarkThinking, setIsStarkThinking] = useState<boolean>(false);
  const [isCandidateListening, setIsCandidateListening] = useState<boolean>(false);
  const [speechTranscript, setSpeechTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [isMutedTts, setIsMutedTts] = useState<boolean>(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(15 * 60);
  const [micAudioLevel, setMicAudioLevel] = useState<number>(0);

  // Word-by-Word Teleprompter State
  const [displayedWordsCount, setDisplayedWordsCount] = useState<number>(0);
  const wordStreamTimerRef = useRef<any>(null);

  // Evaluation Report
  const [finalReport, setFinalReport] = useState<StarkEvaluation | null>(null);

  // Refs for Speech Engine & Audio Analyzers
  const recognitionInstanceRef = useRef<any>(null);
  const isCandidateListeningRef = useRef<boolean>(false);
  const shouldListenRef = useRef<boolean>(false);
  const isStarkSpeakingRef = useRef<boolean>(false);
  const interimTranscriptRef = useRef<string>('');
  const countdownIntervalRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Icon Mapping Helper
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Binary': return <Binary size={18} className="text-cyan-400" />;
      case 'Cpu': return <Cpu size={18} className="text-purple-400" />;
      case 'Network': return <Network size={18} className="text-emerald-400" />;
      case 'Database': return <Database size={18} className="text-amber-400" />;
      case 'LayoutGrid': return <LayoutGrid size={18} className="text-blue-400" />;
      case 'BrainCircuit': return <BrainCircuit size={18} className="text-fuchsia-400" />;
      case 'Sparkles': return <Sparkles size={18} className="text-yellow-400" />;
      case 'Layers': return <Layers size={18} className="text-rose-400" />;
      case 'Cloud': return <Cloud size={18} className="text-sky-400" />;
      case 'Shield': return <Shield size={18} className="text-red-400" />;
      default: return <BrainCircuit size={18} className="text-cyan-400" />;
    }
  };

  // Toggle Category Selection
  const toggleCategory = (id: string) => {
    setSelectedCategoryIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev;
        return prev.filter((c) => c !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const selectAllCategories = () => {
    setSelectedCategoryIds(CS_CATEGORIES.map((c) => c.id));
  };

  const selectCoreCategories = () => {
    setSelectedCategoryIds(['dsa', 'os', 'cn', 'dbms']);
  };

  // ----------------------------------------------------
  // FULLSCREEN & KEYBOARD (ESC DISABLE) ENFORCEMENT
  // ----------------------------------------------------
  const enterFullscreen = () => {
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(() => {});
      } else if ((elem as any).webkitRequestFullscreen) {
        (elem as any).webkitRequestFullscreen();
      }
      setIsFullscreen(true);
      setShowFullscreenWarning(false);
    } catch (e) {
      console.warn('Fullscreen request error:', e);
    }
  };

  useEffect(() => {
    if (stage !== 'interview') return;

    // Trigger fullscreen automatically
    enterFullscreen();

    const handleFullscreenChange = () => {
      const inFull = !!document.fullscreenElement || !!(document as any).webkitFullscreenElement;
      setIsFullscreen(inFull);
      if (!inFull && stage === 'interview') {
        setShowFullscreenWarning(true);
      } else {
        setShowFullscreenWarning(false);
      }
    };

    // Intercept Escape key & functional navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.code === 'Escape' || e.keyCode === 27) {
        e.preventDefault();
        e.stopPropagation();
        if (!document.fullscreenElement) {
          enterFullscreen();
        }
      }
    };

    // Warn before closing tab or navigating away
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Live Elsa technical interview in progress. Are you sure you wish to exit?';
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [stage]);

  // ----------------------------------------------------
  // DIAGNOSTICS & HARDWARE COMPLETION
  // ----------------------------------------------------
  const handleDiagnosticsComplete = (stream: MediaStream | null) => {
    setActiveMediaStream(stream);
    setStage('interview');
    enterFullscreen();
    initializeInterview();
  };

  // Fallback: Ensure activeMediaStream is initialized if candidate enters interview directly
  useEffect(() => {
    if (stage !== 'interview') return;

    if (!activeMediaStream || !activeMediaStream.active || activeMediaStream.getTracks().length === 0) {
      navigator.mediaDevices
        ?.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        })
        .then((stream) => {
          setActiveMediaStream(stream);
        })
        .catch((err) => {
          console.warn('Video+audio stream error, attempting audio-only fallback:', err);
          navigator.mediaDevices
            ?.getUserMedia({ audio: true })
            .then((audioStream) => {
              setActiveMediaStream(audioStream);
            })
            .catch((audioErr) => {
              console.warn('Microphone stream access error:', audioErr);
            });
        });
    }
  }, [stage, activeMediaStream]);

  // Attach video stream to candidate video element
  useEffect(() => {
    if (stage === 'interview' && videoRef.current && activeMediaStream) {
      videoRef.current.srcObject = activeMediaStream;
    }
  }, [stage, activeMediaStream, isCameraOn]);

  // Audio VU Meter & Real-time Spectrum Analyzer for candidate microphone
  useEffect(() => {
    if (stage !== 'interview' || !activeMediaStream || isMicMuted) return;

    let localAudioCtx: AudioContext | null = null;
    let isCancelled = false;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      localAudioCtx = new AudioContextClass();
      audioContextRef.current = localAudioCtx;

      // Resume context if suspended (crucial for Chrome / modern browser autoplay policy)
      if (localAudioCtx.state === 'suspended') {
        localAudioCtx.resume().catch(() => {});
      }

      // Resume context on any user interaction in window
      const handleUserGesture = () => {
        if (localAudioCtx && localAudioCtx.state === 'suspended') {
          localAudioCtx.resume().catch(() => {});
        }
      };
      window.addEventListener('click', handleUserGesture, { once: true });
      window.addEventListener('keydown', handleUserGesture, { once: true });

      const audioTracks = activeMediaStream.getAudioTracks();
      if (audioTracks.length === 0 || !audioTracks[0].enabled) {
        return;
      }

      const analyser = localAudioCtx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.35;

      const source = localAudioCtx.createMediaStreamSource(activeMediaStream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateLevel = () => {
        if (isCancelled) return;
        analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        let peak = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
          if (dataArray[i] > peak) peak = dataArray[i];
        }
        const avg = sum / dataArray.length;
        // Sensitive calibration so normal speech creates responsive 20-95% VU waves
        const normalized = Math.min(100, Math.round(((avg * 1.6 + peak * 0.4) / 20) * 10));
        setMicAudioLevel(normalized);

        animFrameRef.current = requestAnimationFrame(updateLevel);
      };

      animFrameRef.current = requestAnimationFrame(updateLevel);
    } catch (e) {
      console.warn('Live mic analyser error:', e);
    }

    return () => {
      isCancelled = true;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (localAudioCtx && localAudioCtx.state !== 'closed') {
        localAudioCtx.close().catch(() => {});
      }
    };
  }, [stage, activeMediaStream, isMicMuted]);

  // ----------------------------------------------------
  // WORD-BY-WORD STREAMING TELEPROMPTER & ELSA TTS
  // ----------------------------------------------------
  const streamQuestionWordByWord = (fullText: string) => {
    if (wordStreamTimerRef.current) {
      clearInterval(wordStreamTimerRef.current);
    }

    const words = fullText.split(/\s+/).filter(Boolean);
    setDisplayedWordsCount(0);

    let current = 0;
    // Word-by-word streaming interval: 80ms per word
    wordStreamTimerRef.current = setInterval(() => {
      current++;
      setDisplayedWordsCount(current);
      if (current >= words.length) {
        clearInterval(wordStreamTimerRef.current);
      }
    }, 80);
  };

  const speakElsaQuestion = (text: string) => {
    // Start word-by-word streaming teleprompter
    streamQuestionWordByWord(text);

    // Stop candidate speech recognition while Elsa is speaking so mic does not echo
    stopCandidateSpeechRecognition();

    if (isMutedTts || !('speechSynthesis' in window)) {
      setIsStarkSpeaking(false);
      isStarkSpeakingRef.current = false;
      setTimeout(() => {
        startCandidateSpeechRecognition();
      }, 300);
      return;
    }

    speakElsa(text, {
      onStart: () => {
        setIsStarkSpeaking(true);
        isStarkSpeakingRef.current = true;
      },
      onEnd: () => {
        setIsStarkSpeaking(false);
        isStarkSpeakingRef.current = false;
        setTimeout(() => {
          startCandidateSpeechRecognition();
        }, 150);
      },
      onError: (err) => {
        console.warn('[Elsa TTS] Synthesis event:', err);
        setIsStarkSpeaking(false);
        isStarkSpeakingRef.current = false;
        startCandidateSpeechRecognition();
      }
    });
  };

  // ----------------------------------------------------
  // CONTINUOUS CANDIDATE SPEECH RECOGNITION (STT)
  // ----------------------------------------------------
  const startCandidateSpeechRecognition = (forceStart: boolean = false) => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('SpeechRecognition API not available in this browser environment.');
      return;
    }

    if (forceStart) {
      // Force cancel any ongoing speech if user clicks Start Dictation
      window.speechSynthesis?.cancel();
      setIsStarkSpeaking(false);
      isStarkSpeakingRef.current = false;
    } else if (isStarkSpeakingRef.current) {
      // Do not listen while Elsa is narrating question unless force-started
      return;
    }

    shouldListenRef.current = true;

    // Abort previous instance to ensure fresh Web Speech lifecycle
    if (recognitionInstanceRef.current) {
      try {
        recognitionInstanceRef.current.abort();
      } catch {}
      recognitionInstanceRef.current = null;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        isCandidateListeningRef.current = true;
        setIsCandidateListening(true);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let finalChunk = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const segment = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalChunk += segment + ' ';
          } else {
            interim += segment;
          }
        }

        if (finalChunk.trim()) {
          const cleanFinal = finalChunk.trim();
          setSpeechTranscript((prev) => (prev ? `${prev} ${cleanFinal}` : cleanFinal));
          interimTranscriptRef.current = '';
          setInterimTranscript('');
        } else if (interim) {
          interimTranscriptRef.current = interim;
          setInterimTranscript(interim);
        }

        // Live voice detection boost for visual VU meters
        setMicAudioLevel((prev) => Math.max(prev, 35));
      };

      recognition.onerror = (event: any) => {
        console.warn('STT recognition event:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          shouldListenRef.current = false;
          isCandidateListeningRef.current = false;
          setIsCandidateListening(false);
        }
      };

      recognition.onend = () => {
        isCandidateListeningRef.current = false;
        // Commit any pending interim words to final transcript
        if (interimTranscriptRef.current && interimTranscriptRef.current.trim()) {
          const pending = interimTranscriptRef.current.trim();
          setSpeechTranscript((prev) => (prev ? `${prev} ${pending}` : pending));
          interimTranscriptRef.current = '';
          setInterimTranscript('');
        }

        // Auto-restart with a brand NEW recognition instance to bypass Chromium silence timeouts
        if (shouldListenRef.current && stage === 'interview' && !isStarkSpeakingRef.current) {
          setTimeout(() => {
            if (shouldListenRef.current && stage === 'interview' && !isStarkSpeakingRef.current) {
              startCandidateSpeechRecognition();
            }
          }, 180);
        } else {
          setIsCandidateListening(false);
        }
      };

      recognition.start();
      recognitionInstanceRef.current = recognition;
      isCandidateListeningRef.current = true;
      setIsCandidateListening(true);
    } catch (err) {
      console.warn('SpeechRecognition start error:', err);
      isCandidateListeningRef.current = false;
      setIsCandidateListening(false);
    }
  };

  const stopCandidateSpeechRecognition = () => {
    shouldListenRef.current = false;
    isCandidateListeningRef.current = false;
    setIsCandidateListening(false);
    if (recognitionInstanceRef.current) {
      try {
        recognitionInstanceRef.current.stop();
      } catch {}
      recognitionInstanceRef.current = null;
    }
  };

  // ----------------------------------------------------
  // INITIALIZE INTERVIEW FLOW (POWERED BY REAL AI)
  // ----------------------------------------------------
  const initializeInterview = async () => {
    const candidateName = candidateDisplayName.trim() || user?.fullName || user?.username || 'Candidate';
    const totalSecs = durationMinutes * 60;

    const initialPlan = generateStarkInterviewPlan(
      candidateName,
      selectedCategoryIds,
      experienceLevel,
      durationMinutes
    );

    const newSession: StarkInterviewSession = {
      sessionId: 'elsa-' + Date.now(),
      candidateName,
      targetRole: user?.targetRole || 'Software Engineer',
      experienceLevel,
      selectedCategories: selectedCategoryIds,
      durationMinutes,
      totalTimeSeconds: totalSecs,
      currentQuestionIndex: 0,
      questions: initialPlan,
      transcripts: [],
      startedAt: new Date().toISOString()
    };

    setSession(newSession);
    setCurrentIndex(0);
    setSpeechTranscript('');
    setInterimTranscript('');
    setRemainingSeconds(totalSecs);

    // Persist behavior and candidate log to MongoDB
    mongoService.logUserBehavior(
      'INTERVIEW_STARTED',
      '/elsa',
      {
        candidateName,
        categories: selectedCategoryIds,
        durationMinutes,
        experienceLevel,
        sessionId: newSession.sessionId
      },
      { username: user?.username }
    );
    mongoService.recordCandidateLog(
      'INFO',
      'INTERVIEW_INITIALIZED',
      `Session ${newSession.sessionId} initiated for candidate ${candidateName}`,
      {
        categories: selectedCategoryIds,
        durationMinutes,
        experienceLevel
      },
      user?.username
    );

    // Prompt real AI LLM to generate Elsa's warm, human-like opening greeting
    try {
      setIsStarkThinking(true);
      const aiGreeting = await generateElsaAiIntro(
        candidateName,
        selectedCategoryIds,
        experienceLevel
      );
      if (aiGreeting && aiGreeting.length > 20) {
        initialPlan[0].questionText = aiGreeting;
        setSession((prev) => (prev ? { ...prev, questions: initialPlan } : prev));
      }
    } catch (err) {
      console.warn('AI intro generation fallback:', err);
    } finally {
      setIsStarkThinking(false);
    }

    // Speak Question 1 (AI Greeting) - candidate mic starts automatically when Elsa finishes
    setTimeout(() => {
      speakElsaQuestion(initialPlan[0].questionText);
    }, 400);
  };

  // ----------------------------------------------------
  // ACTIVE COUNTDOWN TIMER LOOP (10 mins, 15 mins, etc.)
  // ----------------------------------------------------
  useEffect(() => {
    if (stage === 'interview' && session) {
      countdownIntervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current);
            handleTimeExpiredWrapup();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(countdownIntervalRef.current);
    }

    return () => clearInterval(countdownIntervalRef.current);
  }, [stage, session]);

  // Handle Time Expired Automatic Conclusion (POWERED BY REAL AI EVALUATION)
  const handleTimeExpiredWrapup = async () => {
    if (!session) return;
    stopCandidateSpeechRecognition();
    window.speechSynthesis?.cancel();
    setIsStarkSpeaking(false);
    isStarkSpeakingRef.current = false;
    setIsStarkThinking(true);

    const completedSession: StarkInterviewSession = {
      ...session,
      completedAt: new Date().toISOString()
    };

    let report: StarkEvaluation;
    try {
      report = await generateElsaAiFinalReport(completedSession);
    } catch {
      report = generateFinalStarkReport(completedSession);
    }

    completedSession.finalEvaluation = report;

    setSession(completedSession);
    setFinalReport(report);
    setIsStarkThinking(false);
    setStage('report');

    // Persist session to user's isolated dashboard storage
    const userStorageKey = `kodexis_candidate_dashboard_${user?.username ? user.username.toLowerCase() : 'default'}`;
    const cached = localStorage.getItem(userStorageKey);
    let userDashboard: any = null;
    if (cached) {
      try {
        userDashboard = JSON.parse(cached);
      } catch {}
    }

    if (!userDashboard) {
      userDashboard = {
        fullName: user?.fullName || 'Candidate',
        targetRole: user?.targetRole || 'Software Engineer',
        targetCompanies: user?.targetCompanies || 'Top Tech Companies',
        experienceLevel: user?.experienceLevel || 'MEDIUM',
        preferredLanguage: user?.preferredLanguage || 'PYTHON',
        readinessScore: report.overallScore,
        skills: {
          'Arrays / Hashing': 'DEVELOPING',
          'Strings': 'DEVELOPING',
          'Stacks / Queues': 'DEVELOPING',
          'Sorting / Searching': 'DEVELOPING',
          'System Design': 'DEVELOPING',
          'Recursion': 'DEVELOPING',
          'LinkedLists': 'DEVELOPING',
          'Trees': 'DEVELOPING',
          'Dynamic Programming': 'DEVELOPING',
          'Graphs': 'DEVELOPING'
        },
        history: [],
        weaknesses: []
      };
    }

    const newHistoryItem = {
      sessionId: completedSession.sessionId,
      date: new Date().toISOString(),
      title: `Elsa AI Tech Lead Interview (${session.selectedCategories.map((c) => c.toUpperCase()).join(', ')})`,
      topic: session.selectedCategories.length > 1 ? 'Full-Stack CS' : session.selectedCategories[0].toUpperCase(),
      difficulty: session.experienceLevel.toUpperCase(),
      language: 'Voice / STT',
      score: report.overallScore,
      feedback: report.detailedDebrief
    };

    userDashboard.history = [newHistoryItem, ...(userDashboard.history || [])];
    userDashboard.readinessScore = Math.max(userDashboard.readinessScore || 0, report.overallScore);
    localStorage.setItem(userStorageKey, JSON.stringify(userDashboard));

    // Calculate transparent scoring rubric breakdown
    const formulaBreakdown = computeScoreFormulaBreakdown(
      report.technicalProficiencyScore,
      report.conceptualDepthScore,
      report.problemSolvingScore,
      report.communicationScore
    );
    setScoreFormulaBreakdown(formulaBreakdown);

    // Save full autopsy to MongoDB
    const mongoAutopsy: MongoInterviewAutopsy = {
      sessionId: completedSession.sessionId,
      userId: 'user-' + (user?.username || 'candidate').toLowerCase(),
      username: (user?.username || 'candidate').toLowerCase(),
      candidateName: completedSession.candidateName,
      targetRole: completedSession.targetRole,
      date: new Date().toISOString(),
      durationMinutes: completedSession.durationMinutes,
      overallScore: report.overallScore,
      recommendation: report.recommendation,
      formulaBreakdown,
      multiFactorScores: {
        technicalProficiency: report.technicalProficiencyScore,
        communicationScore: report.communicationScore,
        conceptualDepthScore: report.conceptualDepthScore,
        problemSolvingScore: report.problemSolvingScore
      },
      categoryScores: report.categoryScores,
      keyStrengths: report.keyStrengths,
      areasForImprovement: report.areasForImprovement,
      detailedDebrief: report.detailedDebrief,
      transcripts: completedSession.transcripts.map((t) => ({
        ...t,
        category: t.category || 'General Computer Science'
      })),
      createdAt: new Date().toISOString()
    };

    mongoService.saveInterviewAutopsy(mongoAutopsy).catch((err) => {
      console.warn('Autopsy MongoDB sync notice:', err);
    });

    mongoService.logUserBehavior(
      'INTERVIEW_COMPLETED',
      '/elsa',
      {
        sessionId: completedSession.sessionId,
        overallScore: report.overallScore,
        recommendation: report.recommendation,
        totalQuestions: completedSession.transcripts.length
      },
      { username: user?.username }
    );

    mongoService.recordCandidateLog(
      'INTERVIEW_AUTOPSY',
      'AUTOPSY_GENERATED',
      `Final interview autopsy generated for ${completedSession.candidateName} with overall score ${report.overallScore}/100`,
      {
        sessionId: completedSession.sessionId,
        overallScore: report.overallScore,
        formula: formulaBreakdown.formula
      },
      user?.username
    );

    // Record streak activity uniquely for this user
    recordStreakActivity('Elsa AI Interview Completed', user?.username);

    // Exit fullscreen cleanly on report
    try {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    } catch {}

    setTimeout(() => {
      if (!isMutedTts) {
        speakElsa(
          `Time is up for this interview session. Excellent effort, ${session.candidateName}! I am Elsa, and I have compiled your technical autopsy report. Your overall score is ${report.overallScore} out of 100.`
        );
      }
    }, 500);
  };

  // ----------------------------------------------------
  // SUBMIT CANDIDATE ANSWER & THINK IN REAL TIME (POWERED BY REAL AI)
  // ----------------------------------------------------
  const handleSubmitAnswer = async () => {
    if (!session) return;

    stopCandidateSpeechRecognition();
    window.speechSynthesis?.cancel();
    setIsStarkSpeaking(false);
    isStarkSpeakingRef.current = false;
    setIsStarkThinking(true); // Triggers real-time thinking state on 3D Spline HUD

    const currentQ = session.questions[currentIndex];
    const fullAnswer = (speechTranscript + ' ' + interimTranscript).trim();

    // 1. Evaluate candidate speech answer with real AI reasoning
    let evalResult = { score: 75, feedback: 'Good conceptual overview.' };
    try {
      evalResult = await evaluateElsaAiAnswer(currentQ, fullAnswer, session.experienceLevel);
    } catch {
      evalResult = evaluateCandidateSpeechAnswer(currentQ, fullAnswer);
    }

    const transcriptItem = {
      questionId: currentQ.id,
      questionText: currentQ.questionText,
      category: currentQ.categoryName || 'General Engineering',
      phase: currentQ.phase,
      userAnswerText: fullAnswer || '(No audible speech registered)',
      score: evalResult.score,
      feedback: evalResult.feedback,
      durationSeconds: session.totalTimeSeconds - remainingSeconds,
      timestamp: new Date().toISOString()
    };

    const updatedTranscripts = [...session.transcripts, transcriptItem];

    // Log answer to MongoDB
    mongoService.logUserBehavior(
      'ANSWER_SUBMITTED',
      '/elsa',
      {
        questionIndex: currentIndex,
        category: currentQ.categoryName,
        answerLength: fullAnswer.length,
        score: evalResult.score
      },
      { username: user?.username }
    );
    mongoService.recordCandidateLog(
      'INFO',
      'SPEECH_ANSWER_RECORDED',
      `Spoken response recorded for question #${currentIndex + 1} (${currentQ.categoryName})`,
      {
        questionText: currentQ.questionText,
        score: evalResult.score,
        durationSeconds: transcriptItem.durationSeconds
      },
      user?.username
    );

    // If more than 60 seconds remain, Elsa truly thinks and dynamically generates the next human-like question
    if (remainingSeconds > 60) {
      let nextQ: any = null;
      try {
        const sessionWithTranscripts = {
          ...session,
          transcripts: updatedTranscripts
        };
        // The LLM considers what the candidate actually said (e.g. "I know oops", tools, architecture) and entire history!
        nextQ = await generateElsaAiNextQuestion(
          sessionWithTranscripts,
          fullAnswer,
          currentIndex
        );
      } catch (err) {
        console.warn('AI next question fallback:', err);
        nextQ = generateNextDynamicQuestion(session, fullAnswer, currentIndex);
      }

      const updatedQuestions = [...session.questions.slice(0, currentIndex + 1), nextQ];
      const nextIndex = currentIndex + 1;

      const updatedSession: StarkInterviewSession = {
        ...session,
        currentQuestionIndex: nextIndex,
        questions: updatedQuestions,
        transcripts: updatedTranscripts
      };

      setSession(updatedSession);
      setCurrentIndex(nextIndex);
      setSpeechTranscript('');
      setInterimTranscript('');
      setIsStarkThinking(false);

      setTimeout(() => {
        speakElsaQuestion(nextQ.questionText);
      }, 500);
    } else {
      // Time nearly exhausted: conclude and display dossier report
      handleTimeExpiredWrapup();
    }
  };

  // Toggle Camera
  const toggleCamera = () => {
    if (!activeMediaStream) return;
    const videoTracks = activeMediaStream.getVideoTracks();
    if (videoTracks.length > 0) {
      const nextState = !videoTracks[0].enabled;
      videoTracks[0].enabled = nextState;
      setIsCameraOn(nextState);
    }
  };

  // Toggle Mic Mute
  const toggleMic = () => {
    if (!activeMediaStream) return;
    const audioTracks = activeMediaStream.getAudioTracks();
    if (audioTracks.length > 0) {
      const nextState = !audioTracks[0].enabled;
      audioTracks[0].enabled = nextState;
      setIsMicMuted(!nextState);
      if (!nextState) {
        stopCandidateSpeechRecognition();
      } else {
        startCandidateSpeechRecognition();
      }
    }
  };

  // Format seconds to mm:ss
  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      if (wordStreamTimerRef.current) clearInterval(wordStreamTimerRef.current);
      if (recognitionInstanceRef.current) {
        try {
          recognitionInstanceRef.current.stop();
        } catch {}
      }
      if (activeMediaStream) {
        activeMediaStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [activeMediaStream]);

  // ====================================================
  // STAGE 1: SETUP SCREEN (DURATION IN MINUTES)
  // ====================================================
  if (stage === 'setup') {
    return (
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 font-sans select-none">
        {/* Hero Header */}
        <div className="glass-panel p-6 md:p-8 rounded-3xl border border-cyan-500/25 bg-gradient-to-r from-cyan-950/20 via-background to-purple-950/20 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/40 bg-cyan-500/10 text-cyan-400 font-mono text-[11px] font-bold tracking-widest uppercase">
              <Radio size={12} className="animate-pulse" />
              <span>ELSA REAL TECHNICAL INTERVIEW ENGINE</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold font-mono text-zinc-100 tracking-tight">
              Elsa Tech Lead Chamber
            </h1>
            <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Real-world technical interview simulation powered by Nexus 3D Spline neural visuals, live camera framing, audio VU meters, and continuous speech-to-text. Elsa begins with your self-introduction and dynamically adapts deep technical challenges across your chosen domains.
            </p>
          </div>

          <div className="shrink-0 flex items-center justify-center z-10">
            <div className="w-28 h-28 rounded-2xl border border-cyan-500/30 bg-black/60 p-2 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.2)]">
              <Radio size={36} className="text-cyan-400 animate-pulse mb-1" />
              <span className="text-[9px] font-mono font-bold text-zinc-300">NEXUS 3D CORE</span>
            </div>
          </div>
        </div>

        {/* Configuration Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Candidate Profile Identity */}
          <div className="border border-border bg-background-panel p-4 rounded-2xl space-y-2">
            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <UserCheck size={12} className="text-cyan-400" />
                <span>Candidate Identity</span>
              </span>
              <span className="text-[9px] text-cyan-400 font-bold">LIVE PROFILE</span>
            </label>
            <input
              type="text"
              value={candidateDisplayName}
              onChange={(e) => setCandidateDisplayName(e.target.value)}
              placeholder="Enter your name / handle..."
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-mono text-zinc-100 focus:outline-none focus:border-cyan-500/60 font-bold"
            />
            <p className="text-[9px] font-mono text-zinc-500 truncate">
              Unique candidate identification for session autopsy logs
            </p>
          </div>

          {/* Seniority Level */}
          <div className="border border-border bg-background-panel p-4 rounded-2xl space-y-2">
            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
              Candidate Seniority Target
            </label>
            <div className="grid grid-cols-4 gap-1.5 font-mono text-xs">
              {(['junior', 'mid', 'senior', 'staff'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setExperienceLevel(lvl)}
                  className={`py-2 px-2 rounded-xl border text-center uppercase font-bold transition ${
                    experienceLevel === lvl
                      ? 'bg-cyan-500/15 border-cyan-500 text-cyan-400'
                      : 'border-border bg-background text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Time Duration Selection (10 Mins, 15 Mins, 20 Mins, 30 Mins) */}
          <div className="border border-border bg-background-panel p-4 rounded-2xl space-y-2">
            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block flex items-center gap-1.5">
              <Clock size={12} className="text-cyan-400" />
              <span>Interview Session Duration</span>
            </label>
            <div className="grid grid-cols-4 gap-1.5 font-mono text-xs">
              {[
                { mins: 10, label: '10m' },
                { mins: 15, label: '15m' },
                { mins: 20, label: '20m' },
                { mins: 30, label: '30m' }
              ].map((opt) => (
                <button
                  key={opt.mins}
                  onClick={() => setDurationMinutes(opt.mins)}
                  className={`py-2 px-2 rounded-xl border text-center font-bold transition ${
                    durationMinutes === opt.mins
                      ? 'bg-purple-500/15 border-purple-500 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                      : 'border-border bg-background text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Selection Counts */}
          <div className="border border-border bg-background-panel p-4 rounded-2xl flex items-center justify-between gap-3">
            <div className="text-left font-mono">
              <p className="text-xs font-bold text-zinc-200">
                {selectedCategoryIds.length} of 10 Selected
              </p>
              <p className="text-[10px] text-zinc-500">
                {durationMinutes} Min Session • Adaptive Questions
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={selectCoreCategories}
                className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-zinc-300 font-mono text-[10px] hover:bg-zinc-800 transition"
              >
                Core 4
              </button>
              <button
                onClick={selectAllCategories}
                className="px-2.5 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/10 text-cyan-300 font-mono text-[10px] font-bold hover:bg-cyan-500/20 transition"
              >
                Select All
              </button>
            </div>
          </div>
        </div>

        {/* 10 CS Categories Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-mono font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
              <Binary size={16} className="text-cyan-400" />
              <span>Choose Interview Topics (10 Core Computer Science Disciplines)</span>
            </h3>
            <span className="text-xs font-mono text-zinc-400">
              Select all domains you wish Elsa to explore
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CS_CATEGORIES.map((cat) => {
              const isSelected = selectedCategoryIds.includes(cat.id);
              return (
                <div
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between select-none ${
                    isSelected
                      ? 'bg-cyan-950/20 border-cyan-500/70 shadow-[0_0_15px_rgba(6,182,212,0.12)] scale-[1.01]'
                      : 'bg-background-panel border-border hover:border-zinc-700 opacity-75 hover:opacity-100'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2.5">
                        <div
                          className={`p-2 rounded-xl border ${
                            isSelected ? 'bg-cyan-500/10 border-cyan-500/40' : 'bg-background border-border'
                          }`}
                        >
                          {getCategoryIcon(cat.icon)}
                        </div>
                        <div>
                          <span className="text-[10px] font-mono font-bold text-cyan-400 tracking-wider">
                            {cat.shortCode}
                          </span>
                          <h4 className="text-sm font-bold text-zinc-100 leading-snug">{cat.name}</h4>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition ${
                          isSelected ? 'bg-cyan-500 border-cyan-400 text-zinc-950 font-bold' : 'border-zinc-700 bg-background'
                        }`}
                      >
                        {isSelected && <CheckCircle2 size={13} className="text-zinc-950" />}
                      </div>
                    </div>

                    <p className="text-[11px] text-zinc-400 leading-relaxed mt-1">{cat.tagline}</p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-border/50 flex flex-wrap gap-1">
                    {cat.topics.slice(0, 3).map((topic, i) => (
                      <span
                        key={i}
                        className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-background border border-border text-zinc-400"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Launch CTA */}
        <div className="glass-panel p-6 rounded-3xl border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-left font-mono">
            <h4 className="text-sm font-bold text-zinc-100">Ready to enter the chamber?</h4>
            <p className="text-xs text-zinc-400">
              Next step: Calibrate camera framing, microphone sound levels, and audio before launching fullscreen.
            </p>
          </div>

          <button
            onClick={() => setStage('diagnostics')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-mono text-xs font-bold shadow-[0_0_20px_rgba(6,182,212,0.4)] transition flex items-center justify-center gap-2 group"
          >
            <span>Proceed to Hardware Calibration</span>
            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  // ====================================================
  // STAGE 2: DIAGNOSTICS & HARDWARE FLIGHT CHECK
  // ====================================================
  if (stage === 'diagnostics') {
    return (
      <div className="p-6 md:p-8">
        <StarkDiagnostics
          onComplete={handleDiagnosticsComplete}
          onCancel={() => setStage('setup')}
        />
      </div>
    );
  }

  // ====================================================
  // STAGE 3: LIVE ELSA INTERVIEW CHAMBER (FULLSCREEN HUD)
  // ====================================================
  if (stage === 'interview' && session) {
    const currentQ = session.questions[currentIndex];
    const allWords = currentQ.questionText.split(/\s+/).filter(Boolean);
    const visibleWords = allWords.slice(0, displayedWordsCount);
    const timeProgressPercent = Math.max(0, Math.min(100, (remainingSeconds / session.totalTimeSeconds) * 100));

    return (
      <div className="fixed inset-0 z-50 bg-black text-zinc-100 flex flex-col font-sans select-none overflow-hidden">
        {/* FULLSCREEN RE-ENTRY OVERLAY WARNING IF ACCIDENTALLY EXITED */}
        {showFullscreenWarning && (
          <div className="absolute inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400">
              <AlertTriangle size={32} />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold font-mono text-zinc-100">FULLSCREEN MODE REQUIRED</h2>
              <p className="text-xs text-zinc-400 max-w-md font-mono">
                Technical interview integrity requires uninterrupted fullscreen execution. ESC key and window minimizes are disabled.
              </p>
            </div>
            <button
              onClick={enterFullscreen}
              className="px-6 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-mono text-xs font-bold shadow-[0_0_20px_rgba(6,182,212,0.5)] transition flex items-center gap-2"
            >
              <Maximize2 size={15} />
              <span>Resume Fullscreen Interview</span>
            </button>
          </div>
        )}

        {/* TOP STATUS BAR (NO EXIT BUTTONS, NO QUESTION COUNTERS) */}
        <header className="px-6 py-3 bg-zinc-950/90 border-b border-cyan-500/30 flex items-center justify-between gap-4 shrink-0 shadow-lg z-20">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-400">
              <Radio size={16} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-mono font-bold text-zinc-100 tracking-wider">
                  ELSA INTERVIEW CHAMBER
                </h2>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 uppercase">
                  {currentQ.phase === 'intro'
                    ? 'PHASE 1: CANDIDATE INTRODUCTION'
                    : currentQ.phase === 'intro_followup'
                    ? 'PHASE 2: PROJECT DEBRIEF'
                    : `PHASE 3: ${currentQ.categoryName || 'CS CHALLENGE'}`}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${
                    isFullscreen
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                      : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                  }`}
                >
                  {isFullscreen ? 'FULLSCREEN LOCKED' : 'FULLSCREEN REQUIRED'}
                </span>
              </div>
              <p className="text-[10px] font-mono text-zinc-400">
                Candidate: <strong className="text-zinc-200">{session.candidateName}</strong> • Target: {session.targetRole}
              </p>
            </div>
          </div>

          {/* ACTIVE COUNTDOWN CLOCK & TIMER PROGRESS */}
          <div className="flex items-center space-x-4 font-mono">
            <div className="flex flex-col items-end">
              <div className="flex items-center space-x-2 text-xs font-bold">
                <Clock
                  size={14}
                  className={remainingSeconds < 180 ? 'text-amber-400 animate-pulse' : 'text-cyan-400'}
                />
                <span
                  className={`text-sm tracking-widest ${
                    remainingSeconds < 60
                      ? 'text-red-400 animate-pulse'
                      : remainingSeconds < 180
                      ? 'text-amber-400'
                      : 'text-cyan-300'
                  }`}
                >
                  {formatTime(remainingSeconds)} REMAINING
                </span>
              </div>
              {/* Visual Time Remaining Progress Bar */}
              <div className="w-36 h-1.5 bg-zinc-800 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-cyan-400 transition-all duration-1000"
                  style={{ width: `${timeProgressPercent}%` }}
                />
              </div>
            </div>

            {/* Mute TTS Audio Toggle */}
            <button
              onClick={() => {
                if (isStarkSpeaking) {
                  window.speechSynthesis?.cancel();
                  setIsStarkSpeaking(false);
                  isStarkSpeakingRef.current = false;
                  startCandidateSpeechRecognition(true);
                }
                setIsMutedTts(!isMutedTts);
              }}
              title={isMutedTts ? 'Unmute Elsa Voice' : 'Mute Elsa Voice'}
              className={`p-2 rounded-xl border transition ${
                isMutedTts
                  ? 'bg-red-500/10 border-red-500/30 text-red-400'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {isMutedTts ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
          </div>
        </header>

        {/* MAIN DUAL VIEWPORT SPLIT */}
        <main className="flex-1 p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
          {/* LEFT: ELSA 3D SPLINE HUD (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-4 overflow-hidden">
            {/* 3D Spline Interactive View from nexus-spline-view */}
            <div className="flex-1 relative overflow-hidden rounded-3xl min-h-[320px]">
              <StarkSplineView
                isSpeaking={isStarkSpeaking}
                isListening={isCandidateListening}
                isThinking={isStarkThinking}
                audioLevel={micAudioLevel}
                className="w-full h-full"
              />

              {/* Repeat Audio Button */}
              <button
                onClick={() => speakElsaQuestion(currentQ.questionText)}
                disabled={isStarkSpeaking}
                className="absolute top-4 right-4 z-30 px-3 py-1.5 rounded-xl border border-cyan-500/30 bg-black/70 hover:bg-black/90 text-cyan-300 font-mono text-[10px] font-bold flex items-center gap-1.5 backdrop-blur-md transition shadow-lg"
                title="Repeat Question via Female TTS"
              >
                <RotateCcw size={12} />
                <span>Repeat Question</span>
              </button>
            </div>

            {/* WORD-BY-WORD STREAMING TELEPROMPTER QUESTION BOX */}
            <div className="border border-cyan-500/25 bg-zinc-950/90 rounded-2xl p-5 shrink-0 space-y-3 shadow-xl">
              <div className="flex items-center justify-between text-xs font-mono border-b border-zinc-800 pb-2">
                <span className="text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-2">
                  <Radio size={13} className="animate-pulse" />
                  <span>ELSA&apos;S QUESTION</span>
                </span>
                <span className="text-zinc-500 text-[10px] uppercase font-bold">
                  {currentQ.depthLevel} LEVEL
                </span>
              </div>

              {/* Word-by-Word Arranged Generation */}
              <div className="p-4 rounded-xl border border-cyan-500/20 bg-cyan-950/15 text-sm md:text-base font-medium text-zinc-100 leading-relaxed min-h-[75px] font-sans">
                {visibleWords.map((word, i) => (
                  <span
                    key={i}
                    className={`inline-block mr-1.5 transition-opacity duration-150 ${
                      i === visibleWords.length - 1 && displayedWordsCount < allWords.length
                        ? 'text-cyan-300 font-bold drop-shadow-[0_0_8px_#22d3ee]'
                        : 'text-zinc-100'
                    }`}
                  >
                    {word}
                  </span>
                ))}
                {displayedWordsCount < allWords.length && (
                  <span className="inline-block w-2 h-4 bg-cyan-400 ml-1 animate-pulse align-middle" />
                )}
              </div>

              {/* Key Concept Hints */}
              {currentQ.hints && currentQ.hints.length > 0 && (
                <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-zinc-400">
                  <HelpCircle size={13} className="text-cyan-400 shrink-0" />
                  <span className="text-zinc-500">Core Concepts:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentQ.hints.map((hint, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px]">
                        {hint}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: CANDIDATE STUDIO (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-4 overflow-hidden">
            {/* Live Camera Feed */}
            <div className="relative aspect-video bg-zinc-950 rounded-3xl overflow-hidden border border-cyan-500/40 shadow-2xl flex items-center justify-center shrink-0">
              {isCameraOn ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover -scale-x-100"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-zinc-500 font-mono text-xs space-y-2">
                  <CameraOff size={32} />
                  <span>CAMERA TRANSMISSION PAUSED</span>
                </div>
              )}

              {/* Reticles Overlay */}
              <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
              <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
              <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
              <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

              {/* Status Pill */}
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-sm border border-white/10 font-mono text-[9px] text-zinc-200 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isCameraOn ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} />
                <span>{session.candidateName.toUpperCase()} • ON AIR</span>
              </div>

              {/* Controls */}
              <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                <button
                  onClick={toggleCamera}
                  className={`p-2 rounded-xl backdrop-blur-md border text-xs transition ${
                    isCameraOn
                      ? 'bg-zinc-900/80 border-white/20 text-zinc-200 hover:bg-zinc-800'
                      : 'bg-red-500/30 border-red-500/50 text-red-300'
                  }`}
                  title={isCameraOn ? 'Turn Camera Off' : 'Turn Camera On'}
                >
                  {isCameraOn ? <Camera size={14} /> : <CameraOff size={14} />}
                </button>

                <button
                  onClick={toggleMic}
                  className={`p-2 rounded-xl backdrop-blur-md border text-xs transition ${
                    !isMicMuted
                      ? 'bg-zinc-900/80 border-white/20 text-zinc-200 hover:bg-zinc-800'
                      : 'bg-red-500/30 border-red-500/50 text-red-300'
                  }`}
                  title={!isMicMuted ? 'Mute Microphone' : 'Unmute Microphone'}
                >
                  {!isMicMuted ? <Mic size={14} /> : <MicOff size={14} />}
                </button>
              </div>

              {/* Camera Audio VU Meter Indicator */}
              <div className="absolute bottom-3 left-3 px-2 py-1 rounded-full bg-black/75 backdrop-blur-sm border border-white/10 flex items-center gap-1.5 font-mono text-[9px]">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    micAudioLevel > 8 && !isMicMuted ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'
                  }`}
                />
                <span className="text-zinc-400">MIC:</span>
                <div className="w-14 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-75 ${
                      isMicMuted
                        ? 'bg-zinc-600'
                        : micAudioLevel > 70
                        ? 'bg-amber-400'
                        : micAudioLevel > 12
                        ? 'bg-emerald-400'
                        : 'bg-cyan-400'
                    }`}
                    style={{ width: `${isMicMuted ? 0 : micAudioLevel}%` }}
                  />
                </div>
                <span className="text-zinc-300 font-bold">{isMicMuted ? 'MUTE' : `${micAudioLevel}%`}</span>
              </div>
            </div>

            {/* Speech Recognition Box */}
            <div className="border border-border bg-zinc-950/90 rounded-2xl p-5 flex-1 flex flex-col justify-between space-y-3 shadow-xl">
              <div>
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-3">
                  <div className="flex items-center space-x-2">
                    <Mic size={16} className={isCandidateListening ? 'text-emerald-400 animate-pulse' : 'text-zinc-500'} />
                    <h4 className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider">
                      Speech-To-Text Dictation
                    </h4>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border transition ${
                      isCandidateListening
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                    }`}
                  >
                    {isCandidateListening ? '● CONVERTING SPEECH TO TEXT' : 'MIC PAUSED'}
                  </span>
                </div>

                {/* Live Speech Interim Preview Banner */}
                {interimTranscript && (
                  <div className="mb-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs font-mono text-emerald-300 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                    <span className="truncate">Hearing: &ldquo;{interimTranscript}&rdquo;</span>
                  </div>
                )}

                <textarea
                  value={speechTranscript + (interimTranscript ? ` ${interimTranscript}` : '')}
                  onChange={(e) => {
                    setSpeechTranscript(e.target.value);
                    setInterimTranscript('');
                  }}
                  placeholder="Speak into your microphone — your speech converts directly to text here in real-time. Elsa listens to your answers and adapts follow-ups automatically..."
                  rows={6}
                  className="w-full p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-200 focus:outline-none focus:border-cyan-500 transition resize-none leading-relaxed"
                />

                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mt-1.5">
                  <span>
                    {isCandidateListening
                      ? 'Microphone active • Speech transcribed automatically'
                      : 'Dictation paused • Click Start Dictation below'}
                  </span>
                  <span>
                    {speechTranscript
                      ? `${speechTranscript.split(/\s+/).filter(Boolean).length} words`
                      : '0 words'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (isCandidateListening) {
                        stopCandidateSpeechRecognition();
                      } else {
                        startCandidateSpeechRecognition(true);
                      }
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition ${
                      isCandidateListening
                        ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 shadow-[0_0_12px_rgba(160,185,129,0.2)]'
                        : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-200'
                    }`}
                  >
                    {isCandidateListening ? <MicOff size={14} /> : <Mic size={14} />}
                    <span>{isCandidateListening ? 'Pause Dictation' : 'Start Dictation'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSpeechTranscript('');
                      setInterimTranscript('');
                    }}
                    className="py-2 px-3 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs font-mono transition"
                  >
                    Clear Text
                  </button>
                </div>

                {/* AI Thinking Feedback Banner */}
                {isStarkThinking && (
                  <div className="p-2.5 rounded-xl bg-purple-500/15 border border-purple-500/40 flex items-center justify-center gap-2 text-xs font-mono text-purple-300 animate-pulse shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                    <Sparkles size={14} className="text-purple-400 animate-spin" />
                    <span>Elsa is analyzing your engineering reasoning &amp; formulating next probe...</span>
                  </div>
                )}

                {/* Submit to Elsa Button */}
                <button
                  onClick={handleSubmitAnswer}
                  disabled={isStarkThinking}
                  className="w-full py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-mono text-xs font-bold shadow-[0_0_20px_rgba(6,182,212,0.4)] transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send size={14} />
                  <span>
                    {isStarkThinking
                      ? 'Elsa is Thinking & Synthesizing...'
                      : remainingSeconds > 60
                      ? 'Submit Answer & Proceed'
                      : 'Submit Final Answer & Conclude Session'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ====================================================
  // STAGE 4: FINAL EVALUATION DOSSIER REPORT
  // ====================================================
  if (stage === 'report' && finalReport && session) {
    const breakdown = scoreFormulaBreakdown || computeScoreFormulaBreakdown(
      finalReport.technicalProficiencyScore,
      finalReport.conceptualDepthScore,
      finalReport.problemSolvingScore,
      finalReport.communicationScore
    );

    const getRecBadge = (rec: string) => {
      switch (rec) {
        case 'STRONG_HIRE':
          return 'bg-emerald-500/15 border-emerald-500 text-emerald-400';
        case 'HIRE':
          return 'bg-cyan-500/15 border-cyan-500 text-cyan-400';
        case 'LEAN_HIRE':
          return 'bg-amber-500/15 border-amber-500 text-amber-400';
        default:
          return 'bg-rose-500/15 border-rose-500 text-rose-400';
      }
    };

    return (
      <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8 font-sans">
        {/* Header Banner */}
        <div className="glass-panel p-6 md:p-8 rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/20 via-background to-purple-950/20 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-left">
            <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 uppercase tracking-widest">
              <Award size={14} />
              <span>ELSA AI CANDIDATE AUTOPSY & DOSSIER</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold font-mono text-zinc-100 tracking-tight">
              Technical Interview Autopsy
            </h1>
            <p className="text-xs text-zinc-400 max-w-xl">
              Candidate: <strong className="text-zinc-200">{session.candidateName}</strong> • Completed {session.transcripts.length} in-depth technical questions across selected computer science categories in a {session.durationMinutes}-minute session.
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-center font-mono">
              <span className="text-5xl font-black text-cyan-400 tracking-tight">
                {finalReport.overallScore}
              </span>
              <span className="text-xs text-zinc-500 block">/ 100 SCORE</span>
            </div>

            <div
              className={`px-4 py-2.5 rounded-2xl border font-mono text-xs font-bold uppercase tracking-wider text-center ${getRecBadge(
                finalReport.recommendation
              )}`}
            >
              {finalReport.recommendation.replace('_', ' ')}
            </div>
          </div>
        </div>

        {/* Multi-Factor Scores */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Technical Proficiency', score: finalReport.technicalProficiencyScore, icon: Binary, color: 'text-cyan-400' },
            { label: 'Communication Clarity', score: finalReport.communicationScore, icon: Volume2, color: 'text-purple-400' },
            { label: 'Conceptual Depth', score: finalReport.conceptualDepthScore, icon: BrainCircuit, color: 'text-emerald-400' },
            { label: 'Problem Solving & Trade-offs', score: finalReport.problemSolvingScore, icon: Activity, color: 'text-amber-400' }
          ].map((metric, i) => {
            const Icon = metric.icon;
            return (
              <div key={i} className="border border-border bg-background-panel rounded-2xl p-4 space-y-2 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-400 uppercase">{metric.label}</span>
                  <Icon size={14} className={metric.color} />
                </div>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-2xl font-bold text-zinc-100">{metric.score}</span>
                  <span className="text-[10px] text-zinc-500">/100</span>
                </div>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-400 h-full rounded-full transition-all"
                    style={{ width: `${metric.score}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Transparent Final Score Formula & Rubric Breakdown Card */}
        <div className="glass-panel p-6 rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/20 via-background-panel to-purple-950/20 space-y-5 font-mono">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold tracking-wider uppercase">
                <Calculator size={15} />
                <span>Transparent Scoring Mathematics & Industry Rubric</span>
              </div>
              <h3 className="text-base font-bold text-zinc-100">
                Detailed Final Score Calculation ({finalReport.overallScore} / 100)
              </h3>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
              Weighted Composite Model
            </div>
          </div>

          {/* Prominent Formula Pill */}
          <div className="p-4 rounded-2xl bg-zinc-950/70 border border-cyan-500/40 text-center space-y-1">
            <span className="text-[10px] text-zinc-400 uppercase tracking-widest block font-bold">
              Official Rubric Formula
            </span>
            <p className="text-xs md:text-sm text-cyan-300 font-bold tracking-wide">
              Final Score = (Tech Proficiency × 35%) + (Conceptual Depth × 25%) + (Problem Solving × 25%) + (Communication × 15%)
            </p>
          </div>

          {/* 4 Dimension Contribution Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Tech Proficiency */}
            <div className="p-3.5 rounded-2xl bg-background border border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-cyan-400 font-bold">TECH PROFICIENCY</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-bold">35% Weight</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-zinc-400 text-[11px]">{breakdown.technicalProficiencyScore} × 0.35 =</span>
                <span className="text-base font-bold text-zinc-100">+{breakdown.technicalProficiencyPoints} pts</span>
              </div>
              <p className="text-[10px] text-zinc-500 font-sans leading-tight">
                Data structure accuracy, syntax mastery, and concrete code implementation.
              </p>
            </div>

            {/* Conceptual Depth */}
            <div className="p-3.5 rounded-2xl bg-background border border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-emerald-400 font-bold">CONCEPTUAL DEPTH</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">25% Weight</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-zinc-400 text-[11px]">{breakdown.conceptualDepthScore} × 0.25 =</span>
                <span className="text-base font-bold text-zinc-100">+{breakdown.conceptualDepthPoints} pts</span>
              </div>
              <p className="text-[10px] text-zinc-500 font-sans leading-tight">
                Virtual memory, concurrency quorums, protocols, and architectural internals.
              </p>
            </div>

            {/* Problem Solving */}
            <div className="p-3.5 rounded-2xl bg-background border border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-amber-400 font-bold">PROBLEM SOLVING</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold">25% Weight</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-zinc-400 text-[11px]">{breakdown.problemSolvingScore} × 0.25 =</span>
                <span className="text-base font-bold text-zinc-100">+{breakdown.problemSolvingPoints} pts</span>
              </div>
              <p className="text-[10px] text-zinc-500 font-sans leading-tight">
                Algorithmic trade-offs, edge-case mitigation, and scalability reasoning.
              </p>
            </div>

            {/* Communication */}
            <div className="p-3.5 rounded-2xl bg-background border border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-purple-400 font-bold">COMMUNICATION</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 font-bold">15% Weight</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-zinc-400 text-[11px]">{breakdown.communicationScore} × 0.15 =</span>
                <span className="text-base font-bold text-zinc-100">+{breakdown.communicationPoints} pts</span>
              </div>
              <p className="text-[10px] text-zinc-500 font-sans leading-tight">
                Structured articulation, collaborative dialogue, and technical conciseness.
              </p>
            </div>
          </div>

          {/* Summation Row */}
          <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-zinc-300">
              <Hash size={14} className="text-cyan-400" />
              <span>Points Summation:</span>
              <span className="font-bold text-zinc-100">
                {breakdown.technicalProficiencyPoints} + {breakdown.conceptualDepthPoints} + {breakdown.problemSolvingPoints} + {breakdown.communicationPoints} = {breakdown.calculatedTotal} pts
              </span>
            </div>
            <div className="text-[11px] text-zinc-400">
              Persisted to MongoDB collection <code className="text-cyan-400">interview_autopsies</code>
            </div>
          </div>
        </div>

        {/* Category Breakdown & Feedback */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-5 border border-border bg-background-panel rounded-3xl p-6 space-y-4 font-mono">
            <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
              <BarChart3 size={15} className="text-cyan-400" />
              <span>Category Mastery Breakdown</span>
            </h3>

            <div className="space-y-3">
              {Object.entries(finalReport.categoryScores).map(([cat, score]) => (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-300 font-semibold">{cat}</span>
                    <span className="text-cyan-400 font-bold">{score}%</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-7 border border-border bg-background-panel rounded-3xl p-6 space-y-5">
            <h3 className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider">
              Elsa&apos;s Strategic Feedback
            </h3>

            <div className="space-y-2">
              <h4 className="text-[11px] font-mono font-bold text-emerald-400 uppercase">
                Demonstrated Strengths:
              </h4>
              <ul className="space-y-1 text-xs text-zinc-300">
                {finalReport.keyStrengths.map((str, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2 pt-2 border-t border-border/50">
              <h4 className="text-[11px] font-mono font-bold text-amber-400 uppercase">
                High-Impact Growth Areas:
              </h4>
              <ul className="space-y-1 text-xs text-zinc-300">
                {finalReport.areasForImprovement.map((area, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">!</span>
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Question-by-Question Transcript Autopsy */}
        <div className="space-y-4">
          <h3 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            <FileText size={15} className="text-cyan-400" />
            <span>Spoken Transcripts & Critique Logs</span>
          </h3>

          <div className="space-y-4">
            {session.transcripts.map((item, idx) => (
              <div
                key={idx}
                className="border border-border bg-background-panel rounded-2xl p-5 space-y-3 font-mono"
              >
                <div className="flex items-center justify-between text-xs border-b border-border/50 pb-2">
                  <span className="font-bold text-cyan-400">
                    Question {idx + 1}: {item.category} ({item.phase.replace('_', ' ')})
                  </span>
                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px]">
                    Score: <strong className="text-cyan-400">{item.score}/100</strong> • {item.durationSeconds}s
                  </span>
                </div>

                <div className="text-xs text-zinc-200 bg-background/50 p-3 rounded-xl border border-border/60">
                  <strong className="text-zinc-400 block mb-1">ELSA:</strong>
                  {item.questionText}
                </div>

                <div className="text-xs text-zinc-300 bg-cyan-950/10 p-3 rounded-xl border border-cyan-500/20">
                  <strong className="text-cyan-400 block mb-1">CANDIDATE ANSWER (SPEECH RECOGNITION):</strong>
                  {item.userAnswerText}
                </div>

                <div className="text-[11px] text-zinc-400 bg-background p-2.5 rounded-lg border border-border">
                  <strong className="text-zinc-300">Elsa Feedback: </strong>
                  {item.feedback}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="glass-panel p-6 rounded-3xl border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 font-mono text-xs text-amber-400">
            <Flame size={16} />
            <span>Daily Practice Streak updated! Activity recorded to developer profile.</span>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              onClick={() => {
                setStage('setup');
                setSession(null);
                setFinalReport(null);
              }}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl border border-border bg-background hover:bg-zinc-800 text-zinc-300 font-mono text-xs transition"
            >
              Start New Interview
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-mono text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <span>Back to Dashboard</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default StarkInterviewPage;
