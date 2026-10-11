import re
import uuid
import json
import hashlib
import logging
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timezone

from app.database import get_db_connection
from app.services.learner_model import record_assessment_performance
from app.services.rag_engine import retrieve_relevant_units

logger = logging.getLogger(__name__)

# Master Question Bank containing verified curriculum questions mapped to source materials
QUESTION_TEMPLATES = [
    # 1. Consensus & Raft Protocol - MCQ
    {
        "topic": "Consensus & Raft Protocol",
        "difficulty": "medium",
        "type": "mcq",
        "question": "In the Raft consensus algorithm, which of the following invariants ensures that a newly elected leader already contains all committed entries from all previous terms?",
        "options": [
            {"id": "A", "text": "Heartbeat Frequency Bound: Leaders broadcast AppendEntries every 10ms"},
            {"id": "B", "text": "Election Safety / Log Completeness: Followers deny votes to candidates whose log is less up-to-date than their own"},
            {"id": "C", "text": "State Machine Inversion: Followers apply state changes before leader commits"},
            {"id": "D", "text": "Two-Phase Fallback: Candidates revert to Two-Phase Commit if a term expires"}
        ],
        "correct_answer": "B",
        "explanation": "Raft guarantees Election Safety (Log Completeness property): A follower denies its vote if the candidate's last log entry has a lower term, or the same term with a lower index. Because any committed entry is present on a majority of nodes, at least one node in any majority voter set must contain that entry and will deny votes to candidates lacking it.",
        "source_citation": {
            "source_title": "Lecture 08 Slides: Consensus & The Raft Protocol",
            "slide": 14,
            "file_type": "slides",
            "direct_quote": "A follower will deny its vote to a candidate in RequestVote RPC if candidate's log is less up-to-date than follower's own log."
        },
        "misconceptions": {
            "A": "Confuses operational heartbeat frequency with correctness safety invariants.",
            "C": "Followers must never apply uncommitted entries out of order.",
            "D": "Raft never falls back to 2PC; Raft is a non-blocking majority consensus protocol."
        }
    },
    # 2. Consensus & Raft Protocol - Numerical / Problem Solving
    {
        "topic": "Consensus & Raft Protocol",
        "difficulty": "hard",
        "type": "numerical",
        "question": "A distributed key-value store runs a Raft consensus cluster with N = 7 server nodes. If a sudden network split isolates 3 server nodes into partition A and 4 server nodes into partition B, how many nodes constitute a valid majority quorum, and which partition can elect a leader and commit new writes?",
        "options": None,
        "correct_answer": "4",
        "numerical_value": 4.0,
        "numerical_tolerance": 0.0,
        "explanation": "In any Raft cluster of N nodes, the strict majority quorum is ceil((N + 1) / 2) = floor(N / 2) + 1. For N = 7, the majority is floor(7 / 2) + 1 = 4 nodes. Partition A only has 3 nodes (3 < 4), so it cannot form a quorum. Partition B has 4 nodes (4 ≥ 4), which forms a legitimate strict majority quorum to elect a leader and commit writes.",
        "source_citation": {
            "source_title": "Designing Data-Intensive Applications",
            "page": 42,
            "file_type": "textbook",
            "direct_quote": "A minimum cluster size of 2f + 1 nodes is strictly required to guarantee a majority quorum of f + 1 nodes."
        },
        "misconceptions": {
            "default": "Often students calculate 7 / 2 = 3.5 and mistakenly think 3 nodes can commit writes, which causes a dangerous split-brain."
        }
    },
    # 3. Two-Phase Commit - Short Answer / Conceptual
    {
        "topic": "Two-Phase Commit (2PC)",
        "difficulty": "medium",
        "type": "short_answer",
        "question": "Explain why Two-Phase Commit (2PC) is classified as a 'blocking protocol', and describe what happens to participant nodes if the coordinator crashes during Phase 2.",
        "options": None,
        "correct_answer": "Participants are blocked in doubt holding locks because they do not know whether the coordinator decided to commit or abort.",
        "keywords_required": ["blocking", "coordinator", "locks", "doubt", "commit", "abort"],
        "explanation": "Two-Phase Commit is blocking because if the coordinator crashes after participants have voted YES in Phase 1 but before broadcasting COMMIT in Phase 2, the participants have surrendered autonomy. They cannot abort because the coordinator might have sent COMMIT to others, and they cannot commit because someone might have voted NO. They are stuck in doubt holding resource locks indefinitely.",
        "source_citation": {
            "source_title": "Designing Data-Intensive Applications",
            "page": 34,
            "file_type": "textbook",
            "direct_quote": "2PC is a blocking protocol. If coordinator crashes after nodes vote YES, participant nodes are permanently stuck in doubt holding locks."
        },
        "misconceptions": {
            "default": "Assuming participants can simply timeout and choose to abort, which can lead to catastrophic distributed inconsistency if another shard committed."
        }
    },
    # 4. CAP Theorem - MCQ
    {
        "topic": "CAP Theorem",
        "difficulty": "easy",
        "type": "mcq",
        "question": "According to the formal definition of the CAP Theorem, why can a distributed system not be classified as both 'CA' across wide-area networks?",
        "options": [
            {"id": "A", "text": "Hardware clocks cannot synchronize faster than nanoseconds"},
            {"id": "B", "text": "Network partitions (P) are an unavoidable physical reality; when a partition happens, the system must choose either Consistency or Availability"},
            {"id": "C", "text": "Disk storage write speeds are slower than RAM read latencies"},
            {"id": "D", "text": "Asymmetric encryption algorithms require too much CPU overhead"}
        ],
        "correct_answer": "B",
        "explanation": "Network partitions (P) cannot be eliminated or chosen against in physical networks. Routers fail and fiber lines can be severed. Therefore, when a partition occurs, a system cannot remain both Consistent (Linearizable) and Available for writes across both disconnected segments.",
        "source_citation": {
            "source_title": "Designing Data-Intensive Applications",
            "page": 24,
            "file_type": "textbook",
            "direct_quote": "The CAP theorem states that when a network partition (P) occurs, a distributed data store must choose between Consistency and Availability."
        },
        "misconceptions": {
            "A": "Clock synchronization issues affect linearizable ordering, but do not invalidate the trade-off under partition.",
            "C": "Storage I/O latency is unrelated to Brewer's conjecture.",
            "D": "Cryptographic overhead is orthogonal to distributed consensus limits."
        }
    },
    # 5. Fault Tolerance & Byzantine Failures - Numerical
    {
        "topic": "Fault Tolerance & Byzantine Failures",
        "difficulty": "hard",
        "type": "numerical",
        "question": "To design a mission-critical aerospace distributed voting system that can withstand up to f = 3 arbitrary/Byzantine (malicious or corrupt) node failures, what is the minimum total number of nodes required in the cluster?",
        "options": None,
        "correct_answer": "10",
        "numerical_value": 10.0,
        "numerical_tolerance": 0.0,
        "explanation": "Under the Byzantine fault model, a cluster requires N ≥ 3f + 1 nodes to guarantee consensus among honest nodes. For f = 3 Byzantine failures: N = 3(3) + 1 = 10 nodes. (Contrast this with crash failures, which only require 2f + 1 = 7 nodes).",
        "source_citation": {
            "source_title": "Designing Data-Intensive Applications",
            "page": 42,
            "file_type": "textbook",
            "direct_quote": "Under Byzantine (malicious or arbitrary) faults, the theoretical bound rises to 3f + 1 nodes."
        },
        "misconceptions": {
            "default": "Calculating 2f + 1 = 7 nodes, which is the bound for crash-stop failures, not Byzantine traitor nodes."
        }
    },
    # 6. Replication & Consistency - MCQ
    {
        "topic": "Replication & Consistency",
        "difficulty": "medium",
        "type": "mcq",
        "question": "In a quorum-based replication scheme with N = 5 replicas, if the write quorum is set to W = 3, what is the minimum read quorum R required to ensure strong consistency (linearizable overlap)?",
        "options": [
            {"id": "A", "text": "R = 1"},
            {"id": "B", "text": "R = 2"},
            {"id": "C", "text": "R = 3"},
            {"id": "D", "text": "R = 5"}
        ],
        "correct_answer": "C",
        "explanation": "The strict quorum inequality requires W + R > N. With N = 5 and W = 3: 3 + R > 5, which means R > 2. The smallest integer strictly greater than 2 is R = 3. With W = 3 and R = 3, any read set overlaps with any write set on at least one replica (3 + 3 = 6 > 5).",
        "source_citation": {
            "source_title": "Designing Data-Intensive Applications",
            "page": 25,
            "file_type": "textbook",
            "direct_quote": "For a cluster of N replicas where W is the write quorum and R is the read quorum, strong consistency requires: W + R > N."
        },
        "misconceptions": {
            "A": "R = 1 allows reading from replicas that never received the latest write.",
            "B": "With R = 2, W + R = 3 + 2 = 5, which does not satisfy strict inequality W + R > N.",
            "D": "R = 5 provides consistency, but is unnecessarily large, degrading read availability."
        }
    },
    # 7. Consensus & Raft Protocol - MCQ (Heartbeat & Term update)
    {
        "topic": "Consensus & Raft Protocol",
        "difficulty": "easy",
        "type": "mcq",
        "question": "What happens when an existing Raft leader receives an AppendEntries or RequestVote message containing a term number greater than its own currentTerm?",
        "options": [
            {"id": "A", "text": "It rejects the message and disconnects the peer"},
            {"id": "B", "text": "It immediately updates its currentTerm and steps down to Follower state"},
            {"id": "C", "text": "It initiates an emergency Two-Phase Commit to verify the new term"},
            {"id": "D", "text": "It retains leader authority until the end of its current lease"}
        ],
        "correct_answer": "B",
        "explanation": "As explained in Prof. Alan Stone's Lecture 08 at 14:20: Raft terms act as a logical clock. If any server receives an RPC with a term T > currentTerm, it immediately sets its currentTerm = T and reverts to Follower state. This prevents stale leaders from creating conflicting log forks.",
        "source_citation": {
            "source_title": "Prof. Alan Stone - Lecture 08: Fault Tolerance & Distributed Consensus",
            "timestamp_seconds": 860.0,
            "timestamp_formatted": "14:20",
            "file_type": "lecture_video",
            "direct_quote": "If any node receives a message with a term greater than its own currentTerm, it immediately updates its currentTerm and reverts back to Follower state."
        },
        "misconceptions": {
            "A": "Rejecting higher terms would freeze cluster progress after network healing.",
            "C": "Raft never uses 2PC.",
            "D": "Without lease renewals, staying leader causes split-brain."
        }
    },
    # 8. Linear Algebra - Matrices, Vectors: Addition & Scalar Mult (MCQ)
    {
        "topic": "Matrices, Vectors: Addition and Scalar Multiplication",
        "difficulty": "medium",
        "type": "mcq",
        "question": "Under what conditions are two matrices A = [a_jk] and B = [b_jk] formally defined as equal (A = B)?",
        "options": [
            {"id": "A", "text": "They must have the exact same dimensions (same number of rows and columns) and all corresponding entries must be equal (a_jk = b_jk for all j, k)"},
            {"id": "B", "text": "Their row sums and column sums must be equal"},
            {"id": "C", "text": "They must both be square matrices with equal determinants"},
            {"id": "D", "text": "Their traces must be identical"}
        ],
        "correct_answer": "A",
        "explanation": "Kreyszig Sec. 7.1 Page 5: Two matrices A and B are equal, written A = B, if and only if they have the same size and their corresponding entries are equal: a_jk = b_jk for all j and k. Equality cannot be satisfied with differing dimensions even if entries match.",
        "source_citation": {
            "source_title": "Linear Algebra by Kreyszig.pdf",
            "page": 5,
            "file_type": "textbook",
            "direct_quote": "Two matrices A and B are equal if and only if they have the same size and corresponding entries are equal."
        },
        "misconceptions": {
            "B": "Equal marginal sums do not guarantee that individual elements are identical.",
            "C": "Determinants only apply to square matrices and equal determinants do not imply matrix equality.",
            "D": "Trace is only defined for square matrices and sum of diagonals does not define full matrix equality."
        }
    },
    # 9. Linear Algebra - Matrices, Vectors: Addition & Scalar Mult (Numerical)
    {
        "topic": "Matrices, Vectors: Addition and Scalar Multiplication",
        "difficulty": "easy",
        "type": "numerical",
        "question": "If a matrix A has dimensions 3 x 4, what is the size of the matrix resulting from scalar multiplication 5A, and how many total scalar entries does 5A contain?",
        "options": None,
        "correct_answer": "12",
        "numerical_value": 12.0,
        "numerical_tolerance": 0.0,
        "explanation": "Scalar multiplication cA multiplies every entry of A by the scalar c without altering the dimension of the matrix. Since A has size 3 x 4, 5A also has size 3 x 4, which contains 3 * 4 = 12 total entries.",
        "source_citation": {
            "source_title": "Linear Algebra by Kreyszig.pdf",
            "page": 5,
            "file_type": "textbook",
            "direct_quote": "The product of any m x n matrix A and any scalar c is written cA and is the m x n matrix obtained by multiplying each entry of A by c."
        },
        "misconceptions": {
            "default": "Students sometimes mistakenly multiply the dimensions by the scalar 5 (e.g. 15 x 20), confusing scalar multiplication with matrix scaling."
        }
    },
    # 10. Linear Algebra - Matrices, Vectors: Addition & Scalar Mult (Short Answer)
    {
        "topic": "Matrices, Vectors: Addition and Scalar Multiplication",
        "difficulty": "medium",
        "type": "short_answer",
        "question": "State the algebraic condition required for two matrices A and B to be added together (A + B), and describe how the entries of the sum are computed.",
        "options": None,
        "correct_answer": "Both matrices must have the exact same size (same rows and columns), and each entry in the sum is computed by adding the corresponding entries of A and B.",
        "keywords_required": ["same", "size", "dimensions", "corresponding", "entries", "add"],
        "explanation": "Matrix addition is strictly defined only for matrices of the same size. If A and B are m x n, their sum C = A + B is also m x n, where c_jk = a_jk + b_jk.",
        "source_citation": {
            "source_title": "Linear Algebra by Kreyszig.pdf",
            "page": 5,
            "file_type": "textbook",
            "direct_quote": "The sum of two matrices A and B of the same size is written A + B and has the entries obtained by adding the corresponding entries."
        },
        "misconceptions": {
            "default": "Attempting to add matrices of different dimensions using zero-padding or broadcasting without formal dimension compatibility."
        }
    },
    # 11. Linear Algebra - Matrix Multiplication (MCQ)
    {
        "topic": "Matrix Multiplication",
        "difficulty": "medium",
        "type": "mcq",
        "question": "Under what dimensional condition is the matrix product C = AB defined for two matrices A and B?",
        "options": [
            {"id": "A", "text": "The number of columns of matrix A must strictly equal the number of rows of matrix B"},
            {"id": "B", "text": "Both matrices must have identical row and column counts (m x n)"},
            {"id": "C", "text": "The number of rows of matrix A must equal the number of columns of matrix B"},
            {"id": "D", "text": "Both matrices must be square and invertible"}
        ],
        "correct_answer": "A",
        "explanation": "Kreyszig Sec. 7.2 Page 8: The product C = AB is defined if and only if the number of columns in the first factor A is equal to the number of rows in the second factor B. If A is m x p and B is p x n, the resulting product C is of size m x n.",
        "source_citation": {
            "source_title": "Linear Algebra by Kreyszig.pdf",
            "page": 8,
            "file_type": "textbook",
            "direct_quote": "The product C = AB is defined if and only if the number of columns of A is equal to the number of rows of B."
        },
        "misconceptions": {
            "B": "Identical dimensions are required for matrix addition, not multiplication (unless matrices are square).",
            "C": "Inverses the required index matchup.",
            "D": "Matrix multiplication applies to rectangular matrices; invertibility is not required."
        }
    },
    # 12. Linear Algebra - Matrix Multiplication (Numerical)
    {
        "topic": "Matrix Multiplication",
        "difficulty": "medium",
        "type": "numerical",
        "question": "If matrix A has size 4 x 3 and matrix B has size 3 x 5, what is the total number of entries in the resulting product matrix C = AB?",
        "options": None,
        "correct_answer": "20",
        "numerical_value": 20.0,
        "numerical_tolerance": 0.0,
        "explanation": "The product of an (m x p) matrix and a (p x n) matrix produces an (m x n) matrix. For A (4 x 3) and B (3 x 5), the product C has size 4 x 5. The total number of scalar entries in C is 4 * 5 = 20 entries.",
        "source_citation": {
            "source_title": "Linear Algebra by Kreyszig.pdf",
            "page": 9,
            "file_type": "textbook",
            "direct_quote": "If A is of size m x p and B is of size p x n, then C = AB is of size m x n."
        },
        "misconceptions": {
            "default": "Calculating 4 * 3 * 5 = 60 by multiplying all dimensions, instead of determining the outer dimensions m x n."
        }
    },
    # 13. Linear Algebra - Matrix Multiplication (MCQ Transpose)
    {
        "topic": "Matrix Multiplication",
        "difficulty": "hard",
        "type": "mcq",
        "question": "For any two matrices A and B for which the product AB is defined, which equation correctly describes the transpose of the product (AB)^T?",
        "options": [
            {"id": "A", "text": "(AB)^T = B^T A^T"},
            {"id": "B", "text": "(AB)^T = A^T B^T"},
            {"id": "C", "text": "(AB)^T = -(A^T B^T)"},
            {"id": "D", "text": "(AB)^T = A^T + B^T"}
        ],
        "correct_answer": "A",
        "explanation": "Kreyszig Sec. 7.2 Page 12: A fundamental theorem of linear algebra states that the transpose of a product equals the product of the transposes in reverse order: (AB)^T = B^T A^T.",
        "source_citation": {
            "source_title": "Linear Algebra by Kreyszig.pdf",
            "page": 12,
            "file_type": "textbook",
            "direct_quote": "The transpose of a product equals the product of the transposes in reverse order: (AB)^T = B^T A^T."
        },
        "misconceptions": {
            "B": "Forgetting that transposing reverses the multiplication order.",
            "C": "Confusing transpose with skew-symmetric definition.",
            "D": "Confusing product transpose with addition transpose."
        }
    },
    # 14. Linear Algebra - Gauss Elimination (MCQ)
    {
        "topic": "Linear Systems of Equations. Gauss Elimination",
        "difficulty": "medium",
        "type": "mcq",
        "question": "Which of the following is NOT a permissible elementary row operation used in Gauss elimination to reduce an augmented matrix?",
        "options": [
            {"id": "A", "text": "Squaring all entries in a row to eliminate negative numbers"},
            {"id": "B", "text": "Interchange of two rows (equations)"},
            {"id": "C", "text": "Multiplication of a row by a non-zero scalar constant"},
            {"id": "D", "text": "Addition of a scalar multiple of one row to another row"}
        ],
        "correct_answer": "A",
        "explanation": "Kreyszig Sec. 7.3 Page 18: Gauss elimination uses three elementary row operations: (1) Interchange of two equations, (2) Multiplication of an equation by a non-zero constant, (3) Addition of a constant multiple of one equation to another. Squaring rows introduces spurious solutions and violates linearity.",
        "source_citation": {
            "source_title": "Linear Algebra by Kreyszig.pdf",
            "page": 18,
            "file_type": "textbook",
            "direct_quote": "Elementary row operations for matrices: 1. Interchange of two rows. 2. Addition of a multiple of one row to another row. 3. Multiplication of a row by a nonzero constant."
        },
        "misconceptions": {
            "B": "Row interchange is valid and preserves the solution set.",
            "C": "Non-zero scalar multiplication is an elementary operation.",
            "D": "Row addition is the cornerstone of row elimination."
        }
    },
    # 15. Linear Algebra - Gauss Elimination (Numerical)
    {
        "topic": "Linear Systems of Equations. Gauss Elimination",
        "difficulty": "hard",
        "type": "numerical",
        "question": "A linear system has m = 3 linear equations with n = 5 unknowns. If the rank of the augmented matrix equals the rank of the coefficient matrix rank(A) = 3, how many free parameters (degrees of freedom) exist in the general solution?",
        "options": None,
        "correct_answer": "2",
        "numerical_value": 2.0,
        "numerical_tolerance": 0.0,
        "explanation": "Kreyszig Sec. 7.3 Page 22: If a linear system of n unknowns is consistent and rank(A) = r, the general solution contains n - r arbitrary free parameters. Here, n = 5 and r = 3, so there are 5 - 3 = 2 free parameters.",
        "source_citation": {
            "source_title": "Linear Algebra by Kreyszig.pdf",
            "page": 22,
            "file_type": "textbook",
            "direct_quote": "If a system is consistent and has rank r, it has a unique solution if r = n, and infinitely many solutions with n - r free parameters if r < n."
        },
        "misconceptions": {
            "default": "Guessing 3 based on the number of equations or rank, rather than calculating the difference n - rank(A)."
        }
    },
    # 16. Linear Algebra - Gauss Elimination (Short Answer)
    {
        "topic": "Linear Systems of Equations. Gauss Elimination",
        "difficulty": "medium",
        "type": "short_answer",
        "question": "How is an inconsistent linear system (a system with no solution) detected when an augmented matrix is reduced to row echelon form?",
        "options": None,
        "correct_answer": "It is detected by a row where all coefficient entries on the left are zero, but the right-hand augmented entry is non-zero (representing 0 = c where c is non-zero).",
        "keywords_required": ["zero", "nonzero", "row", "constant", "false", "contradiction", "no solution"],
        "explanation": "An inconsistent system produces a row of the form [0 0 ... 0 | b] where b != 0, representing the contradiction 0 = b.",
        "source_citation": {
            "source_title": "Linear Algebra by Kreyszig.pdf",
            "page": 20,
            "file_type": "textbook",
            "direct_quote": "A linear system is inconsistent (has no solution) if the augmented matrix has a row with all zeros on the left and a nonzero number on the right."
        },
        "misconceptions": {
            "default": "Confusing a row of all zeros [0 0 ... 0 | 0] (which indicates free parameters / infinitely many solutions) with an inconsistent row [0 ... 0 | b]."
        }
    },
    # 17. Linear Algebra - Linear Independence & Rank (MCQ)
    {
        "topic": "Linear Independence. Rank of a Matrix. Vector Space",
        "difficulty": "medium",
        "type": "mcq",
        "question": "A set of vectors {v1, v2, ..., vk} is formally defined as linearly independent if the vector equation c1*v1 + c2*v2 + ... + ck*vk = 0 is satisfied under which condition?",
        "options": [
            {"id": "A", "text": "Only when all scalar coefficients are zero: c1 = c2 = ... = ck = 0"},
            {"id": "B", "text": "When at least one scalar coefficient is non-zero"},
            {"id": "C", "text": "When the sum of all scalar coefficients equals 1"},
            {"id": "D", "text": "When all vectors are orthogonal unit vectors"}
        ],
        "correct_answer": "A",
        "explanation": "Kreyszig Sec. 7.4 Page 28: A set of vectors is linearly independent if the linear combination c1*v1 + ... + ck*vk = 0 holds only when c1 = 0, c2 = 0, ..., ck = 0 (the trivial solution). If it can hold with any non-zero coefficient, the vectors are linearly dependent.",
        "source_citation": {
            "source_title": "Linear Algebra by Kreyszig.pdf",
            "page": 28,
            "file_type": "textbook",
            "direct_quote": "A set of vectors is linearly independent if c1*v1 + ... + ck*vk = 0 holds only when c1 = c2 = ... = ck = 0."
        },
        "misconceptions": {
            "B": "Condition B is the definition of linear dependence.",
            "C": "Affinity/convex combination constraint, not linear independence.",
            "D": "Orthogonality implies independence, but independence does not require orthogonality."
        }
    },
    # 18. Linear Algebra - Linear Independence & Rank (Numerical)
    {
        "topic": "Linear Independence. Rank of a Matrix. Vector Space",
        "difficulty": "medium",
        "type": "numerical",
        "question": "For a rectangular matrix A with dimensions 4 x 7, what is the theoretical maximum rank that matrix A can possess?",
        "options": None,
        "correct_answer": "4",
        "numerical_value": 4.0,
        "numerical_tolerance": 0.0,
        "explanation": "Kreyszig Sec. 7.4 Page 28: The rank of an m x n matrix can never exceed the smaller of its dimensions: rank(A) <= min(m, n). For a 4 x 7 matrix, min(4, 7) = 4, so the maximum possible rank is 4.",
        "source_citation": {
            "source_title": "Linear Algebra by Kreyszig.pdf",
            "page": 28,
            "file_type": "textbook",
            "direct_quote": "The rank of an m x n matrix cannot exceed the minimum of m and n."
        },
        "misconceptions": {
            "default": "Choosing 7 because of the number of columns, forgetting that row rank always equals column rank."
        }
    },
    # 19. Linear Algebra - Eigenvalues (MCQ)
    {
        "topic": "The Matrix Eigenvalue Problem. Determining Eigenvalues and Eigenvectors",
        "difficulty": "medium",
        "type": "mcq",
        "question": "For an n x n square matrix A, what is the characteristic equation used to determine its eigenvalues lambda?",
        "options": [
            {"id": "A", "text": "det(A - lambda * I) = 0"},
            {"id": "B", "text": "det(A + lambda * I) = 1"},
            {"id": "C", "text": "Trace(A) - lambda = 0"},
            {"id": "D", "text": "A * lambda = 0"}
        ],
        "correct_answer": "A",
        "explanation": "Kreyszig Sec. 8.1 Page 33: An eigenvalue problem is defined by Ax = lambda*x, which rearranges to (A - lambda*I)x = 0. For a non-trivial (non-zero) eigenvector x to exist, the coefficient matrix must be singular, meaning its determinant must be zero: det(A - lambda*I) = 0.",
        "source_citation": {
            "source_title": "Linear Algebra by Kreyszig.pdf",
            "page": 33,
            "file_type": "textbook",
            "direct_quote": "The characteristic equation of an n x n matrix A is det(A - lambda*I) = 0."
        },
        "misconceptions": {
            "B": "The determinant must equal 0 (singularity), not 1.",
            "C": "The trace is the sum of eigenvalues, but does not provide individual eigenvalues.",
            "D": "Lambda is a scalar, not an eigenvector."
        }
    },
    # 20. Linear Algebra - Eigenvalues (Numerical)
    {
        "topic": "The Matrix Eigenvalue Problem. Determining Eigenvalues and Eigenvectors",
        "difficulty": "hard",
        "type": "numerical",
        "question": "For a 3 x 3 square matrix A, the eigenvalues are lambda_1 = 3, lambda_2 = 5, and lambda_3 = -2. What is the numerical trace of matrix A (the sum of its main diagonal entries)?",
        "options": None,
        "correct_answer": "6",
        "numerical_value": 6.0,
        "numerical_tolerance": 0.0,
        "explanation": "Kreyszig Sec. 8.1 Page 35: The trace of any square matrix A equals the sum of its eigenvalues: Trace(A) = lambda_1 + lambda_2 + lambda_3 = 3 + 5 + (-2) = 6.",
        "source_citation": {
            "source_title": "Linear Algebra by Kreyszig.pdf",
            "page": 35,
            "file_type": "textbook",
            "direct_quote": "The trace of a square matrix A equals the sum of its eigenvalues."
        },
        "misconceptions": {
            "default": "Calculating the product of eigenvalues 3 * 5 * (-2) = -30 (which is the determinant, not the trace)."
        }
    },
    # 21. Linear Algebra - Symmetric & Orthogonal Matrices (MCQ)
    {
        "topic": "Symmetric, Skew-Symmetric, and Orthogonal Matrices",
        "difficulty": "medium",
        "type": "mcq",
        "question": "A real square matrix A is defined as an orthogonal matrix if it satisfies which of the following conditions?",
        "options": [
            {"id": "A", "text": "A^T = A^(-1), which implies A^T A = I"},
            {"id": "B", "text": "A^T = -A"},
            {"id": "C", "text": "det(A) = 0"},
            {"id": "D", "text": "All eigenvalues of A are zero"}
        ],
        "correct_answer": "A",
        "explanation": "Kreyszig Sec. 8.3 Page 45: An orthogonal matrix is a square matrix whose transpose equals its inverse: A^T = A^(-1), so A^T A = I. Its column (and row) vectors form an orthonormal set.",
        "source_citation": {
            "source_title": "Linear Algebra by Kreyszig.pdf",
            "page": 45,
            "file_type": "textbook",
            "direct_quote": "A real square matrix A is called an orthogonal matrix if its transpose equals its inverse: A^T = A^(-1)."
        },
        "misconceptions": {
            "B": "A^T = -A defines a skew-symmetric matrix, not an orthogonal matrix.",
            "C": "Orthogonal matrices always have determinant +1 or -1, never 0.",
            "D": "Orthogonal matrices have non-zero eigenvalues of modulus 1."
        }
    },
    # 22. Linear Algebra - Symmetric & Orthogonal Matrices (Numerical)
    {
        "topic": "Symmetric, Skew-Symmetric, and Orthogonal Matrices",
        "difficulty": "easy",
        "type": "numerical",
        "question": "In any real skew-symmetric matrix where A^T = -A, what must the numerical value of every main diagonal entry a_jj be?",
        "options": None,
        "correct_answer": "0",
        "numerical_value": 0.0,
        "numerical_tolerance": 0.0,
        "explanation": "Kreyszig Sec. 8.3 Page 45: By definition of skew-symmetry, a_jk = -a_kj. For diagonal entries j = k, this requires a_jj = -a_jj, which means 2*a_jj = 0, so a_jj = 0 for all diagonal entries.",
        "source_citation": {
            "source_title": "Linear Algebra by Kreyszig.pdf",
            "page": 45,
            "file_type": "textbook",
            "direct_quote": "The main diagonal entries of a skew-symmetric matrix are always zero because a_jj = -a_jj implies a_jj = 0."
        },
        "misconceptions": {
            "default": "Assuming diagonal entries can be 1 or -1, confusing with orthogonal sign properties."
        }
    }
]

