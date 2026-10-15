package com.kodexis.core.learning.model;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class DiagnosticReport {
    private String id;
    private String userId;
    private long timestamp;
    private int totalQuestions;
    private int correctCount;
    private double overallAccuracy; // 0.0 - 100.0%
    private String masteryTier; // "NOVICE", "DEVELOPING", "COMPETENT", "PROFICIENT", "EXPERT"
    
    // Requirement 3c: weak topics and likely misconceptions
    private List<String> weakTopics = new ArrayList<>();
    private List<String> strongTopics = new ArrayList<>();
    private Map<String, Double> topicAccuracyMap = new HashMap<>();
    private List<MisconceptionFinding> identifiedMisconceptions = new ArrayList<>();
    private List<String> recommendedNextActions = new ArrayList<>();
    private List<QuizAttempt> questionResults = new ArrayList<>();

    public static class MisconceptionFinding {
        private String topicName;
        private String conceptName;
        private String misconceptionName;
        private String explanation;
        private String remediationRecommendation;
        private String referenceCitation;

        public MisconceptionFinding() {}

        public MisconceptionFinding(String topicName, String conceptName, String misconceptionName,
                                    String explanation, String remediationRecommendation, String referenceCitation) {
            this.topicName = topicName;
            this.conceptName = conceptName;
            this.misconceptionName = misconceptionName;
            this.explanation = explanation;
            this.remediationRecommendation = remediationRecommendation;
            this.referenceCitation = referenceCitation;
        }

        public String getTopicName() { return topicName; }
        public void setTopicName(String topicName) { this.topicName = topicName; }

        public String getConceptName() { return conceptName; }
        public void setConceptName(String conceptName) { this.conceptName = conceptName; }

        public String getMisconceptionName() { return misconceptionName; }
        public void setMisconceptionName(String misconceptionName) { this.misconceptionName = misconceptionName; }

        public String getExplanation() { return explanation; }
        public void setExplanation(String explanation) { this.explanation = explanation; }

        public String getRemediationRecommendation() { return remediationRecommendation; }
        public void setRemediationRecommendation(String remediationRecommendation) { this.remediationRecommendation = remediationRecommendation; }

        public String getReferenceCitation() { return referenceCitation; }
        public void setReferenceCitation(String referenceCitation) { this.referenceCitation = referenceCitation; }
    }

    public DiagnosticReport() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public long getTimestamp() { return timestamp; }
    public void setTimestamp(long timestamp) { this.timestamp = timestamp; }

    public int getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(int totalQuestions) { this.totalQuestions = totalQuestions; }

    public int getCorrectCount() { return correctCount; }
    public void setCorrectCount(int correctCount) { this.correctCount = correctCount; }

    public double getOverallAccuracy() { return overallAccuracy; }
    public void setOverallAccuracy(double overallAccuracy) { this.overallAccuracy = overallAccuracy; }

    public String getMasteryTier() { return masteryTier; }
    public void setMasteryTier(String masteryTier) { this.masteryTier = masteryTier; }

    public List<String> getWeakTopics() { return weakTopics; }
    public void setWeakTopics(List<String> weakTopics) { this.weakTopics = weakTopics; }

    public List<String> getStrongTopics() { return strongTopics; }
    public void setStrongTopics(List<String> strongTopics) { this.strongTopics = strongTopics; }

    public Map<String, Double> getTopicAccuracyMap() { return topicAccuracyMap; }
    public void setTopicAccuracyMap(Map<String, Double> topicAccuracyMap) { this.topicAccuracyMap = topicAccuracyMap; }

    public List<MisconceptionFinding> getIdentifiedMisconceptions() { return identifiedMisconceptions; }
    public void setIdentifiedMisconceptions(List<MisconceptionFinding> identifiedMisconceptions) { this.identifiedMisconceptions = identifiedMisconceptions; }

    public List<String> getRecommendedNextActions() { return recommendedNextActions; }
    public void setRecommendedNextActions(List<String> recommendedNextActions) { this.recommendedNextActions = recommendedNextActions; }

    public List<QuizAttempt> getQuestionResults() { return questionResults; }
    public void setQuestionResults(List<QuizAttempt> questionResults) { this.questionResults = questionResults; }
}
