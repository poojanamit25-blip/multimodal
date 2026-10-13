import {
  Course, DocumentItem, ContentUnit, ChatMessage,
  Assessment, AssessmentResult, LearnerProfile,
  KnowledgeGraphData, Flashcard, StudyScheduleData, EvaluationReport
} from '../types';

const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error [${res.status}]: ${errorText || res.statusText}`);
  }
  return res.json();
}

export const api = {
  healthCheck: () => fetchJson<{ status: string; service: string; time: string }>(`${API_BASE}/health`),

  // Courses
  listCourses: () => fetchJson<Course[]>(`${API_BASE}/courses`),
  getCourseTopics: (courseId: string) => fetchJson<string[]>(`${API_BASE}/courses/${courseId}/topics`),
  createCourse: (data: { code: string; title: string; description?: string }) =>
    fetchJson<Course>(`${API_BASE}/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  // Documents
  listDocuments: (courseId: string) =>
    fetchJson<DocumentItem[]>(`${API_BASE}/courses/${courseId}/documents`),
  getDocumentUnits: (docId: string) =>
    fetchJson<ContentUnit[]>(`${API_BASE}/documents/${docId}/units`),
  getDocumentStatus: (docId: string) =>
    fetchJson<{ status: string; progress: number; total_pages: number; total_duration_seconds: number }>(
      `${API_BASE}/documents/${docId}/status`
    ),
  uploadDocument: async (courseId: string, formData: FormData) => {
    const res = await fetch(`${API_BASE}/courses/${courseId}/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error(`Upload failed: ${await res.text()}`);
    return res.json();
  },
  deleteDocument: (docId: string) =>
    fetchJson<{ success: boolean; message: string }>(`${API_BASE}/documents/${docId}`, {
      method: 'DELETE',
    }),
  deleteVideoRecordings: (courseId: string) =>
    fetchJson<{ success: boolean; message: string; deleted_count: number }>(
      `${API_BASE}/courses/${courseId}/documents/video-recordings`,
      { method: 'DELETE' }
    ),

  // Tutor Chat
  sendChatMessage: (payload: {
    course_id: string;
    student_id?: string;
    session_id?: string;
    message: string;
    preferred_language?: string;
    allow_outside_knowledge?: boolean;
  }) =>
    fetchJson<{
      session_id: string;
      message_id: string;
      role: 'assistant';
      content: string;
      citations: any[];
      direct_evidence?: string;
      tutor_elaboration?: string;
      is_outside_knowledge: boolean;
      is_unanswerable: boolean;
      confidence: number;
      created_at: string;
    }>(`${API_BASE}/tutor/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
  getSessionMessages: (sessionId: string) =>
    fetchJson<ChatMessage[]>(`${API_BASE}/tutor/sessions/${sessionId}/messages`),

  // Assessments
  generateAssessment: (payload: {
    course_id: string;
    student_id?: string;
    assessment_type?: string;
    target_topics?: string[];
    difficulty?: string;
    total_questions?: number;
    time_limit_minutes?: number;
  }) =>
    fetchJson<Assessment>(`${API_BASE}/assessments/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
  getAssessment: (assessmentId: string) =>
    fetchJson<Assessment>(`${API_BASE}/assessments/${assessmentId}`),
  submitAssessment: (assessmentId: string, answers: { question_id: string; student_answer: string }[], studentId?: string) =>
    fetchJson<AssessmentResult>(`${API_BASE}/assessments/${assessmentId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: studentId || 'student_default', answers }),
    }),

  // Learner Profile & Mastery
  getLearnerProfile: (studentId = 'student_default', courseId = 'course_cs401') =>
    fetchJson<LearnerProfile>(`${API_BASE}/learner/profile?student_id=${studentId}&course_id=${courseId}`),
  onboardLearner: (payload: {
    student_id: string;
    name: string;
    preferred_language: string;
    study_goal_hours_per_week: number;
    exam_date?: string;
    prior_experience_level: string;
  }) =>
    fetchJson<{ message: string; diagnostic_score: number }>(`${API_BASE}/learner/onboard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),

  // Knowledge Graph
  getKnowledgeGraph: (courseId: string, studentId = 'student_default') =>
    fetchJson<KnowledgeGraphData>(`${API_BASE}/courses/${courseId}/knowledge-graph?student_id=${studentId}`),

  // Flashcards & Revision
  getFlashcards: (courseId: string, studentId = 'student_default') =>
    fetchJson<Flashcard[]>(`${API_BASE}/courses/${courseId}/flashcards?student_id=${studentId}`),
  reviewFlashcard: (cardId: string, quality: number) =>
    fetchJson<{ card_id: string; repetition_level: number; interval_days: number; next_review_date: string }>(
      `${API_BASE}/flashcards/${cardId}/review`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quality }),
      }
    ),
  getRevisionSummary: (courseId: string, topic: string) =>
    fetchJson<{ topic_name: string; audio_script: string; key_takeaways: string[]; estimated_listen_time_seconds: number }>(
      `${API_BASE}/courses/${courseId}/revision-summary?topic=${encodeURIComponent(topic)}`
    ),

  // Study Planner
  getStudySchedule: (courseId: string, studentId = 'student_default', examDate = '2026-11-20') =>
    fetchJson<StudyScheduleData>(
      `${API_BASE}/courses/${courseId}/study-schedule?student_id=${studentId}&exam_date=${examDate}`
    ),

  // Evaluation
  runEvaluation: (courseId = 'course_cs401') =>
    fetchJson<EvaluationReport>(`${API_BASE}/evaluation/run?course_id=${courseId}`, {
      method: 'POST',
    }),
  getLatestEvaluation: () => fetchJson<EvaluationReport>(`${API_BASE}/evaluation/latest`),
};
