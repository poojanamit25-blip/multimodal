// KODEXIS Daily Practice Streak Engine & Telemetry Service

export interface DayProgress {
  dayName: string;   // 'Mon', 'Tue', etc.
  dateStr: string;   // 'YYYY-MM-DD'
  active: boolean;
  isToday: boolean;
  isFuture: boolean;
}

export type StreakBadgeTier = 'Beginner' | 'Intermediate' | 'Advanced';

export interface StreakBadgeInfo {
  tier: StreakBadgeTier;
  title: string;
  role: string;
  minStreak: number;
  maxStreak?: number;
  description: string;
  avatarType: 'beginner' | 'intermediate' | 'advanced';
  avatarEmoji: string;
  accentColor: string;
  gradient: string;
  perks: string[];
}

export const STREAK_BADGES: Record<StreakBadgeTier, StreakBadgeInfo> = {
  Beginner: {
    tier: 'Beginner',
    title: 'Beginner',
    role: 'Algorithmic Cadet',
    minStreak: 1,
    maxStreak: 6,
    description: 'Building foundational algorithmic momentum with initial daily streak practice.',
    avatarType: 'beginner',
    avatarEmoji: '🌱',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600',
    perks: ['Habit Formation Tracker', 'Basic Autopsy Telemetry', '1x Monthly Streak Freeze']
  },
  Intermediate: {
    tier: 'Intermediate',
    title: 'Intermediate',
    role: 'Consistency Knight',
    minStreak: 7,
    maxStreak: 13,
    description: 'Sustaining a dedicated daily rhythm with defensive problem-solving consistency.',
    avatarType: 'intermediate',
    avatarEmoji: '⚡',
    accentColor: '#38bdf8',
    gradient: 'from-sky-500 to-indigo-600',
    perks: ['2x Monthly Streak Freeze', 'Speed & Memory Benchmark Access', 'Priority Logic Feedback']
  },
  Advanced: {
    tier: 'Advanced',
    title: 'Advanced',
    role: 'Apex Grandmaster',
    minStreak: 14,
    description: 'Elite 14+ day algorithmic mastery reflecting top-tier dedication and interview poise.',
    avatarType: 'advanced',
    avatarEmoji: '👑',
    accentColor: '#f59e0b',
    gradient: 'from-amber-400 via-orange-500 to-amber-600',
    perks: ['Executive Offer Readiness Seal', 'Top 1% Candidate Profile Tag', 'Permanent Hall of Fame Badge']
  }
};

export const getStreakBadge = (streak: number): StreakBadgeInfo => {
  if (streak >= 14) return STREAK_BADGES.Advanced;
  if (streak >= 7) return STREAK_BADGES.Intermediate;
  return STREAK_BADGES.Beginner;
};

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string; // YYYY-MM-DD
  todayCompleted: boolean;
  freezeCount: number;
  totalActiveDays: number;
  weeklyProgress: DayProgress[];
  historyDates: string[]; // List of YYYY-MM-DD
  tier: StreakBadgeTier;
  badge: StreakBadgeInfo;
  nextMilestone: number;
  daysToNextMilestone: number;
  motivationalQuote: string;
}

export const getStreakStorageKey = (customUsername?: string): string => {
  if (customUsername && customUsername.trim()) {
    return `kodexis_user_streak_${customUsername.trim().toLowerCase()}`;
  }
  try {
    const raw = localStorage.getItem('kodexis_user');
    if (raw) {
      const u = JSON.parse(raw);
      if (u.username) {
        return `kodexis_user_streak_${u.username.trim().toLowerCase()}`;
      }
    }
  } catch {}
  return 'kodexis_user_streak_default';
};

// Helper to format date as YYYY-MM-DD in local time
export const formatDateStr = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Calculate day difference (d1 - d2 in calendar days)
const getDaysDifference = (d1Str: string, d2Str: string): number => {
  const [y1, m1, day1] = d1Str.split('-').map(Number);
  const [y2, m2, day2] = d2Str.split('-').map(Number);
  const date1 = new Date(y1, m1 - 1, day1);
  const date2 = new Date(y2, m2 - 1, day2);
  const diffTime = date1.getTime() - date2.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
};

export const getStreakTier = (streak: number): StreakBadgeTier => {
  if (streak >= 14) return 'Advanced';
  if (streak >= 7) return 'Intermediate';
  return 'Beginner';
};

const getNextMilestone = (streak: number): number => {
  const milestones = [3, 7, 14, 21, 30, 50, 100];
  for (const m of milestones) {
    if (streak < m) return m;
  }
  return streak + 10;
};

const MOTIVATIONAL_QUOTES = [
  "Consistency beats talent when talent isn't consistent.",
  "Top 1% engineering problem solvers practice every single day.",
  "Small daily code repetitions build world-class algorithmic reflexes.",
  "Your streak represents momentum. Guard it relentlessly.",
  "Every session brings you one step closer to your dream engineering offer."
];

