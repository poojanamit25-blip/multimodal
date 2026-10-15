package com.kodexis.core.learning.model;

import java.util.ArrayList;
import java.util.List;

public class Flashcard {
    private String id;
    private String topicId;
    private String topicName;
    private String conceptName;
    private String frontPrompt;
    private String backExplanation;
    private String keyFormulaOrCode;
    private String sourceCitation;
    private int intervalDays;
    private double easeFactor; // SM-2 spaced repetition ease factor (default 2.5)
    private int repetitions;
    private long nextReviewTimestamp;

    public Flashcard() {}

    public Flashcard(String id, String topicId, String topicName, String conceptName,
                     String frontPrompt, String backExplanation, String keyFormulaOrCode, String sourceCitation) {
        this.id = id;
        this.topicId = topicId;
        this.topicName = topicName;
        this.conceptName = conceptName;
        this.frontPrompt = frontPrompt;
        this.backExplanation = backExplanation;
        this.keyFormulaOrCode = keyFormulaOrCode;
        this.sourceCitation = sourceCitation;
        this.intervalDays = 1;
        this.easeFactor = 2.5;
        this.repetitions = 0;
        this.nextReviewTimestamp = System.currentTimeMillis() + 86400000L;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTopicId() { return topicId; }
    public void setTopicId(String topicId) { this.topicId = topicId; }

    public String getTopicName() { return topicName; }
    public void setTopicName(String topicName) { this.topicName = topicName; }

    public String getConceptName() { return conceptName; }
    public void setConceptName(String conceptName) { this.conceptName = conceptName; }

    public String getFrontPrompt() { return frontPrompt; }
    public void setFrontPrompt(String frontPrompt) { this.frontPrompt = frontPrompt; }

    public String getBackExplanation() { return backExplanation; }
    public void setBackExplanation(String backExplanation) { this.backExplanation = backExplanation; }

    public String getKeyFormulaOrCode() { return keyFormulaOrCode; }
    public void setKeyFormulaOrCode(String keyFormulaOrCode) { this.keyFormulaOrCode = keyFormulaOrCode; }

    public String getSourceCitation() { return sourceCitation; }
    public void setSourceCitation(String sourceCitation) { this.sourceCitation = sourceCitation; }

    public int getIntervalDays() { return intervalDays; }
    public void setIntervalDays(int intervalDays) { this.intervalDays = intervalDays; }

    public double getEaseFactor() { return easeFactor; }
    public void setEaseFactor(double easeFactor) { this.easeFactor = easeFactor; }

    public int getRepetitions() { return repetitions; }
    public void setRepetitions(int repetitions) { this.repetitions = repetitions; }

    public long getNextReviewTimestamp() { return nextReviewTimestamp; }
    public void setNextReviewTimestamp(long nextReviewTimestamp) { this.nextReviewTimestamp = nextReviewTimestamp; }
}
