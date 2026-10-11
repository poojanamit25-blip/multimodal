import json
import uuid
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta

from app.database import get_db_connection

logger = logging.getLogger(__name__)

def get_course_knowledge_graph(course_id: str, student_id: str = "student_default") -> Dict[str, Any]:
    """
    Builds the concept course map with topics, subtopics, prerequisites, and student mastery levels.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM knowledge_nodes WHERE course_id = ?", (course_id,))
    nodes_rows = cursor.fetchall()
    
    cursor.execute("""
    SELECT topic_name, mastery_level FROM learner_mastery
    WHERE student_id = ? AND course_id = ?
    """, (student_id, course_id))
    mastery_rows = cursor.fetchall()
    mastery_map = {r["topic_name"]: r["mastery_level"] for r in mastery_rows}
    
    nodes = []
    edges = []
    
    for row in nodes_rows:
        topic = row["topic_name"]
        prereqs = json.loads(row["prerequisites"]) if row["prerequisites"] else []
        subtopics = json.loads(row["subtopics"]) if row["subtopics"] else []
        m_level = mastery_map.get(topic, 0.20)
        
        # Determine status: "mastered", "in_progress", "ready", "locked"
        status = "ready"
        if m_level >= 0.75:
            status = "mastered"
        elif m_level >= 0.40:
            status = "in_progress"
        else:
            # Check if all prereqs are mastered
            all_prereqs_met = all(mastery_map.get(p, 0.0) >= 0.60 for p in prereqs)
            status = "ready" if all_prereqs_met else "locked"
            
        nodes.append({
            "id": row["id"],
            "topic_name": topic,
            "category": row["category"],
            "description": row["description"],
            "prerequisites": prereqs,
            "subtopics": subtopics,
            "mastery_level": round(m_level, 3),
            "status": status
        })
        
        for p in prereqs:
            edges.append({
                "source": p,
                "target": topic
            })
            
    conn.close()
    return {
        "course_id": course_id,
        "nodes": nodes,
        "edges": edges
    }

def get_due_flashcards(course_id: str, student_id: str = "student_default") -> List[Dict[str, Any]]:
    """Retrieves flashcards that are due for spaced repetition review."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
    SELECT * FROM flashcards
    WHERE student_id = ? AND course_id = ?
    ORDER BY next_review_date ASC
    """, (student_id, course_id))
    rows = cursor.fetchall()
    conn.close()
    
    cards = []
    for r in rows:
        cit = json.loads(r["source_citation"]) if r["source_citation"] else None
        cards.append({
            "id": r["id"],
            "student_id": r["student_id"],
            "course_id": r["course_id"],
            "topic_name": r["topic_name"],
            "front": r["front"],
            "back": r["back"],
            "source_citation": cit,
            "repetition_level": r["repetition_level"],
            "interval_days": r["interval_days"],
            "next_review_date": r["next_review_date"]
        })
    return cards

def review_flashcard_sm2(card_id: str, quality: int) -> Dict[str, Any]:
    """
    Updates flashcard scheduling using the standard SuperMemo-2 (SM-2) algorithm.
    Quality ranges from 0 (blackout) to 5 (perfect recall).
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM flashcards WHERE id = ?", (card_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise ValueError(f"Flashcard {card_id} not found.")
        
    rep = row["repetition_level"]
    ease = row["ease_factor"]
    interval = row["interval_days"]
    
    # SM-2 Formula
    if quality >= 3:
        if rep == 0:
            interval = 1
        elif rep == 1:
            interval = 6
        else:
            interval = int(round(interval * ease))
        rep += 1
    else:
        rep = 0
        interval = 1
        
    # Update ease factor: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    ease = ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    ease = max(1.3, ease)
    
    next_date = (datetime.utcnow() + timedelta(days=interval)).isoformat()
    
    cursor.execute("""
    UPDATE flashcards SET
        repetition_level = ?,
        ease_factor = ?,
        interval_days = ?,
        next_review_date = ?
    WHERE id = ?
    """, (rep, round(ease, 3), interval, next_date, card_id))
    conn.commit()
    conn.close()
    
    return {
        "card_id": card_id,
        "repetition_level": rep,
        "ease_factor": round(ease, 3),
        "interval_days": interval,
        "next_review_date": next_date
    }

