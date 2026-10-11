import React, { useState, useEffect } from 'react';
import {
  Sparkles, ArrowRight, CheckCircle2, Shield,
  BookOpen, BarChart3, Brain, Zap, ChevronRight,
  UserCheck, Star
} from 'lucide-react';
import { GoogleUser } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: GoogleUser, isNewStudent?: boolean) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const sampleAccounts: (GoogleUser & { tag: string; isNew: boolean; desc: string; color: string })[] = [
    {
      name: 'Poojana',
      email: 'poojana.student@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
      studentId: 'student_new_poojana',
      tag: 'New Student',
      isNew: true,
      desc: 'Set your goals & take a diagnostic mock test',
      color: '#3b82f6',
    },
    {
      name: 'Alex Chen',
      email: 'alex.chen@stanford.edu',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      studentId: 'student_alex',
      tag: 'Returning Student',
      isNew: false,
      desc: 'Resume study history — 84% accuracy tracked',
      color: '#7c3aed',
    },
  ];

  const handleSelectAccount = (user: GoogleUser & { isNew?: boolean }) => {
    setIsLoading(true);
    setShowAccountSelector(false);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(user, user.isNew ?? false);
    }, 700);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail) return;
    const name = customName.trim() || customEmail.split('@')[0];
    const user: GoogleUser = {
      name: name.charAt(0).toUpperCase() + name.slice(1),
      email: customEmail,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=3b82f6,7c3aed`,
      studentId: `student_${Math.random().toString(36).substring(2, 8)}`,
    };
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(user, true);
    }, 700);
  };

  const features = [
    {
      icon: <Brain size={16} />,
      color: '#3b82f6',
      bg: 'rgba(59,130,246,0.1)',
      title: 'Adaptive Learning',
      desc: 'Bayesian Knowledge Tracing personalizes every session',
    },
    {
      icon: <BookOpen size={16} />,
      color: '#7c3aed',
      bg: 'rgba(124,58,237,0.1)',
      title: 'Source Grounded',
      desc: 'Every answer cites your exact slide, page, or timestamp',
    },
    {
      icon: <BarChart3 size={16} />,
      color: '#10b981',
      bg: 'rgba(16,185,129,0.1)',
      title: 'Live Progress',
      desc: 'Real-time mastery tracking across all topics',
    },
    {
      icon: <Zap size={16} />,
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.1)',
      title: 'Instant Feedback',
      desc: 'AI grading with misconception analysis in seconds',
    },
  ];

  const stats = [
    { value: '94%', label: 'Average Accuracy' },
    { value: '3.2×', label: 'Faster Mastery' },
    { value: '50k+', label: 'Students' },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
        background: '#0b0d14',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {/* Ambient Orbs */}
      <div
        style={{
          position: 'absolute',
          width: '42rem',
          height: '42rem',
          top: '-14rem',
          left: '-8rem',
          background: 'radial-gradient(circle, rgba(59,130,246,0.14) 0%, transparent 65%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '36rem',
          height: '36rem',
          bottom: '-10rem',
          right: '-6rem',
          background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 65%)',
          filter: 'blur(70px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '24rem',
          height: '24rem',
          top: '50%',
          left: '38%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 65%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Left Panel: Branding ── */}
      <div
        style={{
          flex: '0 0 50%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '3rem',
          position: 'relative',
          zIndex: 5,
          borderRight: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        {/* Brand mark */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'none' : 'translateY(-8px)',
            transition: 'all 0.5s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <div
            style={{
              width: '2.4rem',
              height: '2.4rem',
              borderRadius: '0.75rem',
              background: 'linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(59,130,246,0.5)',
            }}
          >
            <Sparkles size={16} color="#ffffff" strokeWidth={2.5} />
          </div>
          <div>
            <div
              style={{
                fontWeight: 800,
                fontSize: '1.1rem',
                letterSpacing: '-0.03em',
                color: '#f1f5f9',
              }}
            >
              Synapse
            </div>
            <div
              style={{
                fontSize: '0.62rem',
                fontWeight: 600,
                color: '#475569',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              AI Study Companion
            </div>
          </div>
        </div>

        {/* Hero text */}
        <div
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'none' : 'translateY(20px)',
            transition: 'all 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.3rem 0.85rem',
              borderRadius: '2rem',
              background: 'rgba(59,130,246,0.1)',
              border: '1px solid rgba(59,130,246,0.25)',
              color: '#60a5fa',
              fontSize: '0.72rem',
              fontWeight: 600,
              letterSpacing: '0.02em',
              marginBottom: '1.5rem',
            }}
          >
            <Star size={11} fill="#60a5fa" strokeWidth={0} />
            Ranked #1 AI Study Tool for Students
          </div>

          <h1
            style={{
              fontSize: '3rem',
              fontWeight: 900,
              letterSpacing: '-0.04em',
              lineHeight: 1.08,
              color: '#f1f5f9',
              marginBottom: '1.25rem',
            }}
          >
            Study smarter,{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              not harder.
            </span>
          </h1>

          <p
            style={{
              fontSize: '1rem',
              color: '#64748b',
              lineHeight: 1.65,
              maxWidth: '32rem',
              marginBottom: '2.5rem',
            }}
          >
            Upload your lectures, textbooks, and slides. Synapse builds a
            source-cited knowledge base and runs adaptive assessments tailored
            exactly to your gaps.
          </p>

          {/* Feature grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem',
              maxWidth: '36rem',
            }}
          >
            {features.map((f, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  padding: '0.85rem 1rem',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '0.85rem',
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? 'none' : 'translateY(10px)',
                  transition: `all 0.5s cubic-bezier(0.16,1,0.3,1) ${0.15 + i * 0.07}s`,
                }}
              >
                <div
                  style={{
                    width: '2rem',
                    height: '2rem',
                    borderRadius: '0.5rem',
                    background: f.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: f.color,
                    flexShrink: 0,
                  }}
                >
                  {f.icon}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: '#e2e8f0',
                      marginBottom: '0.2rem',
                    }}
                  >
                    {f.title}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', lineHeight: 1.45 }}>
                    {f.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
            opacity: mounted ? 1 : 0,
            transition: 'opacity 0.6s ease 0.4s',
          }}
        >
          {stats.map((s, i) => (
            <div key={i}>
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  background: 'linear-gradient(135deg, #3b82f6, #7c3aed)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {s.value}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#475569', fontWeight: 500 }}>
                {s.label}
              </div>
            </div>
          ))}
          <div
            style={{
              flex: 1,
              borderTop: '1px solid rgba(255,255,255,0.06)',
              height: 0,
              alignSelf: 'center',
            }}
          />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.72rem',
              color: '#10b981',
              fontWeight: 600,
            }}
          >
            <div
              style={{
                width: '0.45rem',
                height: '0.45rem',
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 8px #10b981',
              }}
            />
            Zero hallucinations — source grounded
          </div>
        </div>
      </div>

      {/* ── Right Panel: Login Form ── */}
      <div
        style={{
          flex: '0 0 50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem 2.5rem',
          position: 'relative',
          zIndex: 5,
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '26rem',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'none' : 'translateX(20px)',
            transition: 'all 0.6s cubic-bezier(0.16,1,0.3,1) 0.2s',
          }}
        >
          {/* Card */}
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: '1.25rem',
              padding: '2.25rem',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Top gradient accent line */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: '15%',
                right: '15%',
                height: '1.5px',
                background: 'linear-gradient(90deg, transparent, #3b82f6, #7c3aed, transparent)',
                borderRadius: '0 0 2px 2px',
              }}
            />

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div
                style={{
                  width: '3.5rem',
                  height: '3.5rem',
                  borderRadius: '1rem',
                  background: 'linear-gradient(135deg, #3b82f6, #7c3aed)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                  boxShadow: '0 8px 24px rgba(59,130,246,0.4)',
                }}
              >
                <Sparkles size={22} color="#ffffff" />
              </div>
              <h2
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  color: '#f1f5f9',
                  letterSpacing: '-0.03em',
                  marginBottom: '0.5rem',
                }}
              >
                Welcome to Synapse
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.55 }}>
                Sign in with Google to access your personalized AI study workspace
              </p>
            </div>

            {/* Google Sign-In Button */}
            <button
              onClick={() => !isLoading && setShowAccountSelector(!showAccountSelector)}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.85rem 1.25rem',
                borderRadius: '0.75rem',
                background: '#ffffff',
                color: '#1f2937',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.85rem',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                transition: 'all 0.2s ease',
                fontFamily: 'var(--font-sans)',
                opacity: isLoading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = '#f8fafc';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.25)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.2)';
              }}
            >
              {isLoading ? (
                <>
                  <div
                    style={{
                      width: '1.1rem',
                      height: '1.1rem',
                      borderRadius: '50%',
                      border: '2px solid #d1d5db',
                      borderTopColor: '#3b82f6',
                      animation: 'spin 0.7s linear infinite',
                    }}
                  />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            {/* Account Selector */}
            {showAccountSelector && (
              <div
                style={{
                  marginTop: '0.85rem',
                  background: 'rgba(15,17,23,0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '0.9rem',
                  padding: '0.6rem',
                  backdropFilter: 'blur(16px)',
                  animation: 'scaleIn 0.15s ease',
                }}
              >
                <div
                  style={{
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.07em',
                    color: '#475569',
                    padding: '0.2rem 0.5rem 0.45rem',
                  }}
                >
                  Choose account
                </div>

                {sampleAccounts.map((acc, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectAccount(acc)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.65rem 0.6rem',
                      borderRadius: '0.6rem',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.12s ease',
                      fontFamily: 'var(--font-sans)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <img
                      src={acc.avatar}
                      alt={acc.name}
                      style={{
                        width: '2.25rem',
                        height: '2.25rem',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: `2px solid ${acc.color}55`,
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                          marginBottom: '0.15rem',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            color: '#f1f5f9',
                          }}
                        >
                          {acc.name}
                        </span>
                        <span
                          style={{
                            fontSize: '0.62rem',
                            fontWeight: 600,
                            padding: '0.08rem 0.4rem',
                            borderRadius: '2rem',
                            background: `${acc.color}18`,
                            color: acc.color,
                            border: `1px solid ${acc.color}30`,
                          }}
                        >
                          {acc.tag}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                        {acc.desc}
                      </div>
                    </div>
                    <ChevronRight size={13} color="#374151" />
                  </button>
                ))}

                {/* Divider */}
                <div
                  style={{
                    height: '1px',
                    background: 'rgba(255,255,255,0.07)',
                    margin: '0.4rem 0',
                  }}
                />

                {/* Custom account */}
                <button
                  type="button"
                  onClick={() => setShowCustomInput(!showCustomInput)}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.6rem',
                    background: 'transparent',
                    border: 'none',
                    color: '#3b82f6',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'center',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  + Use another Google account
                </button>

                {showCustomInput && (
                  <form
                    onSubmit={handleCustomSubmit}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      padding: '0.5rem 0.3rem 0.2rem',
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      style={{
                        padding: '0.5rem 0.75rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '0.5rem',
                        color: '#f1f5f9',
                        fontSize: '0.78rem',
                        outline: 'none',
                        fontFamily: 'var(--font-sans)',
                      }}
                    />
                    <input
                      type="email"
                      placeholder="gmail.com address"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      required
                      style={{
                        padding: '0.5rem 0.75rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '0.5rem',
                        color: '#f1f5f9',
                        fontSize: '0.78rem',
                        outline: 'none',
                        fontFamily: 'var(--font-sans)',
                      }}
                    />
                    <button
                      type="submit"
                      style={{
                        padding: '0.55rem',
                        background: 'linear-gradient(135deg, #3b82f6, #7c3aed)',
                        border: 'none',
                        borderRadius: '0.5rem',
                        color: '#ffffff',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: 'var(--font-sans)',
                      }}
                    >
                      Sign In
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Divider */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                margin: '1.5rem 0',
              }}
            >
              <div
                style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }}
              />
              <span
                style={{
                  fontSize: '0.65rem',
                  color: '#374151',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  fontWeight: 600,
                }}
              >
                or try instantly
              </span>
              <div
                style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }}
              />
            </div>

            {/* Demo launch */}
            <button
              onClick={() => handleSelectAccount(sampleAccounts[0])}
              style={{
                width: '100%',
                padding: '0.8rem 1rem',
                borderRadius: '0.75rem',
                background: 'rgba(59,130,246,0.08)',
                border: '1px solid rgba(59,130,246,0.2)',
                color: '#60a5fa',
                fontSize: '0.82rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.55rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: 'var(--font-sans)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(59,130,246,0.14)';
                e.currentTarget.style.borderColor = 'rgba(59,130,246,0.35)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(59,130,246,0.08)';
                e.currentTarget.style.borderColor = 'rgba(59,130,246,0.2)';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <UserCheck size={15} />
              <span>Launch Demo — No Sign-In Needed</span>
              <ArrowRight size={14} />
            </button>

            {/* Trust badges */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1.25rem',
                marginTop: '1.5rem',
                flexWrap: 'wrap',
              }}
            >
              {[
                { icon: <Shield size={11} />, label: 'FERPA Compliant' },
                { icon: <CheckCircle2 size={11} />, label: 'Zero-Hallucination' },
                { icon: <BookOpen size={11} />, label: 'Source Cited' },
              ].map((b, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontSize: '0.65rem',
                    color: '#475569',
                    fontWeight: 500,
                  }}
                >
                  <span style={{ color: '#374151' }}>{b.icon}</span>
                  {b.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Spinner keyframe */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.97) translateY(-4px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
