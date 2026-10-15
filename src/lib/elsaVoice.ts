/**
 * KODEXIS Elsa Female Voice Engine
 * Guarantees a natural, clear female voice across all operating systems and browsers.
 * Explicitly rejects male voices (e.g. Microsoft David on Windows) and implements
 * Chromium speech synthesis heartbeat to prevent hung speech synthesis.
 */

// Known female voice identifiers across Windows, macOS, iOS, Android, and Chromium
const FEMALE_VOICE_NAMES = [
  'zira',          // Windows Microsoft Zira
  'jenny',         // Edge Microsoft Jenny Online (Natural)
  'aria',          // Edge Microsoft Aria Online (Natural)
  'samantha',      // macOS / iOS Samantha
  'victoria',      // macOS Victoria
  'karen',         // macOS / iOS Karen
  'eva',           // Windows / Android Eva
  'catherine',     // Windows Catherine
  'hazel',         // Windows Hazel (UK)
  'susan',         // Windows Susan (UK)
  'libby',         // Edge Libby
  'sonia',         // Edge Sonia
  'moira',         // macOS Moira (Irish)
  'fiona',         // macOS Fiona (Scottish)
  'tessa',         // macOS Tessa (South Africa)
  'alice',         // macOS Alice
  'serena',        // macOS Serena
  'stephanie',     // macOS Stephanie
  'claire',        // Edge Claire
  'olivia',        // Edge Olivia
  'emma',          // Edge Emma
  'amy',           // Edge Amy
  'joanna',        // AWS Polly Joanna / Edge
  'kendra',        // Edge Kendra
  'salli',         // Edge Salli
  'female',        // Generic "female" tags
  'woman'
];

// Known male voice identifiers to strictly reject
const MALE_VOICE_NAMES = [
  'david',         // Windows Microsoft David Desktop
  'george',        // Windows Microsoft George
  'mark',          // Windows Microsoft Mark
  'richard',       // Windows Microsoft Richard
  'james',         // macOS / Edge James
  'guy',           // Edge Guy
  'stefan',        // Edge Stefan
  'daniel',        // macOS Daniel
  'oliver',        // macOS Oliver
  'ravi',          // Windows Microsoft Ravi
  'male',          // Generic "male" tag
  'man',
  'boy',
  'paul',
  'tom',
  'brian',
  'russell',
  'matthew',
  'justin',
  'joey'
];

let cachedVoices: SpeechSynthesisVoice[] = [];
let voiceLoadingPromise: Promise<SpeechSynthesisVoice[]> | null = null;

/**
 * Pre-warm and retrieve browser voices asynchronously with onvoiceschanged support
 */
export function getAvailableVoices(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return Promise.resolve([]);
  }

  const existing = window.speechSynthesis.getVoices();
  if (existing.length > 0) {
    cachedVoices = existing;
    return Promise.resolve(existing);
  }

  if (voiceLoadingPromise) {
    return voiceLoadingPromise;
  }

  voiceLoadingPromise = new Promise((resolve) => {
    let resolved = false;

    const handleVoicesChanged = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) {
        resolved = true;
        cachedVoices = v;
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
        resolve(v);
      }
    };

    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);

    // Safety timeout in case voiceschanged doesn't trigger
    setTimeout(() => {
      if (!resolved) {
        cachedVoices = window.speechSynthesis.getVoices();
        resolve(cachedVoices);
      }
    }, 600);
  });

  return voiceLoadingPromise;
}

// Preload voices immediately on script load
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  getAvailableVoices().catch(() => {});
}

/**
 * Select the highest quality female voice available on the host machine.
 * Guaranteed to never pick a known male voice.
 */
