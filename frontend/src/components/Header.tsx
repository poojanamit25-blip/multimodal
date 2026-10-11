import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles, Search, Moon, Sun, ChevronDown, CheckCircle2,
  Play, LogOut, Compass, Bell, Layers, CheckSquare,
  GitFork, Flame, Upload, LayoutDashboard, X, Globe
} from 'lucide-react';
import { Course, LearnerProfile, GoogleUser } from '../types';

interface HeaderProps {
  courses: Course[];
  selectedCourseId: string;
  onSelectCourse: (id: string) => void;
  profile: LearnerProfile | null;
  currentUser?: GoogleUser | null;
  activeView: string;
  preferredLanguage: string;
  onToggleLanguage: () => void;
  isDarkTheme: boolean;
  onToggleTheme: () => void;
  backendOnline: boolean;
  onOpenCommandPalette: () => void;
  onRunPractice?: () => void;
  onOpenSetup?: () => void;
  onSignOut?: () => void;
  onNavigate?: (view: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  courses,
  selectedCourseId,
  onSelectCourse,
  profile,
  currentUser,
  activeView,
  preferredLanguage,
  onToggleLanguage,
  isDarkTheme,
  onToggleTheme,
  backendOnline,
  onOpenCommandPalette,
  onRunPractice,
  onOpenSetup,
  onSignOut,
  onNavigate,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCourseMenu, setShowCourseMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const courseMenuRef = useRef<HTMLDivElement>(null);

  const currentCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];

