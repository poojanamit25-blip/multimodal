import React, { useState, useEffect } from 'react';
import {
  Flame, Volume2, VolumeX, RotateCcw, Check, X,
  ChevronRight, Sparkles, BookOpen, Clock, Play, Pause,
  Layers, ArrowRight
} from 'lucide-react';
import { Flashcard, Citation } from '../types';
import { api } from '../api/client';

interface RevisionCenterProps {
  courseId: string;
  onOpenCitation: (citation: Citation) => void;
  onCardReviewed?: () => void;
}

export const RevisionCenter: React.FC<RevisionCenterProps> = ({
  courseId,
  onOpenCitation,
  onCardReviewed,
}) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Audio revision summary state
  const [topicsList, setTopicsList] = useState<string[]>([
    'Consensus & Raft Protocol',
    'Two-Phase Commit (2PC)',
    'CAP Theorem',
    'Matrices, Vectors: Addition and Scalar Multiplication',
    'Linear Systems of Equations. Gauss Elimination'
  ]);
  const [selectedTopic, setSelectedTopic] = useState('Consensus & Raft Protocol');
  const [revisionSummary, setRevisionSummary] = useState<any>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    loadFlashcards();
    // Fetch all active topics dynamically across uploaded textbooks and slides
    api.getCourseTopics(courseId)
      .then((topics) => {
        if (topics && topics.length > 0) {
          setTopicsList(topics);
          setSelectedTopic(topics[0]);
          loadTopicRevision(topics[0]);
        } else {
          loadTopicRevision(selectedTopic);
        }
      })
      .catch((err) => {
        console.error('Failed to load course topics:', err);
        loadTopicRevision(selectedTopic);
      });
  }, [courseId]);

  const loadFlashcards = async () => {
    setIsLoading(true);
    try {
      const res = await api.getFlashcards(courseId);
      setFlashcards(res);
      setCurrentCardIndex(0);
      setIsFlipped(false);
    } catch (err: any) {
      console.error('Failed to load flashcards:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTopicRevision = async (topic: string) => {
    try {
      const res = await api.getRevisionSummary(courseId, topic);
      setRevisionSummary(res);
      setSelectedTopic(topic);
      if (isPlayingAudio) {
        window.speechSynthesis?.cancel();
        setIsPlayingAudio(false);
      }
    } catch (err: any) {
      console.error('Failed to load revision summary:', err);
    }
  };

  const handleReviewCard = async (quality: number) => {
    if (flashcards.length === 0) return;
    const card = flashcards[currentCardIndex];
    try {
      await api.reviewFlashcard(card.id, quality);
      if (onCardReviewed) {
        onCardReviewed();
      }
      // Advance to next card
      if (currentCardIndex < flashcards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
        setIsFlipped(false);
      } else {
        alert('Spaced repetition deck completed for today! Great job maintaining your memory retention.');
        loadFlashcards();
      }
    } catch (err: any) {
      alert(`Error reviewing card: ${err.message}`);
    }
  };

  const toggleAudioSummary = () => {
    if (!('speechSynthesis' in window) || !revisionSummary) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(revisionSummary.audio_script);
    utterance.rate = 1.0;
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  const currentCard = flashcards[currentCardIndex];

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', maxWidth: '54rem', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
          <Flame size={22} style={{ color: 'var(--accent-amber)' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>
            Smart Revision Centre & Memory Retention
          </h2>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Spaced Repetition Flashcards (SuperMemo-2 algorithm) and Rapid 2-minute Audio Synthesized Summaries
          for high-stakes exam review.
        </p>
      </div>

      {/* Section 1: Spaced Repetition Flashcards */}
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={17} style={{ color: 'var(--accent-indigo)' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>
              Active Flashcard Deck
            </h3>
            <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>
              {flashcards.length > 0 ? `${currentCardIndex + 1} of ${flashcards.length}` : 'Completed'}
            </span>
          </div>

          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            Click card to flip
          </span>
        </div>

        {currentCard ? (
          <div>
            {/* Flip Card Container */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              style={{
                minHeight: '13rem',
                backgroundColor: 'var(--bg-app)',
                border: `2px solid ${isFlipped ? 'var(--accent-indigo)' : 'var(--border-subtle)'}`,
                borderRadius: '0.75rem',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: 'var(--shadow-sm)',
                marginBottom: '1.25rem',
              }}
            >
              <div
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: isFlipped ? 'var(--accent-emerald)' : 'var(--accent-indigo)',
                  textTransform: 'uppercase',
                  marginBottom: '0.75rem',
                }}
              >
                {isFlipped ? 'Answer / Concept Invariant' : `Question • ${currentCard.topic_name}`}
              </div>

              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#ffffff', lineHeight: 1.5 }}>
                {isFlipped ? currentCard.back : currentCard.front}
              </div>

              {isFlipped && currentCard.source_citation && (
                <div
                  style={{
                    marginTop: '1.25rem',
                    fontSize: '0.75rem',
                    color: 'var(--accent-cyan)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (currentCard.source_citation) {
                      onOpenCitation(currentCard.source_citation as any);
                    }
                  }}
                >
                  <BookOpen size={13} />
                  <span>Verified in {currentCard.source_citation.source_title}</span>
                </div>
              )}
            </div>

            {/* SM-2 Quality Rating Buttons */}
            {isFlipped ? (
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'center', marginBottom: '0.6rem' }}>
                  How well did you recall this concept? (SuperMemo-2 Spaced Schedule)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleReviewCard(1)}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '0.375rem',
                      backgroundColor: 'rgba(244, 63, 94, 0.15)',
                      color: '#fb7185',
                      border: '1px solid rgba(244, 63, 94, 0.3)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Forgot (1d)
                  </button>
                  <button
                    onClick={() => handleReviewCard(3)}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '0.375rem',
                      backgroundColor: 'rgba(245, 158, 11, 0.15)',
                      color: '#fbbf24',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Hard (2d)
                  </button>
                  <button
                    onClick={() => handleReviewCard(4)}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '0.375rem',
                      backgroundColor: 'rgba(59, 130, 246, 0.15)',
                      color: '#60a5fa',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Good (4d)
                  </button>
                  <button
                    onClick={() => handleReviewCard(5)}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '0.375rem',
                      backgroundColor: 'rgba(16, 185, 129, 0.15)',
                      color: '#34d399',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Perfect (7d)
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={() => setIsFlipped(true)}
                  className="btn-secondary"
                  style={{ padding: '0.5rem 1.5rem', fontSize: '0.825rem' }}
                >
                  <span>Reveal Answer</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
            All due cards completed for today!
          </div>
        )}
      </div>

      {/* Section 2: Rapid Audio Summary & Revision Takeaways */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Volume2 size={17} style={{ color: 'var(--accent-cyan)' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>
              2-Minute Rapid Audio Revision Recap
            </h3>
          </div>

          {/* Topic Selector */}
          <select
            value={selectedTopic}
            onChange={(e) => loadTopicRevision(e.target.value)}
            style={{
              padding: '0.35rem 0.75rem',
              backgroundColor: 'var(--bg-app)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '0.375rem',
              color: 'var(--text-main)',
              fontSize: '0.75rem',
              fontWeight: 600,
              outline: 'none',
            }}
          >
            {topicsList.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {revisionSummary && (
          <div>
            {/* Audio Player Card */}
            <div
              style={{
                backgroundColor: 'var(--bg-app)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '0.5rem',
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                  onClick={toggleAudioSummary}
                  className="btn-primary"
                  style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    borderRadius: '50%',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isPlayingAudio ? <Pause size={16} /> : <Play size={16} style={{ marginLeft: 2 }} />}
                </button>

                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
                    {selectedTopic} • Rapid Audio Recap
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Synthesized speech via Web Speech API • ~{revisionSummary.estimated_listen_time_seconds}s
                  </div>
                </div>
              </div>

              <span className={`badge ${isPlayingAudio ? 'badge-emerald' : 'badge-indigo'}`}>
                {isPlayingAudio ? 'Playing Audio' : 'Ready'}
              </span>
            </div>

            {/* Bullet Takeaways */}
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                CORE EXAM INVARIANTS:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {revisionSummary.key_takeaways?.map((bullet: string, bIdx: number) => (
                  <div
                    key={bIdx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.5rem',
                      fontSize: '0.8rem',
                      color: 'var(--text-main)',
                      lineHeight: 1.4,
                    }}
                  >
                    <ArrowRight size={13} style={{ color: 'var(--accent-cyan)', marginTop: '0.2rem', flexShrink: 0 }} />
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
