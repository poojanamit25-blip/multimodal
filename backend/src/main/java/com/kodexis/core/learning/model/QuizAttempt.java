package com.kodexis.core.learning.model;

import java.util.ArrayList;
import java.util.List;

public class QuizAttempt {
    private String questionId;
    private String userResponse;
    private boolean correct;
    private double score; // 0.0 to 1.0
    private String citedFeedback;
    private String sourceLocation;
    private String sourceUnitId;
    private String detectedMisconception;
    private List<Citation> citations = new ArrayList<>();
    private long latencyMs;

    public QuizAttempt() {}

    public String getQuestionId() { return questionId; }
    public void setQuestionId(String questionId) { this.questionId = questionId; }

    public String getUserResponse() { return userResponse; }
    public void setUserResponse(String userResponse) { this.userResponse = userResponse; }

    public boolean isCorrect() { return correct; }
    public void setCorrect(boolean correct) { this.correct = correct; }

    public double getScore() { return score; }
    public void setScore(double score) { this.score = score; }

    public String getCitedFeedback() { return citedFeedback; }
    public void setCitedFeedback(String citedFeedback) { this.citedFeedback = citedFeedback; }

    public String getSourceLocation() { return sourceLocation; }
    public void setSourceLocation(String sourceLocation) { this.sourceLocation = sourceLocation; }

    public String getSourceUnitId() { return sourceUnitId; }
    public void setSourceUnitId(String sourceUnitId) { this.sourceUnitId = sourceUnitId; }

    public String getDetectedMisconception() { return detectedMisconception; }
    public void setDetectedMisconception(String detectedMisconception) { this.detectedMisconception = detectedMisconception; }

    public List<Citation> getCitations() { return citations; }
    public void setCitations(List<Citation> citations) { this.citations = citations; }

    public long getLatencyMs() { return latencyMs; }
    public void setLatencyMs(long latencyMs) { this.latencyMs = latencyMs; }
}
