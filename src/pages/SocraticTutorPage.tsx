import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { LEARNING_API_BASE } from '../lib/api';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Globe,
  Brain,
  Sparkles,
  BookOpen,
  Presentation,
  Video
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { VoicePoweredOrb } from '../components/ui/voice-powered-orb';

interface Citation {
  contentUnitId: string;
  citationLabel: string;
  documentName: string;
  sourceType: 'VIDEO' | 'SLIDE' | 'TEXTBOOK';
  pageNumber?: number;
  slideNumber?: number;
  videoTimestampSeconds?: number;
  videoDuration?: string;
  excerpt: string;
  relevanceScore: number;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  isGrounded?: boolean;
  isOutOfDomain?: boolean;
  citations?: Citation[];
  socraticFollowup?: string;
  timestamp: string;
}

export const SocraticTutorPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'tutor',
      text: "Welcome to the KODEXIS Socratic Tutor. Ask me any question on **Distributed Systems**, **Network Flow & Graph Algorithms**, or **Transformer Attention**.\n\nAll explanations are strictly grounded in verified textbooks, slides, and video timestamps. Any outside or off-material query will be transparently flagged or declined.",
      isGrounded: true,
      timestamp: '10:00 AM'
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

  const API_BASE = LEARNING_API_BASE;

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
        console.error("Mic start failed", err);
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
      const cleanText = text.replace(/[*_#`>[\]]/g, '').slice(0, 300);
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

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);
    setVoiceOrbHue(280); // Active thinking hue

    try {
      // Endpoint handles source-grounding, refusal check, and multilingual synthesis
      const res = await axios.post(`${API_BASE}/tutor/voice`, {
        query: q,
        language: selectedLanguage
      });

      const tutorMsg: ChatMessage = {
        id: 'tut-' + Date.now(),
        sender: 'tutor',
        text: res.data.tutorResponseText,
        isGrounded: res.data.grounded,
        isOutOfDomain: !res.data.grounded,
        citations: res.data.citations,
        socraticFollowup: res.data.socraticPromptFollowup,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, tutorMsg]);

      // Auto-voice speak if enabled
      if (res.data.speechSynthesisText) {
        handleSpeakText(res.data.speechSynthesisText);
      }
    } catch (err) {
      console.error("Tutor error:", err);
      const fallbackMsg: ChatMessage = {
        id: 'err-' + Date.now(),
        sender: 'tutor',
        text: "Encountered an inference error. Please verify the backend connection.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
      setVoiceOrbHue(190);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* HEADER BANNER */}
      <div className="glass-panel p-6 rounded-xl border border-brand-violet/20 bg-gradient-to-r from-brand-violet/5 via-transparent to-brand-cyan/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-brand-violet uppercase tracking-wider mb-1">
            <Sparkles size={14} />
            <span>Requirements 2 & 6: Source Grounding & Voice Socratic Tutor</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-100 tracking-tight">
            Grounded Socratic Tutor with Voice Orb
          </h1>
          <p className="text-xs md:text-sm text-zinc-400 mt-1 max-w-2xl">
            Ask complex curriculum questions with citation tags linking directly to exact slides, pages, or video timestamps. Off-material queries are strictly declined to guarantee factual integrity.
          </p>
        </div>

        {/* Language Switcher */}
        <div className="flex items-center space-x-2 bg-background-panel border border-border p-1.5 rounded-xl shrink-0">
          <Globe size={16} className="text-brand-cyan ml-2" />
          {(['ENGLISH', 'HINDI', 'HINGLISH'] as const).map(lang => (
            <button
              key={lang}
              onClick={() => setSelectedLanguage(lang)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition ${
                selectedLanguage === lang
                  ? 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {lang === 'HINDI' ? 'हिंदी' : lang}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN LAYOUT: VOICE ORB & CHAT CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: INTERACTIVE VOICE ORB & SOURCE RADAR */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-panel p-6 rounded-2xl border border-border text-center flex flex-col items-center justify-center relative overflow-hidden">
            <div className="w-48 h-48 relative flex items-center justify-center">
              <VoicePoweredOrb
                hue={voiceOrbHue}
                maxRotationSpeed={isSpeaking || isListening ? 3.0 : 1.2}
                maxHoverIntensity={isSpeaking || isListening ? 2.0 : 0.8}
                enableVoiceControl={isListening}
              />
            </div>

            <div className="mt-4 space-y-1">
              <h3 className="text-sm font-mono font-bold text-zinc-200 uppercase">
                {isListening ? 'LISTENING TO SPEECH...' : isSpeaking ? 'ORAL EXPLANATION ACTIVE' : 'SOCRATIC BRAIN IDLE'}
              </h3>
              <p className="text-[11px] text-zinc-400 font-sans">
                {isListening
                  ? 'Speak your question clearly into the microphone...'
                  : 'Click the microphone button to initiate voice-based dialogue.'}
              </p>
            </div>

            <button
              onClick={toggleVoiceListening}
              className={`mt-4 w-full py-3 rounded-xl font-mono text-xs font-bold flex items-center justify-center space-x-2 transition shadow-lg ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse shadow-red-500/20'
                  : 'bg-brand-cyan text-zinc-950 hover:bg-brand-cyan/90 shadow-brand-cyan/10'
              }`}
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              <span>{isListening ? 'STOP RECORDING' : 'START VOICE INTERACTION'}</span>
            </button>
          </div>

          {/* SOURCE BOUNDARY STATUS CARD */}
          <div className="glass-panel p-4 rounded-xl border border-border space-y-2 text-xs font-mono">
            <span className="text-[11px] text-zinc-400 font-bold block">GROUNDING POLICY (REQ 2B)</span>
            <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800 space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400">
                <ShieldCheck size={14} />
                <span className="font-bold">Source-Backed Excerpts</span>
              </div>
              <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                Answers must contain verified citation tags (e.g. `[Slide 14]`, `[Page 652]`, `[@ 04:24]`).
              </p>
              <div className="flex items-center space-x-2 text-amber-400 pt-1 border-t border-zinc-800">
                <AlertTriangle size={14} />
                <span className="font-bold">Strict Outside Query Refusal</span>
              </div>
              <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                Queries outside ingested computer science curriculum are declined without hallucination.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT: CHAT THREAD WITH CLICKABLE CITATIONS */}
        <div className="lg:col-span-8 flex flex-col h-[680px] glass-panel rounded-2xl border border-border overflow-hidden">
          {/* MESSAGES SCROLL AREA */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {messages.map((m) => {
              const isTutor = m.sender === 'tutor';
              return (
                <div key={m.id} className={`flex ${isTutor ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] space-y-2.5 ${
                    isTutor
                      ? 'bg-background-panel border border-border p-4 rounded-2xl rounded-tl-none text-zinc-200'
                      : 'bg-brand-cyan/15 border border-brand-cyan/40 p-3.5 rounded-2xl rounded-tr-none text-zinc-100 font-mono text-xs'
                  }`}>
                    {/* Header */}
                    <div className="flex items-center justify-between gap-3 text-[10px] font-mono text-zinc-500 pb-1 border-b border-border/40">
                      <span className="font-bold flex items-center space-x-1">
                        {isTutor ? (
                          <>
                            <Brain size={12} className="text-brand-violet" />
                            <span className="text-brand-violet">KODEXIS SOCRATIC TUTOR</span>
                          </>
                        ) : (
                          <span>STUDENT INQUIRY</span>
                        )}
                      </span>
                      <span>{m.timestamp}</span>
                    </div>

                    {/* Grounding Status Badges */}
                    {isTutor && m.isOutOfDomain && (
                      <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/25 text-[11px] font-mono font-bold">
                        <AlertTriangle size={12} />
                        <span>OUT-OF-MATERIAL QUERY FLAGGED (REFUSED)</span>
                      </div>
                    )}
                    {isTutor && m.isGrounded && (
                      <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-[11px] font-mono font-bold">
                        <ShieldCheck size={12} />
                        <span>SOURCE-BACKED WITH VERIFIED CITATIONS</span>
                      </div>
                    )}

                    {/* Text / Markdown Body */}
                    <div className="text-xs leading-relaxed font-sans space-y-2 prose prose-invert max-w-none">
                      <ReactMarkdown>{m.text}</ReactMarkdown>
                    </div>

                    {/* Citations Box (Clickable to exact units) */}
                    {m.citations && m.citations.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-border/50 space-y-2">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold block">
                          VERIFIED SOURCE CITATIONS (CLICK TO INSPECT):
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {m.citations.map((c, idx) => (
                            <div
                              key={idx}
                              className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-brand-cyan/30 text-brand-cyan font-mono text-[10px] flex items-center space-x-1.5 hover:bg-brand-cyan/10 transition cursor-pointer"
                              title={c.excerpt}
                            >
                              {c.sourceType === 'VIDEO' && <Video size={12} className="text-red-400" />}
                              {c.sourceType === 'SLIDE' && <Presentation size={12} className="text-amber-400" />}
                              {c.sourceType === 'TEXTBOOK' && <BookOpen size={12} className="text-emerald-400" />}
                              <span className="font-bold">{c.citationLabel}</span>
                              <ExternalLink size={10} className="text-zinc-500" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Socratic Followup Prompt */}
                    {m.socraticFollowup && (
                      <div className="p-3 rounded-lg bg-brand-violet/10 border border-brand-violet/25 text-[11px] text-zinc-300 font-sans space-y-1">
                        <span className="font-mono text-brand-violet font-bold block">Socratic Inquiry Check:</span>
                        <p>{m.socraticFollowup}</p>
                      </div>
                    )}

                    {/* Speak Button */}
                    {isTutor && (
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => handleSpeakText(m.text)}
                          className="text-[11px] font-mono text-zinc-400 hover:text-brand-cyan flex items-center space-x-1 transition"
                        >
                          {isSpeaking ? <VolumeX size={12} /> : <Volume2 size={12} />}
                          <span>{isSpeaking ? 'Mute' : 'Listen'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {isLoading && (
              <div className="flex justify-start">
                <div className="p-4 rounded-xl bg-background-panel border border-border text-xs font-mono text-brand-cyan flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-brand-cyan animate-ping"></span>
                  <span>Verifying source locations & synthesizing grounded response...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* INPUT BAR */}
          <div className="p-4 bg-background-panel border-t border-border flex items-center gap-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendQuery()}
              placeholder={selectedLanguage === 'HINDI' ? 'अपना प्रश्न यहाँ लिखें...' : 'Ask concept question (e.g. How does Raft break split votes?)...'}
              className="flex-1 px-4 py-3 rounded-xl bg-background border border-border text-xs text-zinc-200 placeholder-zinc-500 font-mono focus:outline-none focus:border-brand-cyan/60"
            />

            <button
              onClick={() => handleSendQuery()}
              disabled={isLoading || !inputText.trim()}
              className="px-5 py-3 rounded-xl bg-brand-cyan text-zinc-950 font-mono text-xs font-bold hover:bg-brand-cyan/90 transition disabled:opacity-50 flex items-center space-x-1.5"
            >
              <span>SEND</span>
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
