import React, { useState, useRef, useEffect } from 'react';
import {
  ragService,
  type KnowledgeUnit,
  type RagCitation,
  type RagAnswerResponse
} from '../lib/ragService';
import { VoicePoweredOrb } from '../components/ui/voice-powered-orb';
import ReactMarkdown from 'react-markdown';
import {
  Video,
  BookOpen,
  Search,
  Upload,
  Layers,
  Sparkles,
  Play,
  Pause,
  CheckCircle2,
  Mic,
  MicOff,
  Send,
  Volume2,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Brain,
  LayoutGrid,
  HelpCircle
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  isGrounded?: boolean;
  isOutOfDomain?: boolean;
  citations?: RagCitation[];
  socraticFollowup?: string;
  timestamp: string;
}

type ViewMode = 'split' | 'knowledge' | 'tutor';

export const MultimodalSocraticHub: React.FC = () => {
  // Navigation / View layout mode
  const [viewMode, setViewMode] = useState<ViewMode>('split');

  // Knowledge Base State
  const [units, setUnits] = useState<KnowledgeUnit[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeUnit, setActiveUnit] = useState<KnowledgeUnit | null>(null);

  // Ingestion Modal State
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
  const [ingestTitle, setIngestTitle] = useState('');
  const [ingestDocName, setIngestDocName] = useState('');
  const [ingestType, setIngestType] = useState<'SLIDE' | 'TEXTBOOK' | 'VIDEO' | 'CODE' | 'DOCUMENT'>('SLIDE');
  const [ingestTopicName, setIngestTopicName] = useState('Distributed Systems');
  const [ingestSubtopic, setIngestSubtopic] = useState('');
  const [ingestSnippet, setIngestSnippet] = useState('');
  const [ingestPageOrSlide, setIngestPageOrSlide] = useState('1');
  const [ingestHasFigure, setIngestHasFigure] = useState(false);
  const [ingestFigureDesc, setIngestFigureDesc] = useState('');
  const [ingestVisualDataUrl, setIngestVisualDataUrl] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [ingestSuccessMsg, setIngestSuccessMsg] = useState('');
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  // Video Player Simulated Playback
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlaybackSec, setCurrentPlaybackSec] = useState(0);

  // Socratic Chat & Voice State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'tutor',
      text: "Welcome to the **Unified Multimodal Knowledge & Socratic AI Hub**!\n\nI answer queries strictly using **Retrieval-Augmented Generation (RAG)** grounded in our verified Knowledge Base of textbooks, lecture slides, diagrams, and video timestamps.\n\nAsk me any concept or click **'Ask Socratic AI'** on any knowledge unit in the repository.",
      isGrounded: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<'ENGLISH' | 'HINDI' | 'HINGLISH'>('ENGLISH');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceOrbHue, setVoiceOrbHue] = useState(190);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Load units from ragService
  useEffect(() => {
    refreshKnowledgeUnits();

    const handleUpdate = () => {
      refreshKnowledgeUnits();
    };

    window.addEventListener('kodexis_knowledge_updated', handleUpdate);
    return () => window.removeEventListener('kodexis_knowledge_updated', handleUpdate);
  }, []);

  const refreshKnowledgeUnits = () => {
    const list = ragService.getKnowledgeUnits();
    setUnits(list);
    if (list.length > 0 && !activeUnit) {
      setActiveUnit(list[0]);
      setCurrentPlaybackSec(list[0].videoTimestampSeconds || 0);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Speech Recognition Setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = selectedLanguage === 'HINDI' ? 'hi-IN' : 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
        handleSendQuery(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [selectedLanguage]);

  const toggleVoiceListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.error('Mic start failed', err);
      }
    }
  };

  const handleSpeakText = (text: string) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      // Strip markdown syntax for natural voice synthesis
      const cleanText = text.replace(/[*_#`>[\]]/g, '').slice(0, 320);
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = selectedLanguage === 'HINDI' ? 'hi-IN' : 'en-US';
      utterance.rate = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSendQuery = async (queryToSend?: string) => {
    const q = queryToSend || inputText;
    if (!q.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);
    setVoiceOrbHue(280); // Purple thinking hue

    try {
      // 1. Run RAG Pipeline (Retrieve Top Chunks + Grounded AI Generation)
      const ragResult: RagAnswerResponse = await ragService.askSocraticRag(
        q,
        selectedLanguage,
        messages.map((m) => ({ sender: m.sender, text: m.text }))
      );

      const tutorMsg: ChatMessage = {
        id: 'tut-' + Date.now(),
        sender: 'tutor',
        text: ragResult.answerText,
        isGrounded: ragResult.isGrounded,
        isOutOfDomain: !ragResult.isGrounded,
        citations: ragResult.citations,
        socraticFollowup: ragResult.socraticFollowup,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, tutorMsg]);

      // If highest citation matches a unit, focus it on the left panel
      if (ragResult.matchedUnits && ragResult.matchedUnits.length > 0) {
        setActiveUnit(ragResult.matchedUnits[0]);
      }

      // Speak response if available
      if (ragResult.answerText) {
        handleSpeakText(ragResult.answerText);
      }
    } catch (err) {
      console.error('RAG query error:', err);
      const fallbackMsg: ChatMessage = {
        id: 'err-' + Date.now(),
        sender: 'tutor',
        text: 'Encountered an inference issue while querying knowledge base. Please check connectivity.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
      setVoiceOrbHue(190);
    }
  };

  const handleCitationClick = (citation: RagCitation) => {
    const matched = units.find((u) => u.id === citation.contentUnitId || u.documentName === citation.documentName);
    if (matched) {
      setActiveUnit(matched);
      if (matched.videoTimestampSeconds) {
        setCurrentPlaybackSec(matched.videoTimestampSeconds);
      }
    }
  };

  const handleAskAboutUnit = (unit: KnowledgeUnit) => {
    const query = `Can you explain the core concepts of "${unit.title}" from ${unit.documentName} and test my understanding?`;
    handleSendQuery(query);
  };

  // File Upload Ingestion
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setIsProcessingFile(true);

    const baseName = file.name.replace(/\.[^/.]+$/, '');
    if (!ingestTitle) setIngestTitle(baseName);
    if (!ingestDocName) setIngestDocName(file.name);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setIngestVisualDataUrl(ev.target?.result as string);
        setIngestHasFigure(true);
        if (!ingestFigureDesc) setIngestFigureDesc(`Visual diagram from ${file.name}`);
        setIsProcessingFile(false);
      };
      reader.readAsDataURL(file);
      return;
    }

    const textReader = new FileReader();
    textReader.onload = (ev) => {
      const text = ev.target?.result as string;
      if (text) {
        // Retain full uploaded text (up to 150,000 characters)
        const cleanText = text.substring(0, 150000);
        setIngestSnippet(cleanText);
      }
      setIsProcessingFile(false);
    };
    textReader.onerror = () => setIsProcessingFile(false);
    textReader.readAsText(file);
  };

  const handleSaveIngestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingestTitle.trim() || !ingestSnippet.trim()) {
      alert('Title and Text Excerpt are required to ground RAG models.');
      return;
    }

    const pageOrSlideNum = parseInt(ingestPageOrSlide, 10) || 1;

    // If file is long (> 1500 chars), automatically create semantic chunks for RAG indexing
    if (ingestSnippet.length > 1500) {
      const chunkSize = 1000;
      const overlap = 150;
      const chunks: string[] = [];
      let i = 0;
      while (i < ingestSnippet.length) {
        const chunk = ingestSnippet.substring(i, i + chunkSize);
        chunks.push(chunk);
        i += chunkSize - overlap;
        if (chunks.length >= 25) break;
      }

      const unitsToCreate = chunks.map((chunkText, idx) => ({
        title: `${ingestTitle} (Part ${idx + 1})`,
        sourceType: ingestType,
        documentName: ingestDocName || 'Uploaded Engineering Document',
        topicName: ingestTopicName || 'Computer Science',
        subtopic: ingestSubtopic ? `${ingestSubtopic} - Sec ${idx + 1}` : `Section ${idx + 1}`,
        pageNumber: ingestType === 'TEXTBOOK' ? pageOrSlideNum + idx : undefined,
        slideNumber: ingestType === 'SLIDE' ? pageOrSlideNum + idx : undefined,
        videoTimestampSeconds: ingestType === 'VIDEO' ? (pageOrSlideNum + idx) * 60 : undefined,
        textSnippet: chunkText,
        hasVisualFigure: idx === 0 ? ingestHasFigure : false,
        figureTitle: idx === 0 && ingestHasFigure ? ingestFigureDesc || 'Uploaded Diagram' : undefined,
        figureDescription: idx === 0 ? ingestFigureDesc : undefined,
        visualDataUrl: idx === 0 ? ingestVisualDataUrl || undefined : undefined
      }));

      const created = ragService.addKnowledgeUnitsBatch(unitsToCreate);
      setUnits(ragService.getKnowledgeUnits());
      if (created.length > 0) setActiveUnit(created[0]);
      setIngestSuccessMsg(`✓ Successfully indexed ${created.length} chunks from "${ingestTitle}" into the RAG vector store!`);
    } else {
      const newUnit = ragService.addKnowledgeUnit({
        title: ingestTitle,
        sourceType: ingestType,
        documentName: ingestDocName || 'Uploaded Engineering Document',
        topicName: ingestTopicName || 'Computer Science',
        subtopic: ingestSubtopic || 'Foundations',
        pageNumber: ingestType === 'TEXTBOOK' ? pageOrSlideNum : undefined,
        slideNumber: ingestType === 'SLIDE' ? pageOrSlideNum : undefined,
        videoTimestampSeconds: ingestType === 'VIDEO' ? pageOrSlideNum * 60 : undefined,
        textSnippet: ingestSnippet,
        hasVisualFigure: ingestHasFigure,
        figureTitle: ingestHasFigure ? ingestFigureDesc || 'Uploaded Diagram' : undefined,
        figureDescription: ingestFigureDesc,
        visualDataUrl: ingestVisualDataUrl || undefined
      });

      setUnits(ragService.getKnowledgeUnits());
      setActiveUnit(newUnit);
      setIngestSuccessMsg(`✓ Successfully ingested "${ingestTitle}" into the RAG vector store!`);
    }
    setTimeout(() => {
      setIsIngestModalOpen(false);
      setIngestSuccessMsg('');
      setIngestTitle('');
      setIngestDocName('');
      setIngestSnippet('');
      setIngestVisualDataUrl('');
      setUploadedFileName('');
    }, 1200);
  };

  // Filter Units
  const filteredUnits = units.filter((u) => {
    const matchesTopic = selectedTopic === 'ALL' || u.topicName === selectedTopic;
    const matchesType = selectedType === 'ALL' || u.sourceType === selectedType;
    const matchesSearch =
      searchQuery.trim() === '' ||
      u.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.documentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.topicName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.textSnippet.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTopic && matchesType && matchesSearch;
  });

  const uniqueTopics = Array.from(new Set(units.map((u) => u.topicName)));

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 font-sans">
      {/* TOP HEADER & MODE CONTROLS */}
      <div className="glass-panel p-6 rounded-2xl border border-cyan-500/25 bg-gradient-to-r from-cyan-950/20 via-background to-purple-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1">
            <Sparkles size={14} className="animate-pulse" />
            <span>Unified Multimodal Knowledge Base & Socratic AI Engine</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-100 tracking-tight font-mono">
            Knowledge Base & Socratic AI (RAG)
          </h1>
          <p className="text-xs md:text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            All Socratic AI answers are strictly grounded in your uploaded textbooks, lecture slides, diagrams, and video timestamps using vector retrieval.
          </p>
        </div>

        {/* View Mode & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-background-panel border border-border">
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition ${
                viewMode === 'split'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <LayoutGrid size={14} />
              <span>Split Hub</span>
            </button>
            <button
              onClick={() => setViewMode('knowledge')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition ${
                viewMode === 'knowledge'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <BookOpen size={14} />
              <span>Knowledge Repo</span>
            </button>
            <button
              onClick={() => setViewMode('tutor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition ${
                viewMode === 'tutor'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Brain size={14} />
              <span>Socratic AI</span>
            </button>
          </div>

          {/* Upload Button */}
          <button
            onClick={() => setIsIngestModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-mono text-xs font-bold transition flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          >
            <Upload size={14} />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* MAIN UNIFIED CONTENT AREA */}
      <div
        className={`grid gap-6 ${
          viewMode === 'split'
            ? 'grid-cols-1 lg:grid-cols-12'
            : 'grid-cols-1'
        }`}
      >
        {/* ==================================================== */}
        {/* LEFT COLUMN: MULTIMODAL KNOWLEDGE BASE REPOSITORY */}
        {/* ==================================================== */}
        {(viewMode === 'split' || viewMode === 'knowledge') && (
          <div
            className={`space-y-5 ${
              viewMode === 'split' ? 'lg:col-span-6' : 'w-full'
            }`}
          >
            {/* Search and Filters */}
            <div className="glass-panel p-4 rounded-2xl border border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-zinc-300 flex items-center gap-1.5">
                  <BookOpen size={14} className="text-cyan-400" />
                  <span>KNOWLEDGE REPOSITORY ({units.length} UNITS)</span>
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  RAG Vector Store Active
                </span>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-3 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search textbooks, slides, video timestamps..."
                  className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              {/* Source Type & Topic Filters */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
                {(['ALL', 'TEXTBOOK', 'SLIDE', 'VIDEO'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-2.5 py-1 rounded-lg border transition ${
                      selectedType === type
                        ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300 font-bold'
                        : 'border-border bg-background text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}

                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="bg-background border border-border rounded-lg px-2.5 py-1 text-[11px] font-mono text-zinc-300 focus:outline-none"
                >
                  <option value="ALL">All Disciplines</option>
                  {uniqueTopics.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Units List */}
            <div className="glass-panel p-4 rounded-2xl border border-border space-y-3 max-h-[380px] overflow-y-auto">
              {filteredUnits.length === 0 ? (
                <div className="text-center py-10 font-mono text-xs text-zinc-500 space-y-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
                    <Upload size={18} />
                  </div>
                  <p className="text-zinc-300 font-bold">No Knowledge Materials Ingested</p>
                  <p className="text-[11px] text-zinc-500 max-w-xs mx-auto font-sans">
                    The knowledge base starts clean. Upload slides, textbook snippets, or lecture documents to enable RAG grounding.
                  </p>
                  <button
                    onClick={() => setIsIngestModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-lg bg-cyan-500 text-zinc-950 font-bold text-xs hover:bg-cyan-400 transition inline-flex items-center gap-1.5"
                  >
                    <Upload size={13} />
                    <span>Upload Document</span>
                  </button>
                </div>
              ) : (
                filteredUnits.map((u) => {
                  const isSelected = activeUnit?.id === u.id;
                  return (
                    <div
                      key={u.id}
                      onClick={() => {
                        setActiveUnit(u);
                        if (u.videoTimestampSeconds) {
                          setCurrentPlaybackSec(u.videoTimestampSeconds);
                        }
                      }}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-cyan-950/25 border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.1)]'
                          : 'bg-background-panel border-border/70 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                                u.sourceType === 'TEXTBOOK'
                                  ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                                  : u.sourceType === 'SLIDE'
                                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              }`}
                            >
                              {u.sourceType}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-400">
                              {u.topicName}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-zinc-100 leading-snug">
                            {u.title}
                          </h4>
                          <p className="text-[10px] text-zinc-400 font-mono">
                            {u.documentName}{' '}
                            {u.slideNumber ? `[Slide ${u.slideNumber}]` : u.pageNumber ? `[Page ${u.pageNumber}]` : u.videoTimestampSeconds ? `[${Math.floor(u.videoTimestampSeconds / 60)}m]` : ''}
                          </p>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAskAboutUnit(u);
                          }}
                          className="shrink-0 px-2 py-1 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 font-mono text-[9px] hover:bg-cyan-500/20 transition flex items-center gap-1"
                          title="Ask Socratic AI about this knowledge unit"
                        >
                          <Sparkles size={11} />
                          <span>Ask AI</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Active Unit Detailed Inspector */}
            {activeUnit && (
              <div className="glass-panel p-5 rounded-2xl border border-cyan-500/20 bg-background-panel space-y-4">
                <div className="flex items-start justify-between gap-4 border-b border-border pb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">
                      ACTIVE INSPECTION & CITATION PREVIEW
                    </span>
                    <h3 className="text-base font-bold text-zinc-100 mt-0.5">
                      {activeUnit.title}
                    </h3>
                    <p className="text-xs text-zinc-400 font-mono mt-0.5">
                      {activeUnit.documentName} • {activeUnit.topicName}{' '}
                      {activeUnit.subtopic ? `(${activeUnit.subtopic})` : ''}
                    </p>
                  </div>

                  <button
                    onClick={() => handleAskAboutUnit(activeUnit)}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-mono text-xs font-bold transition flex items-center gap-1 shadow-md shrink-0"
                  >
                    <Brain size={13} />
                    <span>Query Socratic AI</span>
                  </button>
                </div>

                {/* Excerpt */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase">
                    Grounding Text Excerpt:
                  </span>
                  <div className="p-3 rounded-xl bg-zinc-950/60 border border-border text-xs text-zinc-300 leading-relaxed font-sans">
                    {activeUnit.textSnippet}
                  </div>
                </div>

                {/* Visual Figure or Video Frame */}
                {activeUnit.hasVisualFigure && (
                  <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-cyan-400 flex items-center gap-1.5 uppercase">
                      <Layers size={12} />
                      <span>{activeUnit.figureTitle || 'Diagram Architecture'}</span>
                    </span>
                    {activeUnit.visualDataUrl ? (
                      <img
                        src={activeUnit.visualDataUrl}
                        alt={activeUnit.figureTitle}
                        className="rounded-lg max-h-48 mx-auto border border-border object-contain"
                      />
                    ) : (
                      <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 text-center font-mono text-xs text-zinc-400">
                        {activeUnit.figureDescription || activeUnit.figureCaption || 'Schematic Diagram Embedded in Slide Deck'}
                      </div>
                    )}
                  </div>
                )}

                {/* Video Playback simulation */}
                {activeUnit.sourceType === 'VIDEO' && (
                  <div className="p-3 rounded-xl bg-zinc-900/60 border border-border space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono text-zinc-300">
                      <span className="flex items-center gap-1.5 text-emerald-400">
                        <Video size={13} />
                        <span>Lecture Video Sync</span>
                      </span>
                      <span>
                        Timestamp: {Math.floor((activeUnit.videoTimestampSeconds || 0) / 60)}:
                        {((activeUnit.videoTimestampSeconds || 0) % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                    <div className="h-10 bg-black/60 rounded-lg flex items-center justify-center gap-3 px-3">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="p-1 rounded bg-cyan-500 text-zinc-950 hover:bg-cyan-400 transition"
                      >
                        {isPlaying ? <Pause size={12} /> : <Play size={12} />}
                      </button>
                      <div className="flex-1 bg-zinc-800 h-1 rounded-full overflow-hidden">
                        <div
                          className="bg-cyan-400 h-full transition-all"
                          style={{ width: `${((currentPlaybackSec % 60) / 60) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {isPlaying ? 'PLAYING' : 'READY'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* RIGHT COLUMN: GROUNDED SOCRATIC AI TUTOR (WITH RAG) */}
        {/* ==================================================== */}
        {(viewMode === 'split' || viewMode === 'tutor') && (
          <div
            className={`space-y-5 ${
              viewMode === 'split' ? 'lg:col-span-6' : 'w-full'
            }`}
          >
            {/* Top Socratic Bar with Voice Orb & Grounding Shield */}
            <div className="glass-panel p-5 rounded-2xl border border-purple-500/25 bg-gradient-to-r from-purple-950/20 via-background to-cyan-950/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-16 h-16 relative flex items-center justify-center shrink-0">
                  <VoicePoweredOrb
                    hue={voiceOrbHue}
                    maxRotationSpeed={isSpeaking || isListening ? 3.0 : 1.2}
                    maxHoverIntensity={isSpeaking || isListening ? 2.0 : 0.8}
                    enableVoiceControl={isListening}
                  />
                </div>
                <div>
                  <h3 className="text-sm font-mono font-bold text-zinc-100 uppercase flex items-center gap-2">
                    <span>Socratic Brain</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px]">
                      RAG Grounded
                    </span>
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    {isListening
                      ? 'Listening to your speech query...'
                      : isSpeaking
                      ? 'Synthesizing voice response...'
                      : 'Ask questions; answers cite exact pages & timestamps.'}
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center space-x-2 shrink-0">
                {/* Language Switcher */}
                <div className="flex items-center space-x-1 bg-background-panel border border-border p-1 rounded-xl">
                  {(['ENGLISH', 'HINDI', 'HINGLISH'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setSelectedLanguage(lang)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-mono transition ${
                        selectedLanguage === lang
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {lang === 'HINDI' ? 'हिंदी' : lang === 'HINGLISH' ? 'Hinglish' : 'EN'}
                    </button>
                  ))}
                </div>

                {/* Voice Mic Toggle */}
                <button
                  onClick={toggleVoiceListening}
                  className={`p-2.5 rounded-xl font-mono text-xs font-bold transition shadow-md flex items-center gap-1.5 ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-cyan-500 text-zinc-950 hover:bg-cyan-400'
                  }`}
                  title={isListening ? 'Stop Listening' : 'Speak Question'}
                >
                  {isListening ? <MicOff size={15} /> : <Mic size={15} />}
                  <span className="text-[10px] hidden sm:inline">
                    {isListening ? 'Stop' : 'Speak'}
                  </span>
                </button>
              </div>
            </div>

            {/* Quick Socratic Starter Prompts */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] font-mono">
              <span className="text-zinc-500 shrink-0">Try Asking:</span>
              {[
                'Explain Raft Consensus Quorum',
                'How does MVCC avoid locks in Postgres?',
                'Attention mechanism scaling factor',
                'Why does QUIC eliminate HOL blocking?'
              ].map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSendQuery(prompt)}
                  className="px-2.5 py-1 rounded-lg border border-border bg-background hover:border-cyan-500/50 hover:text-cyan-300 text-zinc-400 shrink-0 transition"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Socratic Chat Thread */}
            <div className="glass-panel rounded-2xl border border-border flex flex-col h-[520px] overflow-hidden">
              {/* Message History */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((m) => {
                  const isTutor = m.sender === 'tutor';
                  return (
                    <div
                      key={m.id}
                      className={`flex ${isTutor ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[90%] space-y-2.5 ${
                          isTutor
                            ? 'bg-background-panel border border-border p-4 rounded-2xl rounded-tl-none text-zinc-200'
                            : 'bg-cyan-950/40 border border-cyan-500/50 p-3.5 rounded-2xl rounded-tr-none text-zinc-100 font-mono text-xs'
                        }`}
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between gap-3 text-[10px] font-mono text-zinc-500 pb-1 border-b border-border/40">
                          <span className="font-bold flex items-center space-x-1.5">
                            {isTutor ? (
                              <>
                                <Brain size={12} className="text-purple-400" />
                                <span className="text-purple-400">SOCRATIC RAG ENGINE</span>
                              </>
                            ) : (
                              <span className="text-cyan-400">ENGINEERING INQUIRY</span>
                            )}
                          </span>
                          <span>{m.timestamp}</span>
                        </div>

                        {/* Grounding Status Badges */}
                        {isTutor && m.isOutOfDomain && (
                          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/25 text-[10px] font-mono font-bold">
                            <AlertTriangle size={12} />
                            <span>OUT-OF-MATERIAL (GENERALIZED FOUNDATION)</span>
                          </div>
                        )}

                        {isTutor && m.isGrounded && (
                          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-[10px] font-mono font-bold">
                            <ShieldCheck size={12} />
                            <span>GROUNDED IN UPLOADED KNOWLEDGE BASE</span>
                          </div>
                        )}

                        {/* Body Text */}
                        <div className="text-xs leading-relaxed font-sans space-y-2">
                          <ReactMarkdown>{m.text}</ReactMarkdown>
                        </div>

                        {/* Socratic Probe Follow-Up */}
                        {isTutor && m.socraticFollowup && (
                          <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs text-purple-200 font-sans space-y-1">
                            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-purple-400 uppercase">
                              <HelpCircle size={12} />
                              <span>Socratic Thought Probe:</span>
                            </div>
                            <p className="leading-relaxed">{m.socraticFollowup}</p>
                          </div>
                        )}

                        {/* Clickable Citations */}
                        {isTutor && m.citations && m.citations.length > 0 && (
                          <div className="pt-2 border-t border-border/50 space-y-1.5">
                            <span className="text-[10px] font-mono text-zinc-400 uppercase block font-bold">
                              Verified Citations (Click to view unit):
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {m.citations.map((c, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => handleCitationClick(c)}
                                  className="px-2.5 py-1 rounded-lg border border-cyan-500/30 bg-cyan-950/30 hover:bg-cyan-500/20 text-cyan-300 font-mono text-[10px] transition flex items-center gap-1 group text-left"
                                  title={`Click to focus source: ${c.excerpt}`}
                                >
                                  <ExternalLink size={11} className="group-hover:translate-x-0.5 transition-transform" />
                                  <span>{c.citationLabel}</span>
                                  <span className="text-zinc-500">({c.relevanceScore}% match)</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* TTS Play Button */}
                        {isTutor && (
                          <div className="flex justify-end pt-1">
                            <button
                              onClick={() => handleSpeakText(m.text)}
                              className="text-zinc-400 hover:text-zinc-200 p-1 rounded hover:bg-zinc-800 transition"
                              title="Listen to response"
                            >
                              <Volume2 size={13} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 bg-background-panel border-t border-border flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendQuery();
                    }
                  }}
                  placeholder="Ask a question on your uploaded course materials..."
                  disabled={isLoading}
                  className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-xs font-mono text-zinc-200 focus:outline-none focus:border-cyan-500/50 disabled:opacity-50"
                />

                <button
                  onClick={() => handleSendQuery()}
                  disabled={isLoading || !inputText.trim()}
                  className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold transition disabled:opacity-40"
                  title="Send Query"
                >
                  <Send size={15} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* INGESTION MODAL: UPLOAD SLIDES / TEXTBOOK / VIDEO */}
      {/* ==================================================== */}
      {isIngestModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background-panel border border-cyan-500/40 rounded-3xl p-6 md:p-8 max-w-2xl w-full space-y-6 shadow-2xl font-sans max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 font-bold tracking-widest uppercase">
                  DOCUMENT INGESTION & GROUNDING
                </span>
                <h3 className="text-xl font-bold text-zinc-100 font-mono">
                  Upload Knowledge Material
                </h3>
              </div>
              <button
                onClick={() => setIsIngestModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-200 text-xl font-mono px-2"
              >
                ✕
              </button>
            </div>

            {ingestSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500 text-emerald-400 text-xs font-mono flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>{ingestSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveIngestion} className="space-y-4">
              {/* File Dropzone */}
              <div className="border-2 border-dashed border-zinc-700 hover:border-cyan-500/60 rounded-2xl p-6 text-center transition cursor-pointer bg-zinc-950/40 relative">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.txt,.md,.png,.jpg,.jpeg,.json,.java,.py,.cpp,.ts,.tsx"
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Upload size={28} className="mx-auto text-cyan-400 mb-2" />
                <p className="text-xs font-bold text-zinc-200">
                  {uploadedFileName ? uploadedFileName : 'Click or drag files to upload & ingest'}
                </p>
                <p className="text-[10px] text-zinc-500 font-mono mt-1">
                  Supports Lecture Slides, PDFs, Textbooks, Code Files, or Visual Architecture Diagrams
                </p>
                {isProcessingFile && (
                  <p className="text-[10px] text-cyan-400 font-mono mt-2 animate-pulse">
                    Extracting tokens &amp; preparing RAG vector embeddings...
                  </p>
                )}
              </div>

              {/* Source Type & Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">
                    Source Material Type
                  </label>
                  <select
                    value={ingestType}
                    onChange={(e: any) => setIngestType(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none"
                  >
                    <option value="SLIDE">Lecture Slides</option>
                    <option value="TEXTBOOK">Verified Textbook Chapter</option>
                    <option value="VIDEO">Video Lecture Timestamp</option>
                    <option value="CODE">Source Code Repository</option>
                    <option value="DOCUMENT">Engineering Spec / RFC</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">
                    Core CS Discipline
                  </label>
                  <input
                    type="text"
                    value={ingestTopicName}
                    onChange={(e) => setIngestTopicName(e.target.value)}
                    placeholder="e.g. Distributed Systems, DBMS, AI"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none"
                  />
                </div>
              </div>

              {/* Title & Document Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">
                    Concept Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={ingestTitle}
                    onChange={(e) => setIngestTitle(e.target.value)}
                    placeholder="e.g. Raft Consensus Quorum Safety"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">
                    Original Document / Book Title
                  </label>
                  <input
                    type="text"
                    value={ingestDocName}
                    onChange={(e) => setIngestDocName(e.target.value)}
                    placeholder="e.g. Designing Data-Intensive Applications"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none"
                  />
                </div>
              </div>

              {/* Page / Slide / Timestamp number */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">
                    Page # / Slide # / Video Minute
                  </label>
                  <input
                    type="number"
                    value={ingestPageOrSlide}
                    onChange={(e) => setIngestPageOrSlide(e.target.value)}
                    min="1"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">
                    Subtopic / Tag
                  </label>
                  <input
                    type="text"
                    value={ingestSubtopic}
                    onChange={(e) => setIngestSubtopic(e.target.value)}
                    placeholder="e.g. Quorums, Partition Tolerance"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none"
                  />
                </div>
              </div>

              {/* Text Snippet / Content */}
              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">
                  Text Excerpt / Key Theoretical Content *
                </label>
                <textarea
                  required
                  rows={4}
                  value={ingestSnippet}
                  onChange={(e) => setIngestSnippet(e.target.value)}
                  placeholder="Paste or review the textbook / slide explanation that the RAG model will use as ground truth..."
                  className="w-full bg-background border border-border rounded-xl p-3 text-xs font-sans text-zinc-200 focus:outline-none"
                />
              </div>

              {/* Visual Figure Toggle */}
              <div className="space-y-2 pt-2 border-t border-border/50">
                <label className="flex items-center space-x-2 text-xs font-mono text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ingestHasFigure}
                    onChange={(e) => setIngestHasFigure(e.target.checked)}
                    className="rounded border-zinc-700 text-cyan-500 focus:ring-0"
                  />
                  <span>Includes Architectural Diagram or Visual Figure</span>
                </label>

                {ingestHasFigure && (
                  <div className="space-y-2 pl-6">
                    <input
                      type="text"
                      value={ingestFigureDesc}
                      onChange={(e) => setIngestFigureDesc(e.target.value)}
                      placeholder="Figure description / Caption (e.g. Leader Election Quorum Matrix)"
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsIngestModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-border bg-background hover:bg-zinc-800 text-zinc-300 font-mono text-xs transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-mono text-xs font-bold transition shadow-lg"
                >
                  Save & Ground RAG Model
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultimodalSocraticHub;
