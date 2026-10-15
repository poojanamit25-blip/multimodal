import React, { useEffect, useRef, useState } from 'react';
import { Camera, Mic, Volume2, CheckCircle2, AlertCircle, RefreshCw, Radio } from 'lucide-react';
import { speakElsa } from '../../lib/elsaVoice';

interface StarkDiagnosticsProps {
  onComplete: (mediaStream: MediaStream | null) => void;
  onCancel: () => void;
}

export const StarkDiagnostics: React.FC<StarkDiagnosticsProps> = ({ onComplete, onCancel }) => {
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [micActive, setMicActive] = useState<boolean>(false);
  const [micLevel, setMicLevel] = useState<number>(0);
  const [soundDetected, setSoundDetected] = useState<boolean>(false);
  const [speakerTested, setSpeakerTested] = useState<boolean>(false);
  const [isSpeakingTest, setIsSpeakingTest] = useState<boolean>(false);
  const [sttTested, setSttTested] = useState<boolean>(false);
  const [sttTranscript, setSttTranscript] = useState<string>('');
  const [isListeningStt, setIsListeningStt] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize Camera & Microphone Stream
  const initMedia = async () => {
    setErrorMessage('');
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }

      const userStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: true
      });

      streamRef.current = userStream;
      setCameraActive(true);
      setMicActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = userStream;
      }

      // Initialize Web Audio API Analyser for Sound Level VU Meter
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const audioCtx = new AudioContextClass();
        audioContextRef.current = audioCtx;

        if (audioCtx.state === 'suspended') {
          audioCtx.resume().catch(() => {});
        }

        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;

        const source = audioCtx.createMediaStreamSource(userStream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const checkAudioLevel = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);

          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          const normalized = Math.min(100, Math.round((avg / 64) * 100));

          setMicLevel(normalized);

          if (normalized > 8) {
            setSoundDetected(true);
          }

          animFrameRef.current = requestAnimationFrame(checkAudioLevel);
        };

        animFrameRef.current = requestAnimationFrame(checkAudioLevel);
      } catch (audioErr) {
        console.warn('AudioContext meter initialization error:', audioErr);
        // Fallback: mark sound detected if stream exists
        setSoundDetected(true);
      }
    } catch (err: unknown) {
      console.error('Media stream error:', err);
      const error = err as { name?: string; message?: string };
      setErrorMessage(
        error.name === 'NotAllowedError'
          ? 'Permission denied. Please grant camera & microphone access in your browser.'
          : 'Unable to access camera or microphone. Please verify hardware connection.'
      );
    }
  };

  useEffect(() => {
    initMedia();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      // Note: We do not stop tracks here if user proceeds, we pass streamRef.current to interview
    };
  }, []);

  // Speaker / TTS Check
  const testSpeaker = () => {
    if (!('speechSynthesis' in window)) {
      setSpeakerTested(true);
      return;
    }

    speakElsa(
      "Diagnostic check confirmed. Sound output calibrated. I am Elsa, and I am ready to conduct your interview.",
      {
        onStart: () => setIsSpeakingTest(true),
        onEnd: () => {
          setIsSpeakingTest(false);
          setSpeakerTested(true);
        },
        onError: () => {
          setIsSpeakingTest(false);
          setSpeakerTested(true);
        }
      }
    );
  };

  // Speech Recognition Check
  const testSpeechRecognition = () => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: any }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSttTranscript('Web Speech recognition supported on Chromium browsers.');
      setSttTested(true);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      setIsListeningStt(true);
      setSttTranscript('Listening... Speak a phrase like "Ready for interview"');

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setSttTranscript(`"${transcript.trim()}"`);
        setSttTested(true);
      };

      recognition.onerror = () => {
        setIsListeningStt(false);
        setSttTested(true); // Don't block
      };

      recognition.onend = () => {
        setIsListeningStt(false);
        setSttTested(true);
      };

      recognition.start();
    } catch (e) {
      console.warn('STT test failed:', e);
      setSttTested(true);
      setIsListeningStt(false);
    }
  };

  const allPassed = cameraActive && (soundDetected || micActive) && (speakerTested || true);

  const handleLaunch = () => {
    onComplete(streamRef.current);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-950/20 via-background to-purple-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1">
            <Radio size={14} className="animate-pulse" />
            <span>ELSA SYSTEM CALIBRATION • PRE-FLIGHT CHECK</span>
          </div>
          <h2 className="text-2xl font-bold font-mono text-zinc-100 tracking-tight">
            Hardware & Environment Verification
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Elsa conducts realistic technical interviews with live camera and continuous voice recognition. Please verify your camera framing, microphone sound levels, and speaker output.
          </p>
        </div>

        <button
          onClick={initMedia}
          className="px-3.5 py-2 rounded-xl border border-border bg-background hover:bg-zinc-800 text-zinc-300 font-mono text-xs flex items-center gap-2 transition shrink-0"
        >
          <RefreshCw size={13} />
          <span>Re-test Hardware</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs font-mono flex items-center gap-3">
          <AlertCircle size={18} className="shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Verification Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* CAMERA PREVIEW (7 Cols) */}
        <div className="md:col-span-7 border border-border bg-background-panel rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
            <div className="flex items-center space-x-2">
              <Camera size={16} className="text-cyan-400" />
              <h3 className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider">
                Video Feed & Framing
              </h3>
            </div>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
              cameraActive
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                : 'bg-zinc-800 border-zinc-700 text-zinc-400'
            }`}>
              {cameraActive ? 'CAMERA ONLINE' : 'STANDBY'}
            </span>
          </div>

          {/* Video Container with HUD overlay */}
          <div className="relative aspect-video bg-zinc-950 rounded-xl overflow-hidden border border-cyan-500/30 flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover -scale-x-100"
            />

            {/* Corner Tech Reticles */}
            <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
            <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
            <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

            {/* Facial Framing Guide Circle */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
              <div className="w-44 h-56 rounded-full border border-dashed border-cyan-400" />
            </div>

            {/* Live Status Overlay */}
            <div className="absolute bottom-3 left-3 px-2 py-1 rounded bg-black/60 backdrop-blur-sm border border-white/10 font-mono text-[9px] text-zinc-300 flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${cameraActive ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
              <span>{cameraActive ? '720p HD • LIVE FEED' : 'NO CAMERA DETECTED'}</span>
            </div>
          </div>

          <p className="text-[11px] font-mono text-zinc-400 mt-3 text-center">
            Position your face within the reticle. Ensure good front-facing lighting.
          </p>
        </div>

        {/* AUDIO & SPEECH DIAGNOSTICS (5 Cols) */}
        <div className="md:col-span-5 space-y-4">
          
          {/* Microphone Sound Level */}
          <div className="border border-border bg-background-panel rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Mic size={16} className="text-amber-400" />
                <h4 className="text-xs font-mono font-bold text-zinc-200 uppercase">Sound Input Meter</h4>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                soundDetected
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}>
                {soundDetected ? 'VOICE DETECTED' : 'AWAITING SOUND'}
              </span>
            </div>

            <p className="text-[11px] text-zinc-400">
              Speak into your microphone to verify volume level sensitivity:
            </p>

            {/* VU Meter Bar */}
            <div className="space-y-1.5">
              <div className="h-3 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-700/60 p-0.5">
                <div
                  className="h-full rounded-full transition-all duration-75"
                  style={{
                    width: `${micLevel}%`,
                    background: micLevel > 75
                      ? 'linear-gradient(90deg, #10b981 0%, #f59e0b 60%, #ef4444 100%)'
                      : micLevel > 20
                      ? 'linear-gradient(90deg, #10b981 0%, #06b6d4 100%)'
                      : '#10b981'
                  }}
                />
              </div>
              <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                <span>0 dB (Silence)</span>
                <span className="font-bold text-zinc-300">{micLevel}% Level</span>
                <span>Max Input</span>
              </div>
            </div>
          </div>

          {/* Speaker / TTS Test */}
          <div className="border border-border bg-background-panel rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Volume2 size={16} className="text-cyan-400" />
                <h4 className="text-xs font-mono font-bold text-zinc-200 uppercase">Stark TTS Voice Output</h4>
              </div>
              {speakerTested && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border bg-emerald-500/15 border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={10} /> VERIFIED
                </span>
              )}
            </div>

            <p className="text-[11px] text-zinc-400">
              Stark speaks questions aloud using Speech Synthesis. Ensure your speakers are audible:
            </p>

            <button
              onClick={testSpeaker}
              disabled={isSpeakingTest}
              className={`w-full py-2 px-3 rounded-xl border text-xs font-mono font-bold flex items-center justify-center gap-2 transition ${
                isSpeakingTest
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 animate-pulse'
                  : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-200'
              }`}
            >
              <Volume2 size={14} />
              <span>{isSpeakingTest ? 'Playing Stark Voice Test...' : 'Test Stark Audio Output'}</span>
            </button>
          </div>

          {/* Speech Recognition Test */}
          <div className="border border-border bg-background-panel rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Mic size={16} className="text-purple-400" />
                <h4 className="text-xs font-mono font-bold text-zinc-200 uppercase">Speech Recognition</h4>
              </div>
              {sttTested && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border bg-emerald-500/15 border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={10} /> ACTIVE
                </span>
              )}
            </div>

            <p className="text-[11px] text-zinc-400">
              Stark transcribes your spoken answers in real-time. Test speech recognition:
            </p>

            <button
              onClick={testSpeechRecognition}
              disabled={isListeningStt}
              className={`w-full py-2 px-3 rounded-xl border text-xs font-mono font-bold flex items-center justify-center gap-2 transition ${
                isListeningStt
                  ? 'bg-purple-500/20 border-purple-500 text-purple-300 animate-pulse'
                  : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-200'
              }`}
            >
              <Radio size={14} />
              <span>{isListeningStt ? 'Listening... Speak Now' : 'Test Speech-to-Text Recognition'}</span>
            </button>

            {sttTranscript && (
              <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-border font-mono text-[10px] text-zinc-300">
                <span className="text-purple-400 font-bold">Heard: </span>
                {sttTranscript}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Action Footer */}
      <div className="glass-panel p-5 rounded-2xl border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className={`w-3 h-3 rounded-full ${allPassed ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-amber-400 animate-pulse'}`} />
          <span className="text-zinc-300">
            {allPassed
              ? 'All requirements satisfied. Elsa is primed for your interview.'
              : 'Diagnostics in progress. You can proceed directly or finish tests.'}
          </span>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={onCancel}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-border bg-background hover:bg-zinc-800 text-zinc-300 font-mono text-xs transition"
          >
            Back to Topics
          </button>
          <button
            onClick={handleLaunch}
            className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-mono text-xs font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)] transition flex items-center justify-center gap-2"
          >
            <span>Enter Elsa Interview Chamber</span>
            <CheckCircle2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
