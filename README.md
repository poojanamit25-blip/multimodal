# Synapse AI Study Companion

> **A real, student-focused multimodal AI study companion bringing lecture videos, textbooks, and presentation slides together into a unified, source-grounded learning workspace.**

Designed with a sleek, dark/modern web workspace inspired by the Replit web interface, Synapse features source-grounded tutoring, adaptive quizzes with pre-assessment validation, a calibrated Bayesian Knowledge Tracing (BKT) learner model, and an automated RAGAS-inspired evaluation suite.

---

## 🌟 Key Product Capabilities

### 1. Multimodal Knowledge Base & Ingestion Pipeline
- **Unified Document Ingestion**: Upload academic textbooks (`.pdf`), PowerPoint presentation slides (`.pptx`), and lecture recordings / transcripts (`.mp4`, `.vtt`, `.srt`, `.txt`).
- **Layout & Content Extraction**: Parses headings, sections, tables, equations, and presenter notes using `pypdf` and `python-pptx`.
- **Timestamped Transcripts**: Retains exact timestamps pointing to the original lecture audio/video recording.
- **Searchable Content Units**: Chunks documents into indexed units tagged with topics, page numbers, slide numbers, or second-level timestamps.
- **Hybrid RAG Retrieval**: Combines 256-dimensional dense vector embeddings with BM25 term weighting and Reciprocal Rank Fusion (RRF) for millisecond keyword and conceptual retrieval.

### 2. Source-Grounded AI Tutoring & Split-Pane Viewer
- **Strict Citation Grounding**: Every answer is anchored by citations pointing to textbook pages, slides, or lecture timestamps (e.g. `[Slide 14]`, `[Textbook p. 24]`, `[Lecture 14:20]`).
- **Interactive Source Viewer**: Clicking any citation instantly seeks the video player to that timestamp or navigates the reader to the exact slide/page with highlighted evidence.
- **Evidence vs. Elaboration**: Clear visual distinction separating direct quotation excerpts from the tutor's synthesized explanation.
- **Zero-Hallucination Guardrails**: Out-of-curriculum queries (e.g. biology, quantum computing) trigger strict refusal notices rather than hallucinated answers.
- **Bilingual & Voice Support**: Toggle explanations into conversational Hindi / Hinglish while preserving English technical terms. Includes voice recitation powered by the Web Speech API.

### 3. Adaptive Quizzes & Mock Exams
- **Multi-Type Question Bank**: Generates Multiple Choice (MCQ), Numerical / problem-solving (with parameter checks and tolerance bounds), and Conceptual Short Answer questions.
- **Pre-Assessment Solvability Validation**: Verifies that every generated question is solvable using the available source materials and has defensible answers.
- **Question Deduplication**: Tracks student question presentation history with normalized hashes to prevent repetitive quizzes across sessions.
- **Misconception Diagnosis**: Identifies root misconceptions (e.g., confusing crash failure quorums $2f+1$ with Byzantine agreement bounds $3f+1$).
- **Comprehensive Performance Report**: Post-assessment report showing score, topic-wise breakdown, weak areas, and direct links to review materials.

### 4. Personalized Learner Model (Bayesian Knowledge Tracing)
- **Calibrated BKT Engine**: Tracks prior knowledge $P(L_0)$, transition rate $P(T)$, guess probability $P(G)$, and slip probability $P(S)$ after every attempt.
- **Uncertainty & Confidence Calibration**: Distinguishes demonstrated mastery from cold-start uncertainty based on attempt volume.
- **Ebbinghaus Forgetting Curve**: Models retention decay over time to flag concepts for urgent spaced revision.
- **Diagnostic Onboarding**: Establishes student baseline skill level rather than assuming zero knowledge.

### 5. Automated Evaluation & Quality Assurance (QA)
- **Built-in Benchmark Suite**: Evaluates retrieval precision, context recall, factual faithfulness, answer relevancy, citation accuracy, and refusal correctness over gold test items.
- **Multi-Persona Simulation**: Simulates three student archetypes (*Struggling Learner*, *Average Student*, *Fast Learner*) across 5 consecutive practice sessions to verify mastery convergence.

