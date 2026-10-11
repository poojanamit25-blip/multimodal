import pytest
import os
import json
from pathlib import Path

from app.database import init_db
from app.services.ingestion import compute_dense_embedding, seed_default_course_and_materials
from app.services.rag_engine import retrieve_relevant_units, cosine_similarity
from app.services.tutor import generate_grounded_tutor_response, is_query_unanswerable
from app.services.assessment import (
    generate_assessment, submit_assessment_answers,
    evaluate_numerical_answer, evaluate_short_answer, compute_question_hash
)
from app.services.learner_model import (
    update_bkt_mastery, compute_confidence_level, determine_revision_priority,
    get_learner_profile
)
from app.services.evaluation import run_evaluation_suite

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    init_db()
    seed_default_course_and_materials()

def test_embedding_and_rag_retrieval():
    """Verifies dense embedding and hybrid retrieval functionality."""
    v1 = compute_dense_embedding("Consensus algorithms in distributed systems leader election quorum")
    v2 = compute_dense_embedding("Raft consensus protocol leader election and quorum nodes")
    v3 = compute_dense_embedding("Photosynthesis chloroplast cellular plant biology sunlight leaves")
    
    assert len(v1) == 256
    sim_related = cosine_similarity(v1, v2)
    sim_unrelated = cosine_similarity(v1, v3)
    
    # Related distributed systems queries should have higher similarity than biology
    assert sim_related > sim_unrelated
    
    # Test retrieval from seeded materials
    results = retrieve_relevant_units("What is Brewer's CAP theorem?", "course_cs401", top_k=2)
    assert len(results) > 0
    top_hit = results[0]
    assert "cap" in top_hit["title"].lower() or "cap" in top_hit["text_content"].lower()
    assert top_hit["citation"]["source_title"] != ""
    assert top_hit["citation"]["direct_quote"] != ""

def test_tutor_grounding_and_refusal():
    """Verifies that tutor grounds answers with citations and refuses out-of-scope questions."""
    # 1. Answerable query
    ans_res = generate_grounded_tutor_response("How does Raft leader election work?", "course_cs401")
    assert ans_res["is_unanswerable"] is False
    assert len(ans_res["citations"]) > 0
    assert "Candidate" in ans_res["content"] or "Follower" in ans_res["content"] or "Raft" in ans_res["content"]
    assert ans_res["direct_evidence"] != ""
    
    # 2. Out-of-curriculum unanswerable query (Photosynthesis)
    refuse_res = generate_grounded_tutor_response("Explain photosynthesis in plant leaves", "course_cs401")
    assert refuse_res["is_unanswerable"] is True
    assert "none of your uploaded" in refuse_res["content"].lower() or "do not cover" in refuse_res["content"].lower()

def test_assessment_generation_and_grading():
    """Verifies quiz generation, numerical checks, and answer grading."""
    asmt = generate_assessment("student_test", "course_cs401", total_questions=3)
    assert asmt["id"].startswith("asmt_")
    assert len(asmt["questions"]) == 3
    
    # Verify answers are hidden during active test
    for q in asmt["questions"]:
        assert q["correct_answer"] is None
        assert q["step_by_step_explanation"] is None
        
    # Test numerical evaluation helper
    is_ok, score, _ = evaluate_numerical_answer("4 nodes", 4.0, 0.05)
    assert is_ok is True
    assert score == 1.0
    
    is_wrong, score_zero, _ = evaluate_numerical_answer("99", 4.0, 0.05)
    assert is_wrong is False
    assert score_zero == 0.0
    
    # Test short answer evaluation
    is_sa_ok, sa_score, _ = evaluate_short_answer(
        "The coordinator crashes and participants are blocked in doubt holding locks",
        "Participants are blocked in doubt holding locks",
        ["coordinator", "blocked", "doubt", "locks"]
    )
    assert is_sa_ok is True
    assert sa_score == 1.0

def test_learner_model_bkt_updates():
    """Verifies Bayesian Knowledge Tracing posterior calculation."""
    prior = 0.30
    
    # When answering correctly, mastery should increase
    post_correct = update_bkt_mastery(prior, is_correct=True)
    assert post_correct > prior
    
    # When answering incorrectly, mastery should drop
    post_incorrect = update_bkt_mastery(prior, is_correct=False)
    assert post_incorrect < prior
    
    # Confidence level increases with more attempts
    c1 = compute_confidence_level(1)
    c10 = compute_confidence_level(10)
    assert c10 > c1
    
    # Revision priority check
    assert determine_revision_priority(0.25) == "urgent"
    assert determine_revision_priority(0.90) == "low"

def test_evaluation_pipeline_metrics():
    """Runs the full evaluation benchmark and verifies metric bounds."""
    eval_run = run_evaluation_suite("course_cs401")
    assert eval_run["total_samples"] >= 8
    assert 0.0 <= eval_run["faithfulness_score"] <= 1.0
    assert 0.0 <= eval_run["citation_accuracy_score"] <= 1.0
    assert eval_run["refusal_accuracy_score"] >= 0.80
    assert "student_archetype_simulation" in eval_run["details"]
