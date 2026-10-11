import os
import uuid
import json
import shutil
import logging
from pathlib import Path
from typing import List, Optional
from datetime import datetime

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import APP_NAME, API_PREFIX, CORS_ORIGINS, UPLOADS_DIR
from app.database import (
    init_db, get_db_connection,
    verify_document_ownership, verify_assessment_ownership,
    verify_session_ownership, verify_flashcard_ownership
)
from app.models.schemas import (
    CourseResponse, CourseCreate, DocumentResponse, ContentUnitResponse,
    ChatRequest, ChatResponse, AssessmentRequest, AssessmentResponse,
    AssessmentSubmitRequest, AssessmentResultResponse, LearnerProfileResponse,
    OnboardingRequest, KnowledgeGraphResponse, FlashcardResponse,
    FlashcardReviewRequest, StudyScheduleResponse, EvaluationRunResponse
)
from app.services.ingestion import (
    seed_default_course_and_materials, process_uploaded_document
)
from app.services.tutor import generate_grounded_tutor_response
from app.services.assessment import generate_assessment, submit_assessment_answers
from app.services.learner_model import get_learner_profile
from app.services.features import (
    get_course_knowledge_graph, get_due_flashcards, review_flashcard_sm2,
    get_revision_summary, generate_personalized_study_schedule
)
from app.services.evaluation import run_evaluation_suite

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(APP_NAME)

app = FastAPI(
    title=APP_NAME,
    description="Multimodal Source-Grounded AI Study Companion with Adaptive Assessments and Calibrated Mastery Modeling",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for seamless development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    init_db()
    seed_default_course_and_materials()
    logger.info("Application started and database seeded.")

# ----------------- Course Endpoints -----------------

@app.get(f"{API_PREFIX}/courses", response_model=List[CourseResponse])
def list_courses():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM courses ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.post(f"{API_PREFIX}/courses", response_model=CourseResponse)
def create_course(course: CourseCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    course_id = f"course_{uuid.uuid4().hex[:8]}"
    now_str = datetime.utcnow().isoformat()
    cursor.execute("""
    INSERT INTO courses (id, code, title, description, created_at)
    VALUES (?, ?, ?, ?, ?)
    """, (course_id, course.code, course.title, course.description, now_str))
    conn.commit()
    conn.close()
    return {
        "id": course_id,
        "code": course.code,
        "title": course.title,
        "description": course.description,
        "created_at": now_str
    }

@app.get(f"{API_PREFIX}/courses/{{course_id}}/topics", response_model=List[str])
def get_course_topics(course_id: str, student_id: str = "student_default"):
    """
    Returns topics ONLY from the requesting student's own uploaded materials.
    Students never see topics from other students' documents.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Topics from this student's knowledge_nodes (auto-extracted from their docs)
    cursor.execute("""
    SELECT DISTINCT topic_name FROM knowledge_nodes
    WHERE course_id = ? AND (student_id = ? OR student_id = 'shared')
    ORDER BY importance_score DESC, topic_name ASC
    """, (course_id, student_id))
    kn_topics = [r["topic_name"] for r in cursor.fetchall()]
    
    # 2. Distinct topics from this student's content_units only
    cursor.execute("""
    SELECT DISTINCT topics FROM content_units 
    WHERE course_id = ? AND (student_id = ? OR student_id = 'shared')
    """, (course_id, student_id))
    cu_rows = cursor.fetchall()
    cu_topics = set()
    for r in cu_rows:
        if r["topics"]:
            try:
                for t in json.loads(r["topics"]):
                    if t and t != "General Concepts":
                        cu_topics.add(t)
            except Exception:
                pass
                
    # Combine preserving logical sequence
    ordered_topics = []
    seen = set()
    for t in kn_topics:
        if t not in seen and t != "General Concepts":
            seen.add(t)
            ordered_topics.append(t)
    for t in sorted(cu_topics):
        if t not in seen and t != "General Concepts":
            seen.add(t)
            ordered_topics.append(t)
            
    conn.close()
    return ordered_topics

# ----------------- Document & Ingestion Endpoints -----------------

@app.get(f"{API_PREFIX}/courses/{{course_id}}/documents", response_model=List[DocumentResponse])
def list_documents(course_id: str, student_id: str = "student_default"):
    """Returns ONLY documents uploaded by this specific student."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM documents WHERE course_id = ? AND student_id = ? ORDER BY created_at DESC",
        (course_id, student_id)
    )
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.post(f"{API_PREFIX}/courses/{{course_id}}/upload")
async def upload_document(
    course_id: str,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    student_id: str = Form("student_default"),
    title: Optional[str] = Form(None),
    file_type: Optional[str] = Form("textbook")
):
    """Uploads a document scoped to this specific student. Topics extracted will only be visible to them."""
    if not student_id or student_id.strip() == "":
        raise HTTPException(status_code=400, detail="student_id is required to upload documents.")

    doc_id = f"doc_{uuid.uuid4().hex[:8]}"
    clean_filename = f"{doc_id}_{file.filename}"
    save_path = UPLOADS_DIR / clean_filename
    
    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    file_size = save_path.stat().st_size
    doc_title = title or file.filename.rsplit(".", 1)[0].replace("_", " ")
    now_str = datetime.utcnow().isoformat()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO documents (
        id, student_id, course_id, title, filename, file_type, file_path, file_size,
        status, progress, total_pages, total_duration_seconds, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        doc_id, student_id, course_id, doc_title, file.filename, file_type,
        str(save_path), file_size, "pending", 0, 0, 0.0, now_str
    ))
    conn.commit()
    conn.close()
    
    # Process document asynchronously — pass student_id so extracted topics are scoped correctly
    background_tasks.add_task(process_uploaded_document, doc_id, student_id)
    
    return {
        "message": f"File '{file.filename}' uploaded successfully. Processing started.",
        "document_id": doc_id,
        "student_id": student_id,
        "status": "pending"
    }