### 6. Additional Learning Features
- **Visual Concept Knowledge Map**: Interactive directed graph of topics, subtopics, and prerequisite dependencies.
- **Spaced Repetition Flashcards**: SuperMemo-2 (SM-2) algorithm for daily spaced repetition decks.
- **2-Minute Audio Revision Summaries**: Synthesized rapid audio recaps with core exam invariants.
- **7-Day Adaptive Study Planner**: Countdown schedule prioritizing urgent topics based on forgetting decay.
- **Command Palette (`Ctrl+K`)**: Instant search and navigation across all views.

---

## 🏗️ Technical Architecture

```
Multimodal/
├── backend/
│   ├── app/
│   │   ├── config.py              # Application settings, paths, API keys
│   │   ├── database.py            # SQLite database with WAL mode and tables
│   │   ├── main.py                # FastAPI REST endpoints and background tasks
│   │   ├── models/
│   │   │   └── schemas.py         # Pydantic data schemas
│   │   ├── services/
│   │   │   ├── ingestion.py       # Multimodal parsing (PDF, PPTX, video transcripts)
│   │   │   ├── rag_engine.py      # Dense vector + BM25 hybrid retrieval
│   │   │   ├── tutor.py           # Grounded tutoring and refusal engine
│   │   │   ├── assessment.py      # Quiz generation, grading, deduplication
│   │   │   ├── learner_model.py   # Bayesian Knowledge Tracing mastery engine
│   │   │   ├── evaluation.py      # Quality assurance benchmark & student simulation
│   │   │   └── features.py        # Concept map, SM-2 flashcards, audio summaries
│   │   └── tests/
│   │       └── test_suite.py      # Pytest unit & integration test suite
│   ├── requirements.txt
│   └── data/                      # Persistent database & uploaded media storage
├── frontend/
│   ├── src/
│   │   ├── components/            # Header, Sidebar, TutorChat, SourceViewer,
│   │   │                          # AssessmentRunner, PerformanceReport, KnowledgeGraph,
│   │   │                          # RevisionCenter, StudyPlanner, LearnerDashboard,
│   │   │                          # EvaluationSuite, DocumentManager, CommandPalette
│   │   ├── api/client.ts          # Typed REST API client
│   │   ├── types/index.ts         # TypeScript interfaces
│   │   ├── App.tsx                # Main Replit workspace assembly
│   │   └── index.css              # Custom styling & dark/light theme tokens
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

---

## ⚡ Quick Start & Installation

### Prerequisites
- **Python**: 3.10+ (Tested on Python 3.14)
- **Node.js**: v18+ (Tested on Node.js v24)
- **Git**

### 1. Backend Setup

```bash
cd backend

# Install Python dependencies
python -m pip install -r requirements.txt

# (Optional) Set Gemini API key for external LLM generation;
# if omitted, the application seamlessly runs on its built-in offline semantic engine
# set GEMINI_API_KEY="your_api_key_here"

# Run backend unit tests to verify system integrity
python -m pytest app/tests/test_suite.py -v

# Start FastAPI backend server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

The backend API documentation is available at:
`http://127.0.0.1:8000/docs`

### 2. Frontend Setup

In a second terminal:

```bash
cd frontend

# Install npm dependencies
npm install

# Start Vite development server
npm run dev -- --host 127.0.0.1 --port 5173
```

Open your browser at `http://127.0.0.1:5173/` to use the application.

---

## 🧪 Automated Testing & Evaluation

Synapse comes with an end-to-end evaluation pipeline:

```bash
# Run backend test suite
cd backend
python -m pytest app/tests/test_suite.py -v
```

All 5 test suites pass:
1. `test_embedding_and_rag_retrieval`: Dense vector embedding similarity and hybrid retrieval.
2. `test_tutor_grounding_and_refusal`: Grounded citation retrieval and out-of-curriculum refusal enforcement.
3. `test_assessment_generation_and_grading`: Solvability checks, numerical formula tolerance checks, and MCQ grading.
4. `test_learner_model_bkt_updates`: Bayesian Knowledge Tracing posterior formula and uncertainty intervals.
5. `test_evaluation_pipeline_metrics`: RAGAS benchmark metric bounds and multi-session learner trajectory simulation.

---

## 🔒 Security & Best Practices

- **Zero API Lock-In**: Works 100% out of the box with zero external dependencies or API keys.
- **Traceability**: All answers, flashcards, and quiz items retain explicit references to source documents, page numbers, slide numbers, or video timestamps.
- **Strict Guardrails**: Refuses to answer queries unsupported by the curriculum to prevent misleading students during exam preparation.
- **Local Storage**: All files and SQLite data remain securely on the user's local disk.
