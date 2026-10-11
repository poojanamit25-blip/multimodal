import React, { useState, useEffect } from 'react';
import {
  Search, MessageSquare, BookOpen, CheckSquare, GitFork,
  Flame, Calendar, BarChart2, ShieldCheck, X, Globe, Moon, Sun
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
  onAskTutor: (query: string) => void;
  onToggleLanguage: () => void;
  onToggleTheme: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onAskTutor,
  onToggleLanguage,
  onToggleTheme,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          setQuery('');
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    { id: 'tutor', title: 'Open AI Tutor & Grounded Viewer', icon: MessageSquare, category: 'Navigation' },
    { id: 'quiz', title: 'Start Adaptive Quiz or Mock Exam', icon: CheckSquare, category: 'Navigation' },
    { id: 'map', title: 'Explore Concept Knowledge Map', icon: GitFork, category: 'Navigation' },
    { id: 'revision', title: 'Open Revision Centre & Spaced Flashcards', icon: Flame, category: 'Navigation' },
    { id: 'planner', title: 'View 7-Day Study Schedule & Exam Countdown', icon: Calendar, category: 'Navigation' },
    { id: 'learner', title: 'Inspect Learner Mastery Profile (BKT)', icon: BarChart2, category: 'Navigation' },
    { id: 'eval', title: 'Run QA & RAGAS Benchmark Suite', icon: ShieldCheck, category: 'Evaluation' },
    { id: 'lang', title: 'Toggle Language: English / Hindi Bilingual', icon: Globe, category: 'Settings', action: onToggleLanguage },
    { id: 'theme', title: 'Toggle Dark / Light Workspace Theme', icon: Moon, category: 'Settings', action: onToggleTheme },
  ];

  const quickQuestions = [
    'How does Raft leader election work and why are election timeouts randomized?',
    'Why is Two-Phase Commit a blocking protocol on coordinator crash?',
    'What is Brewer\'s CAP theorem trade-off under network partition?',
    'What are quorum bounds for crash failures (2f+1) vs Byzantine faults (3f+1)?',
  ];

  const filteredActions = actions.filter((a) =>
    a.title.toLowerCase().includes(query.toLowerCase())
  );

  const filteredQuestions = quickQuestions.filter((q) =>
    q.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '6rem',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '36rem',
          maxWidth: '92%',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-active)',
          borderRadius: '0.75rem',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar Input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.85rem 1.25rem',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-input)',
          }}
        >
          <Search size={18} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search concepts, navigate views, or ask tutor..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#ffffff',
              fontSize: '0.95rem',
            }}
          />
          <span
            style={{
              fontSize: '0.7rem',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              padding: '0.15rem 0.4rem',
              borderRadius: '0.25rem',
              color: 'var(--text-dim)',
            }}
          >
            ESC
          </span>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: '22rem', overflowY: 'auto', padding: '0.5rem' }}>
          {filteredActions.length > 0 && (
            <div style={{ marginBottom: '0.5rem' }}>
              <div style={{ padding: '0.35rem 0.75rem', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                Actions & Views
              </div>
              {filteredActions.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.action) item.action();
                      else onNavigate(item.id);
                      onClose();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '0.375rem',
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: 'var(--text-main)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '0.825rem',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <Icon size={16} style={{ color: 'var(--accent-indigo)' }} />
                    <span style={{ flex: 1 }}>{item.title}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{item.category}</span>
                  </button>
                );
              })}
            </div>
          )}

          {filteredQuestions.length > 0 && (
            <div>
              <div style={{ padding: '0.35rem 0.75rem', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                Ask Grounded Tutor Direct
              </div>
              {filteredQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onAskTutor(q);
                    onClose();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '0.375rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#e2e8f0',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '0.8rem',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <MessageSquare size={15} style={{ color: 'var(--accent-cyan)' }} />
                  <span style={{ flex: 1 }}>"{q}"</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
