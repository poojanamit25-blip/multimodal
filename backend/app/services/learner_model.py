import math
import uuid
import json
import logging
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta

from app.database import get_db_connection

logger = logging.getLogger(__name__)

# Bayesian Knowledge Tracing (BKT) Parameters
DEFAULT_P_TRANSITION = 0.18 # Probability of learning after practice
DEFAULT_P_GUESS = 0.25      # Probability of guessing correctly without mastery
DEFAULT_P_SLIP = 0.10       # Probability of slipping/mistake despite mastery

def update_bkt_mastery(
    current_mastery: float,
    is_correct: bool,
    p_guess: float = DEFAULT_P_GUESS,
    p_slip: float = DEFAULT_P_SLIP,
    p_trans: float = DEFAULT_P_TRANSITION
) -> float:
    """
    Computes updated posterior mastery using the standard Bayesian Knowledge Tracing formula.
    """
    p_l = max(0.01, min(0.99, current_mastery))
    
    if is_correct:
        # P(L | Correct) = (P(L) * (1 - S)) / (P(L) * (1 - S) + (1 - P(L)) * G)
        numerator = p_l * (1.0 - p_slip)
        denominator = numerator + (1.0 - p_l) * p_guess
        posterior = numerator / denominator if denominator > 0 else p_l
    else:
        # P(L | Incorrect) = (P(L) * S) / (P(L) * S + (1 - P(L)) * (1 - G))
        numerator = p_l * p_slip
        denominator = numerator + (1.0 - p_l) * (1.0 - p_guess)
        posterior = numerator / denominator if denominator > 0 else p_l
        
    # Transition to learned state
    updated = posterior + (1.0 - posterior) * p_trans
    return round(max(0.05, min(0.99, updated)), 4)

def compute_confidence_level(total_attempts: int) -> float:
    """
    Measures statistical certainty of the mastery estimate based on sample volume.
    Uncertainty decays as attempts increase.
    """
    if total_attempts <= 0:
        return 0.20
    # Asymptotically approaches 0.99 with more attempts
    return round(1.0 - (1.0 / math.sqrt(total_attempts + 1.5)), 3)

def determine_revision_priority(mastery: float, days_since_last: int = 0) -> str:
    """Computes revision priority factoring mastery and forgetting decay."""
    # Effective mastery accounting for Ebbinghaus forgetting decay
    decayed_mastery = mastery * math.exp(-0.04 * days_since_last)
    if decayed_mastery < 0.40:
        return "urgent"
    elif decayed_mastery < 0.65:
        return "high"
    elif decayed_mastery < 0.82:
        return "medium"
    return "low"