// Generate 7-day Monday -> Sunday week structure for current date
const generateWeeklyProgress = (historyDatesSet: Set<string>, todayStr: string): DayProgress[] => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
  // Convert so Monday = 0, Sunday = 6
  const monOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  
  const monday = new Date(now);
  monday.setDate(now.getDate() + monOffset);

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const week: DayProgress[] = [];

  for (let i = 0; i < 7; i++) {
    const current = new Date(monday);
    current.setDate(monday.getDate() + i);
    const dateStr = formatDateStr(current);
    const isToday = dateStr === todayStr;
    const isFuture = dateStr > todayStr;
    const active = historyDatesSet.has(dateStr);

    week.push({
      dayName: dayNames[i],
      dateStr,
      active,
      isToday,
      isFuture
    });
  }

  return week;
};

// Initialize clean, authentic streak data for new candidate
const createDefaultStreak = (): StreakData => {
  const today = new Date();
  const todayStr = formatDateStr(today);
  
  const currentStreak = 0;
  const longestStreak = 0;
  const historySet = new Set<string>();
  const nextMilestone = 3;

  return {
    currentStreak,
    longestStreak,
    lastActivityDate: '',
    todayCompleted: false,
    freezeCount: 1,
    totalActiveDays: 0,
    weeklyProgress: generateWeeklyProgress(historySet, todayStr),
    historyDates: [],
    tier: 'Beginner',
    badge: getStreakBadge(0),
    nextMilestone,
    daysToNextMilestone: 3,
    motivationalQuote: MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]
  };
};

export const getStreakData = (username?: string): StreakData => {
  try {
    const storageKey = getStreakStorageKey(username);
    const raw = localStorage.getItem(storageKey);
    const todayStr = formatDateStr(new Date());

    if (!raw) {
      const initial = createDefaultStreak();
      localStorage.setItem(storageKey, JSON.stringify(initial));
      return initial;
    }

    const data: StreakData = JSON.parse(raw);
    const daysSince = getDaysDifference(todayStr, data.lastActivityDate);
    const historySet = new Set(data.historyDates || []);

    let currentStreak = data.currentStreak;
    let freezeCount = data.freezeCount ?? 1;
    let todayCompleted = data.lastActivityDate === todayStr;

    // Evaluate streak validity
    if (daysSince === 0) {
      // Practiced today
      todayCompleted = true;
    } else if (daysSince === 1) {
      // Practiced yesterday, awaiting today's practice
      todayCompleted = false;
    } else if (daysSince === 2 && freezeCount > 0) {
      // Missed 1 day, protect with streak freeze!
      freezeCount -= 1;
      todayCompleted = false;
      console.log('KODEXIS: Streak freeze shield consumed to protect active streak!');
    } else if (daysSince > 1) {
      // Streak broken
      currentStreak = 0;
      todayCompleted = false;
    }

    const nextMilestone = getNextMilestone(currentStreak);

    const updated: StreakData = {
      ...data,
      currentStreak,
      todayCompleted,
      freezeCount,
      weeklyProgress: generateWeeklyProgress(historySet, todayStr),
      tier: getStreakTier(currentStreak),
      badge: getStreakBadge(currentStreak),
      nextMilestone,
      daysToNextMilestone: Math.max(0, nextMilestone - currentStreak),
      motivationalQuote: data.motivationalQuote || MOTIVATIONAL_QUOTES[0]
    };

    localStorage.setItem(storageKey, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Error fetching streak data:', err);
    return createDefaultStreak();
  }
};

export const recordStreakActivity = (activityNote?: string, username?: string): StreakData => {
  try {
    const storageKey = getStreakStorageKey(username);
    const current = getStreakData(username);
    const todayStr = formatDateStr(new Date());

    if (current.lastActivityDate === todayStr && current.todayCompleted) {
      // Already recorded for today
      return current;
    }

    const daysSince = current.lastActivityDate ? getDaysDifference(todayStr, current.lastActivityDate) : 0;
    let newStreak = current.currentStreak;

    if (daysSince === 1 || newStreak === 0) {
      newStreak += 1;
    } else if (daysSince === 0) {
      // Same day first check-in
      newStreak = Math.max(1, newStreak);
    } else {
      // Gap
      newStreak = 1;
    }

    const newLongest = Math.max(current.longestStreak, newStreak);
    const historySet = new Set(current.historyDates);
    historySet.add(todayStr);
    const historyDates = Array.from(historySet).sort().reverse();
    const nextMilestone = getNextMilestone(newStreak);

    const updated: StreakData = {
      ...current,
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastActivityDate: todayStr,
      todayCompleted: true,
      totalActiveDays: current.totalActiveDays + (current.todayCompleted ? 0 : 1),
      weeklyProgress: generateWeeklyProgress(historySet, todayStr),
      historyDates,
      tier: getStreakTier(newStreak),
      badge: getStreakBadge(newStreak),
      nextMilestone,
      daysToNextMilestone: Math.max(0, nextMilestone - newStreak),
      motivationalQuote: MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]
    };

    localStorage.setItem(storageKey, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('kodexis_streak_updated', { detail: { streak: newStreak, note: activityNote } }));
    return updated;
  } catch (err) {
    console.error('Error recording streak activity:', err);
    return getStreakData(username);
  }
};
