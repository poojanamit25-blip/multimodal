import { useState } from "react";
import { VoicePoweredOrb } from "../components/ui/voice-powered-orb";
import { Button } from "../components/ui/button";
import { Mic, MicOff, Sliders } from "lucide-react";

export default function VoicePoweredOrbDemo() {
  const [isRecording, setIsRecording] = useState(false);
  const [voiceDetected, setVoiceDetected] = useState(false);
  const [hue, setHue] = useState<number>(280); // Neon purple/cyan preset

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8 font-sans select-none">
      
      {/* Header */}
      <div className="border-b border-border pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-mono text-zinc-100 uppercase tracking-wide">WebGL Voice Visualizer</h2>
          <p className="text-xs text-zinc-400 mt-1">Configure and interact with the real-time audio responsive energy core sandbox.</p>
        </div>
        <div className="flex items-center space-x-2 text-[10px] font-mono bg-zinc-950/40 border border-border px-3 py-1.5 rounded">
          <span className={`w-1.5 h-1.5 rounded-full ${voiceDetected ? 'bg-brand-cyan animate-ping' : 'bg-zinc-600'}`}></span>
          <span className="text-zinc-500">VOICE TRIGGER:</span>
          <span className={voiceDetected ? 'text-brand-cyan font-bold' : 'text-zinc-400'}>
            {voiceDetected ? 'ACTIVE SIGNAL' : 'IDLE'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* ORB PREVIEW (7 cols) */}
        <div className="lg:col-span-7 border border-border bg-background-panel rounded p-6 flex flex-col items-center justify-center min-h-[420px] relative overflow-hidden">
          <div className="absolute inset-0 grid-mesh opacity-10 pointer-events-none" />
          
          {/* Glowing Backlight */}
          <div className="absolute w-80 h-80 rounded-full bg-brand-cyan/5 blur-3xl pointer-events-none" />
          
          <div className="w-72 h-72 relative z-10">
            <VoicePoweredOrb
              enableVoiceControl={isRecording}
              hue={hue}
              className="rounded-full overflow-hidden shadow-2xl"
              onVoiceDetected={setVoiceDetected}
            />
          </div>
        </div>

        {/* CONTROLS (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="border border-border bg-background-panel rounded p-6 space-y-5 flex-1">
            <div className="flex items-center space-x-2 border-b border-border/60 pb-3">
              <Sliders size={16} className="text-brand-cyan" />
              <h3 className="text-sm font-mono font-bold text-zinc-200">ORB PARAMETERS</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Spectral Hue Shift ({hue}°)</label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={hue}
                  onChange={(e) => setHue(parseInt(e.target.value))}
                  className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-brand-cyan"
                />
                <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                  <span>0° CYAN/PURPLE</span>
                  <span>180° GREEN</span>
                  <span>360° RED</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Audio Analysis Status</label>
                <div className="p-3 bg-background border border-border/80 rounded font-mono text-[10px] text-zinc-400 space-y-2">
                  <div className="flex justify-between">
                    <span>Microphone Node:</span>
                    <span className={isRecording ? 'text-emerald-400 font-bold' : 'text-zinc-500'}>
                      {isRecording ? 'CONNECTED' : 'STANDBY'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Device AudioContext:</span>
                    <span className={isRecording ? 'text-emerald-400 font-bold' : 'text-zinc-500'}>
                      {isRecording ? 'ACTIVE_RUNNING' : 'SUSPENDED'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-border bg-background-panel rounded p-6 space-y-4 shrink-0">
            <Button
              onClick={toggleRecording}
              className={`w-full py-4 rounded text-xs font-bold font-mono uppercase tracking-wider transition ${
                isRecording 
                  ? 'bg-red-500/20 border border-red-500/50 text-red-300 hover:bg-red-500/30' 
                  : 'bg-brand-cyan hover:bg-brand-cyan/90 text-background'
              }`}
            >
              {isRecording ? (
                <>
                  <MicOff size={14} className="mr-2 inline" />
                  Deactivate Voice Hook
                </>
              ) : (
                <>
                  <Mic size={14} className="mr-2 inline" />
                  Activate Voice Hook
                </>
              )}
            </Button>
            <p className="text-[10px] font-mono text-zinc-500 text-center leading-relaxed">
              Activate microphone hook and speak into your device to witness the WebGL shaders morphing in real-time.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
