import sqlite3
import json
import logging
from typing import Any, Dict, List, Optional
from datetime import datetime
from app.config import DB_PATH

logger = logging.getLogger(__name__)

def get_db_connection() -> sqlite3.Connection:
    """Returns a connection to the SQLite database with row factory enabled."""
    conn = sqlite3.connect(DB_PATH, timeout=30.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA busy_timeout=30000;")
    conn.execute("PRAGMA foreign_keys=ON;")
    return conn

def init_db():
    """Initializes tables and indices in the SQLite database.
    
    SECURITY MODEL:
    - Every document, content unit, knowledge node, and flashcard is 
      scoped to (student_id + course_id). No cross-student data leakage.
    - Topics shown to a student come ONLY from their own uploaded materials.
    - Assessments, mastery records, sessions are all student-scoped.
    - All resource-level endpoints verify ownership before returning data.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    # Courses table (shared — courses are public curriculum definitions)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS courses (
        id TEXT PRIMARY KEY,
        code TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        created_at TEXT NOT NULL
    );
    """)

    # Documents table — student_id scoped (each student owns their uploads)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL DEFAULT 'shared',
        course_id TEXT NOT NULL,
        title TEXT NOT NULL,
        filename TEXT NOT NULL,
        file_type TEXT NOT NULL,
        file_path TEXT,
        file_size INTEGER DEFAULT 0,
        status TEXT NOT NULL,
        progress INTEGER DEFAULT 0,
        total_pages INTEGER DEFAULT 0,
        total_duration_seconds REAL DEFAULT 0,
        error_message TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );
    """)

    # Migrate existing documents to add student_id column if missing
    try:
        cursor.execute("ALTER TABLE documents ADD COLUMN student_id TEXT NOT NULL DEFAULT 'shared'")
        logger.info("Migrated: added student_id to documents table")
    except Exception:
        pass  # Column already exists

    # Content Units table — student_id scoped (derived from student's own documents)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS content_units (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL DEFAULT 'shared',
        document_id TEXT NOT NULL,
        course_id TEXT NOT NULL,
        unit_type TEXT NOT NULL,
        title TEXT NOT NULL,
        text_content TEXT NOT NULL,
        page_number INTEGER,
        slide_number INTEGER,
        start_time_seconds REAL,
        end_time_seconds REAL,
        topics TEXT,
        embedding TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );
    """)

    # Migrate existing content_units to add student_id column if missing
    try:
        cursor.execute("ALTER TABLE content_units ADD COLUMN student_id TEXT NOT NULL DEFAULT 'shared'")
        logger.info("Migrated: added student_id to content_units table")
    except Exception:
        pass

    # Knowledge Graph Nodes — student_id scoped (auto-extracted from student's materials)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS knowledge_nodes (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL DEFAULT 'shared',
        course_id TEXT NOT NULL,
        topic_name TEXT NOT NULL,
        category TEXT,
        description TEXT,
        prerequisites TEXT,
        subtopics TEXT,
        importance_score REAL DEFAULT 1.0,
        UNIQUE(student_id, course_id, topic_name),
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );
    """)

    # Migrate existing knowledge_nodes to add student_id column if missing
    try:
        cursor.execute("ALTER TABLE knowledge_nodes ADD COLUMN student_id TEXT NOT NULL DEFAULT 'shared'")
        logger.info("Migrated: added student_id to knowledge_nodes table")
    except Exception:
        pass

    # Tutoring Sessions — student_id scoped
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS tutoring_sessions (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        course_id TEXT NOT NULL,
        title TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS tutoring_messages (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        citations TEXT,
        direct_evidence TEXT,
        tutor_elaboration TEXT,
        is_outside_knowledge INTEGER DEFAULT 0,
        is_unanswerable INTEGER DEFAULT 0,
        confidence REAL DEFAULT 1.0,
        created_at TEXT NOT NULL,
        FOREIGN KEY (session_id) REFERENCES tutoring_sessions(id) ON DELETE CASCADE
    );
    """)

    # Assessments — student_id scoped
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS assessments (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        course_id TEXT NOT NULL,
        title TEXT NOT NULL,
        assessment_type TEXT NOT NULL,
        target_topics TEXT,
        difficulty TEXT NOT NULL,
        total_questions INTEGER NOT NULL,
        time_limit_minutes INTEGER DEFAULT 0,
        status TEXT NOT NULL,
        score REAL DEFAULT 0.0,
        max_score REAL DEFAULT 0.0,
        feedback_summary TEXT,
        created_at TEXT NOT NULL,
        completed_at TEXT,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS assessment_questions (
        id TEXT PRIMARY KEY,
        assessment_id TEXT NOT NULL,
        question_text TEXT NOT NULL,
        question_type TEXT NOT NULL,
        options TEXT,
        correct_answer TEXT NOT NULL,
        step_by_step_explanation TEXT NOT NULL,
        topic_tag TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        source_citation TEXT,
        student_answer TEXT,
        is_correct INTEGER,
        student_score REAL DEFAULT 0.0,
        feedback TEXT,
        misconception_detected TEXT,
        FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE
    );
    """)

    # Question history — student_id scoped
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS question_history (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        course_id TEXT NOT NULL,
        topic_tag TEXT NOT NULL,
        normalized_hash TEXT NOT NULL,
        question_text TEXT NOT NULL,
        last_presented_at TEXT NOT NULL
    );
    """)

    # Learner Profile — student_id scoped
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS learner_profiles (
        id TEXT PRIMARY KEY,
        student_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        email TEXT,
        preferred_language TEXT DEFAULT 'en',
        onboarding_completed INTEGER DEFAULT 0,
        diagnostic_score REAL,
        study_goal_hours_per_week REAL DEFAULT 10.0,
        exam_date TEXT,
        created_at TEXT NOT NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS learner_mastery (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        course_id TEXT NOT NULL,
        topic_name TEXT NOT NULL,
        mastery_level REAL DEFAULT 0.2,
        confidence_level REAL DEFAULT 0.3,
        total_attempts INTEGER DEFAULT 0,
        correct_attempts INTEGER DEFAULT 0,
        last_practiced TEXT,
        revision_priority TEXT DEFAULT 'medium',
        UNIQUE(student_id, course_id, topic_name)
    );
    """)

    # Flashcards — student_id scoped
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS flashcards (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        course_id TEXT NOT NULL,
        topic_name TEXT NOT NULL,
        front TEXT NOT NULL,
        back TEXT NOT NULL,
        source_citation TEXT,
        repetition_level INTEGER DEFAULT 0,
        ease_factor REAL DEFAULT 2.5,
        interval_days INTEGER DEFAULT 1,
        next_review_date TEXT NOT NULL,
        created_at TEXT NOT NULL
    );
    """)

    # Evaluation Runs — system-wide
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS evaluation_runs (
        id TEXT PRIMARY KEY,
        run_date TEXT NOT NULL,
        dataset_name TEXT NOT NULL,
        total_samples INTEGER NOT NULL,
        faithfulness_score REAL NOT NULL,
        relevancy_score REAL NOT NULL,
        precision_score REAL NOT NULL,
        recall_score REAL NOT NULL,
        citation_accuracy_score REAL NOT NULL,
        refusal_accuracy_score REAL NOT NULL,
        repetition_rate_score REAL NOT NULL,
        details TEXT
    );
    """)

    # ── Indices ──────────────────────────────────────────────────────────────
    # Student-scoped document lookups (primary security index)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_documents_student_course ON documents(student_id, course_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_content_units_student_course ON content_units(student_id, course_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_content_units_doc ON content_units(document_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_knowledge_nodes_student_course ON knowledge_nodes(student_id, course_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_mastery_student ON learner_mastery(student_id, course_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_questions_history ON question_history(student_id, topic_tag);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_sessions_student ON tutoring_sessions(student_id, course_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_assessments_student ON assessments(student_id, course_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_flashcards_student ON flashcards(student_id, course_id);")

    conn.commit()
    conn.close()
    logger.info("Database initialized successfully with student-scoped security model.")


def verify_document_ownership(doc_id: str, student_id: str) -> bool:
    """
    Verifies that a document belongs to the given student.
    Returns True if owned, False otherwise.
    Used as an ownership guard on document endpoints.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id FROM documents WHERE id = ? AND student_id = ?",
        (doc_id, student_id)
    )
    row = cursor.fetchone()
    conn.close()
    return row is not None


def verify_assessment_ownership(assessment_id: str, student_id: str) -> bool:
    """
    Verifies that an assessment belongs to the given student.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id FROM assessments WHERE id = ? AND student_id = ?",
        (assessment_id, student_id)
    )
    row = cursor.fetchone()
    conn.close()
    return row is not None


def verify_session_ownership(session_id: str, student_id: str) -> bool:
    """
    Verifies that a tutoring session belongs to the given student.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id FROM tutoring_sessions WHERE id = ? AND student_id = ?",
        (session_id, student_id)
    )
    row = cursor.fetchone()
    conn.close()
    return row is not None


def verify_flashcard_ownership(card_id: str, student_id: str) -> bool:
    """
    Verifies that a flashcard belongs to the given student.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id FROM flashcards WHERE id = ? AND student_id = ?",
        (card_id, student_id)
    )
    row = cursor.fetchone()
    conn.close()
    return row is not None
