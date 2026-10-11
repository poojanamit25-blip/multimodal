export interface Course {
  id: string;
  code: string;
  title: string;
  description?: string;
  created_at: string;
}

export interface DocumentItem {
  id: string;
  course_id: string;
  title: string;
  filename: string;
  file_type: 'textbook' | 'slides' | 'lecture_video' | 'audio' | 'notes';
  file_size: number;
  status: 'pending' | 'processing' | 'indexed' | 'error';
  progress: number;
  total_pages: number;
  total_duration_seconds: number;
  error_message?: string;
  created_at: string;
}

export interface Citation {
  source_title: string;
  document_id: string;
  unit_id?: string;
  file_type: string;
  page_number?: number;
  slide_number?: number;
  timestamp_seconds?: number;
  timestamp_formatted?: string;
  direct_quote: string;
  relevance_score: number;
}

export interface ContentUnit {
  id: string;
  document_id: string;
  course_id: string;
  unit_type: string;
  title: string;
  text_content: string;
  page_number?: number;
  slide_number?: number;
  start_time_seconds?: number;
  end_time_seconds?: number;
  topics: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations: Citation[];
  direct_evidence?: string;
  tutor_elaboration?: string;
  is_outside_knowledge: boolean;
  is_unanswerable: boolean;
  confidence: number;
  created_at: string;
}

export interface QuestionOption {
  id: string; // "A", "B", "C", "D"
  text: string;
}

export interface Question {
  id: string;
  question_text: string;
  question_type: 'mcq' | 'short_answer' | 'numerical';
  options?: QuestionOption[];
  topic_tag: string;
  difficulty: 'easy' | 'medium' | 'hard';
  source_citation?: Citation;
  student_answer?: string;
  is_correct?: boolean;
  correct_answer?: string;
  step_by_step_explanation?: string;
  feedback?: string;
  misconception_detected?: string;
}

export interface Assessment {
  id: string;
  student_id: string;
  course_id: string;
  title: string;
  assessment_type: 'topic_practice' | 'mock_exam' | 'diagnostic';
  target_topics: string[];
  difficulty: string;
  total_questions: number;
  time_limit_minutes: number;
  status: 'in_progress' | 'completed';
  score: number;
  max_score: number;
  questions: Question[];
  created_at: string;
}

export interface TopicPerformance {
  topic: string;
  total: number;
  correct: number;
  accuracy_percentage: number;
  mastery_delta: number;
  status: 'Mastered' | 'Needs Revision' | 'Review Required';
}

export interface AssessmentResult {
  assessment_id: string;
  score: number;
  max_score: number;
  percentage: number;
  total_questions: number;
  correct_count: number;
  incorrect_count: number;
  topic_breakdown: TopicPerformance[];
  weak_areas: string[];
  misconceptions: string[];
  recommended_topics: string[];
  recommended_citations: Citation[];
  updated_mastery: Record<string, number>;
  summary_feedback: string;
}

export interface TopicMastery {
  topic_name: string;
  mastery_level: number;
  confidence_level: number;
  total_attempts: number;
  correct_attempts: number;
  last_practiced?: string;
  revision_priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface LearnerProfile {
  student_id: string;
  name: string;
  email?: string;
  preferred_language: string;
  onboarding_completed: boolean;
  diagnostic_score?: number;
  study_goal_hours_per_week: number;
  exam_date?: string;
  overall_mastery: number;
  mastery_by_topic: TopicMastery[];
}

export interface KnowledgeGraphNode {
  id: string;
  topic_name: string;
  category: string;
  description: string;
  prerequisites: string[];
  subtopics: string[];
  mastery_level: number;
  status: 'mastered' | 'in_progress' | 'ready' | 'locked';
}

export interface KnowledgeGraphData {
  course_id: string;
  nodes: KnowledgeGraphNode[];
  edges: { source: string; target: string }[];
}

export interface Flashcard {
  id: string;
  student_id: string;
  course_id: string;
  topic_name: string;
  front: string;
  back: string;
  source_citation?: Citation;
  repetition_level: number;
  interval_days: number;
  next_review_date: string;
}

export interface StudyPlanItem {
  date: string;
  day_of_week: string;
  topic: string;
  activity: string;
  estimated_minutes: number;
  urgency: 'High' | 'Medium' | 'Revision';
  reason: string;
  linked_source_title: string;
  linked_citation?: { page?: number; slide?: number; timestamp?: string };
}

export interface StudyScheduleData {
  student_id: string;
  course_id: string;
  exam_date?: string;
  days_remaining: number;
  target_mastery: number;
  schedule: StudyPlanItem[];
}

export interface EvaluationItemResult {
  test_id: string;
  category: string;
  question: string;
  expected_unanswerable: boolean;
  actual_unanswerable: boolean;
  metrics: {
    context_precision: number;
    context_recall: number;
    faithfulness: number;
    answer_relevancy: number;
    citation_accuracy: number;
    refusal_correctness: number;
  };
  citations_returned: string[];
  passed: boolean;
}

export interface StudentArchetypeSimulation {
  name: string;
  initial_mastery: number;
  final_mastery: number;
  mastery_progression: number[];
  total_attempts: number;
  accuracy: number;
  final_confidence: number;
  repetition_rate: number;
}

export interface EvaluationReport {
  id: string;
  run_date: string;
  dataset_name: string;
  total_samples: number;
  faithfulness_score: number;
  relevancy_score: number;
  precision_score: number;
  recall_score: number;
  citation_accuracy_score: number;
  refusal_accuracy_score: number;
  repetition_rate_score: number;
  details: {
    sample_breakdown: Record<string, number>;
    test_items: EvaluationItemResult[];
    student_archetype_simulation: Record<string, StudentArchetypeSimulation>;
    methodology: string;
  };
}

export interface GoogleUser {
  name: string;
  email: string;
  avatar: string;
  studentId: string;
}
