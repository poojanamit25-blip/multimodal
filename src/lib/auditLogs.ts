export interface CandidateActivity {
  id: string;
  timestamp: string;
  actionType: 'SOLVE' | 'TAB_SWITCH' | 'LOGIC_GATE' | 'FULLSCREEN' | 'RUN_CODE' | 'SUBMIT';
  description: string;
  questionTitle: string;
  difficulty: string;
  status: 'PASSED' | 'FAILED' | 'WARNING' | 'INFO';
  metrics?: {
    runtimeMs?: number;
    tabSwitches?: number;
    testCasesPassed?: string;
    logicVerdict?: string;
  };
}

export interface CandidateUsageLog {
  id: string;
  userId: string;
  username: string;
  fullName: string;
  targetRole: string;
  level: {
    number: number; // 1 to 5
    title: string;
    badgeColor: string;
    xp: number;
    readinessScore: number;
  };
  regularity: {
    tier: 'Daily Active' | 'Frequent' | 'Weekly' | 'Occasional' | 'Newcomer';
    sessionsCount: number;
    streakDays: number;
    lastActive: string;
    hoursPracticed: number;
  };
  skills: {
    domain: string;
    proficiency: 'EXPERT' | 'STRONG' | 'INTERMEDIATE' | 'DEVELOPING' | 'WEAK';
  }[];
  recentActivities: CandidateActivity[];
}

export const SEED_USERS_LOGS: CandidateUsageLog[] = [];

export const getAuditUsers = (): CandidateUsageLog[] => {
  try {
    const rawCustomLogs = localStorage.getItem('kodexis_user_custom_logs');
    const customActivities: CandidateActivity[] = rawCustomLogs ? JSON.parse(rawCustomLogs) : [];

    // Retrieve registered candidates from local DB
    const rawDb = localStorage.getItem('kodexis_users_db');
    const usersDb: Record<string, any> = rawDb ? JSON.parse(rawDb) : {};

    // Retrieve active logged in user
    const rawCurrentUser = localStorage.getItem('kodexis_user');
    const currentUser = rawCurrentUser ? JSON.parse(rawCurrentUser) : null;

    if (currentUser && currentUser.username) {
      usersDb[currentUser.username.toLowerCase()] = currentUser;
    }

    const candidateList = Object.values(usersDb);
    if (candidateList.length === 0) {
      return [];
    }

    return candidateList.map((u: any, idx: number) => {
      const userActivities = customActivities.filter(a => !a.id || a.id.includes(u.username) || idx === 0);
      const readiness = typeof u.readinessScore === 'number' ? u.readinessScore : 85;
      
      return {
        id: `user-${u.username || idx}`,
        userId: String(idx + 1),
        username: u.username || 'candidate',
        fullName: u.fullName || (u.username ? u.username.charAt(0).toUpperCase() + u.username.slice(1) : 'Candidate'),
        targetRole: u.targetRole || 'Software Engineer',
        level: {
          number: readiness >= 90 ? 4 : readiness >= 75 ? 3 : 2,
          title: readiness >= 90 ? 'Level 4: Senior Problem Solver' : readiness >= 75 ? 'Level 3: Mid-Level Developer' : 'Level 2: Junior Developer',
          badgeColor: readiness >= 90 ? 'text-brand-violet bg-brand-violet/10 border-brand-violet/30' : 'text-brand-cyan bg-brand-cyan/10 border-brand-cyan/30',
          xp: readiness * 15,
          readinessScore: readiness
        },
        regularity: {
          tier: userActivities.length > 5 ? 'Daily Active' : userActivities.length > 0 ? 'Frequent' : 'Newcomer',
          sessionsCount: userActivities.length,
          streakDays: userActivities.length > 0 ? 1 : 0,
          lastActive: userActivities.length > 0 ? 'Recently' : 'New account',
          hoursPracticed: Math.round(userActivities.length * 0.5 * 10) / 10
        },
        skills: [
          { domain: 'Algorithms & Data Structures', proficiency: readiness >= 85 ? 'STRONG' : 'INTERMEDIATE' },
          { domain: u.preferredLanguage || 'Java / Python', proficiency: 'STRONG' }
        ],
        recentActivities: userActivities
      };
    });
  } catch (e) {
    return [];
  }
};

export const logUserActivity = (activity: Omit<CandidateActivity, 'id' | 'timestamp'>): void => {
  try {
    const raw = localStorage.getItem('kodexis_user_custom_logs');
    const existing: CandidateActivity[] = raw ? JSON.parse(raw) : [];

    const newActivity: CandidateActivity = {
      ...activity,
      id: `act-live-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updated = [newActivity, ...existing].slice(0, 50); // keep recent 50
    localStorage.setItem('kodexis_user_custom_logs', JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to log user activity:', e);
  }
};
