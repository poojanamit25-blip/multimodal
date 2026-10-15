import React from 'react';
import { type StreakBadgeTier, STREAK_BADGES } from '../lib/streakService';

interface StreakAvatarBadgeProps {
  tier: StreakBadgeTier;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  showRole?: boolean;
  isActive?: boolean;
  isUnlocked?: boolean;
  currentStreak?: number;
  className?: string;
  onClick?: () => void;
}

export const StreakAvatarBadge: React.FC<StreakAvatarBadgeProps> = ({
  tier,
  size = 'md',
  showLabel = false,
  showRole = false,
  isActive = true,
  isUnlocked = true,
  currentStreak,
  className = '',
  onClick
}) => {
  const badge = STREAK_BADGES[tier];

  // Size specifications
  const sizeMap = {
    xs: { box: 'w-6 h-6', svg: 24, text: 'text-[9px]', ring: 'p-0.5' },
    sm: { box: 'w-8 h-8', svg: 32, text: 'text-[10px]', ring: 'p-1' },
    md: { box: 'w-12 h-12', svg: 48, text: 'text-xs', ring: 'p-1.5' },
    lg: { box: 'w-16 h-16', svg: 64, text: 'text-sm', ring: 'p-2' },
    xl: { box: 'w-24 h-24', svg: 96, text: 'text-base', ring: 'p-3' }
  };

  const currentSize = sizeMap[size];

  // Vector Avatar SVG graphics for each tier
  const renderAvatarGraphic = () => {
    switch (tier) {
      case 'Beginner':
        return (
          // BEGINNER: Bronze & Emerald Cadet Avatar with Cyber Visor & Sprout Spark
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="beg-bg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#064e3b" />
                <stop offset="1" stopColor="#042f2e" />
              </linearGradient>
              <linearGradient id="beg-rim" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#34d399" />
                <stop offset="1" stopColor="#059669" />
              </linearGradient>
              <linearGradient id="beg-face" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#10b981" />
                <stop offset="1" stopColor="#065f46" />
              </linearGradient>
            </defs>
            {/* Outer Shield Hexagon */}
            <polygon points="50,6 88,27 88,73 50,94 12,73 12,27" fill="url(#beg-bg)" stroke="url(#beg-rim)" strokeWidth="4" />
            {/* Inner Shield Line */}
            <polygon points="50,14 80,31 80,69 50,86 20,69 20,31" stroke="#34d399" strokeWidth="1.5" strokeOpacity="0.4" fill="none" />
            {/* Cadet Helmet Head */}
            <circle cx="50" cy="50" r="24" fill="#0f172a" stroke="#10b981" strokeWidth="2.5" />
            {/* Visor */}
            <rect x="34" y="44" width="32" height="11" rx="5.5" fill="#10b981" />
            <circle cx="43" cy="49.5" r="2.5" fill="#ffffff" />
            <circle cx="57" cy="49.5" r="2.5" fill="#ffffff" />
            {/* Cadet Spark Antenna */}
            <path d="M50 26 L50 17 M46 17 L54 17" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="50" cy="14" r="3" fill="#34d399" className="animate-pulse" />
            {/* Bronze/Emerald Leaf Chevrons */}
            <path d="M36 70 L50 63 L64 70" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M40 76 L50 71 L60 76" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );

      case 'Intermediate':
        return (
          // INTERMEDIATE: Silver & Sky Cyan Knight Avatar with Cyber Visor & Winged Orbital Crest
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="int-bg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#0c4a6e" />
                <stop offset="1" stopColor="#1e1b4b" />
              </linearGradient>
              <linearGradient id="int-rim" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#38bdf8" />
                <stop offset="1" stopColor="#818cf8" />
              </linearGradient>
              <linearGradient id="int-blade" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#e0f2fe" />
                <stop offset="1" stopColor="#38bdf8" />
              </linearGradient>
            </defs>
            {/* Outer Diamond Shield */}
            <polygon points="50,4 92,38 78,92 22,92 8,38" fill="url(#int-bg)" stroke="url(#int-rim)" strokeWidth="4" />
            <polygon points="50,12 84,40 72,84 28,84 16,40" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.4" fill="none" />
            {/* Cyber Knight Helmet */}
            <path d="M30 40 C30 26 70 26 70 40 L70 66 C70 74 50 80 50 80 C50 80 30 74 30 66 Z" fill="#0f172a" stroke="#38bdf8" strokeWidth="2.5" />
            {/* Knight Dual Visor */}
            <path d="M36 46 L64 46" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
            <path d="M42 54 L58 54" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="50" cy="50" r="2" fill="#ffffff" />
            {/* Winged Side Antenna Crests */}
            <path d="M22 36 L30 46 L24 54" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M78 36 L70 46 L76 54" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {/* Energy Core Star Top */}
            <polygon points="50,14 53,22 61,22 55,27 57,35 50,30 43,35 45,27 39,22 47,22" fill="#38bdf8" />
          </svg>
        );

      case 'Advanced':
        return (
          // ADVANCED: Gold & Amber Apex Grandmaster Avatar with Crown & Phoenix Aura
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="adv-bg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#451a03" />
                <stop offset="0.6" stopColor="#78350f" />
                <stop offset="1" stopColor="#18181b" />
              </linearGradient>
              <linearGradient id="adv-gold" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#fbbf24" />
                <stop offset="0.5" stopColor="#f59e0b" />
                <stop offset="1" stopColor="#d97706" />
              </linearGradient>
              <radialGradient id="adv-glow" cx="50" cy="50" r="45" gradientUnits="userSpaceOnUse">
                <stop stopColor="#f59e0b" stopOpacity="0.3" />
                <stop offset="1" stopColor="#f59e0b" stopOpacity="0" />
              </radialGradient>
            </defs>
            {/* Radiant Background Aura */}
            <circle cx="50" cy="50" r="45" fill="url(#adv-glow)" />
            {/* Octagonal Titan Crest */}
            <polygon points="50,4 78,14 96,42 86,76 50,96 14,76 4,42 22,14" fill="url(#adv-bg)" stroke="url(#adv-gold)" strokeWidth="4" />
            <polygon points="50,11 72,19 87,43 78,71 50,88 22,71 13,43 28,19" stroke="#fef08a" strokeWidth="1.5" strokeOpacity="0.4" fill="none" />
            {/* Grandmaster Crown */}
            <path d="M28 32 L36 44 L50 24 L64 44 L72 32 L70 54 L30 54 Z" fill="url(#adv-gold)" stroke="#fef08a" strokeWidth="1.5" />
            {/* Crown Gems */}
            <circle cx="50" cy="24" r="3" fill="#ffffff" />
            <circle cx="28" cy="32" r="2.5" fill="#fef08a" />
            <circle cx="72" cy="32" r="2.5" fill="#fef08a" />
            {/* Grandmaster Mask & Golden Optics */}
            <path d="M34 54 C34 46 66 46 66 54 L66 70 C66 78 50 84 50 84 C50 84 34 78 34 70 Z" fill="#09090b" stroke="url(#adv-gold)" strokeWidth="2.5" />
            {/* Glowing Golden Cyber Visor */}
            <path d="M38 60 Q50 63 62 60" stroke="#fef08a" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="44" cy="61" r="2" fill="#ffffff" />
            <circle cx="56" cy="61" r="2" fill="#ffffff" />
            {/* Dual Star Embers */}
            <polygon points="50,72 52,77 57,77 53,80 55,85 50,82 45,85 47,80 43,77 48,77" fill="#fbbf24" />
          </svg>
        );

      default:
        return null;
    }
  };

  const getBorderColor = () => {
    switch (tier) {
      case 'Beginner':
        return 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.25)]';
      case 'Intermediate':
        return 'border-sky-500/50 shadow-[0_0_15px_rgba(56,189,248,0.25)]';
      case 'Advanced':
        return 'border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.35)]';
    }
  };

  const getBadgePillBg = () => {
    switch (tier) {
      case 'Beginner':
        return 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400';
      case 'Intermediate':
        return 'bg-sky-500/15 border-sky-500/30 text-sky-400';
      case 'Advanced':
        return 'bg-amber-500/20 border-amber-500/40 text-amber-400';
    }
  };

  return (
    <div
      onClick={onClick}
      title={
        !isUnlocked
          ? `Locked: Reach a ${badge.minStreak}-day streak to unlock ${badge.title}`
          : `${badge.title} (${tier}) ${currentStreak !== undefined ? `• Current Streak: ${currentStreak}d` : ''}`
      }
      className={`inline-flex items-center gap-2.5 ${onClick ? 'cursor-pointer hover:scale-[1.02] transition-transform' : ''} ${className}`}
    >
      {/* Avatar Container with glowing ring */}
      <div className={`relative ${currentSize.box} ${currentSize.ring} rounded-2xl border ${getBorderColor()} bg-background flex items-center justify-center shrink-0 ${!isUnlocked ? 'grayscale opacity-60' : ''}`}>
        {renderAvatarGraphic()}
        
        {/* Tier indicator spark */}
        {isActive && isUnlocked && (
          <span 
            className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-background animate-pulse"
            style={{ backgroundColor: badge.accentColor }}
            title={`Active ${tier} Streak Avatar`}
          />
        )}

        {/* Lock icon overlay if locked */}
        {!isUnlocked && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl">
            <svg className="w-3.5 h-3.5 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </span>
        )}
      </div>

      {/* Optional Label / Metadata */}
      {(showLabel || showRole) && (
        <div className="flex flex-col text-left">
          {showLabel && (
            <div className="flex items-center gap-1.5">
              <span className={`font-mono font-bold uppercase tracking-wider ${currentSize.text} text-zinc-100`}>
                {badge.title}
              </span>
              <span className={`px-1.5 py-0.2 rounded-full border text-[9px] font-mono font-semibold ${getBadgePillBg()}`}>
                {badge.minStreak}{badge.maxStreak ? `-${badge.maxStreak}` : '+'}d
              </span>
            </div>
          )}
          {showRole && (
            <span className="text-[10px] text-zinc-400 font-mono">
              {badge.role}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
