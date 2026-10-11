import React, { useState, useRef, useEffect } from 'react';
import {
  Send, Sparkles, BookOpen, Volume2, VolumeX, ShieldAlert,
  Info, CornerDownLeft, ExternalLink, HelpCircle, CheckCircle2,
  FileText, Presentation, Video
} from 'lucide-react';
import { ChatMessage, Citation } from '../types';
import { api } from '../api/client';

interface TutorChatProps {
  courseId: string;
  preferredLanguage: string;
  initialQuestion?: string | null;
  onClearInitialQuestion?: () => void;
  onSelectCitation: (citation: Citation) => void;
}

export const TutorChat: React.FC<TutorChatProps> = ({
  courseId,
  preferredLanguage,
  initialQuestion,
  onClearInitialQuestion,
  onSelectCitation,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init_welcome',
      role: 'assistant',
      content:
        "Hello! I am your AI Study Companion.\n\n" +
        "I provide step-by-step explanations strictly grounded in all your uploaded textbooks, slide decks, and course documents. " +
        "Every response includes verified citations linking directly to the exact page, slide, or excerpt so you can inspect sources side-by-side.\n\n" +
        "What concept would you like to review or explore today?",
      citations: [],
      is_outside_knowledge: false,
      is_unanswerable: false,
      confidence: 1.0,
      created_at: new Date().toISOString(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [allowOutsideKnowledge, setAllowOutsideKnowledge] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialQuestion && initialQuestion.trim()) {
      handleSend(initialQuestion);
      if (onClearInitialQuestion) {
        onClearInitialQuestion();
      }
    }
  }, [initialQuestion]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text,
      citations: [],
      is_outside_knowledge: false,
      is_unanswerable: false,
      confidence: 1.0,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const res = await api.sendChatMessage({
        course_id: courseId,
        message: text,
        preferred_language: preferredLanguage,
        allow_outside_knowledge: allowOutsideKnowledge,
      });

      const assistantMsg: ChatMessage = {
        id: res.message_id,
        role: 'assistant',
        content: res.content,
        citations: res.citations || [],
        direct_evidence: res.direct_evidence,
        tutor_elaboration: res.tutor_elaboration,
        is_outside_knowledge: res.is_outside_knowledge,
        is_unanswerable: res.is_unanswerable,
        confidence: res.confidence,
        created_at: res.created_at,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // If response includes citations, automatically spotlight the first citation in viewer
      if (assistantMsg.citations.length > 0) {
        onSelectCitation(assistantMsg.citations[0]);
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content: `I ran into a connection issue: ${err.message || 'Unable to connect to study engine'}. Please make sure the backend server is running.`,
        citations: [],
        is_outside_knowledge: false,
        is_unanswerable: true,
        confidence: 0.0,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Text to Speech playback
  const toggleSpeech = (msg: ChatMessage) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingMessageId === msg.id) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown asterisks and hashtags for audio
    const cleanText = msg.content.replace(/[*#`_]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    setSpeakingMessageId(msg.id);
    window.speechSynthesis.speak(utterance);
  };

  const samplePrompts = [
    'How does Raft leader election work and why are election timeouts randomized?',
    'Why is Two-Phase Commit a blocking protocol when the coordinator crashes?',
    'What does the CAP theorem state regarding network partitions?',
    'How many nodes are needed to tolerate 2 crash failures vs 2 Byzantine faults?',
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--bg-panel)',
        overflow: 'hidden',
      }}
    >
      {/* Top Session Bar */}
      <div
        style={{
          padding: '0.65rem 1rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-card)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={16} style={{ color: 'var(--accent-indigo)' }} />
          <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Source-Grounded AI Tutoring Session
          </span>
          <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
            Zero-Hallucination Guardrail Active
          </span>
        </div>

        {/* Outside Knowledge Setting */}
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={allowOutsideKnowledge}
            onChange={(e) => setAllowOutsideKnowledge(e.target.checked)}
            style={{ accentColor: 'var(--accent-indigo)' }}
          />
          <span>Allow marked outside knowledge</span>
        </label>
      </div>

      {/* Messages Stream */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
              gap: '0.4rem',
            }}
          >
            {/* Message Bubble */}
            <div
              style={{
                maxWidth: msg.role === 'user' ? '80%' : '90%',
                padding: '0.85rem 1.15rem',
                borderRadius: '0.75rem',
                background:
                  msg.role === 'user'
                    ? 'linear-gradient(135deg, #0079f2 0%, #6366f1 100%)'
                    : 'var(--bg-card)',
                color: '#ffffff',
                border: `1px solid ${
                  msg.role === 'user' ? 'rgba(255,255,255,0.1)' : 'var(--border-subtle)'
                }`,
                boxShadow: 'var(--shadow-sm)',
                lineHeight: 1.6,
                fontSize: '0.875rem',
                whiteSpace: 'pre-wrap',
              }}
            >
              {msg.role === 'user' ? (
                <div style={{ fontWeight: 500 }}>{msg.content}</div>
              ) : (
                <div>
                  {/* Warning banner if out-of-scope refusal */}
                  {msg.is_unanswerable && !msg.is_outside_knowledge && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        backgroundColor: 'rgba(244, 63, 94, 0.12)',
                        border: '1px solid rgba(244, 63, 94, 0.3)',
                        borderRadius: '0.375rem',
                        padding: '0.5rem 0.75rem',
                        marginBottom: '0.75rem',
                        color: '#fb7185',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      <ShieldAlert size={16} />
                      <span>Curriculum Boundary Refusal: Not present in course materials</span>
                    </div>
                  )}

                  {msg.is_outside_knowledge && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        backgroundColor: 'rgba(245, 158, 11, 0.12)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        borderRadius: '0.375rem',
                        padding: '0.5rem 0.75rem',
                        marginBottom: '0.75rem',
                        color: '#fbbf24',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      <Info size={16} />
                      <span>Marked Outside Knowledge (Explicitly requested)</span>
                    </div>
                  )}

                  {/* Message Body */}
                  <div style={{ color: 'var(--text-main)' }}>{msg.content}</div>

                  {/* Direct Evidence Box */}
                  {msg.direct_evidence && !msg.is_unanswerable && (
                    <div
                      style={{
                        marginTop: '0.85rem',
                        padding: '0.65rem 0.85rem',
                        backgroundColor: 'var(--bg-app)',
                        borderLeft: '3px solid var(--accent-cyan)',
                        borderRadius: '0 0.375rem 0.375rem 0',
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                      }}
                    >
                      <div style={{ fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '0.25rem' }}>
                        DIRECT SOURCE EVIDENCE:
                      </div>
                      <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                        {msg.direct_evidence}
                      </div>
                    </div>
                  )}

                  {/* Grounded Citations Pill Row */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div style={{ marginTop: '0.85rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600 }}>
                        CITATIONS:
                      </span>
                      {msg.citations.map((cit, cIdx) => (
                        <button
                          key={cIdx}
                          onClick={() => onSelectCitation(cit)}
                          className="citation-pill"
                          title="Click to open source location in viewer"
                        >
                          {cit.file_type === 'textbook' && <FileText size={12} />}
                          {cit.file_type === 'slides' && <Presentation size={12} />}
                          {cit.file_type === 'lecture_video' && <Video size={12} />}
                          <span>
                            {cit.page_number && `p. ${cit.page_number}`}
                            {cit.slide_number && `Slide ${cit.slide_number}`}
                            {cit.timestamp_formatted && `Lecture ${cit.timestamp_formatted}`}
                          </span>
                          <ExternalLink size={10} style={{ marginLeft: 2 }} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bubble Action Bar for Assistant Messages */}
            {msg.role === 'assistant' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', paddingLeft: '0.5rem', marginTop: '0.2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <button
                    onClick={() => toggleSpeech(msg)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: speakingMessageId === msg.id ? 'var(--accent-indigo)' : 'var(--text-dim)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontSize: '0.7rem',
                    }}
                    title="Listen to Explanation"
                  >
                    {speakingMessageId === msg.id ? <VolumeX size={13} /> : <Volume2 size={13} />}
                    <span>{speakingMessageId === msg.id ? 'Stop Audio' : 'Listen'}</span>
                  </button>
                </div>

                {/* Quick Follow-up Learning Chips */}
                {!msg.is_unanswerable && msg.id !== 'init_welcome' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleSend("Can you explain this simpler with a clear real-world intuition (ELI5)?")}
                      style={{
                        padding: '0.2rem 0.55rem',
                        borderRadius: '0.35rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-muted)',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                    >
                      💡 Explain Simpler (ELI5)
                    </button>
                    <button
                      onClick={() => handleSend("Can you show a rigorous step-by-step mathematical breakdown or proof for this?")}
                      style={{
                        padding: '0.2rem 0.55rem',
                        borderRadius: '0.35rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-muted)',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                    >
                      📋 Step-by-Step Breakdown
                    </button>
                    <button
                      onClick={() => handleSend("Give me a quick question on this concept to test my understanding.")}
                      style={{
                        padding: '0.2rem 0.55rem',
                        borderRadius: '0.35rem',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        border: '1px solid rgba(99, 102, 241, 0.25)',
                        color: '#a5b4fc',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.2)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.1)')}
                    >
                      🎯 Quiz Me on This
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              alignSelf: 'flex-start',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
            }}
          >
            <div
              style={{
                width: '0.9rem',
                height: '0.9rem',
                border: '2px solid var(--accent-indigo)',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
            <span>Retrieving textbook chapters, lecture slides, and transcripts...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: 'var(--bg-panel)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
        }}
      >
        {samplePrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            style={{
              padding: '0.3rem 0.65rem',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '0.375rem',
              color: 'var(--text-muted)',
              fontSize: '0.725rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-indigo)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div
        style={{
          padding: '1rem 1.25rem',
          backgroundColor: 'var(--bg-card)',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            backgroundColor: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '0.75rem',
            padding: '0.45rem 0.75rem',
            boxShadow: 'var(--shadow-sm)',
            transition: 'border-color 0.2s ease',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent-primary)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Ask a question about ${preferredLanguage === 'hi' ? 'CS401 (Hinglish me samjhe)' : 'CS401 Distributed Systems'}...`}
            disabled={isLoading}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-main)',
              fontSize: '0.9rem',
              padding: '0.5rem 0.25rem',
            }}
          />

          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="btn-primary"
            style={{
              padding: '0.45rem 0.95rem',
              fontSize: '0.825rem',
              opacity: !inputValue.trim() || isLoading ? 0.5 : 1,
            }}
          >
            <Send size={14} />
            <span>Ask Tutor</span>
          </button>
        </form>
      </div>
    </div>
  );
};