@app.get(f"{API_PREFIX}/documents/{{doc_id}}/status")
def get_document_status(doc_id: str, student_id: str = "student_default"):
    """Returns status only if this student owns the document."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, student_id, status, progress, error_message, total_pages, total_duration_seconds FROM documents WHERE id = ?",
        (doc_id,)
    )
    row = cursor.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Document not found")
    # Ownership check: only the owning student (or shared docs) can poll status
    if row["student_id"] not in (student_id, "shared"):
        raise HTTPException(status_code=403, detail="Access denied: this document belongs to another student.")
    return dict(row)

@app.get(f"{API_PREFIX}/documents/{{doc_id}}/units")
def get_document_units(doc_id: str, student_id: str = "student_default"):
    """Returns content units only if this student owns the document."""
    if not verify_document_ownership(doc_id, student_id):
        # Also allow 'shared' documents (seeded by admin)
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT student_id FROM documents WHERE id = ?", (doc_id,))
        row = cursor.fetchone()
        conn.close()
        if not row or row["student_id"] != "shared":
            raise HTTPException(status_code=403, detail="Access denied: this document belongs to another student.")
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM content_units WHERE document_id = ? ORDER BY page_number ASC, start_time_seconds ASC, slide_number ASC",
        (doc_id,)
    )
    rows = cursor.fetchall()
    conn.close()
    result = []
    for r in rows:
        d = dict(r)
        d["topics"] = [str(t) for t in (d["topics"].split(",") if d["topics"] else [])]
        result.append(d)
    return result

@app.delete(f"{API_PREFIX}/documents/{{doc_id}}")
def delete_document(doc_id: str, student_id: str = "student_default"):
    """Deletes a document — only the owning student can delete it."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, student_id, title, file_path FROM documents WHERE id = ?", (doc_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Document not found")
    # Ownership guard
    if row["student_id"] not in (student_id, "shared"):
        conn.close()
        raise HTTPException(status_code=403, detail="Access denied: you can only delete your own documents.")
    
    file_path = row["file_path"]
    if file_path:
        try:
            p = Path(file_path)
            if p.exists():
                p.unlink()
        except Exception as e:
            logger.warning(f"Failed to remove file on disk: {e}")

    cursor.execute("DELETE FROM content_units WHERE document_id = ?", (doc_id,))
    cursor.execute("DELETE FROM documents WHERE id = ?", (doc_id,))
    conn.commit()
    conn.close()
    return {"success": True, "message": f"Document '{row['title']}' deleted successfully"}

@app.delete(f"{API_PREFIX}/courses/{{course_id}}/documents/video-recordings")
def delete_course_video_recordings(course_id: str, student_id: str = "student_default"):
    """Deletes only THIS student's video recordings — not other students'."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, title, file_path FROM documents WHERE course_id = ? AND student_id = ? AND file_type = 'lecture_video'",
        (course_id, student_id)
    )
    rows = cursor.fetchall()
    count = len(rows)
    for r in rows:
        doc_id = r["id"]
        file_path = r["file_path"]
        if file_path:
            try:
                p = Path(file_path)
                if p.exists():
                    p.unlink()
            except Exception:
                pass
        cursor.execute("DELETE FROM content_units WHERE document_id = ?", (doc_id,))
        cursor.execute("DELETE FROM documents WHERE id = ?", (doc_id,))
    conn.commit()
    conn.close()
    return {"success": True, "message": f"Deleted {count} video recording(s) for student {student_id}", "deleted_count": count}

# ----------------- Grounded Tutoring Endpoints -----------------

@app.post(f"{API_PREFIX}/tutor/chat", response_model=ChatResponse)
def tutor_chat(req: ChatRequest):
    response = generate_grounded_tutor_response(
        query=req.message,
        course_id=req.course_id,
        student_id=req.student_id,
        session_id=req.session_id,
        preferred_language=req.preferred_language,
        allow_outside_knowledge=req.allow_outside_knowledge
    )
    return response

@app.get(f"{API_PREFIX}/tutor/sessions/{{session_id}}/messages")
def get_session_messages(session_id: str, student_id: str = "student_default"):
    """Returns session messages only if this student owns the session."""
    if not verify_session_ownership(session_id, student_id):
        raise HTTPException(status_code=403, detail="Access denied: this session belongs to another student.")
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tutoring_messages WHERE session_id = ? ORDER BY created_at ASC", (session_id,))
    rows = cursor.fetchall()
    conn.close()
    result = []
    for r in rows:
        d = dict(r)
        d["citations"] = json.loads(d["citations"]) if d["citations"] else []
        result.append(d)
    return result

# ----------------- Assessment & Quiz Endpoints -----------------

@app.post(f"{API_PREFIX}/assessments/generate", response_model=AssessmentResponse)
def create_assessment(req: AssessmentRequest):
    return generate_assessment(
        student_id=req.student_id,
        course_id=req.course_id,
        assessment_type=req.assessment_type,
        target_topics=req.target_topics,
        difficulty=req.difficulty,
        total_questions=req.total_questions,
        time_limit_minutes=req.time_limit_minutes
    )

@app.get(f"{API_PREFIX}/assessments/{{assessment_id}}")
def get_assessment(assessment_id: str, student_id: str = "student_default"):
    """Returns assessment data only if this student owns it."""
    if not verify_assessment_ownership(assessment_id, student_id):
        raise HTTPException(status_code=403, detail="Access denied: this assessment belongs to another student.")
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM assessments WHERE id = ?", (assessment_id,))
    asmt_row = cursor.fetchone()
    if not asmt_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Assessment not found")
        
    asmt = dict(asmt_row)
    cursor.execute("SELECT * FROM assessment_questions WHERE assessment_id = ?", (assessment_id,))
    q_rows = cursor.fetchall()
    conn.close()
    
    questions = []
    is_completed = (asmt["status"] == "completed")
    for q in q_rows:
        qd = dict(q)
        qd["options"] = json.loads(qd["options"]) if qd["options"] else None
        qd["source_citation"] = json.loads(qd["source_citation"]) if qd["source_citation"] else None
        if not is_completed:
            # Hide answers during active test
            qd["correct_answer"] = None
            qd["step_by_step_explanation"] = None
        questions.append(qd)
        
    asmt["questions"] = questions
    asmt["target_topics"] = json.loads(asmt["target_topics"]) if asmt["target_topics"] else []
    return asmt

@app.post(f"{API_PREFIX}/assessments/{{assessment_id}}/submit", response_model=AssessmentResultResponse)
def submit_assessment(assessment_id: str, req: AssessmentSubmitRequest):
    """Submits answers — verifies the assessment belongs to the submitting student."""
    if not verify_assessment_ownership(assessment_id, req.student_id):
        raise HTTPException(status_code=403, detail="Access denied: you cannot submit answers for another student's assessment.")
    answers_dicts = [{"question_id": a.question_id, "student_answer": a.student_answer} for a in req.answers]
    return submit_assessment_answers(assessment_id, answers_dicts, req.student_id)

# ----------------- Learner Profile & Mastery Endpoints -----------------

@app.get(f"{API_PREFIX}/learner/profile", response_model=LearnerProfileResponse)
def get_profile(student_id: str = "student_default", course_id: str = "course_cs401"):
    return get_learner_profile(student_id, course_id)

@app.post(f"{API_PREFIX}/learner/onboard")
def onboard_learner(req: OnboardingRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    now_str = datetime.utcnow().isoformat()
    
    # Establish calibrated baseline score based on prior experience
    diagnostic_score = 45.0 if req.prior_experience_level == "beginner" else (70.0 if req.prior_experience_level == "intermediate" else 90.0)
    
    cursor.execute("""
    INSERT OR REPLACE INTO learner_profiles (
        id, student_id, name, preferred_language, onboarding_completed,
        diagnostic_score, study_goal_hours_per_week, exam_date, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        f"prof_{req.student_id}", req.student_id, req.name, req.preferred_language,
        1, diagnostic_score, req.study_goal_hours_per_week, req.exam_date, now_str
    ))
    conn.commit()
    conn.close()
    return {"message": "Onboarding completed successfully.", "diagnostic_score": diagnostic_score}

