package com.kodexis.core.learning.controller;

import com.kodexis.core.learning.model.*;
import com.kodexis.core.learning.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/learning")
@CrossOrigin(origins = "*")
public class LearningHubController {

    private final KnowledgeIngestionService ingestionService;
    private final SourceGroundingService groundingService;
    private final AdaptiveQuizService quizService;
    private final BayesianKnowledgeTracingService bktService;
    private final ColdStartService coldStartService;
    private final RagEvaluationService ragEvaluationService;
    private final StudentSimulationService studentSimulationService;
    private final CourseFlowMapService courseFlowMapService;
    private final TargetedRevisionService targetedRevisionService;
    private final StudySchedulePlannerService schedulePlannerService;
    private final MultilingualTutoringService multilingualTutoringService;
    private final MisconceptionAnalysisService misconceptionService;
    private final StudyCalendarService calendarService;

    @Autowired
    public LearningHubController(
            KnowledgeIngestionService ingestionService,
            SourceGroundingService groundingService,
            AdaptiveQuizService quizService,
            BayesianKnowledgeTracingService bktService,
            ColdStartService coldStartService,
            RagEvaluationService ragEvaluationService,
            StudentSimulationService studentSimulationService,
            CourseFlowMapService courseFlowMapService,
            TargetedRevisionService targetedRevisionService,
            StudySchedulePlannerService schedulePlannerService,
            MultilingualTutoringService multilingualTutoringService,
            MisconceptionAnalysisService misconceptionService,
            StudyCalendarService calendarService) {
        this.ingestionService = ingestionService;
        this.groundingService = groundingService;
        this.quizService = quizService;
        this.bktService = bktService;
        this.coldStartService = coldStartService;
        this.ragEvaluationService = ragEvaluationService;
        this.studentSimulationService = studentSimulationService;
        this.courseFlowMapService = courseFlowMapService;
        this.targetedRevisionService = targetedRevisionService;
        this.schedulePlannerService = schedulePlannerService;
        this.multilingualTutoringService = multilingualTutoringService;
        this.misconceptionService = misconceptionService;
        this.calendarService = calendarService;
    }

