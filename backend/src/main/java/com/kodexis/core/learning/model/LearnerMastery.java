package com.kodexis.core.learning.model;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class LearnerMastery {
    private String userId;
    private boolean coldStartComplete;
    private long lastActiveTimestamp;
    
    // Per-Topic Mastery (0.0 to 1.0)
    private Map<String, Double> topicMastery = new HashMap<>();
    
    // Per-Concept Mastery (0.0 to 1.0) based on BKT P(Lt)
    private Map<String, Double> conceptMastery = new HashMap<>();

    // Interaction Counts & Performance
    private Map<String, Integer> topicOpportunityCount = new HashMap<>();
    private Map<String, Integer> topicCorrectCount = new HashMap<>();

    // History Log of Mastery Updates for visualizations
    private List<MasteryUpdateEvent> history = new ArrayList<>();

    public static class MasteryUpdateEvent {
        private long timestamp;
        private String topicId;
        private String topicName;
        private String conceptId;
        private boolean correct;
        private double priorMastery;
        private double updatedMastery;

        public MasteryUpdateEvent() {}

        public MasteryUpdateEvent(long timestamp, String topicId, String topicName, String conceptId,
                                  boolean correct, double priorMastery, double updatedMastery) {
            this.timestamp = timestamp;
            this.topicId = topicId;
            this.topicName = topicName;
            this.conceptId = conceptId;
            this.correct = correct;
            this.priorMastery = priorMastery;
            this.updatedMastery = updatedMastery;
        }

        public long getTimestamp() { return timestamp; }
        public void setTimestamp(long timestamp) { this.timestamp = timestamp; }

        public String getTopicId() { return topicId; }
        public void setTopicId(String topicId) { this.topicId = topicId; }

        public String getTopicName() { return topicName; }
        public void setTopicName(String topicName) { this.topicName = topicName; }

        public String getConceptId() { return conceptId; }
        public void setConceptId(String conceptId) { this.conceptId = conceptId; }

        public boolean isCorrect() { return correct; }
        public void setCorrect(boolean correct) { this.correct = correct; }

        public double getPriorMastery() { return priorMastery; }
        public void setPriorMastery(double priorMastery) { this.priorMastery = priorMastery; }

        public double getUpdatedMastery() { return updatedMastery; }
        public void setUpdatedMastery(double updatedMastery) { this.updatedMastery = updatedMastery; }
    }

    public LearnerMastery() {}

    public LearnerMastery(String userId) {
        this.userId = userId;
        this.coldStartComplete = false;
        this.lastActiveTimestamp = System.currentTimeMillis();
    }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public boolean isColdStartComplete() { return coldStartComplete; }
    public void setColdStartComplete(boolean coldStartComplete) { this.coldStartComplete = coldStartComplete; }

    public long getLastActiveTimestamp() { return lastActiveTimestamp; }
    public void setLastActiveTimestamp(long lastActiveTimestamp) { this.lastActiveTimestamp = lastActiveTimestamp; }

    public Map<String, Double> getTopicMastery() { return topicMastery; }
    public void setTopicMastery(Map<String, Double> topicMastery) { this.topicMastery = topicMastery; }

    public Map<String, Double> getConceptMastery() { return conceptMastery; }
    public void setConceptMastery(Map<String, Double> conceptMastery) { this.conceptMastery = conceptMastery; }

    public Map<String, Integer> getTopicOpportunityCount() { return topicOpportunityCount; }
    public void setTopicOpportunityCount(Map<String, Integer> topicOpportunityCount) { this.topicOpportunityCount = topicOpportunityCount; }

    public Map<String, Integer> getTopicCorrectCount() { return topicCorrectCount; }
    public void setTopicCorrectCount(Map<String, Integer> topicCorrectCount) { this.topicCorrectCount = topicCorrectCount; }

    public List<MasteryUpdateEvent> getHistory() { return history; }
    public void setHistory(List<MasteryUpdateEvent> history) { this.history = history; }
}