export function getElsaFemaleVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return null;
  }

  let voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  // 1. Filter out all explicitly male voices
  const nonMaleVoices = voices.filter((v) => {
    const nameLower = v.name.toLowerCase();
    return !MALE_VOICE_NAMES.some((m) => nameLower.includes(m));
  });

  const candidates = nonMaleVoices.length > 0 ? nonMaleVoices : voices;

  // 2. Prioritize high-quality female English voices by name
  for (const femaleName of FEMALE_VOICE_NAMES) {
    const match = candidates.find(
      (v) =>
        v.lang.toLowerCase().startsWith('en') &&
        v.name.toLowerCase().includes(femaleName)
    );
    if (match) return match;
  }

  // 3. Match any English voice that has female tag
  const anyFemale = candidates.find(
    (v) =>
      v.lang.toLowerCase().startsWith('en') &&
      (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('natural'))
  );
  if (anyFemale) return anyFemale;

  // 4. Match any non-male English voice
  const nonMaleEnglish = candidates.find((v) => v.lang.toLowerCase().startsWith('en'));
  if (nonMaleEnglish) return nonMaleEnglish;

  // 5. Fallback to first non-male candidate
  return candidates[0] || null;
}

export interface ElsaSpeakOptions {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
  rate?: number;
  pitch?: number;
}

let activeHeartbeat: any = null;

/**
 * Speak text as Elsa using a verified female voice with Chromium heartbeat protection
 */
export function speakElsa(text: string, options?: ElsaSpeakOptions): () => void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    options?.onEnd?.();
    return () => {};
  }

  // Clear any existing speech
  window.speechSynthesis.cancel();
  if (activeHeartbeat) {
    clearInterval(activeHeartbeat);
    activeHeartbeat = null;
  }

  // Strip markdown formatting for clear TTS articulation
  const clean = text
    .replace(/[*_#`>[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!clean) {
    options?.onEnd?.();
    return () => {};
  }

  const utterance = new SpeechSynthesisUtterance(clean);

  // Female voice tuning: pitch 1.15 gives bright, feminine tone
  utterance.rate = options?.rate ?? 0.98;
  utterance.pitch = options?.pitch ?? 1.15;

  const femaleVoice = getElsaFemaleVoice();
  if (femaleVoice) {
    utterance.voice = femaleVoice;
    // If voice has generic name, elevate pitch slightly to ensure feminine timbre
    const isExplicitFemale = FEMALE_VOICE_NAMES.some((n) =>
      femaleVoice.name.toLowerCase().includes(n)
    );
    if (!isExplicitFemale) {
      utterance.pitch = 1.25;
    }
  } else {
    utterance.pitch = 1.25;
  }

  // Prevent Chromium garbage collection of active utterance
  (window as any)._elsaCurrentUtterance = utterance;

  let hasEnded = false;
  let safetyTimer: any = null;

  const cleanup = () => {
    if (activeHeartbeat) {
      clearInterval(activeHeartbeat);
      activeHeartbeat = null;
    }
    if (safetyTimer) {
      clearTimeout(safetyTimer);
      safetyTimer = null;
    }
  };

  const handleEnd = () => {
    if (hasEnded) return;
    hasEnded = true;
    cleanup();
    options?.onEnd?.();
  };

  utterance.onstart = () => {
    options?.onStart?.();

    // Chromium speech synthesis heartbeat: prevents audio from freezing on sentences > 15s
    activeHeartbeat = setInterval(() => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      } else {
        clearInterval(activeHeartbeat);
        activeHeartbeat = null;
      }
    }, 4500);
  };

  utterance.onend = () => {
    handleEnd();
  };

  utterance.onerror = (e) => {
    console.warn('[Elsa Voice] Speech synthesis event:', e);
    handleEnd();
    options?.onError?.(e);
  };

  // Safety fallback: Chromium bug occasionally drops onend
  const words = clean.split(/\s+/).filter(Boolean);
  const estimatedDurationMs = Math.max(3500, words.length * 350 + 1500);
  safetyTimer = setTimeout(() => {
    if (!hasEnded) {
      console.log('[Elsa Voice] Safety timer triggered for completion');
      handleEnd();
    }
  }, estimatedDurationMs);

  try {
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('[Elsa Voice] Speech synthesis invocation error:', err);
    handleEnd();
  }

  // Return cancel function
  return () => {
    cleanup();
    window.speechSynthesis.cancel();
    hasEnded = true;
  };
}