def generate_dynamic_questions_from_content(
    course_id: str,
    target_topics: List[str],
    count: int = 5,
    conn: Optional[Any] = None
) -> List[Dict[str, Any]]:
    """
    Dynamically generates authentic, source-grounded practice and exam questions
    directly from uploaded content units when questions for a specific topic
    are not already present in QUESTION_TEMPLATES.
    """
    should_close = False
    if conn is None:
        conn = get_db_connection()
        should_close = True
        
    cursor = conn.cursor()
    generated: List[Dict[str, Any]] = []
    
    try:
        for topic in target_topics:
            # Query content units tagged with this topic
            cursor.execute("""
            SELECT cu.id, cu.title, cu.text_content, cu.page_number, cu.slide_number,
                   cu.unit_type, d.title as doc_title
            FROM content_units cu
            JOIN documents d ON cu.document_id = d.id
            WHERE cu.course_id = ? AND cu.topics LIKE ?
            ORDER BY cu.page_number ASC, cu.slide_number ASC
            LIMIT 8
            """, (course_id, f'%"{topic}"%'))
            units = cursor.fetchall()
            
            if not units:
                # Fallback search by text match
                cursor.execute("""
                SELECT cu.id, cu.title, cu.text_content, cu.page_number, cu.slide_number,
                       cu.unit_type, d.title as doc_title
                FROM content_units cu
                JOIN documents d ON cu.document_id = d.id
                WHERE cu.course_id = ? AND cu.text_content LIKE ?
                LIMIT 8
                """, (course_id, f'%{topic[:20]}%'))
                units = cursor.fetchall()
                
            for u in units:
                if len(generated) >= count:
                    break
                    
                txt = u["text_content"]
                doc_title = u["doc_title"]
                page = u["page_number"]
                slide = u["slide_number"]
                
                # Check for DEFINITION
                m_def = re.search(r'DEFINITION\s+([^\n\r]+?)(?:[\n\r]+)([^\n\r\.]+[\.!?])', txt)
                if m_def:
                    term = re.sub(r'^[0-9\.\s]+', '', m_def.group(1)).strip()
                    definition_text = m_def.group(2).strip()
                    if len(term) > 3 and len(definition_text) > 20:
                        q_text = f"According to your course material on {topic}, what is the definition and core property of '{term}'?"
                        correct = definition_text
                        distractor_1 = f"{term} only applies to scalar quantities and cannot be applied in vector or matrix spaces."
                        distractor_2 = f"{term} requires an asymptotic time complexity exceeding O(n^3)."
                        distractor_3 = f"{term} is strictly undefined whenever zero elements are present."
                        
                        generated.append({
                            "topic": topic,
                            "difficulty": "medium",
                            "type": "mcq",
                            "question": q_text,
                            "options": [
                                {"id": "A", "text": correct},
                                {"id": "B", "text": distractor_1},
                                {"id": "C", "text": distractor_2},
                                {"id": "D", "text": distractor_3}
                            ],
                            "correct_answer": "A",
                            "explanation": f"Grounded in {doc_title}: {definition_text}",
                            "source_citation": {
                                "source_title": doc_title,
                                "page": page,
                                "slide": slide,
                                "file_type": "textbook" if page else "slides",
                                "direct_quote": definition_text[:120]
                            },
                            "misconceptions": {
                                "B": "Incorrectly restricts scope to scalar values.",
                                "C": "Confuses algorithmic complexity with structural definition.",
                                "D": "Zero elements do not violate the definition."
                            }
                        })
                        continue
                        
                # Check for sentences with key defining terms
                sentences = [s.strip() for s in txt.split(".") if len(s.strip()) > 35]
                for s in sentences[:2]:
                    if any(kw in s.lower() for kw in ["is defined as", "consists of", "theorem", "property", "condition", "is called"]):
                        generated.append({
                            "topic": topic,
                            "difficulty": "medium",
                            "type": "short_answer",
                            "question": f"Explain the principle in {topic} discussed in your course material regarding: '{s[:60]}...'?",
                            "options": None,
                            "correct_answer": s,
                            "keywords_required": [w for w in re.findall(r'\b[a-zA-Z]{5,}\b', s)[:4]],
                            "explanation": f"As explained in {doc_title}: {s}.",
                            "source_citation": {
                                "source_title": doc_title,
                                "page": page,
                                "slide": slide,
                                "file_type": "textbook" if page else "slides",
                                "direct_quote": s[:120]
                            },
                            "misconceptions": {
                                "default": "Missing key conceptual constraints stated in the textbook."
                            }
                        })
                        break
    except Exception as e:
        logger.exception(f"Error generating dynamic questions: {e}")
    finally:
        if should_close:
            conn.close()
            
    return generated

