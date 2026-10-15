import React from 'react';

interface StarkCoreAvatarProps {
  isSpeaking: boolean;
  isListening: boolean;
  isThinking: boolean;
  audioLevel?: number; // 0 to 100
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const StarkCoreAvatar: React.FC<StarkCoreAvatarProps> = ({
  isSpeaking,
  isListening,
  isThinking,
  audioLevel = 0,
  size = 'lg',
  className = ''
}) => {
  const sizeMap = {
    sm: 'w-20 h-20',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
    xl: 'w-64 h-64'
  };

  // Determine state colors
  const primaryGlow = isSpeaking
    ? 'rgba(6, 182, 212, 0.85)' // Cyan energy
    : isListening
    ? 'rgba(234, 88, 12, 0.85)' // Amber listening
    : isThinking
    ? 'rgba(139, 92, 246, 0.85)' // Violet neural processing
    : 'rgba(59, 130, 246, 0.5)'; // Idle cobalt

  const statusText = isSpeaking
    ? 'STARK SPEAKING'
    : isListening
    ? 'LISTENING TO YOU'
    : isThinking
    ? 'NEURAL EVALUATION'
    : 'STARK ONLINE';

  const badgeColor = isSpeaking
    ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400'
    : isListening
    ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
    : isThinking
    ? 'bg-purple-500/10 border-purple-500/40 text-purple-400'
    : 'bg-blue-500/10 border-blue-500/30 text-blue-400';

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Outer Holographic Containment Ring */}
      <div className={`relative ${sizeMap[size]} flex items-center justify-center`}>
        {/* Ambient Backlight Glow */}
        <div
          className="absolute inset-0 rounded-full blur-2xl transition-all duration-500 opacity-60"
          style={{
            backgroundColor: primaryGlow,
            transform: `scale(${1 + (isSpeaking ? 0.25 : isListening ? Math.min(0.3, audioLevel / 150) : 0.05)})`
          }}
        />

        {/* Outer Tech Brackets (Spinning) */}
        <div
          className={`absolute inset-0 rounded-full border border-dashed border-cyan-500/40 transition-transform ${
            isSpeaking ? 'animate-[spin_6s_linear_infinite]' : isThinking ? 'animate-[spin_4s_linear_infinite]' : 'animate-[spin_20s_linear_infinite]'
          }`}
        />

        {/* Middle Ring with Tick Marks */}
        <div
          className={`absolute inset-2 rounded-full border-2 border-cyan-400/30 transition-transform ${
            isSpeaking ? 'animate-[spin_10s_linear_infinite_reverse]' : 'animate-[spin_30s_linear_infinite_reverse]'
          }`}
        />

        {/* Stark Arc Reactor Core Geometry */}
        <div className="relative w-3/4 h-3/4 rounded-full bg-zinc-950/90 border border-cyan-500/50 flex items-center justify-center shadow-[inset_0_0_20px_rgba(6,182,212,0.4)] overflow-hidden">
          {/* Inner Geometric Star / Turbine Segments */}
          <div className="absolute inset-0 flex items-center justify-center opacity-40">
            {[0, 30, 60, 90, 120, 150].map((deg) => (
              <div
                key={deg}
                className="absolute w-full h-[1.5px] bg-cyan-400/40"
                style={{ transform: `rotate(${deg}deg)` }}
              />
            ))}
          </div>

          {/* Core Energy Node */}
          <div
            className={`relative w-1/2 h-1/2 rounded-full transition-all duration-300 flex items-center justify-center ${
              isSpeaking
                ? 'bg-gradient-to-tr from-cyan-400 via-sky-300 to-white shadow-[0_0_30px_#22d3ee]'
                : isListening
                ? 'bg-gradient-to-tr from-amber-500 via-orange-400 to-yellow-200 shadow-[0_0_30px_#f59e0b]'
                : isThinking
                ? 'bg-gradient-to-tr from-purple-500 via-violet-400 to-fuchsia-300 shadow-[0_0_30px_#8b5cf6]'
                : 'bg-gradient-to-tr from-cyan-600 to-blue-500 shadow-[0_0_15px_#0284c7]'
            }`}
          >
            {/* Pulsing Center Iris */}
            <div className="w-1/3 h-1/3 rounded-full bg-white/90 shadow-[0_0_10px_#fff]" />
          </div>

          {/* Stark HUD Triangular Pointer */}
          <div className="absolute top-1 text-[8px] font-mono text-cyan-400 font-bold opacity-75">
            ▲
          </div>
        </div>

        {/* Audio Reactive Waveform Ring (Active when speaking or listening) */}
        {(isSpeaking || isListening) && (
          <div className="absolute -inset-3 flex items-center justify-center pointer-events-none">
            <div className="w-full h-full rounded-full border border-cyan-400/40 animate-ping opacity-30" />
          </div>
        )}
      </div>

      {/* Status Pill */}
      <div className={`mt-3 px-3 py-1 rounded-full border text-[10px] font-mono font-bold tracking-widest flex items-center gap-1.5 transition-colors ${badgeColor}`}>
        <span className={`w-2 h-2 rounded-full ${
          isSpeaking ? 'bg-cyan-400 animate-ping' : isListening ? 'bg-amber-400 animate-pulse' : isThinking ? 'bg-purple-400 animate-pulse' : 'bg-blue-400'
        }`} />
        <span>{statusText}</span>
      </div>
    </div>
  );
};
