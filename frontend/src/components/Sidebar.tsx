import React from 'react';
import {
  MessageSquare, BookOpen, CheckSquare, GitFork, Flame, Calendar,
  BarChart2, ShieldCheck, ChevronLeft, ChevronRight, Sparkles, Folder
} from 'lucide-react';
import { LearnerProfile } from '../types';

interface SidebarProps {
  activeView: string;
  onSelectView: (view: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  dueFlashcardsCount: number;
  profile?: LearnerProfile | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  collapsed,
  onToggleCollapse,
  dueFlashcardsCount,
  profile,
}) => {
  const navItems = [
    {
      id: 'workspace',
      label: 'Study Workspace',
      subtitle: 'Central study launchpad',
      icon: Sparkles,
      badge: 'Hub',
      badgeColor: 'badge-indigo',
    },
    {
      id: 'tutor',
      label: 'AI Tutor',
      subtitle: 'Source-grounded chat',
      icon: MessageSquare,
      badge: 'Active',
      badgeColor: 'badge-indigo',
    },
    {
      id: 'materials',
      label: 'Course Library',
      subtitle: 'Textbooks & slides',
      icon: BookOpen,
      badge: '',
      badgeColor: 'badge-blue',
    },
    {
      id: 'quiz',
      label: 'Adaptive Practice',
      subtitle: 'Quizzes & mock exams',
      icon: CheckSquare,
      badge: 'Adaptive',
      badgeColor: 'badge-emerald',
    },
    {
      id: 'map',
      label: 'Knowledge Graph',
      subtitle: 'Visual concept map',
      icon: GitFork,
      badge: '',
      badgeColor: 'badge-blue',
    },
    {
      id: 'revision',
      label: 'Smart Revision',
      subtitle: 'Flashcards & audio recaps',
      icon: Flame,
      badge: dueFlashcardsCount > 0 ? `${dueFlashcardsCount} Due` : '',
      badgeColor: 'badge-amber',
    },
    {
      id: 'planner',
      label: 'Study Planner',
      subtitle: '7-day exam countdown',
      icon: Calendar,
      badge: '7d',
      badgeColor: 'badge-blue',
    },
    {
      id: 'learner',
      label: 'Learner Analytics',
      subtitle: 'BKT mastery profile',
      icon: BarChart2,
      badge: '',
      badgeColor: 'badge-emerald',
    },
    {
      id: 'eval',
      label: 'QA & Evaluation',
      subtitle: 'RAGAS benchmark suite',
      icon: ShieldCheck,
      badge: 'RAGAS',
      badgeColor: 'badge-rose',
    },
  ];

  const overallMastery = profile ? Math.round(profile.overall_mastery * 100) : 74;

  return (
    <aside
      style={{
        width: collapsed ? '4.75rem' : '17rem',
        backgroundColor: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-default)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        userSelect: 'none',
        flexShrink: 0,
        zIndex: 20,
      }}
    >
      {/* Top: Navigation Section */}
      <div style={{ padding: '1rem 0.65rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {!collapsed && (
          <div
            style={{
              padding: '0.25rem 0.75rem 0.5rem 0.75rem',
              fontSize: '0.68rem',
              fontWeight: 700,
              color: 'var(--text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Study Workspace
          </div>
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              title={collapsed ? item.label : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                width: '100%',
                padding: collapsed ? '0.75rem 0' : '0.65rem 0.85rem',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: '0.65rem',
                backgroundColor: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                border: `1px solid ${isActive ? 'rgba(59, 130, 246, 0.3)' : 'transparent'}`,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                position: 'relative',
                fontFamily: 'var(--font-sans)',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'var(--bg-card)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {isActive && (
                <span
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '0.5rem',
                    bottom: '0.5rem',
                    width: '3px',
                    borderRadius: '0 3px 3px 0',
                    backgroundColor: 'var(--accent-blue)',
                    boxShadow: '0 0 8px rgba(59, 130, 246, 0.6)',
                  }}
                />
              )}
              <Icon
                size={19}
                style={{
                  color: isActive ? 'var(--accent-blue)' : 'inherit',
                  flexShrink: 0,
                }}
              />
              {!collapsed && (
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, textAlign: 'left', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <span
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {item.label}
                    </span>
                    {item.badge && item.badge !== '' && (
                      <span className={`badge ${item.badgeColor}`} style={{ fontSize: '0.62rem', padding: '0.1rem 0.4rem' }}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.subtitle}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom: Mastery Progress Card & Collapse Toggle */}
      <div style={{ padding: '0.75rem 0.65rem', borderTop: '1px solid var(--border-default)', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {!collapsed && (
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              borderRadius: '0.75rem',
              padding: '0.85rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                Course Mastery
              </span>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#34d399' }}>
                {overallMastery}%
              </span>
            </div>
            {/* Progress Bar */}
            <div
              style={{
                height: '5px',
                width: '100%',
                backgroundColor: 'var(--border-subtle)',
                borderRadius: '9999px',
                overflow: 'hidden',
                marginBottom: '0.5rem',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${overallMastery}%`,
                  background: 'linear-gradient(90deg, #3b82f6 0%, #10b981 100%)',
                  borderRadius: '9999px',
                  transition: 'width 0.7s ease',
                }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
              <span>{dueFlashcardsCount} cards due</span>
              <span>Exam in 7 days</span>
            </div>
          </div>
        )}

        {/* Collapse Button */}
        <button
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            width: '100%',
            padding: '0.55rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-tertiary)',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontSize: '0.75rem',
            fontWeight: 500,
            transition: 'color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
        >
          {!collapsed && <span>Collapse Sidebar</span>}
          {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
        </button>
      </div>
    </aside>
  );
};
export default Sidebar;