    // --- REQUIREMENT 1: MULTIMODAL KNOWLEDGE BASE ---
    @GetMapping("/knowledge/topics")
    public ResponseEntity<Map<String, Object>> getTopics() {
        Map<String, Object> response = new HashMap<>();
        response.put("topics", ingestionService.getAllTopics());
        response.put("concepts", ingestionService.getAllConcepts());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/knowledge/content")
    public ResponseEntity<List<MultimodalContentUnit>> getContentUnits(@RequestParam(required = false) String topicId) {
        if (topicId != null && !topicId.trim().isEmpty() && !"ALL".equalsIgnoreCase(topicId)) {
            return ResponseEntity.ok(ingestionService.getContentUnitsForTopic(topicId));
        }
        return ResponseEntity.ok(ingestionService.getAllContentUnits());
    }

    @PostMapping("/knowledge/ingest")
    public ResponseEntity<MultimodalContentUnit> ingestCustomUnit(@RequestBody MultimodalContentUnit unit) {
        MultimodalContentUnit ingested = ingestionService.ingestUserUploadedContent(unit);
        quizService.generateQuestionsForUnit(ingested);
        return ResponseEntity.ok(ingested);
    }

    @PostMapping("/knowledge/upload")
    public ResponseEntity<MultimodalContentUnit> uploadUserMaterial(@RequestBody MultimodalContentUnit unit) {
        MultimodalContentUnit ingested = ingestionService.ingestUserUploadedContent(unit);
        quizService.generateQuestionsForUnit(ingested);
        return ResponseEntity.ok(ingested);
    }

    @PostMapping("/knowledge/clear")
    public ResponseEntity<Map<String, Object>> clearAllData() {
        ingestionService.clearAllData();
        quizService.clearAllQuestions();
        return ResponseEntity.ok(Map.of(
                "status", "CLEARED",
                "message", "All dummy and ingested materials cleared. System is clean and ready for user uploads."
        ));
    }

    @PostMapping("/knowledge/seed-sample")
    public ResponseEntity<Map<String, Object>> seedSampleData() {
        ingestionService.loadSampleData();
        quizService.seedSampleQuestions();
        return ResponseEntity.ok(Map.of(
                "status", "SEEDED",
                "message", "Sample curriculum loaded successfully into knowledge base."
        ));
    }

    // --- REQUIREMENT 2: SOURCE GROUNDING & REFUSAL ---
    @PostMapping("/grounding/ask")
    public ResponseEntity<SourceGroundingService.GroundedAnswerResult> askGroundedQuestion(@RequestBody Map<String, String> payload) {
        String query = payload.get("query");
        String language = payload.getOrDefault("language", "ENGLISH");
        if (query == null || query.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(groundingService.answerGroundedQuery(query, language));
    }

    // --- REQUIREMENT 3: ADAPTIVE ASSESSMENT & CITATIONS ---
    @GetMapping("/assessment/generate")
    public ResponseEntity<List<QuizQuestion>> generateQuiz(
            @RequestParam(defaultValue = "guest_student") String userId,
            @RequestParam(required = false) String topicId,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String format,
            @RequestParam(defaultValue = "5") int count) {

        QuizQuestion.QuestionType formatType = null;
        if (format != null && !format.trim().isEmpty() && !"ALL".equalsIgnoreCase(format)) {
            try {
                formatType = QuizQuestion.QuestionType.valueOf(format.toUpperCase());
            } catch (Exception ignored) {}
        }

        return ResponseEntity.ok(quizService.generateAdaptiveQuiz(userId, topicId, difficulty, formatType, count));
    }

    public static class QuizSubmissionRequest {
        private String userId;
        private List<AnswerItem> answers = new ArrayList<>();

        public static class AnswerItem {
            private String questionId;
            private String userResponse;

            public String getQuestionId() { return questionId; }
            public void setQuestionId(String questionId) { this.questionId = questionId; }
            public String getUserResponse() { return userResponse; }
            public void setUserResponse(String userResponse) { this.userResponse = userResponse; }
        }

        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public List<AnswerItem> getAnswers() { return answers; }
        public void setAnswers(List<AnswerItem> answers) { this.answers = answers; }
    }

    @PostMapping("/assessment/submit")
    public ResponseEntity<DiagnosticReport> submitQuiz(@RequestBody QuizSubmissionRequest submission) {
        String userId = (submission.getUserId() != null && !submission.getUserId().trim().isEmpty())
                ? submission.getUserId() : "guest_student";

        DiagnosticReport report = new DiagnosticReport();
        report.setId("report-" + UUID.randomUUID().toString().substring(0, 8));
        report.setUserId(userId);
        report.setTimestamp(System.currentTimeMillis());
        report.setTotalQuestions(submission.getAnswers().size());

        int correctCount = 0;
        Map<String, Integer> topicTotal = new HashMap<>();
        Map<String, Integer> topicCorrect = new HashMap<>();

        for (QuizSubmissionRequest.AnswerItem item : submission.getAnswers()) {
            QuizAttempt attempt = quizService.evaluateAnswer(item.getQuestionId(), item.getUserResponse());
            report.getQuestionResults().add(attempt);

            if (attempt.isCorrect()) {
                correctCount++;
            }

            // Find question metadata
            QuizQuestion question = quizService.getAllQuestions().stream()
                    .filter(q -> q.getId().equals(item.getQuestionId()))
                    .findFirst()
                    .orElse(null);

            if (question != null) {
                topicTotal.put(question.getTopicName(), topicTotal.getOrDefault(question.getTopicName(), 0) + 1);
                if (attempt.isCorrect()) {
                    topicCorrect.put(question.getTopicName(), topicCorrect.getOrDefault(question.getTopicName(), 0) + 1);
                }

                // Update BKT Bayesian Knowledge Tracing
                bktService.updateBKT(userId, question.getTopicId(), question.getConceptId(), attempt.isCorrect());

                // Detect Misconception
                if (!attempt.isCorrect() && attempt.getDetectedMisconception() != null) {
                    var finding = misconceptionService.findMisconception(attempt.getDetectedMisconception());
                    if (finding != null) {
                        report.getIdentifiedMisconceptions().add(finding);
                    }
                }
            }
        }

        report.setCorrectCount(correctCount);
        double acc = submission.getAnswers().isEmpty() ? 0.0 : ((double) correctCount / submission.getAnswers().size()) * 100.0;
        report.setOverallAccuracy(Math.round(acc * 10.0) / 10.0);

        if (acc >= 85.0) report.setMasteryTier("EXPERT");
        else if (acc >= 70.0) report.setMasteryTier("PROFICIENT");
        else if (acc >= 50.0) report.setMasteryTier("COMPETENT");
        else report.setMasteryTier("DEVELOPING");

        // Topic accuracy breakdowns
        for (String topic : topicTotal.keySet()) {
            double topicAcc = ((double) topicCorrect.getOrDefault(topic, 0) / topicTotal.get(topic)) * 100.0;
            report.getTopicAccuracyMap().put(topic, Math.round(topicAcc * 10.0) / 10.0);
            if (topicAcc < 60.0) {
                report.getWeakTopics().add(topic);
            } else {
                report.getStrongTopics().add(topic);
            }
        }

        // Recommendations
        if (!report.getWeakTopics().isEmpty()) {
            report.getRecommendedNextActions().add("Generate targeted flashcards for weak topic: " + report.getWeakTopics().get(0));
            report.getRecommendedNextActions().add("Listen to audio brief revision podcast in the Revision Studio.");
        } else {
            report.getRecommendedNextActions().add("Mastery threshold achieved! Advance to next topic in Course Flow Map.");
        }

        return ResponseEntity.ok(report);
    }

    // --- REQUIREMENT 4: LEARNER MODEL & COLD START ---
    @GetMapping("/learner/mastery")
    public ResponseEntity<LearnerMastery> getLearnerMastery(@RequestParam(defaultValue = "guest_student") String userId) {
        return ResponseEntity.ok(bktService.getOrCreateLearnerMastery(userId));
    }

    @GetMapping("/learner/intake/quiz")
    public ResponseEntity<List<QuizQuestion>> getIntakeQuiz() {
        return ResponseEntity.ok(coldStartService.generateDiagnosticIntakeQuiz());
    }

    @PostMapping("/learner/intake/submit")
    public ResponseEntity<ColdStartService.IntakeCompletionResult> completeIntake(
            @RequestParam(defaultValue = "guest_student") String userId,
            @RequestBody Map<String, String> answers) {
        return ResponseEntity.ok(coldStartService.completeIntakeDiagnostic(userId, answers));
    }

    // --- REQUIREMENT 5: SYSTEM EVALUATION (RAGAS & COHORT SIMULATION) ---
    @GetMapping("/eval/ragas")
    public ResponseEntity<EvaluationMetricResult> runRagasEvaluation() {
        return ResponseEntity.ok(ragEvaluationService.runRagasEvaluation());
    }

    @PostMapping("/eval/simulate")
    public ResponseEntity<SimulationCohortReport> runSimulationCohort(@RequestParam(defaultValue = "8") int sessions) {
        return ResponseEntity.ok(studentSimulationService.runCohortSimulation(sessions));
    }

    // --- REQUIREMENT 6: ENHANCEMENTS ---
    @GetMapping("/course-map")
    public ResponseEntity<CourseGraph> getCourseFlowMap(@RequestParam(defaultValue = "guest_student") String userId) {
        return ResponseEntity.ok(courseFlowMapService.generateCourseFlowMap(userId));
    }

    @GetMapping("/revision/material")
    public ResponseEntity<TargetedRevisionService.RevisionPack> getRevisionPack(@RequestParam(defaultValue = "guest_student") String userId) {
        return ResponseEntity.ok(targetedRevisionService.generateTargetedRevision(userId));
    }

    @GetMapping("/revision/schedule")
    public ResponseEntity<StudySchedule> getStudySchedule(
            @RequestParam(defaultValue = "guest_student") String userId,
            @RequestParam(defaultValue = "Distributed Systems & Algorithms Final Exam") String examName,
            @RequestParam(defaultValue = "14") int days) {
        return ResponseEntity.ok(schedulePlannerService.generateAdaptiveSchedule(userId, examName, days));
    }

    @PostMapping("/tutor/voice")
    public ResponseEntity<MultilingualTutoringService.SocraticVoiceExchange> conductVoiceTutoring(@RequestBody Map<String, String> payload) {
        String query = payload.get("query");
        String language = payload.getOrDefault("language", "ENGLISH");
        if (query == null || query.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(multilingualTutoringService.conductSocraticVoiceSession(query, language));
    }

    // --- REQUIREMENT 6c & STUDY CALENDAR EVENTS ---
    @GetMapping("/calendar/events")
    public ResponseEntity<List<StudyCalendarEvent>> getCalendarEvents(
            @RequestParam(defaultValue = "guest_student") String userId,
            @RequestParam(required = false) String date) {
        if (date != null && !date.trim().isEmpty()) {
            return ResponseEntity.ok(calendarService.getEventsForDate(userId, date));
        }
        return ResponseEntity.ok(calendarService.getEventsForUser(userId));
    }

    @PostMapping("/calendar/events")
    public ResponseEntity<StudyCalendarEvent> createCalendarEvent(
            @RequestParam(defaultValue = "guest_student") String userId,
            @RequestBody StudyCalendarEvent event) {
        return ResponseEntity.ok(calendarService.createEvent(userId, event));
    }

    @PutMapping("/calendar/events/{id}")
    public ResponseEntity<StudyCalendarEvent> updateCalendarEvent(
            @RequestParam(defaultValue = "guest_student") String userId,
            @PathVariable String id,
            @RequestBody StudyCalendarEvent event) {
        return ResponseEntity.ok(calendarService.updateEvent(userId, id, event));
    }

    @DeleteMapping("/calendar/events/{id}")
    public ResponseEntity<Map<String, Object>> deleteCalendarEvent(
            @RequestParam(defaultValue = "guest_student") String userId,
            @PathVariable String id) {
        boolean deleted = calendarService.deleteEvent(userId, id);
        return ResponseEntity.ok(Map.of("deleted", deleted, "id", id));
    }

    @PatchMapping("/calendar/events/{id}/toggle")
    public ResponseEntity<StudyCalendarEvent> toggleCalendarEvent(
            @RequestParam(defaultValue = "guest_student") String userId,
            @PathVariable String id) {
        StudyCalendarEvent toggled = calendarService.toggleComplete(userId, id);
        if (toggled == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(toggled);
    }
}
