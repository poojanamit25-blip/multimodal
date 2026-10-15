package com.kodexis.core.learning.service;

import com.kodexis.core.learning.model.LearnerMastery;
import com.kodexis.core.learning.model.QuizQuestion;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ColdStartService {

    private final BayesianKnowledgeTracingService bktService;
    private final AdaptiveQuizService quizService;

    @Autowired
    public ColdStartService(BayesianKnowledgeTracingService bktService, AdaptiveQuizService quizService) {
        this.bktService = bktService;
        this.quizService = quizService;
    }

    public List<QuizQuestion> generateDiagnosticIntakeQuiz() {
        // Sample 3 foundational questions across topics
        return quizService.getAllQuestions().stream()
                .filter(q -> "EASY".equalsIgnoreCase(q.getDifficulty()))
                .limit(3)
                .collect(Collectors.toList());
    }

    public static class IntakeCompletionResult {
        private String userId;
        private int totalQuestions;
        private int correctCount;
        private String assignedStartingTier;
        private double calibratedBaselineMastery;
        private Map<String, Double> initialTopicMastery;

        public IntakeCompletionResult() {}

        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }

        public int getTotalQuestions() { return totalQuestions; }
        public void setTotalQuestions(int totalQuestions) { this.totalQuestions = totalQuestions; }

        public int getCorrectCount() { return correctCount; }
        public void setCorrectCount(int correctCount) { this.correctCount = correctCount; }

        public String getAssignedStartingTier() { return assignedStartingTier; }
        public void setAssignedStartingTier(String assignedStartingTier) { this.assignedStartingTier = assignedStartingTier; }

        public double getCalibratedBaselineMastery() { return calibratedBaselineMastery; }
        public void setCalibratedBaselineMastery(double calibratedBaselineMastery) { this.calibratedBaselineMastery = calibratedBaselineMastery; }

        public Map<String, Double> getInitialTopicMastery() { return initialTopicMastery; }
        public void setInitialTopicMastery(Map<String, Double> initialTopicMastery) { this.initialTopicMastery = initialTopicMastery; }
    }

    public IntakeCompletionResult completeIntakeDiagnostic(String userId, Map<String, String> answers) {
        LearnerMastery mastery = bktService.getOrCreateLearnerMastery(userId);

        int correctCount = 0;
        for (Map.Entry<String, String> entry : answers.entrySet()) {
            var attempt = quizService.evaluateAnswer(entry.getKey(), entry.getValue());
            if (attempt.isCorrect()) {
                correctCount++;
            }
        }

        // Calibrate baseline mastery
        double calibratedMastery;
        String tier;
        if (correctCount == answers.size()) {
            calibratedMastery = 0.65;
            tier = "ADVANCED_BASELINE";
        } else if (correctCount >= answers.size() / 2) {
            calibratedMastery = 0.45;
            tier = "INTERMEDIATE_BASELINE";
        } else {
            calibratedMastery = 0.20;
            tier = "NOVICE_FOUNDATIONAL";
        }

        // Update all topic masteries to this calibrated baseline
        for (String topicId : mastery.getTopicMastery().keySet()) {
            mastery.getTopicMastery().put(topicId, calibratedMastery);
        }
        for (String conceptId : mastery.getConceptMastery().keySet()) {
            mastery.getConceptMastery().put(conceptId, calibratedMastery);
        }

        mastery.setColdStartComplete(true);

        IntakeCompletionResult result = new IntakeCompletionResult();
        result.setUserId(userId);
        result.setTotalQuestions(answers.size());
        result.setCorrectCount(correctCount);
        result.setAssignedStartingTier(tier);
        result.setCalibratedBaselineMastery(calibratedMastery);
        result.setInitialTopicMastery(new HashMap<>(mastery.getTopicMastery()));
        return result;
    }
}
