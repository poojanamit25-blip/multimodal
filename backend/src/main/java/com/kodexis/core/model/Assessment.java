package com.kodexis.core.model;

import jakarta.persistence.*;

@Entity
@Table(name = "assessments")
public class Assessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "session_id", nullable = false, unique = true)
    private InterviewSession session;

    @Column(name = "overall_score", nullable = false)
    private int overallScore;

    // 9 Dimensions of KODEXIS Multi-Factor Grading
    @Column(name = "correctness_score", nullable = false)
    private int correctnessScore;

    @Column(name = "problem_solving_score", nullable = false)
    private int problemSolvingScore;

    @Column(name = "efficiency_score", nullable = false)
    private int efficiencyScore;

    @Column(name = "code_quality_score", nullable = false)
    private int codeQualityScore;

    @Column(name = "debugging_score", nullable = false)
    private int debuggingScore;

    @Column(name = "edge_cases_score", nullable = false)
    private int edgeCasesScore;

    @Column(name = "communication_score", nullable = false)
    private int communicationScore;

    // Code Telemetry Complexity Results
    @Column(name = "detected_time_complexity")
    private String detectedTimeComplexity;

    @Column(name = "detected_space_complexity")
    private String detectedSpaceComplexity;

    // Detailed Report Feedback
    @Column(name = "autopsy_summary", columnDefinition = "TEXT")
    private String autopsySummary;

    @Column(name = "what_went_well", columnDefinition = "TEXT")
    private String whatWentWell;

    @Column(name = "areas_to_improve", columnDefinition = "TEXT")
    private String areasToImprove;

    @Column(name = "interviewer_feedback", columnDefinition = "TEXT")
    private String interviewerFeedback;

    @Column(name = "suggested_practice", columnDefinition = "TEXT")
    private String suggestedPractice; // Stores comma-separated recommendations or practice topics

    public Assessment() {}

    public Assessment(InterviewSession session) {
        this.session = session;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public InterviewSession getSession() { return session; }
    public void setSession(InterviewSession session) { this.session = session; }

    public int getOverallScore() { return overallScore; }
    public void setOverallScore(int overallScore) { this.overallScore = overallScore; }

    public int getCorrectnessScore() { return correctnessScore; }
    public void setCorrectnessScore(int correctnessScore) { this.correctnessScore = correctnessScore; }

    public int getProblemSolvingScore() { return problemSolvingScore; }
    public void setProblemSolvingScore(int problemSolvingScore) { this.problemSolvingScore = problemSolvingScore; }

    public int getEfficiencyScore() { return efficiencyScore; }
    public void setEfficiencyScore(int efficiencyScore) { this.efficiencyScore = efficiencyScore; }

    public int getCodeQualityScore() { return codeQualityScore; }
    public void setCodeQualityScore(int codeQualityScore) { this.codeQualityScore = codeQualityScore; }

    public int getDebuggingScore() { return debuggingScore; }
    public void setDebuggingScore(int debuggingScore) { this.debuggingScore = debuggingScore; }

    public int getEdgeCasesScore() { return edgeCasesScore; }
    public void setEdgeCasesScore(int edgeCasesScore) { this.edgeCasesScore = edgeCasesScore; }

    public int getCommunicationScore() { return communicationScore; }
    public void setCommunicationScore(int communicationScore) { this.communicationScore = communicationScore; }

    public String getDetectedTimeComplexity() { return detectedTimeComplexity; }
    public void setDetectedTimeComplexity(String detectedTimeComplexity) { this.detectedTimeComplexity = detectedTimeComplexity; }

    public String getDetectedSpaceComplexity() { return detectedSpaceComplexity; }
    public void setDetectedSpaceComplexity(String detectedSpaceComplexity) { this.detectedSpaceComplexity = detectedSpaceComplexity; }

    public String getAutopsySummary() { return autopsySummary; }
    public void setAutopsySummary(String autopsySummary) { this.autopsySummary = autopsySummary; }

    public String getWhatWentWell() { return whatWentWell; }
    public void setWhatWentWell(String whatWentWell) { this.whatWentWell = whatWentWell; }

    public String getAreasToImprove() { return areasToImprove; }
    public void setAreasToImprove(String areasToImprove) { this.areasToImprove = areasToImprove; }

    public String getInterviewerFeedback() { return interviewerFeedback; }
    public void setInterviewerFeedback(String interviewerFeedback) { this.interviewerFeedback = interviewerFeedback; }

    public String getSuggestedPractice() { return suggestedPractice; }
    public void setSuggestedPractice(String suggestedPractice) { this.suggestedPractice = suggestedPractice; }
}
