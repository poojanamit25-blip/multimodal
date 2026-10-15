package com.kodexis.core.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kodexis.core.ai.MistralAiService;
import com.kodexis.core.model.*;
import com.kodexis.core.repository.AssessmentRepository;
import com.kodexis.core.repository.CandidateProfileRepository;
import com.kodexis.core.repository.SubmissionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class AssessmentEngine {

    private final MistralAiService mistralAiService;
    private final AssessmentRepository assessmentRepository;
    private final SubmissionRepository submissionRepository;
    private final CandidateProfileRepository profileRepository;
    private final ObjectMapper objectMapper;

    public AssessmentEngine(MistralAiService mistralAiService,
                            AssessmentRepository assessmentRepository,
                            SubmissionRepository submissionRepository,
                            CandidateProfileRepository profileRepository) {
        this.mistralAiService = mistralAiService;
        this.assessmentRepository = assessmentRepository;
        this.submissionRepository = submissionRepository;
        this.profileRepository = profileRepository;
        this.objectMapper = new ObjectMapper();
    }

    @Transactional
    public Assessment evaluateSession(InterviewSession session, List<InterviewMessage> messages) {
        // Fetch last submission for session
        List<Submission> submissions = submissionRepository.findBySessionIdOrderBySubmittedAtDesc(session.getId());
        Submission lastSubmission = submissions.isEmpty() ? null : submissions.get(0);

        int correctnessScore = 0;
        int passedCount = 0;
        int totalCount = 0;
        String submittedCode = "";
        Enums.Language language = session.getLanguage();

        if (lastSubmission != null) {
            passedCount = lastSubmission.getPassedCases();
            totalCount = lastSubmission.getTotalCases();
            correctnessScore = totalCount > 0 ? (passedCount * 100) / totalCount : 0;
            submittedCode = lastSubmission.getCode();
        }

        // Build prompts to extract AI analysis
        String systemAssessmentPrompt = "You are the KODEXIS AI Technical Assessment Brain. Your task is to evaluate a candidate's software engineering interview submission. " +
                "You must analyze the candidate's code, compile outputs, and chat discussion history. " +
                "Evaluate them across the following factors on a scale of 0 to 100:\n" +
                "- problemSolvingScore (0-100): algorithm selection, optimization\n" +
                "- efficiencyScore (0-100): code runtime & space optimization\n" +
                "- codeQualityScore (0-100): modularity, naming, formatting\n" +
                "- debuggingScore (0-100): attempts, error resolution speed\n" +
                "- edgeCasesScore (0-100): defensive checks (null, empty, negative)\n" +
                "- communicationScore (0-100): explanation of concepts, terminology\n" +
                "Also estimate: \n" +
                "- detectedTimeComplexity (e.g. 'O(n)', 'O(n log n)', 'O(n^2)')\n" +
                "- detectedSpaceComplexity (e.g. 'O(1)', 'O(n)')\n" +
                "Provide text responses for:\n" +
                "- autopsySummary: brief engineering summary of what happened\n" +
                "- whatWentWell: candidate strengths\n" +
                "- areasToImprove: key developmental points\n" +
                "- interviewerFeedback: what an experienced human interviewer would write in their scorecard\n" +
                "- suggestedPractice: comma-separated list of 3-4 topics (e.g. 'Arrays, Sliding Window, Edge Case Analysis')\n\n" +
                "You MUST respond ONLY with a raw JSON object matching the keys listed above, with no markdown styling (no ```json code blocks), no comments, and no trailing text. Ensure the JSON is valid and parsing-safe.";

        StringBuilder userContent = new StringBuilder();
        userContent.append("PROBLEM DETAILS:\n");
        userContent.append("Title: ").append(session.getQuestion().getTitle()).append("\n");
        userContent.append("Expected Time Complexity: ").append(session.getQuestion().getExpectedTimeComplexity()).append("\n");
        userContent.append("Expected Space Complexity: ").append(session.getQuestion().getExpectedSpaceComplexity()).append("\n\n");
        userContent.append("CANDIDATE CODE:\n").append(submittedCode).append("\n\n");
        userContent.append("COMPILER EXECUTION STATUS:\n");
        userContent.append("Passed Cases: ").append(passedCount).append(" / ").append(totalCount).append("\n");
        userContent.append("Compilation status: ").append(lastSubmission != null ? lastSubmission.getStatus().name() : "No submission").append("\n\n");
        userContent.append("CHAT TELEMETRY HISTORY:\n");
        for (InterviewMessage msg : messages) {
            userContent.append(msg.getSender()).append(": ").append(msg.getContent()).append("\n");
        }

        List<Map<String, String>> messagesList = new ArrayList<>();
        Map<String, String> userMsg = new HashMap<>();
        userMsg.put("role", "user");
        userMsg.put("content", userContent.toString());
        messagesList.add(userMsg);

        // Fetch AI evaluation
        String aiResponse = mistralAiService.generateResponse(messagesList, systemAssessmentPrompt);
        
        Assessment assessment = new Assessment(session);
        assessment.setCorrectnessScore(correctnessScore);
        
        // Parse results from JSON response or fallback to mock template
        try {
            // Strip any Markdown backticks if model generated them
            if (aiResponse.contains("```")) {
                aiResponse = aiResponse.replaceAll("```json|```", "").trim();
            }
            @SuppressWarnings("unchecked")
            Map<String, Object> map = (Map<String, Object>) objectMapper.readValue(aiResponse, Map.class);
            assessment.setProblemSolvingScore(parseScore(map.get("problemSolvingScore"), 70));
            assessment.setEfficiencyScore(parseScore(map.get("efficiencyScore"), 70));
            assessment.setCodeQualityScore(parseScore(map.get("codeQualityScore"), 70));
            assessment.setDebuggingScore(parseScore(map.get("debuggingScore"), 70));
            assessment.setEdgeCasesScore(parseScore(map.get("edgeCasesScore"), 70));
            assessment.setCommunicationScore(parseScore(map.get("communicationScore"), 70));
            assessment.setDetectedTimeComplexity(map.getOrDefault("detectedTimeComplexity", "O(n)").toString());
            assessment.setDetectedSpaceComplexity(map.getOrDefault("detectedSpaceComplexity", "O(1)").toString());
            assessment.setAutopsySummary(map.getOrDefault("autopsySummary", "Completed coding session evaluation.").toString());
            assessment.setWhatWentWell(map.getOrDefault("whatWentWell", "Selected appropriate data structure. Good communication during discussion.").toString());
            assessment.setAreasToImprove(map.getOrDefault("areasToImprove", "Refine edge case testing prior to compilation. Optimize loop constructs.").toString());
            assessment.setInterviewerFeedback(map.getOrDefault("interviewerFeedback", "Candidate exhibits good technical instincts, but should practice constraint checking.").toString());
            assessment.setSuggestedPractice(map.getOrDefault("suggestedPractice", "Edge Case Handling, Hashing, Code Modularity").toString());
        } catch (Exception e) {
            System.err.println("[KODEXIS] Assessment parsing failed. Falling back to deterministic estimation: " + e.getMessage());
            // Safe fallback
            assessment.setProblemSolvingScore(correctnessScore > 50 ? 80 : 50);
            assessment.setEfficiencyScore(correctnessScore > 70 ? 75 : 60);
            assessment.setCodeQualityScore(70);
            assessment.setDebuggingScore(submissions.size() > 2 ? 65 : 85); // fewer attempts -> better debugging score
            assessment.setEdgeCasesScore(correctnessScore == 100 ? 90 : 50);
            assessment.setCommunicationScore(messages.size() > 4 ? 80 : 60);
            assessment.setDetectedTimeComplexity(session.getQuestion().getExpectedTimeComplexity());
            assessment.setDetectedSpaceComplexity(session.getQuestion().getExpectedSpaceComplexity());
            assessment.setAutopsySummary("Assessment generated via deterministic metrics check. The candidate completed " + passedCount + " of " + totalCount + " test cases.");
            assessment.setWhatWentWell("Constructed compiling syntax structure. Demonstrated iterative corrections inside Sandbox.");
            assessment.setAreasToImprove("Analyze edge conditions such as blank boundaries. Reduce nested iterations to conserve memory footprint.");
            assessment.setInterviewerFeedback("Candidate resolved logic flow to compile output, but missed hidden edge cases. Shows standard readiness.");
            assessment.setSuggestedPractice("Sliding Window, Binary Search, Edge Case Validation");
        }

        // Weighted Overall Score Calculations
        // Correctness: 30%, Problem Solving: 20%, Complexity/Efficiency: 15%, Code Quality: 10%, Edge Cases: 10%, Debugging: 10%, Communication: 5%
        double rawOverall = (assessment.getCorrectnessScore() * 0.30)
                + (assessment.getProblemSolvingScore() * 0.20)
                + (assessment.getEfficiencyScore() * 0.15)
                + (assessment.getCodeQualityScore() * 0.10)
                + (assessment.getEdgeCasesScore() * 0.10)
                + (assessment.getDebuggingScore() * 0.10)
                + (assessment.getCommunicationScore() * 0.05);
        
        // Anti-cheat Proctoring: count tab switch infractions from telemetry log
        int tabSwitchCount = 0;
        if (session.getTelemetryLog() != null) {
            String logLower = session.getTelemetryLog().toLowerCase();
            int idx = 0;
            while ((idx = logLower.indexOf("tab switch", idx)) != -1) {
                tabSwitchCount++;
                idx += 10;
            }
        }
        int proctoringPenalty = Math.min(25, tabSwitchCount * 5);
        int finalScore = Math.max(0, Math.min(100, (int) Math.round(rawOverall) - proctoringPenalty));
        
        assessment.setOverallScore(finalScore);

        // Save Assessment
        Assessment savedAssessment = assessmentRepository.save(assessment);

        // Update Candidate Skill vectors & overall readiness score
        updateCandidateProficiency(session.getUser(), savedAssessment, session.getQuestion().getTopic());

        return savedAssessment;
    }

    private int parseScore(Object obj, int defaultVal) {
        if (obj == null) return defaultVal;
        try {
            if (obj instanceof Number) {
                return ((Number) obj).intValue();
            }
            return Integer.parseInt(obj.toString());
        } catch (Exception e) {
            return defaultVal;
        }
    }

    private void updateCandidateProficiency(User user, Assessment assessment, String topic) {
        profileRepository.findByUserId(user.getId()).ifPresent(profile -> {
            // Recalculate candidate overall Readiness Score: moving average: 80% current, 20% assessment
            int currentReadiness = profile.getReadinessScore() != null ? profile.getReadinessScore() : 50;
            int nextReadiness = (int) Math.round((currentReadiness * 0.6) + (assessment.getOverallScore() * 0.4));
            profile.setReadinessScore(Math.clamp(nextReadiness, 0, 100));

            // Map topic to specific vector column
            Enums.SkillLevel level = computeSkillLevel(assessment.getOverallScore());
            String cleanTopic = topic.trim().toLowerCase();

            if (cleanTopic.contains("array")) {
                profile.setArraysProficiency(level);
            } else if (cleanTopic.contains("string")) {
                profile.setStringsProficiency(level);
            } else if (cleanTopic.contains("hash") || cleanTopic.contains("map")) {
                profile.setHashingProficiency(level);
            } else if (cleanTopic.contains("linked list")) {
                profile.setLinkedListsProficiency(level);
            } else if (cleanTopic.contains("stack") || cleanTopic.contains("queue")) {
                profile.setStacksQueuesProficiency(level);
            } else if (cleanTopic.contains("tree") || cleanTopic.contains("bst")) {
                profile.setTreesProficiency(level);
            } else if (cleanTopic.contains("graph")) {
                profile.setGraphsProficiency(level);
            } else if (cleanTopic.contains("recursion")) {
                profile.setRecursionProficiency(level);
            } else if (cleanTopic.contains("dynamic programming") || cleanTopic.contains("dp")) {
                profile.setDynamicProgrammingProficiency(level);
            } else if (cleanTopic.contains("greedy")) {
                profile.setGreedyProficiency(level);
            } else if (cleanTopic.contains("backtrack")) {
                profile.setBacktrackingProficiency(level);
            } else if (cleanTopic.contains("sort") || cleanTopic.contains("search")) {
                profile.setSortingSearchingProficiency(level);
            } else if (cleanTopic.contains("system design")) {
                profile.setSystemDesignProficiency(level);
            }

            profileRepository.save(profile);
        });
    }

    private Enums.SkillLevel computeSkillLevel(int score) {
        if (score >= 90) return Enums.SkillLevel.EXPERT;
        if (score >= 80) return Enums.SkillLevel.STRONG;
        if (score >= 65) return Enums.SkillLevel.INTERMEDIATE;
        if (score >= 45) return Enums.SkillLevel.DEVELOPING;
        return Enums.SkillLevel.WEAK;
    }
}
