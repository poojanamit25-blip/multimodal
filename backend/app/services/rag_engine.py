import json
import math
import re
from typing import List, Dict, Any, Optional, Tuple
from app.database import get_db_connection
from app.services.ingestion import compute_dense_embedding

def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    """Computes cosine similarity between two unit-normalized vectors."""
    if not v1 or not v2 or len(v1) != len(v2):
        return 0.0
    dot = sum(a * b for a, b in zip(v1, v2))
    return max(0.0, min(1.0, (dot + 1.0) / 2.0)) # scale to 0..1

def compute_keyword_bm25_score(query: str, text: str) -> float:
    """Lightweight BM25 term overlap score."""
    q_words = set(re.findall(r'\b[a-z0-9_-]{3,}\b', query.lower()))
    if not q_words:
        return 0.0
    
    t_words = re.findall(r'\b[a-z0-9_-]{3,}\b', text.lower())
    if not t_words:
        return 0.0
        
    doc_len = len(t_words)
    avg_len = 100.0 # estimated average unit word length
    k1 = 1.2
    b = 0.75
    
    score = 0.0
    for qw in q_words:
        tf = t_words.count(qw)
        if tf > 0:
            numerator = tf * (k1 + 1.0)
            denominator = tf + k1 * (1.0 - b + b * (doc_len / avg_len))
            score += numerator / denominator
            
    # Normalized score
    return min(1.0, score / (len(q_words) * 2.0))

def retrieve_relevant_units(
    query: str,
    course_id: str,
    top_k: int = 4,
    min_score: float = 0.35,
    filter_doc_id: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Retrieves top_k relevant content units using hybrid dense + sparse retrieval.
    Returns ranked content units with source documents and citations.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query_vec = compute_dense_embedding(query)
    
    sql = """
    SELECT u.*, d.title as doc_title, d.file_type as doc_file_type, d.filename as doc_filename
    FROM content_units u
    JOIN documents d ON u.document_id = d.id
    WHERE u.course_id = ?
    """
    params = [course_id]
    if filter_doc_id:
        sql += " AND u.document_id = ?"
        params.append(filter_doc_id)
        
    cursor.execute(sql, params)
    rows = cursor.fetchall()
    conn.close()
    
    scored_items: List[Tuple[float, Dict[str, Any]]] = []
    
    for row in rows:
        unit = dict(row)
        try:
            stored_vec = json.loads(unit["embedding"]) if unit["embedding"] else []
        except Exception:
            stored_vec = []
            
        dense_score = cosine_similarity(query_vec, stored_vec)
        bm25_score = compute_keyword_bm25_score(query, f"{unit['title']} {unit['text_content']}")
        
        # Hybrid combined score
        hybrid_score = 0.55 * dense_score + 0.45 * bm25_score
        
        # Boost if query explicitly mentions page, slide, or timestamp
        if unit.get("page_number") and f"page {unit['page_number']}" in query.lower():
            hybrid_score = min(1.0, hybrid_score + 0.3)
        if unit.get("slide_number") and f"slide {unit['slide_number']}" in query.lower():
            hybrid_score = min(1.0, hybrid_score + 0.3)
            
        if hybrid_score >= min_score:
            unit["score"] = round(hybrid_score, 4)
            scored_items.append((hybrid_score, unit))
            
    # Sort descending by score
    scored_items.sort(key=lambda x: x[0], reverse=True)
    top_results = [item[1] for item in scored_items[:top_k]]
    
    # Format citations
    for item in top_results:
        quote_snippet = item["text_content"][:160] + "..." if len(item["text_content"]) > 160 else item["text_content"]
        time_formatted = None
        if item.get("start_time_seconds") is not None:
            mins = int(item["start_time_seconds"] // 60)
            secs = int(item["start_time_seconds"] % 60)
            time_formatted = f"{mins:02d}:{secs:02d}"
            
        item["citation"] = {
            "source_title": item["doc_title"],
            "document_id": item["document_id"],
            "unit_id": item["id"],
            "file_type": item["doc_file_type"],
            "page_number": item.get("page_number"),
            "slide_number": item.get("slide_number"),
            "timestamp_seconds": item.get("start_time_seconds"),
            "timestamp_formatted": time_formatted,
            "direct_quote": quote_snippet,
            "relevance_score": item["score"]
        }
        
    return top_results