  const navItems = [
    { id: 'workspace', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tutor', label: 'AI Tutor', icon: Sparkles },
    { id: 'materials', label: 'Materials', icon: Layers },
    { id: 'quiz', label: 'Mock Test', icon: CheckSquare },
    { id: 'map', label: 'Topics', icon: GitFork },
    { id: 'revision', label: 'Flashcards', icon: Flame },
  ];

  const userName = currentUser?.name || profile?.name || 'Student';
  const userInitial = userName.charAt(0).toUpperCase();
  const masteryPct = profile ? Math.round(profile.overall_mastery * 100) : 0;

  // Close menus on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
      if (courseMenuRef.current && !courseMenuRef.current.contains(e.target as Node)) {
        setShowCourseMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const headerBg = isDarkTheme
    ? 'rgba(11, 13, 20, 0.9)'
    : 'rgba(255, 255, 255, 0.92)';
  const headerBorder = isDarkTheme
    ? 'rgba(255, 255, 255, 0.07)'
    : 'rgba(15, 23, 42, 0.09)';

  return (
    <header
      style={{
        height: '3.85rem',
        borderBottom: `1px solid ${headerBorder}`,
        backgroundColor: headerBg,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        gap: '1rem',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        userSelect: 'none',
      }}
    >
      {/* ── Left: Brand + Course Selector ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
        {/* Logo */}
        <button
          onClick={() => onNavigate && onNavigate('workspace')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.25rem 0.35rem',
            borderRadius: '0.5rem',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = isDarkTheme
              ? 'rgba(255,255,255,0.05)'
              : 'rgba(15,23,42,0.05)';
          }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
        >
          {/* Gradient logo icon */}
          <div
            style={{
              width: '1.9rem',
              height: '1.9rem',
              borderRadius: '0.5rem',
              background: 'linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 12px rgba(59,130,246,0.4)',
              flexShrink: 0,
            }}
          >
            <Sparkles size={12} color="#ffffff" strokeWidth={2.5} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span
              style={{
                fontWeight: 800,
                fontSize: '0.9rem',
                letterSpacing: '-0.03em',
                background: isDarkTheme
                  ? 'linear-gradient(135deg, #f1f5f9 0%, #94a3b8 100%)'
                  : 'linear-gradient(135deg, #0f172a 0%, #475569 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Synapse
            </span>
            <span
              style={{
                fontSize: '0.56rem',
                fontWeight: 600,
                color: isDarkTheme ? '#475569' : '#94a3b8',
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
              }}
            >
              AI Companion
            </span>
          </div>
        </button>

        {/* Divider */}
        <div
          style={{
            width: '1px',
            height: '1.4rem',
            background: isDarkTheme ? 'rgba(255,255,255,0.07)' : 'rgba(15,23,42,0.1)',
            flexShrink: 0,
          }}
        />

        {/* Course Pill Selector */}
        <div ref={courseMenuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowCourseMenu(!showCourseMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: isDarkTheme ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)',
              border: `1px solid ${isDarkTheme ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.1)'}`,
              borderRadius: '2rem',
              padding: '0.32rem 0.75rem 0.32rem 0.65rem',
              cursor: 'pointer',
              color: isDarkTheme ? '#94a3b8' : '#475569',
              fontSize: '0.78rem',
              fontWeight: 600,
              fontFamily: 'var(--font-sans)',
              transition: 'all 0.15s ease',
              maxWidth: '14rem',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDarkTheme
                ? 'rgba(255,255,255,0.07)'
                : 'rgba(15,23,42,0.07)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isDarkTheme
                ? 'rgba(255,255,255,0.04)'
                : 'rgba(15,23,42,0.04)';
            }}
          >
            <span
              style={{
                width: '0.45rem',
                height: '0.45rem',
                borderRadius: '50%',
                backgroundColor: backendOnline ? '#10b981' : '#64748b',
                boxShadow: backendOnline ? '0 0 6px #10b981' : 'none',
                flexShrink: 0,
              }}
            />
            <span
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '9rem',
                color: isDarkTheme ? '#e2e8f0' : '#1e293b',
              }}
            >
              {currentCourse
                ? `${currentCourse.code}`
                : 'Select Course'}
            </span>
            <ChevronDown
              size={11}
              style={{
                flexShrink: 0,
                transform: showCourseMenu ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s ease',
              }}
            />
          </button>

          {showCourseMenu && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 0.5rem)',
                left: 0,
                minWidth: '16rem',
                backgroundColor: isDarkTheme ? '#0f1117' : '#ffffff',
                border: `1px solid ${isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.1)'}`,
                borderRadius: '0.85rem',
                boxShadow: isDarkTheme
                  ? '0 16px 48px rgba(0,0,0,0.6)'
                  : '0 16px 48px rgba(15,23,42,0.12)',
                padding: '0.5rem',
                zIndex: 100,
                animation: 'scaleIn 0.15s ease',
              }}
            >
              <div
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: isDarkTheme ? '#64748b' : '#94a3b8',
                  padding: '0.3rem 0.65rem 0.4rem',
                }}
              >
                Your Courses
              </div>
              {courses.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    onSelectCourse(c.id);
                    setShowCourseMenu(false);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.55rem 0.7rem',
                    borderRadius: '0.55rem',
                    background:
                      c.id === selectedCourseId
                        ? isDarkTheme
                          ? 'rgba(59,130,246,0.1)'
                          : 'rgba(59,130,246,0.07)'
                        : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.12s ease',
                    fontFamily: 'var(--font-sans)',
                  }}
                  onMouseEnter={(e) => {
                    if (c.id !== selectedCourseId) {
                      e.currentTarget.style.background = isDarkTheme
                        ? 'rgba(255,255,255,0.05)'
                        : 'rgba(15,23,42,0.04)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (c.id !== selectedCourseId) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <div
                    style={{
                      width: '0.5rem',
                      height: '0.5rem',
                      borderRadius: '50%',
                      background:
                        c.id === selectedCourseId
                          ? 'linear-gradient(135deg, #3b82f6, #7c3aed)'
                          : isDarkTheme
                          ? '#374151'
                          : '#cbd5e1',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ overflow: 'hidden' }}>
                    <div
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color:
                          c.id === selectedCourseId
                            ? '#3b82f6'
                            : isDarkTheme
                            ? '#e2e8f0'
                            : '#1e293b',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {c.code}
                    </div>
                    <div
                      style={{
                        fontSize: '0.68rem',
                        color: isDarkTheme ? '#64748b' : '#94a3b8',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '12rem',
                      }}
                    >
                      {c.title}
                    </div>
                  </div>
                  {c.id === selectedCourseId && (
                    <CheckCircle2
                      size={13}
                      style={{ marginLeft: 'auto', color: '#3b82f6', flexShrink: 0 }}
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Center: Pill Navigation ── */}
      {onNavigate && (
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.2rem',
            background: isDarkTheme ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)',
            border: `1px solid ${isDarkTheme ? 'rgba(255,255,255,0.07)' : 'rgba(15,23,42,0.08)'}`,
            borderRadius: '2rem',
            padding: '0.25rem',
          }}
        >
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                title={item.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: isActive ? '0.35rem 0.9rem' : '0.35rem 0.65rem',
                  borderRadius: '2rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.76rem',
                  fontWeight: isActive ? 600 : 500,
                  fontFamily: 'var(--font-sans)',
                  transition: 'all 0.18s ease',
                  background: isActive
                    ? 'linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%)'
                    : 'transparent',
                  color: isActive
                    ? '#ffffff'
                    : isDarkTheme
                    ? '#64748b'
                    : '#94a3b8',
                  boxShadow: isActive ? '0 2px 10px rgba(59,130,246,0.3)' : 'none',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = isDarkTheme
                      ? 'rgba(255,255,255,0.06)'
                      : 'rgba(15,23,42,0.06)';
                    e.currentTarget.style.color = isDarkTheme ? '#94a3b8' : '#475569';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = isDarkTheme ? '#64748b' : '#94a3b8';
                  }
                }}
              >
                <Icon size={13} strokeWidth={isActive ? 2.5 : 2} />
                {isActive && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
      )}

      {/* ── Right: Action Controls ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
        {/* Upload Material */}
        {onNavigate && (
          <button
            onClick={() => onNavigate('materials')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'var(--accent-blue-muted)',
              border: '1px solid var(--accent-blue-border)',
              color: 'var(--accent-blue)',
              borderRadius: '2rem',
              padding: '0.38rem 0.9rem',
              fontSize: '0.76rem',
              fontWeight: 600,
              fontFamily: 'var(--font-sans)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(59,130,246,0.18)';
              e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--accent-blue-muted)';
              e.currentTarget.style.borderColor = 'var(--accent-blue-border)';
            }}
          >
            <Upload size={12} strokeWidth={2.5} />
            <span>Upload</span>
          </button>
        )}

        {/* Search */}
        <button
          onClick={onOpenCommandPalette}
          title="Search (⌘K)"
          style={{
            width: '2rem',
            height: '2rem',
            borderRadius: '0.5rem',
            background: isDarkTheme ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)',
            border: `1px solid ${isDarkTheme ? 'rgba(255,255,255,0.07)' : 'rgba(15,23,42,0.08)'}`,
            color: isDarkTheme ? '#64748b' : '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = isDarkTheme ? '#f1f5f9' : '#0f172a';
            e.currentTarget.style.borderColor = isDarkTheme
              ? 'rgba(255,255,255,0.15)'
              : 'rgba(15,23,42,0.18)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = isDarkTheme ? '#64748b' : '#94a3b8';
            e.currentTarget.style.borderColor = isDarkTheme
              ? 'rgba(255,255,255,0.07)'
              : 'rgba(15,23,42,0.08)';
          }}
        >
          <Search size={14} />
        </button>

        {/* Language Toggle */}
        <button
          onClick={onToggleLanguage}
          title="Toggle Language"
          style={{
            width: '2rem',
            height: '2rem',
            borderRadius: '0.5rem',
            background:
              preferredLanguage === 'hi'
                ? 'var(--accent-violet-muted)'
                : isDarkTheme
                ? 'rgba(255,255,255,0.04)'
                : 'rgba(15,23,42,0.04)',
            border: `1px solid ${
              preferredLanguage === 'hi'
                ? 'var(--accent-violet-border)'
                : isDarkTheme
                ? 'rgba(255,255,255,0.07)'
                : 'rgba(15,23,42,0.08)'
            }`,
            color:
              preferredLanguage === 'hi'
                ? '#8b5cf6'
                : isDarkTheme
                ? '#64748b'
                : '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            flexShrink: 0,
          }}
        >
          <Globe size={13} />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          title={isDarkTheme ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{
            width: '2rem',
            height: '2rem',
            borderRadius: '0.5rem',
            background: isDarkTheme ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)',
            border: `1px solid ${isDarkTheme ? 'rgba(255,255,255,0.07)' : 'rgba(15,23,42,0.08)'}`,
            color: isDarkTheme ? '#64748b' : '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = isDarkTheme ? '#f1f5f9' : '#0f172a';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = isDarkTheme ? '#64748b' : '#94a3b8';
          }}
        >
          {isDarkTheme ? <Sun size={14} /> : <Moon size={14} />}
        </button>

        {/* Bell */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button
            title="Notifications"
            style={{
              width: '2rem',
              height: '2rem',
              borderRadius: '0.5rem',
              background: isDarkTheme ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)',
              border: `1px solid ${isDarkTheme ? 'rgba(255,255,255,0.07)' : 'rgba(15,23,42,0.08)'}`,
              color: isDarkTheme ? '#64748b' : '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Bell size={14} />
          </button>
          <div
            style={{
              position: 'absolute',
              top: '0.35rem',
              right: '0.35rem',
              width: '0.38rem',
              height: '0.38rem',
              borderRadius: '50%',
              backgroundColor: '#f59e0b',
            }}
          />
        </div>

        {/* Start Practice CTA */}
        {onRunPractice && (
          <button
            onClick={onRunPractice}
            className="btn-primary"
            style={{ padding: '0.42rem 1rem', fontSize: '0.76rem', gap: '0.38rem' }}
          >
            <Play size={12} fill="#ffffff" strokeWidth={0} />
            <span>Practice</span>
          </button>
        )}

        {/* User Profile Chip */}
        <div ref={profileMenuRef} style={{ position: 'relative', flexShrink: 0 }}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: isDarkTheme ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)',
              border: `1px solid ${isDarkTheme ? 'rgba(255,255,255,0.07)' : 'rgba(15,23,42,0.1)'}`,
              padding: '0.22rem 0.65rem 0.22rem 0.28rem',
              borderRadius: '2rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              fontFamily: 'var(--font-sans)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = isDarkTheme
                ? 'rgba(59,130,246,0.4)'
                : 'rgba(59,130,246,0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = isDarkTheme
                ? 'rgba(255,255,255,0.07)'
                : 'rgba(15,23,42,0.1)';
            }}
          >
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={userName}
                style={{
                  width: '1.65rem',
                  height: '1.65rem',
                  borderRadius: '50%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <div
                style={{
                  width: '1.65rem',
                  height: '1.65rem',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3b82f6, #7c3aed)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  flexShrink: 0,
                }}
              >
                {userInitial}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: isDarkTheme ? '#e2e8f0' : '#1e293b',
                  lineHeight: 1.15,
                  maxWidth: '6rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {userName.split(' ')[0]}
              </span>
              <span
                style={{
                  fontSize: '0.6rem',
                  color: masteryPct > 70 ? '#10b981' : '#f59e0b',
                  fontWeight: 600,
                  lineHeight: 1.1,
                }}
              >
                {masteryPct}% Mastery
              </span>
            </div>
            <ChevronDown
              size={11}
              style={{
                color: isDarkTheme ? '#64748b' : '#94a3b8',
                transform: showProfileMenu ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.18s ease',
              }}
            />
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 0.6rem)',
                right: 0,
                width: '16rem',
                backgroundColor: isDarkTheme ? '#0f1117' : '#ffffff',
                border: `1px solid ${isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.1)'}`,
                borderRadius: '0.9rem',
                boxShadow: isDarkTheme
                  ? '0 20px 48px rgba(0,0,0,0.7)'
                  : '0 20px 48px rgba(15,23,42,0.14)',
                padding: '0.6rem',
                zIndex: 200,
                animation: 'scaleIn 0.15s ease',
              }}
            >
              {/* Profile Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.7rem',
                  padding: '0.5rem 0.6rem 0.75rem',
                  borderBottom: `1px solid ${isDarkTheme ? 'rgba(255,255,255,0.07)' : 'rgba(15,23,42,0.07)'}`,
                  marginBottom: '0.4rem',
                }}
              >
                {currentUser?.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={userName}
                    style={{
                      width: '2.25rem',
                      height: '2.25rem',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid rgba(59,130,246,0.4)',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '2.25rem',
                      height: '2.25rem',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #3b82f6, #7c3aed)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      flexShrink: 0,
                    }}
                  >
                    {userInitial}
                  </div>
                )}
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: isDarkTheme ? '#f1f5f9' : '#0f172a',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {userName}
                  </div>
                  <div
                    style={{
                      fontSize: '0.68rem',
                      color: isDarkTheme ? '#64748b' : '#94a3b8',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {currentUser?.email || 'student@gmail.com'}
                  </div>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      marginTop: '0.25rem',
                      fontSize: '0.62rem',
                      fontWeight: 600,
                      color: '#10b981',
                    }}
                  >
                    <CheckCircle2 size={10} />
                    Google Verified
                  </div>
                </div>
              </div>

              {/* Mastery Progress */}
              <div
                style={{
                  padding: '0.5rem 0.65rem',
                  borderRadius: '0.55rem',
                  background: isDarkTheme ? 'rgba(59,130,246,0.07)' : 'rgba(59,130,246,0.05)',
                  marginBottom: '0.4rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.45rem',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.68rem',
                      color: isDarkTheme ? '#94a3b8' : '#475569',
                      fontWeight: 500,
                    }}
                  >
                    Overall Mastery
                  </span>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: masteryPct > 70 ? '#10b981' : '#f59e0b',
                    }}
                  >
                    {masteryPct}%
                  </span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${masteryPct}%` }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                {onOpenSetup && (
                  <MenuAction
                    icon={<Compass size={14} color="#3b82f6" />}
                    label="Change Study Focus"
                    isDark={isDarkTheme}
                    onClick={() => { setShowProfileMenu(false); onOpenSetup(); }}
                  />
                )}
                {onSignOut && (
                  <MenuAction
                    icon={<LogOut size={14} color="#f43f5e" />}
                    label="Sign Out"
                    isDark={isDarkTheme}
                    danger
                    onClick={() => { setShowProfileMenu(false); onSignOut(); }}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

const MenuAction: React.FC<{
  icon: React.ReactNode;
  label: string;
  isDark: boolean;
  danger?: boolean;
  onClick: () => void;
}> = ({ icon, label, isDark, danger, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.6rem',
      padding: '0.5rem 0.65rem',
      borderRadius: '0.55rem',
      background: 'transparent',
      border: 'none',
      color: danger ? '#f43f5e' : isDark ? '#94a3b8' : '#475569',
      fontSize: '0.78rem',
      fontWeight: 500,
      cursor: 'pointer',
      textAlign: 'left',
      width: '100%',
      fontFamily: 'var(--font-sans)',
      transition: 'background 0.12s ease',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = danger
        ? 'rgba(244,63,94,0.08)'
        : isDark
        ? 'rgba(255,255,255,0.06)'
        : 'rgba(15,23,42,0.05)';
    }}
    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default Header;
