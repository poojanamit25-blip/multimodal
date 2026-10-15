package com.kodexis.core.learning.service;

import com.kodexis.core.learning.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class AdaptiveQuizService {

    private final KnowledgeIngestionService ingestionService;
    private final QuestionVerificationService verificationService;

    // Master Question Pool
    private final List<QuizQuestion> questionPool = new ArrayList<>();

    @Autowired
    public AdaptiveQuizService(KnowledgeIngestionService ingestionService, QuestionVerificationService verificationService) {
        this.ingestionService = ingestionService;
        this.verificationService = verificationService;
    }

    @PostConstruct
    public void init() {
        // Starts clean with zero dummy questions as requested: questions are dynamically generated from user-uploaded materials.
    }

    public void clearAllQuestions() {
        questionPool.clear();
    }

    public void seedSampleQuestions() {
        clearAllQuestions();
        seedQuestionPool();
    }

    private void seedQuestionPool() {
        // --- TOPIC 1: Distributed Consensus & Fault Tolerance ---
        // 1. MCQ
        QuizQuestion q1 = new QuizQuestion();
        q1.setId("q-raft-01");
        q1.setType(QuizQuestion.QuestionType.MCQ);
        q1.setTopicId("topic-dist-consensus");
        q1.setTopicName("Distributed Consensus & Fault Tolerance");
        q1.setConceptId("concept-raft-election");
        q1.setConceptName("Raft Leader Election & Term Monotonicity");
        q1.setDifficulty("EASY");
        q1.setQuestionText("In the Raft consensus protocol, what primary mechanism is employed to prevent simultaneous split votes when multiple followers time out concurrently?");
        q1.setOptions(Arrays.asList(
                "A) Static leader priority ranking based on IP address",
                "B) Randomized election timeouts chosen from a range (e.g. 150ms-300ms)",
                "C) Centralized clock synchronization via GPS atomic clocks",
                "D) Exponential backoff on client read requests"
        ));
        q1.setCorrectAnswer("B) Randomized election timeouts chosen from a range (e.g. 150ms-300ms)");
        q1.setDetailedExplanation("Raft uses randomized election timeouts (e.g., 150-300ms) to spread out candidate transitions so that one follower typically times out first, increments term, and gathers majority votes before rivals wake up.");
        q1.setSourceLocation("[MIT 6.824 Distributed Systems @ 04:24]");
        q1.setSourceUnitId("unit-video-raft-01");
        q1.setMisconceptionKey("MISCONCEPTION_PRIORITY_RANKING");
        verificationService.verifyQuestionCorrectness(q1);
        questionPool.add(q1);

        // 2. Numerical
        QuizQuestion q2 = new QuizQuestion();
        q2.setId("q-raft-02");
        q2.setType(QuizQuestion.QuestionType.NUMERICAL);
        q2.setTopicId("topic-dist-consensus");
        q2.setTopicName("Distributed Consensus & Fault Tolerance");
        q2.setConceptId("concept-raft-election");
        q2.setConceptName("Raft Leader Election & Term Monotonicity");
        q2.setDifficulty("MEDIUM");
        q2.setQuestionText("In an enterprise distributed database running Raft with an ensemble of N = 7 nodes, what is the exact minimum quorum of affirmative votes a candidate node must secure to be declared the legal Leader?");
        q2.setCorrectAnswer("4");
        q2.setNumericalTolerance(0.0);
        q2.setNumericalUnit("nodes");
        q2.setDetailedExplanation("In Raft, a majority quorum requires floor(N / 2) + 1 votes. For N = 7 nodes, floor(7 / 2) + 1 = 3 + 1 = 4 affirmative votes.");
        q2.setSourceLocation("[MIT 6.824 Distributed Systems @ 04:24]");
        q2.setSourceUnitId("unit-video-raft-01");
        q2.setMisconceptionKey("MISCONCEPTION_QUORUM_TWO_THIRDS");
        verificationService.verifyQuestionCorrectness(q2);
        questionPool.add(q2);

        // 3. Short Answer
        QuizQuestion q3 = new QuizQuestion();
        q3.setId("q-raft-03");
        q3.setType(QuizQuestion.QuestionType.SHORT_ANSWER);
        q3.setTopicId("topic-dist-consensus");
        q3.setTopicName("Distributed Consensus & Fault Tolerance");
        q3.setConceptId("concept-raft-log-safety");
        q3.setConceptName("Raft Log Matching & Committed State Safety");
        q3.setDifficulty("HARD");
        q3.setQuestionText("Which invariant property in Raft guarantees that if a leader commits an entry at index i in term t, no future leader will ever overwrite or omit that entry?");
        q3.setCorrectAnswer("Leader Completeness");
        q3.setDetailedExplanation("The Leader Completeness property guarantees that if a log entry is committed in a given term, that entry will be present in the logs of the leaders for all higher-numbered terms.");
        q3.setSourceLocation("[MIT 6.824 Distributed Systems @ 04:24]");
        q3.setSourceUnitId("unit-video-raft-01");
        q3.setMisconceptionKey("MISCONCEPTION_APPEND_ENTRIES_OVERWRITE");
        verificationService.verifyQuestionCorrectness(q3);
        questionPool.add(q3);

        // --- TOPIC 2: Logical Time & Consistency ---
        // 4. MCQ
        QuizQuestion q4 = new QuizQuestion();
        q4.setId("q-vector-01");
        q4.setType(QuizQuestion.QuestionType.MCQ);
        q4.setTopicId("topic-dist-consistency");
        q4.setTopicName("Logical Time, Clocks & Consistency Models");
        q4.setConceptId("concept-vector-clocks");
        q4.setConceptName("Vector Clocks & Causal Ordering");
        q4.setDifficulty("MEDIUM");
        q4.setQuestionText("Suppose process P1 has vector timestamp V1 = [2, 1, 0] and process P2 has vector timestamp V2 = [1, 2, 0]. What is the true causal relationship between events with these timestamps?");
        q4.setOptions(Arrays.asList(
                "A) Event 1 causally preceded Event 2 (V1 < V2)",
                "B) Event 2 causally preceded Event 1 (V2 < V1)",
                "C) The events are concurrent and causally independent (V1 || V2)",
                "D) The timestamps indicate a network deadlock"
        ));
        q4.setCorrectAnswer("C) The events are concurrent and causally independent (V1 || V2)");
        q4.setDetailedExplanation("Because V1[0] > V2[0] (2 > 1) but V1[1] < V2[1] (1 < 2), neither vector is strictly less than or equal to the other across all indices. Thus, V1 and V2 represent concurrent events (V1 || V2).");
        q4.setSourceLocation("[Distributed Computing Lecture Slides (CS451) - Slide 14]");
        q4.setSourceUnitId("unit-slide-vector-clocks-14");
        q4.setMisconceptionKey("MISCONCEPTION_VECTOR_MAGNITUDE_COMPARE");
        verificationService.verifyQuestionCorrectness(q4);
        questionPool.add(q4);

        // --- TOPIC 3: Graph Traversal & Network Flow ---
        // 5. Numerical
        QuizQuestion q5 = new QuizQuestion();
        q5.setId("q-flow-01");
        q5.setType(QuizQuestion.QuestionType.NUMERICAL);
        q5.setTopicId("topic-algo-graphs");
        q5.setTopicName("Advanced Graph Traversal & Network Flow");
        q5.setConceptId("concept-max-flow");
        q5.setConceptName("Max-Flow Min-Cut Theorem");
        q5.setDifficulty("HARD");
        q5.setQuestionText("A flow network G has an s-t cut with edges crossing from S to T having capacities 14 and 18. Two backward edges point from T to S with capacities 8 and 10. According to Theorem 26.6, what is the exact numerical capacity of this cut c(S, T)?");
        q5.setCorrectAnswer("32");
        q5.setNumericalTolerance(0.0);
        q5.setNumericalUnit("units");
        q5.setDetailedExplanation("By definition of cut capacity c(S, T), only edges originating in partition S and terminating in partition T are summed: 14 + 18 = 32. Edges pointing from T back to S do NOT contribute to or subtract from the capacity.");
        q5.setSourceLocation("[CLRS Introduction to Algorithms 4th Edition - Page 652]");
        q5.setSourceUnitId("unit-textbook-algo-page-652");
        q5.setMisconceptionKey("MISCONCEPTION_SUBTRACTING_BACKWARD_EDGES");
        verificationService.verifyQuestionCorrectness(q5);
        questionPool.add(q5);

        // 6. MCQ
        QuizQuestion q6 = new QuizQuestion();
        q6.setId("q-bellman-01");
        q6.setType(QuizQuestion.QuestionType.MCQ);
        q6.setTopicId("topic-algo-graphs");
        q6.setTopicName("Advanced Graph Traversal & Network Flow");
        q6.setConceptId("concept-bellman-ford");
        q6.setConceptName("Bellman-Ford & Negative Weight Cycles");
        q6.setDifficulty("EASY");
        q6.setQuestionText("In a directed graph with |V| vertices, how many passes of edge relaxation does the Bellman-Ford algorithm execute before performing the final negative-weight cycle verification check?");
        q6.setOptions(Arrays.asList(
                "A) |V| passes",
                "B) |V| - 1 passes",
                "C) |E| passes",
                "D) log(|V|) passes"
        ));
        q6.setCorrectAnswer("B) |V| - 1 passes");
        q6.setDetailedExplanation("Bellman-Ford relaxes all edges |V| - 1 times because any simple shortest path in a graph contains at most |V| - 1 edges. The |V|-th pass is used exclusively to detect negative-weight cycles.");
        q6.setSourceLocation("[CLRS Introduction to Algorithms 4th Edition - Page 614]");
        q6.setSourceUnitId("unit-textbook-algo-page-614");
        q6.setMisconceptionKey("MISCONCEPTION_BELLMAN_V_PASSES");
        verificationService.verifyQuestionCorrectness(q6);
        questionPool.add(q6);

        // --- TOPIC 5 & 6: Deep Learning & Transformers ---
        // 7. Numerical
        QuizQuestion q7 = new QuizQuestion();
        q7.setId("q-trans-01");
        q7.setType(QuizQuestion.QuestionType.NUMERICAL);
        q7.setTopicId("topic-dl-transformers");
        q7.setTopicName("Transformers & Self-Attention Mechanisms");
        q7.setConceptId("concept-multihead-attention");
        q7.setConceptName("Multi-Head Scaled Dot-Product Attention");
        q7.setDifficulty("MEDIUM");
        q7.setQuestionText("In the standard Transformer architecture, if the key projection vector dimension is d_k = 64, what is the exact scaling factor 1 / sqrt(d_k) used in scaled dot-product attention softmax((QK^T) / sqrt(d_k))?");
        q7.setCorrectAnswer("0.125");
        q7.setNumericalTolerance(0.005);
        q7.setNumericalUnit("scalar");
        q7.setDetailedExplanation("The scaling factor is 1 / sqrt(d_k). For d_k = 64, sqrt(64) = 8, so 1 / 8 = 0.125.");
        q7.setSourceLocation("[Stanford CS224N NLP with Deep Learning - Slide 9]");
        q7.setSourceUnitId("unit-slide-transformer-attention-09");
        q7.setMisconceptionKey("MISCONCEPTION_SQUARE_ROOT_OMISSION");
        verificationService.verifyQuestionCorrectness(q7);
        questionPool.add(q7);

        // 8. Short Answer
        QuizQuestion q8 = new QuizQuestion();
        q8.setId("q-trans-02");
        q8.setType(QuizQuestion.QuestionType.SHORT_ANSWER);
        q8.setTopicId("topic-dl-transformers");
        q8.setTopicName("Transformers & Self-Attention Mechanisms");
        q8.setConceptId("concept-kv-cache");
        q8.setConceptName("KV Caching in Autoregressive Generation");
        q8.setDifficulty("HARD");
        q8.setQuestionText("What computational technique is used during autoregressive LLM decoding to prevent recomputing the Key and Value attention projection matrices for previous tokens at every step?");
        q8.setCorrectAnswer("KV Caching");
        q8.setDetailedExplanation("KV Caching (Key-Value Caching) stores previously computed key and value vectors in GPU VRAM, allowing the model to compute attention for only the newly generated token rather than recomputing the entire sequence.");
        q8.setSourceLocation("[Stanford CS224N NLP with Deep Learning - Slide 9]");
        q8.setSourceUnitId("unit-slide-transformer-attention-09");
        q8.setMisconceptionKey("MISCONCEPTION_ACTIVATION_CHECKPOINTING");
        verificationService.verifyQuestionCorrectness(q8);
        questionPool.add(q8);
    }

    public List<QuizQuestion> generateAdaptiveQuiz(String userId, String topicId, String difficulty,
                                                  QuizQuestion.QuestionType formatFilter, int questionCount) {
        List<QuizQuestion> eligible = new ArrayList<>(questionPool);

        // Filter by topic if specified
        if (topicId != null && !topicId.trim().isEmpty() && !"ALL".equalsIgnoreCase(topicId)) {
            eligible = eligible.stream()
                    .filter(q -> topicId.equalsIgnoreCase(q.getTopicId()))
                    .collect(Collectors.toList());
        }

        // Filter by format if specified
        if (formatFilter != null) {
            eligible = eligible.stream()
                    .filter(q -> q.getType() == formatFilter)
                    .collect(Collectors.toList());
        }

        // Requirement 3b: Avoid repeated questions across assessments for this student
        List<QuizQuestion> unseenQuestions = eligible.stream()
                .filter(q -> !verificationService.isQuestionRepeatedForUser(userId, q))
                .collect(Collectors.toList());

        // If user has seen all questions, fall back gracefully to eligible pool so they can still practice
        List<QuizQuestion> selectionPool = unseenQuestions.isEmpty() ? eligible : unseenQuestions;

        Collections.shuffle(selectionPool);
        List<QuizQuestion> result = selectionPool.stream().limit(questionCount).collect(Collectors.toList());

        // Record that user has now been served these questions
        for (QuizQuestion q : result) {
            verificationService.recordQuestionSeenForUser(userId, q);
        }

        return result;
    }

    public QuizAttempt evaluateAnswer(String questionId, String userResponse) {
        QuizQuestion question = questionPool.stream()
                .filter(q -> q.getId().equals(questionId))
                .findFirst()
                .orElse(null);

        QuizAttempt attempt = new QuizAttempt();
        attempt.setQuestionId(questionId);
        attempt.setUserResponse(userResponse);

        if (question == null) {
            attempt.setCorrect(false);
            attempt.setScore(0.0);
            attempt.setCitedFeedback("Unknown question ID.");
            return attempt;
        }

        attempt.setSourceLocation(question.getSourceLocation());
        attempt.setSourceUnitId(question.getSourceUnitId());

        boolean isCorrect = false;
        if (question.getType() == QuizQuestion.QuestionType.MCQ) {
            isCorrect = userResponse != null && (
                    userResponse.trim().equalsIgnoreCase(question.getCorrectAnswer().trim()) ||
                    question.getCorrectAnswer().startsWith(userResponse.trim()) ||
                    (userResponse.length() == 1 && question.getCorrectAnswer().startsWith(userResponse.toUpperCase()))
            );
        } else if (question.getType() == QuizQuestion.QuestionType.NUMERICAL) {
            try {
                double userVal = Double.parseDouble(userResponse.trim().replaceAll("[^0-9.-]", ""));
                double expectedVal = Double.parseDouble(question.getCorrectAnswer().trim());
                double tol = question.getNumericalTolerance() != null ? question.getNumericalTolerance() : 0.05;
                isCorrect = Math.abs(userVal - expectedVal) <= (Math.abs(expectedVal) * tol + 1e-6);
            } catch (Exception e) {
                isCorrect = false;
            }
        } else if (question.getType() == QuizQuestion.QuestionType.SHORT_ANSWER) {
            String normUser = userResponse != null ? userResponse.toLowerCase().replaceAll("[^a-z0-9]", "") : "";
            String normExpected = question.getCorrectAnswer().toLowerCase().replaceAll("[^a-z0-9]", "");
            isCorrect = normUser.contains(normExpected) || normExpected.contains(normUser);
        }

        attempt.setCorrect(isCorrect);
        attempt.setScore(isCorrect ? 1.0 : 0.0);

        // Cited Feedback (Requirement 3c)
        StringBuilder feedback = new StringBuilder();
        if (isCorrect) {
            feedback.append("✅ **Correct!** Excellent grasp of ").append(question.getConceptName()).append(".\n\n");
            feedback.append(question.getDetailedExplanation()).append("\n\n");
            feedback.append("> **Verified Source Anchor**: ").append(question.getSourceLocation());
        } else {
            feedback.append("❌ **Incorrect.** The correct verified answer is: **").append(question.getCorrectAnswer()).append("**.\n\n");
            feedback.append(question.getDetailedExplanation()).append("\n\n");
            feedback.append("> **Review Excerpt**: Found in ").append(question.getSourceLocation());
            attempt.setDetectedMisconception(question.getMisconceptionKey());
        }

        // Attach citation
        Citation citation = new Citation();
        citation.setContentUnitId(question.getSourceUnitId());
        citation.setCitationLabel(question.getSourceLocation());
        citation.setExcerpt(question.getDetailedExplanation());
        citation.setRelevanceScore(1.0);
        attempt.getCitations().add(citation);

        attempt.setCitedFeedback(feedback.toString());
        return attempt;
    }

    public List<QuizQuestion> getAllQuestions() {
        return new ArrayList<>(questionPool);
    }

    public void generateQuestionsForUnit(MultimodalContentUnit unit) {
        String conceptName = (unit.getConceptNames() != null && !unit.getConceptNames().isEmpty())
                ? unit.getConceptNames().get(0) : unit.getTitle();
        String conceptId = (unit.getConceptIds() != null && !unit.getConceptIds().isEmpty())
                ? unit.getConceptIds().get(0) : ("concept-" + UUID.randomUUID().toString().substring(0, 6));

        String citationRef = unit.getCitationReference() != null ? unit.getCitationReference()
                : (unit.getDocumentName() + " (" + unit.getSourceType() + ")");

        // 1. Generate Multiple Choice Question (MCQ)
        QuizQuestion qMcq = new QuizQuestion();
        qMcq.setId("q-" + UUID.randomUUID().toString().substring(0, 8));
        qMcq.setType(QuizQuestion.QuestionType.MCQ);
        qMcq.setTopicId(unit.getTopicId());
        qMcq.setTopicName(unit.getTopicName());
        qMcq.setConceptId(conceptId);
        qMcq.setConceptName(conceptName);
        qMcq.setDifficulty("MEDIUM");
        qMcq.setQuestionText("Based on the uploaded material in " + unit.getDocumentName() + " (" + citationRef + "), what is the fundamental principle of " + conceptName + "?");

        String snippet = unit.getTextSnippet() != null && !unit.getTextSnippet().trim().isEmpty()
                ? unit.getTextSnippet() : "Concept core invariant and theoretical behavior.";
        String correctOption = "A) " + (snippet.length() > 140 ? snippet.substring(0, 140) + "..." : snippet);

        qMcq.setOptions(Arrays.asList(
                correctOption,
                "B) Bypasses validation and assumes unverified external clock synchronization",
                "C) Eliminates prerequisite verification across all dependency chains",
                "D) Inverts runtime execution flow without preserving computational invariants"
        ));
        qMcq.setCorrectAnswer(correctOption);
        qMcq.setDetailedExplanation("Verified source citation " + citationRef + ": " + snippet);
        qMcq.setSourceLocation(citationRef);
        qMcq.setSourceUnitId(unit.getId());
        qMcq.setMisconceptionKey("MISCONCEPTION_USER_MATERIAL_" + unit.getId());
        verificationService.verifyQuestionCorrectness(qMcq);
        questionPool.add(qMcq);

        // 2. Generate Short Answer Question
        QuizQuestion qShort = new QuizQuestion();
        qShort.setId("q-" + UUID.randomUUID().toString().substring(0, 8));
        qShort.setType(QuizQuestion.QuestionType.SHORT_ANSWER);
        qShort.setTopicId(unit.getTopicId());
        qShort.setTopicName(unit.getTopicName());
        qShort.setConceptId(conceptId);
        qShort.setConceptName(conceptName);
        qShort.setDifficulty("EASY");
        qShort.setQuestionText("Explain the role of " + conceptName + " according to " + citationRef + ".");
        qShort.setCorrectAnswer(snippet.split("\\.")[0]);
        qShort.setDetailedExplanation("Grounded directly in " + unit.getDocumentName() + ": " + snippet);
        qShort.setSourceLocation(citationRef);
        qShort.setSourceUnitId(unit.getId());
        verificationService.verifyQuestionCorrectness(qShort);
        questionPool.add(qShort);
    }
}