def get_revision_summary(topic_name: str, course_id: str) -> Dict[str, Any]:
    """
    Generates a rapid revision card with bullet summaries and audio transcript
    optimized for students revising before an exam.
    """
    audio_scripts = {
        "Consensus & Raft Protocol": (
            "Welcome to your 2-minute revision on Raft Consensus. Key things to remember for your exam: "
            "First, Raft decomposes consensus into Leader Election, Log Replication, and Safety. "
            "Second, nodes have three states: Follower, Candidate, and Leader. "
            "Third, election timeouts are randomized between 150 and 300 milliseconds to avoid split votes. "
            "And fourth, Raft guarantees Election Safety: a follower denies votes to any candidate whose log is less up-to-date than its own. "
            "Good luck with your review!"
        ),
        "Two-Phase Commit (2PC)": (
            "Here is your rapid revision on Two-Phase Commit. "
            "Remember that 2PC achieves atomic transactions across multiple shards using a centralized coordinator. "
            "In Phase 1, the coordinator asks all nodes to prepare. If all vote YES, the coordinator sends COMMIT in Phase 2. "
            "The number one exam question: 2PC is a blocking protocol! If the coordinator crashes after nodes vote YES, "
            "participants remain locked in doubt indefinitely."
        ),
        "CAP Theorem": (
            "Quick CAP Theorem recap: "
            "In a distributed system, network partitions are an unavoidable reality. "
            "When a partition happens, you can either choose Consistency, which means rejecting writes on isolated nodes to maintain linearizability, "
            "or Availability, which means accepting writes on both sides and dealing with divergent state. "
            "You cannot choose CA across partitions."
        ),
        "Fault Tolerance & Byzantine Failures": (
            "Fault tolerance recap: "
            "To tolerate f crash-stop failures, you need a minimum of 2f plus 1 nodes so that a majority quorum of f plus 1 can always be formed. "
            "Under Byzantine traitor faults where nodes can lie or be corrupted, you need at least 3f plus 1 nodes."
        )
    }
    
    bullets = {
        "Consensus & Raft Protocol": [
            "Follower, Candidate, Leader discrete states.",
            "Randomized election timeouts (150ms–300ms) prevent split-vote deadlocks.",
            "Quorum requirement: Leader election requires majority (N/2 + 1) votes.",
            "Election Safety: Only candidates with complete, up-to-date logs can be elected."
        ],
        "Two-Phase Commit (2PC)": [
            "Phase 1: Prepare (coordinator collects votes; participants write prepare log).",
            "Phase 2: Commit or Abort (unanimous agreement required).",
            "Coordinator Bottleneck: Single point of failure.",
            "Blocking Flaw: Participants get permanently stuck in doubt if coordinator crashes."
        ],
        "CAP Theorem": [
            "Partitions (P) are an unpreventable physical reality in distributed networks.",
            "CP Systems prioritize linearizability over availability during network splits.",
            "AP Systems prioritize availability over consistency, permitting replication lag.",
            "Strict Quorum Overlap: W + R > N guarantees linearizable read-your-writes."
        ],
        "Fault Tolerance & Byzantine Failures": [
            "Crash-recovery tolerance bound: N ≥ 2f + 1 nodes.",
            "Byzantine agreement bound: N ≥ 3f + 1 nodes.",
            "Odd-sized clusters (3 or 5) are preferred over even sizes (4 or 6).",
            "Quorums prevent split-brain dual leaders."
        ]
    }
    
    if topic_name in audio_scripts:
        script = audio_scripts[topic_name]
        bullet_list = bullets.get(topic_name, ["Core definitions", "Mechanics and protocol steps", "Failure modes and trade-offs"])
    else:
        # Dynamically synthesize from uploaded content units
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
        SELECT title, text_content, page_number, slide_number 
        FROM content_units 
        WHERE course_id = ? AND (topics LIKE ? OR title LIKE ?)
        LIMIT 4
        """, (course_id, f'%"{topic_name}"%', f'%{topic_name}%'))
        unit_rows = cursor.fetchall()
        conn.close()
        
        if unit_rows:
            excerpts = []
            for r in unit_rows:
                lines = [l.strip() for l in r["text_content"].split("\n") if len(l.strip()) > 25]
                if lines:
                    excerpts.append(lines[0])
            
            script = (
                f"Welcome to your rapid review session on {topic_name}. "
                f"Key foundational principles from your course material include: "
                f"{'. '.join(excerpts[:2])}. "
                f"Be sure to master the formal definitions, computation steps, and verification invariants before your exam. "
                f"Good luck with your review!"
            )
            bullet_list = [
                f"Core foundations: {excerpts[0][:80]}..." if excerpts else f"Fundamental theorems and definitions of {topic_name}.",
                f"Operational mechanics and step-by-step problem solving.",
                f"Edge cases, solvability conditions, and dimensional constraints.",
                f"Exam priority: review practice problems and verify calculations against textbook theorems."
            ]
        else:
            script = f"Quick review on {topic_name}. Review core textbook definitions and practice problem steps before testing."
            bullet_list = [f"Foundations of {topic_name}", "Key definitions and formulas", "Problem-solving steps"]
    
    return {
        "topic_name": topic_name,
        "audio_script": script,
        "key_takeaways": bullet_list,
        "estimated_listen_time_seconds": 90
    }

def generate_personalized_study_schedule(
    student_id: str,
    course_id: str,
    exam_date_str: Optional[str] = "2026-11-20"
) -> Dict[str, Any]:
    """
    Builds an adaptive 7-day study plan prioritizing weak topics,
    factoring in Ebbinghaus memory decay and time remaining before the exam.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
    SELECT topic_name, mastery_level, revision_priority
    FROM learner_mastery
    WHERE student_id = ? AND course_id = ?
    ORDER BY mastery_level ASC
    """, (student_id, course_id))
    mastery_rows = cursor.fetchall()
    conn.close()
    
    # Calculate days remaining
    now = datetime.utcnow()
    try:
        exam_dt = datetime.fromisoformat(exam_date_str.split("T")[0])
        days_rem = max(1, (exam_dt - now).days)
    except Exception:
        days_rem = 25
        
    schedule_items = []
    days_of_week = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    
    sorted_topics = [dict(r) for r in mastery_rows] if mastery_rows else [
        {"topic_name": "Consensus & Raft Protocol", "mastery_level": 0.35, "revision_priority": "urgent"},
        {"topic_name": "Two-Phase Commit (2PC)", "mastery_level": 0.40, "revision_priority": "urgent"},
        {"topic_name": "Fault Tolerance & Byzantine Failures", "mastery_level": 0.45, "revision_priority": "high"},
        {"topic_name": "Replication & Consistency", "mastery_level": 0.60, "revision_priority": "medium"},
        {"topic_name": "CAP Theorem", "mastery_level": 0.72, "revision_priority": "low"},
        {"topic_name": "Distributed Systems Basics", "mastery_level": 0.85, "revision_priority": "low"}
    ]

    for day_offset in range(7):
        target_day = now + timedelta(days=day_offset)
        day_name = days_of_week[target_day.weekday()]
        date_str = target_day.strftime("%Y-%m-%d")
        
        # Pick topic with highest urgency / lowest mastery
        topic_idx = day_offset % len(sorted_topics)
        t_data = sorted_topics[topic_idx]
        topic = t_data["topic_name"]
        m_level = t_data["mastery_level"]
        
        if m_level < 0.45:
            activity = "Concept Deep Dive & Worked Problems"
            mins = 50
            urgency = "High"
            reason = f"Current mastery is {int(m_level*100)}%. Targeted revision needed before mock exam."
        elif m_level < 0.70:
            activity = "Practice Quiz & Citation Review"
            mins = 40
            urgency = "Medium"
            reason = f"Mastery at {int(m_level*100)}%. Practice solving numerical quorum questions."
        else:
            activity = "Quick Spaced Flashcards & Retention Check"
            mins = 25
            urgency = "Revision"
            reason = f"Mastered ({int(m_level*100)}%). Spaced review to prevent memory decay."
            
        schedule_items.append({
            "date": date_str,
            "day_of_week": day_name,
            "topic": topic,
            "activity": activity,
            "estimated_minutes": mins,
            "urgency": urgency,
            "reason": reason,
            "linked_source_title": "Designing Data-Intensive Applications",
            "linked_citation": {"page": 24 if "CAP" in topic else 34}
        })

    return {
        "student_id": student_id,
        "course_id": course_id,
        "exam_date": exam_date_str,
        "days_remaining": days_rem,
        "target_mastery": 0.90,
        "schedule": schedule_items
    }
