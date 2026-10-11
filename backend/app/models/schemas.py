from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

# Course Schemas
class CourseBase(BaseModel):
    code: str
    title: str
    description: Optional[str] = None

class CourseCreate(CourseBase):
    pass

class CourseResponse(CourseBase):
    id: str
    created_at: str

# Document Schemas
class DocumentResponse(BaseModel):
    id: str
    course_id: str
    title: str
    filename: str
    file_type: str # textbook, slides, lecture_video, audio, notes
    file_size: int
    status: str # pending, processing, indexed, error
    progress: int
    total_pages: int
    total_duration_seconds: float
    error_message: Optional[str] = None
    created_at: str

# Citation Schema
class Citation(BaseModel):
    source_title: str
    document_id: str
    unit_id: Optional[str] = None
    file_type: str # textbook, slides, lecture_video, etc.
    page_number: Optional[int] = None
    slide_number: Optional[int] = None
    timestamp_seconds: Optional[float] = None
    timestamp_formatted: Optional[str] = None
    direct_quote: str
    relevance_score: float = 1.0

# Content Unit Schema
class ContentUnitResponse(BaseModel):
    id: str
    document_id: str
    course_id: str
    unit_type: str
    title: str
    text_content: str
    page_number: Optional[int] = None
    slide_number: Optional[int] = None
    start_time_seconds: Optional[float] = None
    end_time_seconds: Optional[float] = None
    topics: List[str] = []

# Tutoring Chat Schemas
class ChatRequest(BaseModel):
    student_id: str = "student_default"
    course_id: str
    session_id: Optional[str] = None
    message: str
    preferred_language: str = "en" # "en", "hi" (Hindi explanation), etc.
    allow_outside_knowledge: bool = False

class ChatResponse(BaseModel):
    session_id: str
    message_id: str
    role: str = "assistant"
    content: str
    citations: List[Citation] = []
    direct_evidence: Optional[str] = None
    tutor_elaboration: Optional[str] = None
    is_outside_knowledge: bool = False
    is_unanswerable: bool = False
    confidence: float = 1.0
    created_at: str

# Assessment & Quiz Schemas
class AssessmentRequest(BaseModel):
    student_id: str = "student_default"
    course_id: str
    assessment_type: str = "topic_practice" # "topic_practice", "mock_exam", "diagnostic"
    target_topics: List[str] = []
    difficulty: str = "adaptive" # "easy", "medium", "hard", "adaptive"
    total_questions: int = 5
    time_limit_minutes: int = 15

class QuestionOption(BaseModel):
    id: str # "A", "B", "C", "D"
    text: str

class QuestionResponse(BaseModel):
    id: str
    question_text: str
    question_type: str # "mcq", "short_answer", "numerical"
    options: Optional[List[Dict[str, str]]] = None # [{"id": "A", "text": "..."}]
    topic_tag: str
    difficulty: str
    source_citation: Optional[Dict[str, Any]] = None
    # Hidden during exam, populated after answer:
    student_answer: Optional[str] = None
    is_correct: Optional[bool] = None
    correct_answer: Optional[str] = None
    step_by_step_explanation: Optional[str] = None
    feedback: Optional[str] = None
    misconception_detected: Optional[str] = None

class AssessmentResponse(BaseModel):
    id: str
    student_id: str
    course_id: str
    title: str
    assessment_type: str
    target_topics: List[str]
    difficulty: str
    total_questions: int
    time_limit_minutes: int
    status: str
    score: float
    max_score: float
    questions: List[QuestionResponse]
    created_at: str

class AnswerSubmissionItem(BaseModel):
    question_id: str
    student_answer: str

class AssessmentSubmitRequest(BaseModel):
    student_id: str = "student_default"
    answers: List[AnswerSubmissionItem]

class TopicPerformance(BaseModel):
    topic: str
    total: int
    correct: int
    accuracy_percentage: float
    mastery_delta: float
    status: str # "Mastered", "Needs Revision", "Review Required"

class AssessmentResultResponse(BaseModel):
    assessment_id: str
    score: float
    max_score: float
    percentage: float
    total_questions: int
    correct_count: int
    incorrect_count: int
    topic_breakdown: List[TopicPerformance]
    weak_areas: List[str]
    misconceptions: List[str]
    recommended_topics: List[str]
    recommended_citations: List[Citation]
    updated_mastery: Dict[str, float]
    summary_feedback: str

# Learner Profile & Mastery Schemas
class TopicMastery(BaseModel):
    topic_name: str
    mastery_level: float # 0.0 to 1.0
    confidence_level: float # 0.0 to 1.0
    total_attempts: int
    correct_attempts: int
    last_practiced: Optional[str] = None
    revision_priority: str # "low", "medium", "high", "urgent"

class LearnerProfileResponse(BaseModel):
    student_id: str
    name: str
    email: Optional[str] = None
    preferred_language: str
    onboarding_completed: bool
    diagnostic_score: Optional[float] = None
    study_goal_hours_per_week: float
    exam_date: Optional[str] = None
    overall_mastery: float
    mastery_by_topic: List[TopicMastery]

class OnboardingRequest(BaseModel):
    student_id: str = "student_default"
    name: str
    preferred_language: str = "en"
    study_goal_hours_per_week: float = 10.0
    exam_date: Optional[str] = None
    prior_experience_level: str = "beginner" # "beginner", "intermediate", "advanced"

# Knowledge Graph & Course Map
class KnowledgeGraphNode(BaseModel):
    id: str
    topic_name: str
    category: str
    description: str
    prerequisites: List[str]
    subtopics: List[str]
    mastery_level: float = 0.0
    status: str = "locked" # "mastered", "in_progress", "ready", "locked"

class KnowledgeGraphResponse(BaseModel):
    course_id: str
    nodes: List[KnowledgeGraphNode]
    edges: List[Dict[str, str]] # [{"source": "Distributed Systems Basics", "target": "Consensus"}]

# Flashcards & Revision
class FlashcardResponse(BaseModel):
    id: str
    student_id: str
    course_id: str
    topic_name: str
    front: str
    back: str
    source_citation: Optional[Dict[str, Any]] = None
    repetition_level: int
    interval_days: int
    next_review_date: str

class FlashcardReviewRequest(BaseModel):
    card_id: str
    quality: int # 0 to 5 (SM-2 scale: 5=perfect, 4=good, 3=pass, 0-2=fail)

# Study Planner
class StudyPlanItem(BaseModel):
    date: str
    day_of_week: str
    topic: str
    activity: str # "Concept Deep Dive", "Practice Quiz", "Quick Flashcards", "Full Mock"
    estimated_minutes: int
    urgency: str # "High", "Medium", "Revision"
    reason: str
    linked_source_title: str
    linked_citation: Optional[Dict[str, Any]] = None

class StudyScheduleResponse(BaseModel):
    student_id: str
    course_id: str
    exam_date: Optional[str] = None
    days_remaining: int
    target_mastery: float
    schedule: List[StudyPlanItem]

# Evaluation Pipeline Schemas
class EvaluationRunResponse(BaseModel):
    id: str
    run_date: str
    dataset_name: str
    total_samples: int
    faithfulness_score: float # 0.0 to 1.0
    relevancy_score: float # 0.0 to 1.0
    precision_score: float # 0.0 to 1.0
    recall_score: float # 0.0 to 1.0
    citation_accuracy_score: float # 0.0 to 1.0
    refusal_accuracy_score: float # 0.0 to 1.0
    repetition_rate_score: float # 0.0 to 1.0 (lower is better, reports 1 - rep_rate)
    details: Dict[str, Any]
