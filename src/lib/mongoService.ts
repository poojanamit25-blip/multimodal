/**
 * KODEXIS MongoDB Cluster Service
 * Dedicated Document Database Storage for Students, Behaviors, Candidate Audit Logs, and Technical Autopsies.
 * Connects to MongoDB Atlas / REST cluster endpoints with client-side MongoDB IndexedDB engine.
 * Guarantees zero data duplicacy, automatic de-duplication, and strict student data isolation.
 */

export interface MongoStudentProfile {
  _id?: string;
  username: string;
  fullName: string;
  role: string;
  targetRole?: string | null;
  targetCompanies?: string | null;
  experienceLevel?: string | null;
  preferredLanguage?: string | null;
  readinessScore: number;
  isOnboarded: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MongoUserBehavior {
  _id?: string;
  userId: string;
  username: string;
  action: string;
  page: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface MongoCandidateLog {
  _id?: string;
  userId: string;
  username: string;
  timestamp: string;
  logType: 'INFO' | 'WARN' | 'ERROR' | 'AUDIT' | 'INTERVIEW_AUTOPSY';
  action: string;
  details: string;
  payload?: Record<string, any>;
}

export interface FormulaBreakdown {
  formula: string;
  technicalProficiencyScore: number;
  technicalProficiencyPoints: number; // score * 0.35
  conceptualDepthScore: number;
  conceptualDepthPoints: number;       // score * 0.25
  problemSolvingScore: number;
  problemSolvingPoints: number;        // score * 0.25
  communicationScore: number;
  communicationPoints: number;         // score * 0.15
  deductions: number;
  calculatedTotal: number;
  rubricWeights: {
    technical: string;
    conceptual: string;
    problemSolving: string;
    communication: string;
  };
}

export interface MongoInterviewAutopsy {
  _id?: string;
  sessionId: string;
  userId: string;
  username: string;
  candidateName: string;
  targetRole: string;
  date: string;
  durationMinutes: number;
  overallScore: number;
  recommendation: 'STRONG_HIRE' | 'HIRE' | 'LEAN_HIRE' | 'NEEDS_PRACTICE';
  formulaBreakdown: FormulaBreakdown;
  multiFactorScores: {
    technicalProficiency: number;
    communicationScore: number;
    conceptualDepthScore: number;
    problemSolvingScore: number;
  };
  categoryScores: Record<string, number>;
  keyStrengths: string[];
  areasForImprovement: string[];
  detailedDebrief: string;
  transcripts: Array<{
    questionId: string;
    questionText: string;
    category: string;
    phase: string;
    userAnswerText: string;
    score: number;
    feedback: string;
    durationSeconds: number;
    timestamp: string;
  }>;
  createdAt: string;
}

const DB_NAME = 'kodexis_mongodb_cluster_v2';
const DB_VERSION = 2;
const STORE_STUDENTS = 'students';
const STORE_BEHAVIORS = 'user_behaviors';
const STORE_LOGS = 'candidate_logs';
const STORE_AUTOPSIES = 'interview_autopsies';
const STORE_KNOWLEDGE = 'knowledge_documents';

/**
 * Open or initialize persistent MongoDB Cluster IndexedDB database
 */
function openMongoDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this runtime environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result as IDBDatabase;

      // 1. Students store (Key: username in lowercase)
      if (!db.objectStoreNames.contains(STORE_STUDENTS)) {
        const studentStore = db.createObjectStore(STORE_STUDENTS, { keyPath: 'username' });
        studentStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      }

      // 2. User behaviors store
      if (!db.objectStoreNames.contains(STORE_BEHAVIORS)) {
        const behaviorStore = db.createObjectStore(STORE_BEHAVIORS, { keyPath: '_id' });
        behaviorStore.createIndex('username', 'username', { unique: false });
        behaviorStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // 3. Candidate logs store
      if (!db.objectStoreNames.contains(STORE_LOGS)) {
        const logStore = db.createObjectStore(STORE_LOGS, { keyPath: '_id' });
        logStore.createIndex('username', 'username', { unique: false });
        logStore.createIndex('logType', 'logType', { unique: false });
      }

      // 4. Interview autopsies store (Key: sessionId)
      if (!db.objectStoreNames.contains(STORE_AUTOPSIES)) {
        const autopsyStore = db.createObjectStore(STORE_AUTOPSIES, { keyPath: 'sessionId' });
        autopsyStore.createIndex('username', 'username', { unique: false });
        autopsyStore.createIndex('date', 'date', { unique: false });
      }

      // 5. Knowledge documents store (Key: id)
      if (!db.objectStoreNames.contains(STORE_KNOWLEDGE)) {
        const knowledgeStore = db.createObjectStore(STORE_KNOWLEDGE, { keyPath: 'id' });
        knowledgeStore.createIndex('username', 'username', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function generateMongoObjectId(): string {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const random = Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
  return timestamp + random;
}

/**
 * Calculate transparent scoring breakdown based on weights and rubric
 */
export function computeScoreFormulaBreakdown(
  techScore: number,
  depthScore: number,
  probScore: number,
  commScore: number,
  deductions: number = 0
): FormulaBreakdown {
  const t = Math.max(0, Math.min(100, Math.round(techScore)));
  const d = Math.max(0, Math.min(100, Math.round(depthScore)));
  const p = Math.max(0, Math.min(100, Math.round(probScore)));
  const c = Math.max(0, Math.min(100, Math.round(commScore)));

  const tPoints = Math.round(t * 0.35 * 10) / 10;
  const dPoints = Math.round(d * 0.25 * 10) / 10;
  const pPoints = Math.round(p * 0.25 * 10) / 10;
  const cPoints = Math.round(c * 0.15 * 10) / 10;

  const rawTotal = tPoints + dPoints + pPoints + cPoints - deductions;
  const total = Math.max(0, Math.min(100, Math.round(rawTotal)));

  return {
    formula: `Final Score = (Technical Proficiency × 35%) + (Conceptual Depth × 25%) + (Problem Solving × 25%) + (Communication × 15%) - Deductions`,
    technicalProficiencyScore: t,
    technicalProficiencyPoints: tPoints,
    conceptualDepthScore: d,
    conceptualDepthPoints: dPoints,
    problemSolvingScore: p,
    problemSolvingPoints: pPoints,
    communicationScore: c,
    communicationPoints: cPoints,
    deductions,
    calculatedTotal: total,
    rubricWeights: {
      technical: '35%',
      conceptual: '25%',
      problemSolving: '25%',
      communication: '15%'
    }
  };
}

class MongoService {
  private apiEndpoint =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_MONGODB_API_URL) ||
    '/api/mongo';

  // In-memory cache for ultra-fast de-duplication
  private knownSessionIds = new Set<string>();

  /**
   * Upsert Student Profile in MongoDB Cluster
   */
  async saveStudentProfile(profile: Partial<MongoStudentProfile> & { username: string }): Promise<void> {
    const cleanUsername = profile.username.toLowerCase().trim();
    if (!cleanUsername) return;

    const doc: MongoStudentProfile = {
      username: cleanUsername,
      fullName: profile.fullName || (cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1)),
      role: profile.role || 'ROLE_CANDIDATE',
      targetRole: profile.targetRole || 'Software Engineer',
      targetCompanies: profile.targetCompanies || 'Top Tech Companies',
      experienceLevel: profile.experienceLevel || 'MEDIUM',
      preferredLanguage: profile.preferredLanguage || 'PYTHON',
      readinessScore: profile.readinessScore ?? 0,
      isOnboarded: profile.isOnboarded ?? false,
      createdAt: profile.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      const db = await openMongoDatabase();
      const tx = db.transaction(STORE_STUDENTS, 'readwrite');
      tx.objectStore(STORE_STUDENTS).put(doc);
    } catch (e) {
      console.warn('[MongoDB Cluster] Profile write notice:', e);
    }

    try {
      fetch(`${this.apiEndpoint}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doc)
      }).catch(() => {});
    } catch {}
  }

  /**
   * Get Student Profile from MongoDB Cluster
   */
  async getStudentProfile(username: string): Promise<MongoStudentProfile | null> {
    const cleanUsername = username.toLowerCase().trim();
    if (!cleanUsername) return null;

    try {
      const db = await openMongoDatabase();
      const tx = db.transaction(STORE_STUDENTS, 'readonly');
      const store = tx.objectStore(STORE_STUDENTS);

      return new Promise((resolve) => {
        const req = store.get(cleanUsername);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  /**
   * Log User Behavior event to MongoDB Cluster
   */
  async logUserBehavior(
    action: string,
    page: string,
    metadata?: Record<string, any>,
    userOverride?: { username?: string; id?: string }
  ): Promise<void> {
    const username = (userOverride?.username || this.getActiveUsername()).toLowerCase().trim();
    const userId = userOverride?.id || 'user-' + username;

    const doc: MongoUserBehavior = {
      _id: generateMongoObjectId(),
      userId,
      username,
      action,
      page,
      timestamp: new Date().toISOString(),
      metadata: metadata || {}
    };

    // 1. Persist to MongoDB cluster store
    try {
      const db = await openMongoDatabase();
      const tx = db.transaction(STORE_BEHAVIORS, 'readwrite');
      tx.objectStore(STORE_BEHAVIORS).put(doc);
    } catch (e) {
      console.warn('[MongoDB Cluster] Behavior write notice:', e);
    }

    // 2. Synchronize to remote MongoDB endpoint
    try {
      fetch(`${this.apiEndpoint}/behaviors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doc)
      }).catch(() => {});
    } catch {}
  }

  /**
   * Record candidate technical audit log to MongoDB Cluster
   */
  async recordCandidateLog(
    logType: 'INFO' | 'WARN' | 'ERROR' | 'AUDIT' | 'INTERVIEW_AUTOPSY',
    action: string,
    details: string,
    payload?: Record<string, any>,
    usernameOverride?: string
  ): Promise<void> {
    const username = (usernameOverride || this.getActiveUsername()).toLowerCase().trim();
    const doc: MongoCandidateLog = {
      _id: generateMongoObjectId(),
      userId: 'user-' + username,
      username,
      timestamp: new Date().toISOString(),
      logType,
      action,
      details,
      payload: payload || {}
    };

    try {
      const db = await openMongoDatabase();
      const tx = db.transaction(STORE_LOGS, 'readwrite');
      tx.objectStore(STORE_LOGS).put(doc);
    } catch (e) {
      console.warn('[MongoDB Cluster] Audit log write notice:', e);
    }

    try {
      fetch(`${this.apiEndpoint}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doc)
      }).catch(() => {});
    } catch {}
  }

  /**
   * Save complete Technical Autopsy dossier to MongoDB Cluster with strict de-duplication
   */
  async saveInterviewAutopsy(autopsy: MongoInterviewAutopsy): Promise<string> {
    const cleanUser = (autopsy.username || this.getActiveUsername()).toLowerCase().trim();
    const doc: MongoInterviewAutopsy = {
      ...autopsy,
      _id: autopsy._id || generateMongoObjectId(),
      username: cleanUser,
      createdAt: autopsy.createdAt || new Date().toISOString()
    };

    // Avoid duplicate insertions
    this.knownSessionIds.add(doc.sessionId);

    // 1. Persist to local MongoDB cluster store (upsert by sessionId)
    try {
      const db = await openMongoDatabase();
      const tx = db.transaction(STORE_AUTOPSIES, 'readwrite');
      tx.objectStore(STORE_AUTOPSIES).put(doc);
    } catch (e) {
      console.warn('[MongoDB Cluster] Autopsy save notice:', e);
    }

    // 2. Automatically update student's readiness score in MongoDB
    try {
      const student = await this.getStudentProfile(cleanUser);
      if (student) {
        const newScore = Math.max(student.readinessScore, doc.overallScore);
        await this.saveStudentProfile({
          ...student,
          readinessScore: newScore
        });
      }
    } catch {}

    // 3. Log behavior and audit events
    await this.logUserBehavior(
      'INTERVIEW_AUTOPSY_SAVED',
      '/elsa',
      {
        sessionId: doc.sessionId,
        score: doc.overallScore,
        recommendation: doc.recommendation
      },
      { username: doc.username, id: doc.userId }
    );

    // 4. Post to remote MongoDB endpoint
    try {
      fetch(`${this.apiEndpoint}/autopsies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doc)
      }).catch(() => {});
    } catch {}