@app.get(f"{API_PREFIX}/learner/{{student_id}}/history")
def get_learner_history(student_id: str, course_id: Optional[str] = None):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Fetch completed assessments
    query = """
    SELECT id, title, assessment_type, target_topics, difficulty, total_questions,
           score, max_score, feedback_summary, created_at, completed_at
    FROM assessments
    WHERE student_id = ? AND status = 'completed'
    """
    params = [student_id]
    if course_id:
        query += " AND course_id = ?"
        params.append(course_id)
    query += " ORDER BY completed_at DESC LIMIT 10"
    cursor.execute(query, params)
    asmt_rows = cursor.fetchall()
    
    assessments_list = []
    total_score_sum = 0.0
    total_max_sum = 0.0
    for r in asmt_rows:
        item = dict(r)
        item["target_topics"] = json.loads(item["target_topics"]) if item["target_topics"] else []
        item["percentage"] = round((item["score"] / item["max_score"] * 100.0), 1) if item["max_score"] > 0 else 0.0
        total_score_sum += item["score"]
        total_max_sum += item["max_score"]
        assessments_list.append(item)
        
    overall_accuracy = round((total_score_sum / total_max_sum * 100.0), 1) if total_max_sum > 0 else 0.0
    
    # 2. Fetch topics studied & revised
    m_query = "SELECT topic_name, mastery_level, total_attempts, correct_attempts, last_practiced FROM learner_mastery WHERE student_id = ?"
    m_params = [student_id]
    if course_id:
        m_query += " AND course_id = ?"
        m_params.append(course_id)
    m_query += " ORDER BY total_attempts DESC"
    cursor.execute(m_query, m_params)
    mastery_rows = cursor.fetchall()
    topics_studied = [dict(r) for r in mastery_rows]
    
    # 3. Flashcards count
    fc_query = "SELECT count(*) FROM flashcards WHERE student_id = ? AND repetition_level > 0"
    cursor.execute(fc_query, (student_id,))
    cards_revised = cursor.fetchone()[0]
    
    conn.close()
    return {
        "student_id": student_id,
        "is_returning_student": len(assessments_list) > 0 or len(topics_studied) > 0,
        "total_assessments_taken": len(assessments_list),
        "overall_accuracy_percentage": overall_accuracy,
        "recent_assessments": assessments_list,
        "topics_studied": topics_studied,
        "cards_revised": cards_revised
    }

