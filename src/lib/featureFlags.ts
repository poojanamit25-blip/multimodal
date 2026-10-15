export interface PlatformFeature {
  id: string;
  key: string;
  name: string;
  description: string;
  category: 'Proctoring' | 'AI Interviewer' | 'Assessment' | 'Interface' | 'General';
  enabled: boolean;
  createdAt: string;
  isSystem?: boolean;
}

export const DEFAULT_FEATURES: PlatformFeature[] = [
  {
    id: 'feat-fullscreen-prompt',
    key: 'FULLSCREEN_PROCTORING_PROMPT',
    name: 'Fullscreen Coding Prompt',
    description: 'Prompts candidates to switch to fullscreen mode when starting to code for proctoring compliance.',
    category: 'Proctoring',
    enabled: true,
    createdAt: '2026-10-06T00:00:00Z',
    isSystem: true
  },
  {
    id: 'feat-tab-switch-tracker',
    key: 'TAB_SWITCH_TRACKER',
    name: 'Tab Switch Violation Counter',
    description: 'Monitors and counts browser tab/window switches during the interview, displaying warnings and recording telemetry.',
    category: 'Proctoring',
    enabled: true,
    createdAt: '2026-10-06T00:00:00Z',
    isSystem: true
  },
  {
    id: 'feat-strict-logic-gate',
    key: 'STRICT_LOGIC_GATE',
    name: 'Phase 1 Conceptual Logic Gate',
    description: 'Requires candidate to explain and defend data structures & Big-O complexity before unlocking the code editor.',
    category: 'AI Interviewer',
    enabled: true,
    createdAt: '2026-10-06T00:00:00Z',
    isSystem: true
  },
  {
    id: 'feat-sample-cases-markdown',
    key: 'SAMPLE_CASES_MARKDOWN',
    name: 'Rich Markdown Test Cases & Walkthrough',
    description: 'Renders comprehensive problem descriptions and sample test cases using styled React Markdown.',
    category: 'Interface',
    enabled: true,
    createdAt: '2026-10-06T00:00:00Z',
    isSystem: true
  },
  {
    id: 'feat-youtube-autopsy',
    key: 'YOUTUBE_AUTOPSY_REDIRECT',
    name: 'YouTube DSA Tutorial Recommendations',
    description: 'Redirects recommended practice topics on autopsy report to targeted YouTube search queries instead of static links.',
    category: 'Assessment',
    enabled: true,
    createdAt: '2026-10-06T00:00:00Z',
    isSystem: true
  },
  {
    id: 'feat-socratic-voice',
    key: 'SOCRATIC_VOICE_ORB',
    name: 'Socratic Voice Tutor & Live Orb',
    description: 'Enables live conversational reasoning and voice guidance with the AI Interviewer during coding sessions.',
    category: 'AI Interviewer',
    enabled: true,
    createdAt: '2026-10-06T00:00:00Z',
    isSystem: true
  },
  {
    id: 'feat-study-calendar',
    key: 'STUDY_CALENDAR_TRACKING',
    name: 'Study Calendar & Revision Planner',
    description: 'Adaptive spaced-repetition revision calendar and daily consistency tracking.',
    category: 'General',
    enabled: true,
    createdAt: '2026-10-06T00:00:00Z',
    isSystem: true
  },
  {
    id: 'feat-code-inspector',
    key: 'CODE_QUALITY_INSPECTOR',
    name: 'Real-time AST Code Quality Inspector',
    description: 'Computes cyclomatic complexity, code smells, and stylistic defects in real time.',
    category: 'Assessment',
    enabled: true,
    createdAt: '2026-10-06T00:00:00Z',
    isSystem: true
  }
];

export const getFeatures = (): PlatformFeature[] => {
  try {
    const raw = localStorage.getItem('kodexis_platform_features');
    if (!raw) {
      localStorage.setItem('kodexis_platform_features', JSON.stringify(DEFAULT_FEATURES));
      return DEFAULT_FEATURES;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem('kodexis_platform_features', JSON.stringify(DEFAULT_FEATURES));
      return DEFAULT_FEATURES;
    }
    return parsed;
  } catch (e) {
    return DEFAULT_FEATURES;
  }
};

export const saveFeatures = (features: PlatformFeature[]): void => {
  try {
    localStorage.setItem('kodexis_platform_features', JSON.stringify(features));
    window.dispatchEvent(new Event('kodexis_features_updated'));
  } catch (e) {
    console.error('Failed to save features to localStorage:', e);
  }
};

export const isFeatureEnabled = (key: string): boolean => {
  const features = getFeatures();
  const found = features.find(f => f.key === key);
  return found ? found.enabled : true;
};

export const toggleFeature = (keyOrId: string): boolean => {
  const features = getFeatures();
  let updatedState = false;
  const next = features.map(f => {
    if (f.key === keyOrId || f.id === keyOrId) {
      updatedState = !f.enabled;
      return { ...f, enabled: !f.enabled };
    }
    return f;
  });
  saveFeatures(next);
  return updatedState;
};

export const addFeature = (feature: Omit<PlatformFeature, 'id' | 'createdAt'>): PlatformFeature => {
  const features = getFeatures();
  const newFeature: PlatformFeature = {
    ...feature,
    id: `feat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString()
  };
  features.push(newFeature);
  saveFeatures(features);
  return newFeature;
};

export const removeFeature = (keyOrId: string): void => {
  const features = getFeatures();
  const next = features.filter(f => f.id !== keyOrId && f.key !== keyOrId);
  saveFeatures(next);
};

export const resetFeaturesToDefault = (): PlatformFeature[] => {
  saveFeatures(DEFAULT_FEATURES);
  return DEFAULT_FEATURES;
};