def get_learner_profile(student_id: str, course_id: str) -> Dict[str, Any]:
    """Retrieves full student profile, topic mastery list, and overall readiness."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Fetch profile
    cursor.execute("SELECT * FROM learner_profiles WHERE student_id = ?", (student_id,))
    profile_row = cursor.fetchone()
    if not profile_row:
        # Auto-create if not present
        now_str = datetime.utcnow().isoformat()
        cursor.execute("""
        INSERT INTO learner_profiles (
            id, student_id, name, email, preferred_language,
            onboarding_completed, diagnostic_score, study_goal_hours_per_week, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            f"prof_{student_id}", student_id, "Student User", "student@university.edu",
            "en", 1, 65.0, 10.0, now_str
        ))
        conn.commit()
        cursor.execute("SELECT * FROM learner_profiles WHERE student_id = ?", (student_id,))
        profile_row = cursor.fetchone()
        
    profile = dict(profile_row)
    
    # 2. Fetch all course knowledge topics to guarantee comprehensive mastery coverage
    cursor.execute("SELECT topic_name FROM knowledge_nodes WHERE course_id = ?", (course_id,))
    kn_rows = cursor.fetchall()
    all_topics = [r["topic_name"] for r in kn_rows]
    
    # 3. Fetch mastery records
    cursor.execute("""
    SELECT * FROM learner_mastery
    WHERE student_id = ? AND course_id = ?
    """, (student_id, course_id))
    mastery_rows = cursor.fetchall()
    mastery_map = {r["topic_name"]: dict(r) for r in mastery_rows}
    
    topic_mastery_list = []
    total_mastery_sum = 0.0
    
    now = datetime.utcnow()
    for topic in all_topics:
        if topic in mastery_map:
            m = mastery_map[topic]
            last_date_str = m.get("last_practiced")
            days_since = 0
            if last_date_str:
                try:
                    dt = datetime.fromisoformat(last_date_str.split("T")[0])
                    days_since = max(0, (now - dt).days)
                except Exception:
                    days_since = 0
            priority = determine_revision_priority(m["mastery_level"], days_since)
            item = {
                "topic_name": topic,
                "mastery_level": round(m["mastery_level"], 3),
                "confidence_level": round(m["confidence_level"], 3),
                "total_attempts": m["total_attempts"],
                "correct_attempts": m["correct_attempts"],
                "last_practiced": m["last_practiced"],
                "revision_priority": priority
            }
        else:
            # Default prior for unpracticed topic
            item = {
                "topic_name": topic,
                "mastery_level": 0.20,
                "confidence_level": 0.25,
                "total_attempts": 0,
                "correct_attempts": 0,
                "last_practiced": None,
                "revision_priority": "urgent"
            }
        topic_mastery_list.append(item)
        total_mastery_sum += item["mastery_level"]
        
    overall = (total_mastery_sum / len(all_topics)) if all_topics else 0.50
    conn.close()
    
    return {
        "student_id": student_id,
        "name": profile.get("name", "Student"),
        "email": profile.get("email"),
        "preferred_language": profile.get("preferred_language", "en"),
        "onboarding_completed": bool(profile.get("onboarding_completed", 0)),
        "diagnostic_score": profile.get("diagnostic_score"),
        "study_goal_hours_per_week": profile.get("study_goal_hours_per_week", 10.0),
        "exam_date": profile.get("exam_date"),
        "overall_mastery": round(overall, 3),
        "mastery_by_topic": topic_mastery_list
    }

def record_assessment_performance(
    student_id: str,
    course_id: str,
    question_results: List[Dict[str, Any]]
) -> Dict[str, float]:
    """
    Updates Bayesian Knowledge Tracing mastery and confidence for each answered question.
    Returns a dictionary of updated mastery levels by topic.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    now_str = datetime.utcnow().isoformat()
    
    updated_masteries: Dict[str, float] = {}
    
    for q in question_results:
        topic = q["topic_tag"]
        is_correct = bool(q["is_correct"])
        q_type = q.get("question_type", "mcq")
        
        # Adjust guess and slip parameters based on question difficulty & type
        p_guess = 0.25 if q_type == "mcq" else 0.10
        p_slip = 0.12 if q.get("difficulty") == "hard" else 0.08
        
        # Fetch current record
        cursor.execute("""
        SELECT * FROM learner_mastery
        WHERE student_id = ? AND course_id = ? AND topic_name = ?
        """, (student_id, course_id, topic))
        row = cursor.fetchone()
        
        if row:
            curr_mastery = row["mastery_level"]
            tot_attempts = row["total_attempts"] + 1
            corr_attempts = row["correct_attempts"] + (1 if is_correct else 0)
        else:
            curr_mastery = 0.25 # cold prior
            tot_attempts = 1
            corr_attempts = 1 if is_correct else 0
            
        new_mastery = update_bkt_mastery(curr_mastery, is_correct, p_guess, p_slip)
        new_confidence = compute_confidence_level(tot_attempts)
        priority = determine_revision_priority(new_mastery, 0)
        
        cursor.execute("""
        INSERT OR REPLACE INTO learner_mastery (
            id, student_id, course_id, topic_name, mastery_level,
            confidence_level, total_attempts, correct_attempts,
            last_practiced, revision_priority
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            f"mast_{uuid.uuid4().hex[:8]}",
            student_id,
            course_id,
            topic,
            new_mastery,
            new_confidence,
            tot_attempts,
            corr_attempts,
            now_str,
            priority
        ))
        updated_masteries[topic] = new_mastery
        
    conn.commit()
    conn.close()
    return updated_masteries