# ----------------- Concept Map & Knowledge Graph Endpoints -----------------

@app.get(f"{API_PREFIX}/courses/{{course_id}}/knowledge-graph", response_model=KnowledgeGraphResponse)
def get_knowledge_graph(course_id: str, student_id: str = "student_default"):
    return get_course_knowledge_graph(course_id, student_id)

# ----------------- Flashcards & Revision Endpoints -----------------

@app.get(f"{API_PREFIX}/courses/{{course_id}}/flashcards", response_model=List[FlashcardResponse])
def list_flashcards(course_id: str, student_id: str = "student_default"):
    return get_due_flashcards(course_id, student_id)

@app.post(f"{API_PREFIX}/flashcards/{{card_id}}/review")
def review_flashcard(card_id: str, req: FlashcardReviewRequest):
    """Reviews a flashcard — verifies the card belongs to the requesting student."""
    student_id = getattr(req, 'student_id', 'student_default')
    if not verify_flashcard_ownership(card_id, student_id):
        raise HTTPException(status_code=403, detail="Access denied: this flashcard belongs to another student.")
    return review_flashcard_sm2(card_id, req.quality)

@app.get(f"{API_PREFIX}/courses/{{course_id}}/revision-summary")
def get_topic_revision(course_id: str, topic: str):
    return get_revision_summary(topic, course_id)

# ----------------- Study Planner Endpoints -----------------

@app.get(f"{API_PREFIX}/courses/{{course_id}}/study-schedule", response_model=StudyScheduleResponse)
def get_study_schedule(course_id: str, student_id: str = "student_default", exam_date: Optional[str] = "2026-11-20"):
    return generate_personalized_study_schedule(student_id, course_id, exam_date)

# ----------------- Evaluation & QA Benchmark Endpoints -----------------

@app.post(f"{API_PREFIX}/evaluation/run", response_model=EvaluationRunResponse)
def trigger_evaluation(course_id: str = "course_cs401"):
    return run_evaluation_suite(course_id)

@app.get(f"{API_PREFIX}/evaluation/latest")
def get_latest_evaluation():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM evaluation_runs ORDER BY run_date DESC LIMIT 1")
    row = cursor.fetchone()
    conn.close()
    if not row:
        # Run one immediately if none exists
        return run_evaluation_suite()
    d = dict(row)
    d["details"] = json.loads(d["details"]) if d["details"] else {}
    return d

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": APP_NAME, "time": datetime.utcnow().isoformat()}
