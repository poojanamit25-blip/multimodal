import React, { useEffect, useRef, useState } from 'react';
import { Application } from '@splinetool/runtime';

interface StarkSplineViewProps {
  isSpeaking: boolean;
  isListening: boolean;
  isThinking: boolean;
  audioLevel?: number;
  className?: string;
}

export const StarkSplineView: React.FC<StarkSplineViewProps> = ({
  isSpeaking,
  isListening,
  isThinking,
  audioLevel = 0,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rainRef = useRef<HTMLCanvasElement>(null);
  const [isSplineLoaded, setIsSplineLoaded] = useState<boolean>(false);
  const [splineError, setSplineError] = useState<boolean>(false);

  // Status Badge Metadata
  const statusLabel = isSpeaking
    ? 'ELSA TRANSMITTING AUDIO (TTS)'
    : isListening
    ? 'LISTENING TO CANDIDATE SPEECH'
    : isThinking
    ? 'EVALUATING ARCHITECTURAL REASONING'
    : 'ELSA ONLINE • AWAITING RESPONSE';

  const statusColor = isSpeaking
    ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
    : isListening
    ? 'border-amber-500/50 bg-amber-500/10 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
    : isThinking
    ? 'border-purple-500/50 bg-purple-500/10 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
    : 'border-blue-500/40 bg-blue-500/10 text-blue-300';

  // Load Spline 3D Scene
  useEffect(() => {
    let app: Application | null = null;
    let isCancelled = false;

    if (canvasRef.current) {
      app = new Application(canvasRef.current);
      app
        .load('https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode')
        .then(() => {
          if (!isCancelled) {
            setIsSplineLoaded(true);
          }
        })
        .catch((err) => {
          console.warn('Spline 3D scene load warning:', err);
          if (!isCancelled) {
            setSplineError(true);
          }
        });
    }

    return () => {
      isCancelled = true;
      try {
        app?.dispose();
      } catch {}
    };
  }, []);

  // Ambient Falling Light Particles (from nexus-spline-view)
  useEffect(() => {
    const canvas = rainRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.parentElement?.clientWidth || 600;
    canvas.height = canvas.parentElement?.clientHeight || 400;

    const drops: Array<{ x: number; y: number; length: number; speed: number; opacity: number }> = [];
    const createDrop = () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      length: Math.random() * 80 + 20,
      speed: Math.random() * 2.5 + 1.5,
      opacity: Math.random() * 0.4 + 0.2
    });

    for (let i = 0; i < 40; i++) drops.push(createDrop());

    let animId: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drops.forEach((d, idx) => {
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x + 0.5, d.y + d.length);

        const grad = ctx.createLinearGradient(d.x, d.y, d.x, d.y + d.length);
        grad.addColorStop(0, 'rgba(6, 182, 212, 0)');
        grad.addColorStop(1, `rgba(6, 182, 212, ${d.opacity})`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        d.y += d.speed;
        if (d.y > canvas.height) {
          drops[idx] = createDrop();
        }
      });
      animId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div
      className={`relative w-full h-full min-h-[340px] md:min-h-[420px] rounded-3xl overflow-hidden bg-black/[0.96] border border-cyan-500/30 flex items-center justify-center select-none shadow-[0_0_40px_rgba(6,182,212,0.15)] ${className}`}
    >
      {/* Background Rain Particle Canvas */}
      <canvas ref={rainRef} className="absolute inset-0 pointer-events-none z-0 opacity-60" />

      {/* Atmospheric Spotlight Halos (from nexus-spline-view) */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

      {/* Main Spline 3D Scene */}
      <div className="relative w-full h-full z-10 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className={`w-full h-full object-cover transition-opacity duration-700 ${
            isSplineLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Loading Spinner for Spline 3D Model */}
        {!isSplineLoaded && !splineError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 backdrop-blur-sm z-20">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
              <div className="w-8 h-8 rounded-full border-2 border-purple-500/30 border-b-purple-400 animate-[spin_1.5s_linear_infinite_reverse]" />
            </div>
            <p className="text-xs font-mono font-bold text-cyan-400 tracking-widest uppercase animate-pulse">
              SYNCHRONIZING ELSA 3D NEURAL CORE...
            </p>
          </div>
        )}

        {/* Fallback if WebGL/Spline fails on constrained hardware */}
        {splineError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-20">
            <div className="relative w-36 h-36 rounded-full border-2 border-cyan-500/50 bg-cyan-950/20 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.4)]">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-400 to-sky-200 animate-pulse shadow-[0_0_20px_#22d3ee]" />
            </div>
            <p className="text-xs font-mono text-cyan-400">ELSA NEURAL CORE ONLINE</p>
          </div>
        )}
      </div>

      {/* Audio Reactive Waveform Ring Overlay when Speaking */}
      {isSpeaking && (
        <div className="absolute bottom-16 inset-x-0 flex justify-center items-center pointer-events-none z-20">
          <div className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-black/70 backdrop-blur-md border border-cyan-500/40">
            {[10, 22, 16, 28, 36, 24, 18, 32, 28, 14, 22, 10].map((h, i) => (
              <div
                key={i}
                className="w-1 bg-cyan-400 rounded-full animate-pulse"
                style={{
                  height: `${h}px`,
                  animationDelay: `${i * 0.08}s`
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Live Voice Spectrum Waveform when Candidate is Speaking / Listening */}
      {isListening && (
        <div className="absolute bottom-16 inset-x-0 flex flex-col items-center justify-center pointer-events-none z-20 space-y-1">
          <div className="flex items-center space-x-2.5 px-4 py-2 rounded-full bg-black/80 backdrop-blur-md border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.25)]">
            <span className={`w-2 h-2 rounded-full ${audioLevel > 5 ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
              {audioLevel > 5 ? 'CANDIDATE VOICE DETECTED' : 'AWAITING CANDIDATE SPEECH'}
            </span>
            <div className="flex items-end space-x-1 h-5 px-1">
              {[0.4, 0.7, 1.0, 0.8, 0.5, 0.9, 1.2, 0.6, 0.4, 0.85, 1.1, 0.7, 0.4].map((mult, idx) => {
                const dynamicHeight = Math.max(
                  4,
                  Math.min(22, Math.round((audioLevel / 100) * 22 * mult + (audioLevel > 3 ? 4 : 2)))
                );
                return (
                  <div
                    key={idx}
                    className="w-1 rounded-full transition-all duration-75 bg-gradient-to-t from-emerald-500 to-cyan-300"
                    style={{ height: `${dynamicHeight}px` }}
                  />
                );
              })}
            </div>
            <span className="text-[10px] font-mono font-bold text-zinc-300">
              {audioLevel}%
            </span>
          </div>
        </div>
      )}

      {/* Top Floating Status Hologram */}
      <div className="absolute top-4 left-4 z-20 flex items-center space-x-2">
        <div className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/10 text-[10px] font-mono text-zinc-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-bold tracking-wider">ELSA TECH LEAD</span>
          <span className="text-zinc-500">|</span>
          <span className="text-cyan-400 font-mono">NEXUS SPLINE CORE</span>
        </div>
      </div>

      {/* Bottom Floating Dynamic State Pill */}
      <div className="absolute bottom-4 z-20">
        <div
          className={`px-4 py-1.5 rounded-full border text-[11px] font-mono font-bold tracking-widest uppercase backdrop-blur-md transition-all duration-300 flex items-center gap-2 ${statusColor}`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isSpeaking
                ? 'bg-cyan-400 animate-ping'
                : isListening
                ? 'bg-amber-400 animate-pulse'
                : isThinking
                ? 'bg-purple-400 animate-pulse'
                : 'bg-blue-400'
            }`}
          />
          <span>{statusLabel}</span>
        </div>
      </div>
    </div>
  );
};
