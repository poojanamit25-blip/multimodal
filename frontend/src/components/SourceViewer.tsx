import React, { useState, useEffect } from 'react';
import {
  FileText, Presentation, Video, Play, Pause, RotateCcw,
  ExternalLink, ZoomIn, ZoomOut, ChevronLeft, ChevronRight,
  Bookmark, CheckCircle2, Volume2, Sparkles, X
} from 'lucide-react';
import { Citation, DocumentItem, ContentUnit } from '../types';

interface SourceViewerProps {
  activeCitation: Citation | null;
  documents: DocumentItem[];
  onClose?: () => void;
}

export const SourceViewer: React.FC<SourceViewerProps> = ({
  activeCitation,
  documents,
  onClose,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayTime, setCurrentPlayTime] = useState(activeCitation?.timestamp_seconds || 860.0);
  const [currentPage, setCurrentPage] = useState<number>(activeCitation?.page_number || 24);
  const [currentSlide, setCurrentSlide] = useState<number>(activeCitation?.slide_number || 7);

  // Sync state whenever active citation changes
  useEffect(() => {
    if (activeCitation) {
      if (activeCitation.page_number) setCurrentPage(activeCitation.page_number);
      if (activeCitation.slide_number) setCurrentSlide(activeCitation.slide_number);
      if (activeCitation.timestamp_seconds !== undefined && activeCitation.timestamp_seconds !== null) {
        setCurrentPlayTime(activeCitation.timestamp_seconds);
      }
    }
  }, [activeCitation]);

  // Audio/video timer simulation
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentPlayTime((t) => (t >= 2535 ? 0 : t + 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const fileType = activeCitation?.file_type || 'textbook';
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--bg-panel)',
        borderLeft: '1px solid var(--border-subtle)',
        overflow: 'hidden',
      }}
    >
      {/* Top Header */}
      <div
        style={{
          padding: '0.75rem 1rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-card)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {fileType === 'textbook' && <FileText size={17} style={{ color: '#60a5fa' }} />}
          {fileType === 'slides' && <Presentation size={17} style={{ color: '#f59e0b' }} />}
          {fileType === 'lecture_video' && <Video size={17} style={{ color: '#a855f7' }} />}
          <div>
            <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {activeCitation ? activeCitation.source_title : 'Source Document Inspector'}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {fileType === 'textbook' && `PDF Document • Page ${currentPage}`}
              {fileType === 'slides' && `PowerPoint Presentation • Slide ${currentSlide}`}
              {fileType === 'lecture_video' && `Lecture Recording • Timestamp ${formatTime(currentPlayTime)}`}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="badge badge-indigo">
            <CheckCircle2 size={12} />
            Verified Source
          </span>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-dim)',
                cursor: 'pointer',
                padding: '0.25rem',
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area based on File Type */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
        {fileType === 'textbook' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Page Navigation Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.5rem 0.75rem',
                backgroundColor: 'var(--bg-app)',
                borderRadius: '0.5rem',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-main)',
                    borderRadius: '0.375rem',
                    padding: '0.25rem 0.5rem',
                    cursor: 'pointer',
                  }}
                >
                  <ChevronLeft size={14} />
                </button>
                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                  Page {currentPage} of 45
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(45, p + 1))}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-main)',
                    borderRadius: '0.375rem',
                    padding: '0.25rem 0.5rem',
                    cursor: 'pointer',
                  }}
                >
                  <ChevronRight size={14} />
                </button>
              </div>

              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                Chapter 8: The Trouble with Distributed Systems
              </span>
            </div>

            {/* Simulated Textbook Page Reader */}
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '0.5rem',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-md)',
                lineHeight: 1.6,
                fontSize: '0.875rem',
              }}
            >
              <div
                style={{
                  borderBottom: '1px solid var(--border-subtle)',
                  paddingBottom: '0.75rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                  {currentPage === 24
                    ? '8.4 Formal Formulation of the CAP Theorem'
                    : currentPage === 25
                    ? '8.5 Strict Quorums & Replication Invariants'
                    : currentPage === 34
                    ? '9.2 Two-Phase Commit and The Coordinator Failure Mode'
                    : currentPage === 42
                    ? '9.6 Consensus Bounds: Crash vs Byzantine Resiliency'
                    : `Section on Page ${currentPage}`}
                </h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  p. {currentPage}
                </span>
              </div>

              {/* Highlighted Quote Box */}
              {activeCitation?.direct_quote && (
                <div
                  style={{
                    backgroundColor: 'rgba(99, 102, 241, 0.12)',
                    borderLeft: '4px solid var(--accent-indigo)',
                    padding: '0.75rem 1rem',
                    borderRadius: '0 0.375rem 0.375rem 0',
                    marginBottom: '1rem',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: '#a5b4fc',
                      textTransform: 'uppercase',
                      marginBottom: '0.25rem',
                    }}
                  >
                    Cited In Tutor Explanation
                  </div>
                  <div style={{ color: '#ffffff', fontStyle: 'italic', fontWeight: 500 }}>
                    "{activeCitation.direct_quote}"
                  </div>
                </div>
              )}

              {/* Surrounding Textbook Excerpt */}
              <p style={{ color: 'var(--text-main)', marginBottom: '0.75rem' }}>
                {currentPage === 24 &&
                  "The CAP theorem states that when a network partition (P) occurs, a distributed data store must choose between Consistency (Linearizability) and Availability. If the network between two datacenters is severed, you can either allow writes on both sides—which breaks linearizable consistency because clients read stale or conflicting records—or reject writes on the partitioned nodes until connectivity is restored, preserving consistency at the cost of availability."}
                {currentPage === 25 &&
                  "For a cluster of N replicas where W is the write quorum and R is the read quorum, strong consistency (linearizable overlap) requires: W + R > N. When this inequality holds, the set of nodes written to and the set of nodes read from must contain at least one overlapping node that holds the most up-to-date version timestamp."}
                {currentPage === 34 &&
                  "Two-Phase Commit (2PC) achieves atomic commitment across heterogeneous database nodes. In Phase 1 (Prepare), the coordinator asks all participants: 'Can you commit?' Each node executes local checks, writes a prepare log, and votes YES or NO. In Phase 2 (Commit), if all voted YES, the coordinator broadcasts COMMIT. However, 2PC is a blocking protocol. If the coordinator crashes after nodes vote YES, participant nodes are permanently stuck in doubt holding locks."}
                {currentPage === 42 &&
                  "In a distributed consensus system with f crash-recovery failures, a minimum cluster size of 2f + 1 nodes is strictly required to guarantee a majority quorum of f + 1 nodes. For example, a 5-node cluster tolerates f = 2 failures. Under Byzantine faults, the bound rises to 3f + 1 nodes."}
                {![24, 25, 34, 42].includes(currentPage) &&
                  "This section details the fundamental constraints governing distributed computing systems, focusing on fault detectors, partial networks, and the inability to distinguish node crashes from message delay."}
              </p>

              <div
                style={{
                  marginTop: '1.25rem',
                  padding: '0.5rem 0.75rem',
                  backgroundColor: 'var(--bg-app)',
                  borderRadius: '0.375rem',
                  fontSize: '0.75rem',
                  color: 'var(--text-dim)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Bookmark size={14} />
                <span>Textbook citation automatically verified against indexed vector store.</span>
              </div>
            </div>
          </div>
        )}

        {fileType === 'slides' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Slide Navigation */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.5rem 0.75rem',
                backgroundColor: 'var(--bg-app)',
                borderRadius: '0.5rem',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  onClick={() => setCurrentSlide((s) => Math.max(1, s - 1))}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-main)',
                    borderRadius: '0.375rem',
                    padding: '0.25rem 0.5rem',
                    cursor: 'pointer',
                  }}
                >
                  <ChevronLeft size={14} />
                </button>
                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                  Slide {currentSlide} of 15
                </span>
                <button
                  onClick={() => setCurrentSlide((s) => Math.min(15, s + 1))}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-main)',
                    borderRadius: '0.375rem',
                    padding: '0.25rem 0.5rem',
                    cursor: 'pointer',
                  }}
                >
                  <ChevronRight size={14} />
                </button>
              </div>

              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                CS401 Lecture 08 Slides
              </span>
            </div>

            {/* Slide Visual Presentation Frame */}
            <div
              style={{
                backgroundColor: '#181b24',
                border: '2px solid var(--border-active)',
                borderRadius: '0.5rem',
                padding: '1.75rem',
                aspectRatio: '16/9',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: 'var(--accent-amber)',
                    textTransform: 'uppercase',
                    marginBottom: '0.5rem',
                  }}
                >
                  Lecture Slide {currentSlide}
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', marginBottom: '1rem' }}>
                  {currentSlide === 3
                    ? 'Raft Node State Transitions'
                    : currentSlide === 7
                    ? 'Leader Election & Randomized Timeouts'
                    : currentSlide === 10
                    ? 'Log Replication & Commit Quorums'
                    : currentSlide === 14
                    ? 'Election Safety & Log Completeness Property'
                    : `Slide ${currentSlide}: Distributed Consensus Principles`}
                </h3>

                <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', color: '#e2e8f0', fontSize: '0.85rem' }}>
                  {currentSlide === 3 && (
                    <>
                      <li><strong>Follower</strong>: Passive, responds to incoming RPCs from leaders.</li>
                      <li><strong>Candidate</strong>: Initiates election when election timeout fires.</li>
                      <li><strong>Leader</strong>: Handles client requests, broadcasts AppendEntries heartbeats.</li>
                    </>
                  )}
                  {currentSlide === 7 && (
                    <>
                      <li>Randomized timeouts (150ms–300ms) prevent split-vote deadlocks.</li>
                      <li>Transitions to Candidate, votes for self, requests votes from peers.</li>
                      <li>Wins election upon securing majority quorum (N/2 + 1) votes.</li>
                    </>
                  )}
                  {currentSlide === 14 && (
                    <>
                      <li>Followers deny votes if candidate's log is less up-to-date.</li>
                      <li>Guarantees newly elected leader contains all committed entries.</li>
                      <li>Invariants prevent log overwrite or state divergence.</li>
                    </>
                  )}
                  {![3, 7, 14].includes(currentSlide) && (
                    <>
                      <li>Decomposing consensus into leader election, replication, and safety.</li>
                      <li>Ensuring uniform agreement across distributed state machines.</li>
                    </>
                  )}
                </ul>
              </div>

              {/* Presenter Notes */}
              <div
                style={{
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                  paddingTop: '0.75rem',
                  fontSize: '0.75rem',
                  color: 'var(--text-dim)',
                  fontStyle: 'italic',
                }}
              >
                <strong>Presenter Notes:</strong> Emphasize during lecture that Election Safety is the central inductive invariant proving Raft correctness.
              </div>
            </div>
          </div>
        )}

        {fileType === 'lecture_video' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Interactive Media Player Container */}
            <div
              style={{
                backgroundColor: '#0a0d14',
                border: '1px solid var(--border-subtle)',
                borderRadius: '0.5rem',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              {/* Video Simulated Canvas */}
              <div
                style={{
                  height: '13rem',
                  backgroundColor: '#111520',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundImage: 'radial-gradient(circle at center, #1e2436 0%, #0e121d 100%)',
                }}
              >
                <div style={{ textAlign: 'center', padding: '1rem' }}>
                  <div
                    style={{
                      width: '3.5rem',
                      height: '3.5rem',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(99, 102, 241, 0.25)',
                      border: '1px solid var(--accent-indigo)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      margin: '0 auto 0.75rem auto',
                      cursor: 'pointer',
                    }}
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? <Pause size={22} /> : <Play size={22} style={{ marginLeft: 3 }} />}
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
                    Prof. Alan Stone — Lecture 08
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    Fault Tolerance and the Raft Consensus Protocol
                  </div>
                </div>

                {/* Timestamp Badge Overlay */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '0.75rem',
                    right: '0.75rem',
                    background: 'rgba(0,0,0,0.7)',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#ffffff',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {formatTime(currentPlayTime)} / 42:15
                </div>
              </div>

              {/* Scrubber & Controls */}
              <div style={{ padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <input
                  type="range"
                  min="0"
                  max="2535"
                  value={currentPlayTime}
                  onChange={(e) => setCurrentPlayTime(parseFloat(e.target.value))}
                  style={{
                    width: '100%',
                    accentColor: 'var(--accent-indigo)',
                    cursor: 'pointer',
                  }}
                />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="btn-primary"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                    >
                      {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                      {isPlaying ? 'Pause' : 'Play'}
                    </button>
                    <button
                      onClick={() => setCurrentPlayTime(activeCitation?.timestamp_seconds || 860.0)}
                      className="btn-secondary"
                      style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                      title="Jump to Cited Timestamp"
                    >
                      <RotateCcw size={13} />
                      Jump to Citation
                    </button>
                  </div>

                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                    Speed: 1.0x
                  </span>
                </div>
              </div>
            </div>

            {/* Synchronized Transcript Segments */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                SYNCHRONIZED TRANSCRIPT
              </div>

              {[
                {
                  time: 255.0,
                  label: '04:15',
                  text: 'Why Paxos was so hard & why Ongaro created Raft for understandable decomposition.',
                },
                {
                  time: 860.0,
                  label: '14:20',
                  text: 'The Heartbeat mechanism and term discrepancy handling. If a leader receives an RPC with a term greater than its own currentTerm, it immediately steps down to Follower state.',
                },
                {
                  time: 1725.0,
                  label: '28:45',
                  text: 'Split-Brain prevention: Why odd numbers of nodes (3 or 5) matter and why 4 nodes give no additional fault tolerance.',
                },
                {
                  time: 2170.0,
                  label: '36:10',
                  text: 'Comparing Two-Phase Commit with Raft. In 2PC every node must agree; in Raft only a majority (N/2 + 1) needs to respond.',
                },
              ].map((seg, idx) => {
                const isCurrent = Math.abs(currentPlayTime - seg.time) < 180;
                return (
                  <div
                    key={idx}
                    onClick={() => setCurrentPlayTime(seg.time)}
                    style={{
                      padding: '0.65rem 0.85rem',
                      borderRadius: '0.375rem',
                      backgroundColor: isCurrent ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-card)',
                      border: `1px solid ${isCurrent ? 'var(--accent-indigo)' : 'var(--border-subtle)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          color: isCurrent ? '#a5b4fc' : 'var(--text-dim)',
                        }}
                      >
                        [{seg.label}]
                      </span>
                      {isCurrent && (
                        <span className="badge badge-indigo" style={{ fontSize: '0.6rem' }}>
                          Now Playing
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: isCurrent ? '#ffffff' : 'var(--text-muted)' }}>
                      {seg.text}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
