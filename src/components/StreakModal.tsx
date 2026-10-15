import React, { useState, useEffect } from 'react';
import { X, Flame, Shield, Award, Clock, Sparkles, Calendar, CheckCircle2, Lock } from 'lucide-react';
import { getStreakData, recordStreakActivity, type StreakData, type StreakBadgeTier, STREAK_BADGES } from '../lib/streakService';
import { StreakAvatarBadge } from './StreakAvatarBadge';

interface StreakModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StreakModal: React.FC<StreakModalProps> = ({ isOpen, onClose }) => {
  const [streakData, setStreakData] = useState<StreakData>(getStreakData);
  const [justCheckedIn, setJustCheckedIn] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStreakData(getStreakData());
      setJustCheckedIn(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCheckIn = () => {
    const updated = recordStreakActivity("Candidate checked in via Streak Console");
    setStreakData(updated);
    setJustCheckedIn(true);
    setTimeout(() => setJustCheckedIn(false), 3000);
  };

  const progressPercent = Math.min(
    100,
    Math.round((streakData.currentStreak / (streakData.nextMilestone || 7)) * 100)
  );

  const badgeTiers: StreakBadgeTier[] = ['Beginner', 'Intermediate', 'Advanced'];

  return (
    <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in font-sans">
      <div 
        className="w-full max-w-2xl bg-background-panel border border-border shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[92vh] rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-background shrink-0">
          <div className="flex items-center space-x-3">
            <StreakAvatarBadge tier={streakData.tier} size="md" isActive={true} />
            <div>
              <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2 font-mono">
                PRACTICE STREAK & AVATAR BADGES
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 uppercase tracking-wider font-semibold">
                  {streakData.tier} Tier
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400">
                Maintain daily algorithmic momentum to rank up your engineering avatar badge.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* MODAL CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* HERO ACTIVE STREAK & AVATAR DISPLAY */}
          <div className="p-6 rounded-xl border border-amber-500/30 bg-gradient-to-b from-amber-500/10 via-orange-500/5 to-transparent flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            {/* Left: Avatar & Flame Hero */}
            <div className="flex items-center space-x-5">
              <div className="relative">
                <StreakAvatarBadge tier={streakData.tier} size="xl" isActive={streakData.todayCompleted} />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-zinc-950 flex items-center justify-center shadow-lg border-2 border-background">
                  <Flame size={16} className="fill-zinc-950/30 animate-pulse" />
                </div>
              </div>

              <div className="space-y-1 text-left">
                <div className="flex items-baseline space-x-2">
                  <span className="text-5xl font-black font-mono text-zinc-100 tracking-tight">
                    {streakData.currentStreak}
                  </span>
                  <span className="text-base font-mono font-bold text-amber-400 uppercase">
                    Days in a Row
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-zinc-200">
                    {STREAK_BADGES[streakData.tier].role}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono">
                    Rank: {streakData.tier}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-zinc-400 max-w-xs">
                  {streakData.todayCompleted
                    ? '🔥 Practice logged today! Your avatar rank is secured.'
                    : '⚠️ Practice pending today. Check in to maintain your streak & avatar level!'}
                </p>
              </div>
            </div>

            {/* Right: Check in Action */}
            <div className="flex flex-col items-center md:items-end w-full md:w-auto">
              {!streakData.todayCompleted ? (
                <button
                  onClick={handleCheckIn}
                  className="w-full md:w-auto px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-mono font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.35)] transition transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  ⚡ Check-In Today
                </button>
              ) : (
                <div className="px-4 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 size={15} />
                  <span>Streak Maintained Today</span>
                </div>
              )}

              {justCheckedIn && (
                <div className="mt-2 text-[11px] font-mono text-emerald-400 flex items-center gap-1 animate-bounce">
                  <Sparkles size={13} />
                  <span>Streak & Avatar badge preserved!</span>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 1: BADGES FOR STREAK MAINTENANCE WITH AVATAR */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Award size={14} className="text-brand-cyan" />
                <span>Streak Maintenance Badges & Avatars</span>
              </h3>
              <span className="text-[10px] text-zinc-400 font-mono">
                Current Level: <strong className="text-brand-cyan">{streakData.tier}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {badgeTiers.map((tierKey) => {
                const badgeInfo = STREAK_BADGES[tierKey];
                const isCurrentTier = streakData.tier === tierKey;
                const isUnlocked = streakData.currentStreak >= badgeInfo.minStreak;
                const daysNeeded = Math.max(0, badgeInfo.minStreak - streakData.currentStreak);

                return (
                  <div
                    key={tierKey}
                    className={`p-4 rounded-xl border flex flex-col justify-between transition-all relative overflow-hidden ${
                      isCurrentTier
                        ? 'border-brand-cyan bg-brand-cyan/10 ring-2 ring-brand-cyan/50 shadow-[0_0_20px_rgba(56,189,248,0.15)]'
                        : isUnlocked
                        ? 'border-emerald-500/40 bg-emerald-500/5'
                        : 'border-border bg-background opacity-75'
                    }`}
                  >
                    {/* Header: Avatar + Tier Pill */}
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <StreakAvatarBadge tier={tierKey} size="md" isActive={isCurrentTier} />
                        
                        {isCurrentTier ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-brand-cyan text-zinc-950 shadow-sm flex items-center gap-1">
                            <Sparkles size={10} /> Active
                          </span>
                        ) : isUnlocked ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 size={10} /> Unlocked
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-semibold uppercase bg-zinc-800 text-zinc-400 border border-zinc-700 flex items-center gap-1">
                            <Lock size={10} /> {daysNeeded}d to unlock
                          </span>
                        )}
                      </div>

                      {/* Tier Name & Subtitle */}
                      <div className="mb-2">
                        <h4 className="text-xs font-bold font-mono text-zinc-100 flex items-center gap-1.5">
                          <span>{badgeInfo.title}</span>
                          <span className="text-[10px] text-zinc-400 font-normal">
                            ({badgeInfo.minStreak}{badgeInfo.maxStreak ? `-${badgeInfo.maxStreak}` : '+'} Days)
                          </span>
                        </h4>
                        <span className="text-[10px] text-brand-cyan font-mono block">
                          {badgeInfo.role}
                        </span>
                      </div>

                      <p className="text-[11px] text-zinc-400 leading-relaxed mb-3">
                        {badgeInfo.description}
                      </p>
                    </div>

                    {/* Perks List */}
                    <div className="pt-2.5 border-t border-border/60 space-y-1">
                      <span className="text-[9px] font-mono text-zinc-500 uppercase block">Rank Privileges:</span>
                      {badgeInfo.perks.map((perk, pIdx) => (
                        <div key={pIdx} className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-300">
                          <span className="w-1 h-1 rounded-full bg-brand-cyan shrink-0" />
                          <span className="truncate">{perk}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 7-DAY WEEKLY TRACKER */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="font-bold text-zinc-300 flex items-center gap-1.5 uppercase">
                <Calendar size={13} className="text-brand-cyan" />
                This Week's Consistency
              </span>
              <span className="text-[10px] text-zinc-400">
                {streakData.weeklyProgress.filter(d => d.active).length} / 7 Days Active
              </span>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {streakData.weeklyProgress.map((day) => {
                return (
                  <div
                    key={day.dateStr}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition ${
                      day.active
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.12)]'
                        : day.isToday
                        ? 'bg-zinc-800/80 border-brand-cyan/60 text-brand-cyan'
                        : 'bg-background border-border text-zinc-500'
                    }`}
                  >
                    <span className="text-[10px] font-mono font-bold block mb-1">
                      {day.dayName}
                    </span>
                    <div className="w-6 h-6 flex items-center justify-center">
                      {day.active ? (
                        <Flame size={16} className="text-amber-400 fill-amber-400 animate-pulse" />
                      ) : day.isToday ? (
                        <Clock size={14} className="text-brand-cyan" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-zinc-700" />
                      )}
                    </div>
                    <span className="text-[8px] font-mono mt-1 opacity-70">
                      {day.dateStr.slice(8)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* MILESTONE PROGRESS BAR */}
          <div className="p-4 rounded-xl border border-border bg-background space-y-2.5">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-zinc-300 font-bold flex items-center gap-1.5">
                <Award size={14} className="text-brand-violet" />
                Next Milestone: {streakData.nextMilestone}-Day Club
              </span>
              <span className="text-brand-cyan font-semibold text-[11px]">
                {streakData.daysToNextMilestone} days away ({progressPercent}%)
              </span>
            </div>
            
            <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-brand-cyan transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[10px] font-mono text-zinc-500">
              Rank up your consistency to unlock higher-tier engineering avatar badges.
            </p>
          </div>

          {/* TELEMETRY METRICS 3-GRID */}
          <div className="grid grid-cols-3 gap-3 font-mono text-center">
            <div className="p-3.5 rounded-xl border border-border bg-background">
              <span className="text-[9px] text-zinc-500 uppercase block mb-1">Personal Record</span>
              <span className="text-lg font-bold text-zinc-200">{streakData.longestStreak}d</span>
              <span className="text-[8px] text-zinc-500 block mt-0.5">All-time best</span>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-background">
              <span className="text-[9px] text-zinc-500 uppercase block mb-1">Streak Shield</span>
              <div className="flex items-center justify-center gap-1">
                <Shield size={14} className="text-cyan-400" />
                <span className="text-lg font-bold text-cyan-400">{streakData.freezeCount}</span>
              </div>
              <span className="text-[8px] text-zinc-500 block mt-0.5">Miss protection</span>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-background">
              <span className="text-[9px] text-zinc-500 uppercase block mb-1">Total Active</span>
              <span className="text-lg font-bold text-brand-emerald">{streakData.totalActiveDays}</span>
              <span className="text-[8px] text-zinc-500 block mt-0.5">Sessions logged</span>
            </div>
          </div>

          {/* MOTIVATIONAL QUOTE */}
          <div className="p-3.5 rounded-xl border border-border bg-background-elevated text-center">
            <p className="text-xs text-zinc-400 italic">
              "{streakData.motivationalQuote}"
            </p>
          </div>

        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 border-t border-border flex justify-end bg-background shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
