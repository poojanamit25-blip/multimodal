package com.kodexis.core.learning.model;

import java.util.ArrayList;
import java.util.List;

public class EvaluationMetricResult {
    private double faithfulnessScore; // 0.0 to 1.0 (RAGAS: claims grounded in context)
    private double answerRelevancyScore; // 0.0 to 1.0 (RAGAS: semantic alignment with question)
    private double contextPrecisionScore; // 0.0 to 1.0 (Signal-to-noise ratio in retrieved units)
    private double contextRecallScore; // 0.0 to 1.0 (Ground truth coverage)
    private double outOfDomainRefusalAccuracy; // 0.0 to 1.0 (Correctly declined off-material queries)
    private int totalTestQueriesEvaluated;
    private long evaluationTimeMs;

    private List<EvaluationTestCaseResult> testCaseResults = new ArrayList<>();

    public static class EvaluationTestCaseResult {
        private String query;
        private String groundTruthTopic;
        private String expectedCitation;
        private String retrievedCitation;
        private String generatedAnswer;
        private boolean isOutOfDomain;
        private boolean correctlyRefused;
        private double faithfulness;
        private double relevancy;
        private double precision;
        private double recall;

        public EvaluationTestCaseResult() {}

        public String getQuery() { return query; }
        public void setQuery(String query) { this.query = query; }

        public String getGroundTruthTopic() { return groundTruthTopic; }
        public void setGroundTruthTopic(String groundTruthTopic) { this.groundTruthTopic = groundTruthTopic; }

        public String getExpectedCitation() { return expectedCitation; }
        public void setExpectedCitation(String expectedCitation) { this.expectedCitation = expectedCitation; }

        public String getRetrievedCitation() { return retrievedCitation; }
        public void setRetrievedCitation(String retrievedCitation) { this.retrievedCitation = retrievedCitation; }

        public String getGeneratedAnswer() { return generatedAnswer; }
        public void setGeneratedAnswer(String generatedAnswer) { this.generatedAnswer = generatedAnswer; }

        public boolean isOutOfDomain() { return isOutOfDomain; }
        public void setOutOfDomain(boolean outOfDomain) { isOutOfDomain = outOfDomain; }

        public boolean isCorrectlyRefused() { return correctlyRefused; }
        public void setCorrectlyRefused(boolean correctlyRefused) { this.correctlyRefused = correctlyRefused; }

        public double getFaithfulness() { return faithfulness; }
        public void setFaithfulness(double faithfulness) { this.faithfulness = faithfulness; }

        public double getRelevancy() { return relevancy; }
        public void setRelevancy(double relevancy) { this.relevancy = relevancy; }

        public double getPrecision() { return precision; }
        public void setPrecision(double precision) { this.precision = precision; }

        public double getRecall() { return recall; }
        public void setRecall(double recall) { this.recall = recall; }
    }

    public EvaluationMetricResult() {}

    public double getFaithfulnessScore() { return faithfulnessScore; }
    public void setFaithfulnessScore(double faithfulnessScore) { this.faithfulnessScore = faithfulnessScore; }

    public double getAnswerRelevancyScore() { return answerRelevancyScore; }
    public void setAnswerRelevancyScore(double answerRelevancyScore) { this.answerRelevancyScore = answerRelevancyScore; }

    public double getContextPrecisionScore() { return contextPrecisionScore; }
    public void setContextPrecisionScore(double contextPrecisionScore) { this.contextPrecisionScore = contextPrecisionScore; }

    public double getContextRecallScore() { return contextRecallScore; }
    public void setContextRecallScore(double contextRecallScore) { this.contextRecallScore = contextRecallScore; }

    public double getOutOfDomainRefusalAccuracy() { return outOfDomainRefusalAccuracy; }
    public void setOutOfDomainRefusalAccuracy(double outOfDomainRefusalAccuracy) { this.outOfDomainRefusalAccuracy = outOfDomainRefusalAccuracy; }

    public int getTotalTestQueriesEvaluated() { return totalTestQueriesEvaluated; }
    public void setTotalTestQueriesEvaluated(int totalTestQueriesEvaluated) { this.totalTestQueriesEvaluated = totalTestQueriesEvaluated; }

    public long getEvaluationTimeMs() { return evaluationTimeMs; }
    public void setEvaluationTimeMs(long evaluationTimeMs) { this.evaluationTimeMs = evaluationTimeMs; }

    public List<EvaluationTestCaseResult> getTestCaseResults() { return testCaseResults; }
    public void setTestCaseResults(List<EvaluationTestCaseResult> testCaseResults) { this.testCaseResults = testCaseResults; }
}