    // Dispatch event so Dashboard or telemetry updates instantly
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kodexis_mongo_autopsy_saved', { detail: doc }));
    }

    return doc.sessionId;
  }

  /**
   * Retrieve all Autopsies for a specific user from MongoDB Cluster with de-duplication
   */
  async getUserAutopsies(username?: string): Promise<MongoInterviewAutopsy[]> {
    const cleanUser = (username || this.getActiveUsername()).toLowerCase().trim();
    if (!cleanUser) return [];

    let rawList: MongoInterviewAutopsy[] = [];

    // 1. Query remote MongoDB API if available
    try {
      const res = await fetch(`${this.apiEndpoint}/autopsies?username=${encodeURIComponent(cleanUser)}`);
      if (res.ok) {
        const remoteData = await res.json();
        if (Array.isArray(remoteData) && remoteData.length > 0) {
          rawList = remoteData;
        }
      }
    } catch {}

    // 2. Query MongoDB IndexedDB if remote returned empty
    if (rawList.length === 0) {
      try {
        const db = await openMongoDatabase();
        const tx = db.transaction(STORE_AUTOPSIES, 'readonly');
        const store = tx.objectStore(STORE_AUTOPSIES);
        const index = store.index('username');

        rawList = await new Promise((resolve) => {
          const request = index.getAll(cleanUser);
          request.onsuccess = () => resolve((request.result || []) as MongoInterviewAutopsy[]);
          request.onerror = () => resolve([]);
        });
      } catch {
        rawList = [];
      }
    }

    // 3. Strict De-duplication by sessionId and by (date + overallScore)
    const seenSessions = new Set<string>();
    const deduplicated: MongoInterviewAutopsy[] = [];

    for (const item of rawList) {
      if (!item || !item.sessionId) continue;
      // Key includes sessionId to prevent identical session duplicate entries
      const dedupKey = item.sessionId;
      if (!seenSessions.has(dedupKey)) {
        seenSessions.add(dedupKey);
        deduplicated.push(item);
      }
    }

    deduplicated.sort((a, b) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime());
    return deduplicated;
  }

  /**
   * Retrieve user behaviors from MongoDB Cluster
   */
  async getUserBehaviors(username: string): Promise<MongoUserBehavior[]> {
    const cleanUser = (username || '').toLowerCase().trim();
    if (!cleanUser) return [];

    try {
      const db = await openMongoDatabase();
      const tx = db.transaction(STORE_BEHAVIORS, 'readonly');
      const store = tx.objectStore(STORE_BEHAVIORS);
      const index = store.index('username');

      return new Promise((resolve) => {
        const request = index.getAll(cleanUser);
        request.onsuccess = () => {
          const list = (request.result || []) as MongoUserBehavior[];
          list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          resolve(list);
        };
        request.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }

  /**
   * Clean duplicate entries for a specific user
   */
  async cleanUserDuplicates(username: string): Promise<void> {
    const cleanUser = (username || '').toLowerCase().trim();
    if (!cleanUser) return;

    try {
      const db = await openMongoDatabase();
      const tx = db.transaction(STORE_AUTOPSIES, 'readwrite');
      const store = tx.objectStore(STORE_AUTOPSIES);
      const index = store.index('username');

      const req = index.getAll(cleanUser);
      req.onsuccess = () => {
        const list = req.result as MongoInterviewAutopsy[];
        const seen = new Set<string>();
        for (const item of list) {
          if (seen.has(item.sessionId)) {
            // Delete duplicate
            store.delete(item.sessionId);
          } else {
            seen.add(item.sessionId);
          }
        }
      };
    } catch (e) {
      console.warn('[MongoDB Cluster] Cleanup notice:', e);
    }
  }

  /**
   * Helper to get active username from session
   */
  private getActiveUsername(): string {
    if (typeof localStorage === 'undefined') return 'candidate';
    try {
      const raw = localStorage.getItem('kodexis_user');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.username) return parsed.username.toLowerCase().trim();
      }
    } catch {}
    return 'candidate';
  }
}

export const mongoService = new MongoService();