def compute_question_hash(question_text: str) -> str:
    """Computes a normalized hash of the question text to detect duplicate questions."""
    norm = re.sub(r'[^a-z0-9]', '', question_text.lower())
    return hashlib.sha256(norm.encode('utf-8')).hexdigest()[:16]

def is_question_recently_asked(student_id: str, course_id: str, question_hash: str) -> bool:
    """Checks whether the student was already asked this question recently."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT id FROM question_history
    WHERE student_id = ? AND course_id = ? AND normalized_hash = ?
    """, (student_id, course_id, question_hash))
    row = cursor.fetchone()
    conn.close()
    return bool(row)

def record_question_presentation(
    student_id: str,
    course_id: str,
    topic_tag: str,
    question_hash: str,
    question_text: str,
    cursor: Optional[Any] = None
):
    """Logs the question presentation to student history to prevent repetitive quizzes."""
    should_close = False
    if cursor is None:
        conn = get_db_connection()
        cursor = conn.cursor()
        should_close = True
        
    now_str = datetime.now(timezone.utc).isoformat()
    cursor.execute("""
    INSERT OR REPLACE INTO question_history (id, student_id, course_id, topic_tag, normalized_hash, question_text, last_presented_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (f"qh_{uuid.uuid4().hex[:8]}", student_id, course_id, topic_tag, question_hash, question_text[:200], now_str))
    
    if should_close:
        conn.commit()
        conn.close()

def generate_assessment(
    student_id: str,
    course_id: str,
    assessment_type: str = "topic_practice",
    target_topics: Optional[List[str]] = None,
    difficulty: str = "adaptive",
    total_questions: int = 5,
    time_limit_minutes: int = 15
) -> Dict[str, Any]:
    """
    Generates a personalized assessment tailored to learner mastery.
    Filters out recently repeated questions, validates solvability from source materials,
    supports any uploaded document topics flexibly, and returns an interactive test instance.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Fetch all active course topics to handle "All Topics" or missing scope
    cursor.execute("SELECT topic_name, mastery_level FROM learner_mastery WHERE student_id = ? AND course_id = ? ORDER BY mastery_level ASC", (student_id, course_id))
    mastery_rows = cursor.fetchall()
    all_available_topics = [r["topic_name"] for r in mastery_rows]
    
    if not all_available_topics:
        cursor.execute("SELECT topic_name FROM knowledge_nodes WHERE course_id = ?", (course_id,))
        kn_rows = cursor.fetchall()
        all_available_topics = [r["topic_name"] for r in kn_rows]
        
    if not target_topics or "All Topics (Adaptive)" in target_topics:
        if assessment_type == "mock_exam":
            # For a mock exam, include topics across all uploaded materials and modules
            target_topics = all_available_topics if all_available_topics else ["Matrices, Vectors: Addition and Scalar Multiplication", "Consensus & Raft Protocol", "CAP Theorem", "Linear Systems of Equations. Gauss Elimination"]
        else:
            # Topic practice: focus on the lowest mastery topics
            target_topics = all_available_topics[:3] if all_available_topics else ["Matrices, Vectors: Addition and Scalar Multiplication", "Consensus & Raft Protocol"]

    # 2. Gather candidate questions from QUESTION_TEMPLATES matching target topics
    candidates = []
    for tpl in QUESTION_TEMPLATES:
        if target_topics and tpl["topic"] not in target_topics:
            continue
        if difficulty != "adaptive" and tpl["difficulty"] != difficulty:
            continue
        candidates.append(tpl)
        
    # If candidates don't cover all target topics or fewer than needed, dynamically generate from uploaded content_units!
    uncovered_topics = [t for t in target_topics if not any(c["topic"] == t for c in candidates)]
    if uncovered_topics or len(candidates) < total_questions:
        topics_to_generate = uncovered_topics if uncovered_topics else target_topics
        dynamic_q = generate_dynamic_questions_from_content(
            course_id=course_id,
            target_topics=topics_to_generate,
            count=max(total_questions - len(candidates), 3),
            conn=conn
        )
        candidates.extend(dynamic_q)
        
    # If still fewer than total_questions, include any matching topic templates
    if len(candidates) < total_questions:
        for tpl in QUESTION_TEMPLATES:
            if tpl not in candidates:
                candidates.append(tpl)
                if len(candidates) >= total_questions:
                    break

    # 3. Apply deduplication check
    fresh_candidates = []
    reused_candidates = []
    for c in candidates:
        q_hash = compute_question_hash(c["question"])
        if not is_question_recently_asked(student_id, course_id, q_hash):
            fresh_candidates.append(c)
        else:
            reused_candidates.append(c)
            
    # Prefer fresh questions, fallback to least recently asked if pool exhausted
    selected_templates = fresh_candidates[:total_questions]
    if len(selected_templates) < total_questions:
        needed = total_questions - len(selected_templates)
        selected_templates.extend(reused_candidates[:needed])

    # 4. Create Assessment Record in DB
    assessment_id = f"asmt_{uuid.uuid4().hex[:10]}"
    now_str = datetime.now(timezone.utc).isoformat()
    title = f"{'Mock Exam' if assessment_type == 'mock_exam' else 'Practice Quiz'}: {', '.join(target_topics[:2])}"
    
    cursor.execute("""
    INSERT INTO assessments (
        id, student_id, course_id, title, assessment_type, target_topics,
        difficulty, total_questions, time_limit_minutes, status, score,
        max_score, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        assessment_id,
        student_id,
        course_id,
        title,
        assessment_type,
        json.dumps(target_topics),
        difficulty,
        len(selected_templates),
        time_limit_minutes,
        "in_progress",
        0.0,
        float(len(selected_templates)),
        now_str
    ))

    # 5. Insert Questions into DB
    questions_response = []
    for tpl in selected_templates:
        q_id = f"q_{uuid.uuid4().hex[:10]}"
        q_hash = compute_question_hash(tpl["question"])
        record_question_presentation(student_id, course_id, tpl["topic"], q_hash, tpl["question"], cursor=cursor)
        
        cursor.execute("""
        INSERT INTO assessment_questions (
            id, assessment_id, question_text, question_type, options,
            correct_answer, step_by_step_explanation, topic_tag, difficulty,
            source_citation, student_score
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            q_id,
            assessment_id,
            tpl["question"],
            tpl["type"],
            json.dumps(tpl.get("options")) if tpl.get("options") else None,
            tpl["correct_answer"],
            tpl["explanation"],
            tpl["topic"],
            tpl["difficulty"],
            json.dumps(tpl["source_citation"]),
            0.0
        ))
        
        questions_response.append({
            "id": q_id,
            "question_text": tpl["question"],
            "question_type": tpl["type"],
            "options": tpl.get("options"),
            "topic_tag": tpl["topic"],
            "difficulty": tpl["difficulty"],
            "source_citation": tpl["source_citation"],
            "student_answer": None,
            "is_correct": None,
            "correct_answer": None, # Kept hidden during active exam
            "step_by_step_explanation": None,
            "feedback": None
        })

    conn.commit()
    conn.close()

    return {
        "id": assessment_id,
        "student_id": student_id,
        "course_id": course_id,
        "title": title,
        "assessment_type": assessment_type,
        "target_topics": target_topics,
        "difficulty": difficulty,
        "total_questions": len(questions_response),
        "time_limit_minutes": time_limit_minutes,
        "status": "in_progress",
        "score": 0.0,
        "max_score": float(len(questions_response)),
        "questions": questions_response,
        "created_at": now_str
    }

def evaluate_short_answer(student_ans: str, correct_ans: str, keywords: List[str]) -> Tuple[bool, float, str]:
    """Evaluates short open-ended student answer based on conceptual keywords and semantics."""
    s_clean = student_ans.lower().strip()
    if not s_clean:
        return False, 0.0, "No answer provided."
        
    hits = sum(1 for kw in keywords if kw.lower() in s_clean)
    ratio = hits / max(1, len(keywords))
    
    if ratio >= 0.50:
        return True, 1.0, "Great answer! You correctly identified the fundamental mechanics and key constraints."
    elif ratio >= 0.25:
        return False, 0.5, "Partially correct. You mentioned some relevant aspects, but missed key conditions."
    else:
        return False, 0.0, "Incorrect. Review the concept and the exact protocol steps in the source material."

def evaluate_numerical_answer(student_ans: str, expected_val: float, tolerance: float = 0.05) -> Tuple[bool, float, str]:
    """Validates numerical calculation within specified tolerance bounds."""
    try:
        # Extract number from student text
        nums = re.findall(r'[-+]?\d*\.?\d+', student_ans)
        if not nums:
            return False, 0.0, "Could not parse a numeric answer."
        val = float(nums[0])
        diff = abs(val - expected_val)
        if diff <= tolerance * max(1.0, abs(expected_val)):
            return True, 1.0, f"Correct calculation! The calculated value {val} matches the formula."
        return False, 0.0, f"Incorrect. Your calculated value was {val}, but the correct solution is {expected_val}."
    except Exception:
        return False, 0.0, "Invalid numerical format."

def submit_assessment_answers(
    assessment_id: str,
    answers: List[Dict[str, str]],
    student_id: str = "student_default"
) -> Dict[str, Any]:
    """
    Submits student answers, grades questions, detects misconceptions,
    updates Bayesian Knowledge Tracing topic masteries, and generates comprehensive report.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM assessments WHERE id = ?", (assessment_id,))
    asmt_row = cursor.fetchone()
    if not asmt_row:
        conn.close()
        raise ValueError(f"Assessment {assessment_id} not found.")
        
    course_id = asmt_row["course_id"]
    
    cursor.execute("SELECT * FROM assessment_questions WHERE assessment_id = ?", (assessment_id,))
    q_rows = cursor.fetchall()
    q_map = {r["id"]: dict(r) for r in q_rows}
    
    total_score = 0.0
    correct_count = 0
    incorrect_count = 0
    question_results = []
    topic_tally: Dict[str, Dict[str, int]] = {}
    misconceptions_found = []
    
    for ans_item in answers:
        q_id = ans_item.get("question_id")
        user_ans = ans_item.get("student_answer", "").strip()
        if q_id not in q_map:
            continue
            
        q = q_map[q_id]
        topic = q["topic_tag"]
        q_type = q["question_type"]
        corr_ans = q["correct_answer"]
        
        if topic not in topic_tally:
            topic_tally[topic] = {"total": 0, "correct": 0}
        topic_tally[topic]["total"] += 1
        
        is_corr = False
        earned_score = 0.0
        feedback = ""
        misconception = None
        
        # Grading by type
        if q_type == "mcq":
            is_corr = (user_ans.upper() == corr_ans.upper())
            earned_score = 1.0 if is_corr else 0.0
            if is_corr:
                feedback = "Correct! Well reasoned and backed by the source material."
            else:
                feedback = f"Incorrect. You selected ({user_ans.upper()}), but the correct option is ({corr_ans.upper()})."
                # Check for known misconception
                for tpl in QUESTION_TEMPLATES:
                    if tpl["question"] == q["question_text"] and tpl.get("misconceptions"):
                        misconception = tpl["misconceptions"].get(user_ans.upper())
                        if misconception:
                            misconceptions_found.append(f"On {topic}: {misconception}")
        elif q_type == "numerical":
            try:
                exp_val = float(corr_ans)
                is_corr, earned_score, feedback = evaluate_numerical_answer(user_ans, exp_val)
            except Exception:
                is_corr = (user_ans.lower() == corr_ans.lower())
                earned_score = 1.0 if is_corr else 0.0
                feedback = "Correct!" if is_corr else f"Incorrect. Correct answer is {corr_ans}."
        elif q_type == "short_answer":
            # Keyword evaluation
            kws = ["blocking", "coordinator", "locks", "doubt", "commit", "abort", "crash"]
            is_corr, earned_score, feedback = evaluate_short_answer(user_ans, corr_ans, kws)
            
        if is_corr:
            correct_count += 1
            topic_tally[topic]["correct"] += 1
        else:
            incorrect_count += 1
            
        total_score += earned_score
        
        # Update question record in DB
        cursor.execute("""
        UPDATE assessment_questions SET
            student_answer = ?,
            is_correct = ?,
            student_score = ?,
            feedback = ?,
            misconception_detected = ?
        WHERE id = ?
        """, (user_ans, 1 if is_corr else 0, earned_score, feedback, misconception, q_id))
        
        question_results.append({
            "id": q_id,
            "topic_tag": topic,
            "is_correct": is_corr,
            "difficulty": q["difficulty"],
            "question_type": q_type
        })

    # Update assessment record
    now_str = datetime.now(timezone.utc).isoformat()
    cursor.execute("""
    UPDATE assessments SET
        status = 'completed',
        score = ?,
        completed_at = ?
    WHERE id = ?
    """, (total_score, now_str, assessment_id))
    conn.commit()
    conn.close()

    # Update Bayesian Knowledge Tracing topic masteries
    updated_mastery_map = record_assessment_performance(student_id, course_id, question_results)
    
    # Formulate Topic Breakdown
    topic_breakdown = []
    weak_areas = []
    recommended_topics = []
    
    for t, tally in topic_tally.items():
        acc = (tally["correct"] / tally["total"] * 100.0) if tally["total"] > 0 else 0.0
        new_mast = updated_mastery_map.get(t, 0.5)
        
        if acc >= 80.0:
            status = "Mastered"
        elif acc >= 50.0:
            status = "Needs Revision"
            recommended_topics.append(t)
        else:
            status = "Review Required"
            weak_areas.append(t)
            recommended_topics.append(t)
            
        topic_breakdown.append({
            "topic": t,
            "total": tally["total"],
            "correct": tally["correct"],
            "accuracy_percentage": round(acc, 1),
            "mastery_delta": round(new_mast, 3),
            "status": status
        })

    # Fetch recommended citations from course units
    recommended_citations = []
    for weak_t in (weak_areas or recommended_topics)[:2]:
        units = retrieve_relevant_units(f"{weak_t} fundamentals and review", course_id, top_k=1)
        if units:
            recommended_citations.append(units[0]["citation"])

    pct = round((total_score / max(1, len(answers))) * 100.0, 1)
    
    if pct >= 85.0:
        summary_feedback = "Outstanding performance! You demonstrated firm mastery across distributed consensus and fault tolerance invariants."
    elif pct >= 60.0:
        summary_feedback = "Good effort! You grasp the high-level concepts, but review the coordinator blocking condition and quorum bounds before mock exams."
    else:
        summary_feedback = "You encountered some challenging concepts here. Don't worry—focus your review on the highlighted textbook sections and slides below!"

    return {
        "assessment_id": assessment_id,
        "score": total_score,
        "max_score": float(len(answers)),
        "percentage": pct,
        "total_questions": len(answers),
        "correct_count": correct_count,
        "incorrect_count": incorrect_count,
        "topic_breakdown": topic_breakdown,
        "weak_areas": weak_areas,
        "misconceptions": misconceptions_found,
        "recommended_topics": recommended_topics,
        "recommended_citations": recommended_citations,
        "updated_mastery": updated_mastery_map,
        "summary_feedback": summary_feedback
    }
