package com.kodexis.core.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kodexis.core.ai.MistralAiService;
import com.kodexis.core.model.*;
import com.kodexis.core.repository.CandidateProfileRepository;
import com.kodexis.core.repository.InterviewMessageRepository;
import com.kodexis.core.repository.InterviewSessionRepository;
import com.kodexis.core.repository.SubmissionRepository;
import com.kodexis.core.sandbox.ExecutionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class InterviewService {

    private final InterviewSessionRepository sessionRepository;
    private final InterviewMessageRepository messageRepository;
    private final SubmissionRepository submissionRepository;
    private final CandidateProfileRepository profileRepository;
    private final AdaptiveDifficultyEngine difficultyEngine;
    private final ExecutionService executionService;
    private final MistralAiService mistralAiService;
    private final AssessmentEngine assessmentEngine;
    private final ObjectMapper objectMapper;

    public InterviewService(InterviewSessionRepository sessionRepository,
                            InterviewMessageRepository messageRepository,
                            SubmissionRepository submissionRepository,
                            CandidateProfileRepository profileRepository,
                            AdaptiveDifficultyEngine difficultyEngine,
                            ExecutionService executionService,
                            MistralAiService mistralAiService,
                            AssessmentEngine assessmentEngine) {
        this.sessionRepository = sessionRepository;
        this.messageRepository = messageRepository;
        this.submissionRepository = submissionRepository;
        this.profileRepository = profileRepository;
        this.difficultyEngine = difficultyEngine;
        this.executionService = executionService;
        this.mistralAiService = mistralAiService;
        this.assessmentEngine = assessmentEngine;
        this.objectMapper = new ObjectMapper();
    }

    @Transactional
    public InterviewSession startSession(User user, Enums.Difficulty requestedDifficulty, Enums.Language language, Integer duration, String mode) {
        return startSession(user, requestedDifficulty, language, duration, mode, null, null, null, null);
    }

    @Transactional
    public InterviewSession startSession(User user, Enums.Difficulty requestedDifficulty, Enums.Language language, Integer duration, String mode,
                                         String candidateAlias, String targetRole, String candidateMood, String interviewerPersona) {
        CandidateProfile profile = profileRepository.findByUserId(user.getId()).orElse(null);
        
        AdaptiveDifficultyEngine.QuestionRecommendation recommendation = difficultyEngine.recommendQuestion(profile, requestedDifficulty);
        InterviewQuestion question = recommendation.getQuestion();

        InterviewSession session = new InterviewSession(user, question, requestedDifficulty, language, duration, mode);
        boolean isFullSim = mode != null && (mode.toLowerCase().contains("full") || mode.toLowerCase().contains("simulation"));
        if (isFullSim) {
            session.setState(Enums.SessionState.CODING);
        } else {
            session.setState(Enums.SessionState.DISCUSSION);
        }
        session.setCandidateAlias(candidateAlias != null && !candidateAlias.trim().isEmpty() ? candidateAlias : (profile != null ? profile.getFullName() : user.getUsername()));
        session.setTargetRole(targetRole != null && !targetRole.trim().isEmpty() ? targetRole : "Software Engineer");
        session.setCandidateMood(candidateMood != null ? candidateMood : "Feeling Confident");
        session.setInterviewerPersona(interviewerPersona != null ? interviewerPersona : "Rigorous Tech Lead");
        
        // Log Initial Telemetry
        session = sessionRepository.save(session);
        logTelemetry(session.getId(), "Interview Session Initiated. Selected Problem: " + question.getTitle() + " (" + question.getDifficulty() + "). " + recommendation.getAdjustmentReason());

        // Save AI Welcome Message
        String candidateName = session.getCandidateAlias();
        String welcomeText;
        if (isFullSim) {
            welcomeText = "Welcome " + candidateName + "! You are in **Full Simulation Mode** (Timed OA Sandbox) for **" + question.getTitle() + "** (" + question.getDifficulty() + ").\n\n" +
                    "Your code editor is **UNLOCKED and active from second 0**. Review the problem requirements on the left, implement your solution in the editor, and run test suites when ready. Use this chat if you need hints on edge cases or complexity analysis.";
        } else if ("Chaotic Code Critic".equals(session.getInterviewerPersona())) {
            welcomeText = "Hey " + candidateName + "! 😼 I'm your Chaotic Code Critic AI today. We are going to tackle a " + question.getDifficulty() + " problem: **" + question.getTitle() + "**.\n\n" +
                    "🔒 **Editor Locked:** In AI Interview mode, you must defend your algorithmic logic first! Explain your conceptual approach and Big-O runtime before writing any code. Convince me, and I'll unlock your editor.";
        } else if ("Friendly Peer/Mentor".equals(session.getInterviewerPersona())) {
            welcomeText = "Hi " + candidateName + "! 😊 I'm your Friendly Mentor AI interviewer. Today, we have a great " + question.getDifficulty() + " coding problem to solve: **" + question.getTitle() + "**.\n\n" +
                    "🔒 **Editor Locked:** Let's discuss your logic first! Tell me how you'd solve this conceptually, which data structure you'd pick, and the time complexity. Once we agree on the optimal plan, the code editor will unlock for you.";
        } else if ("Silent Auditor".equals(session.getInterviewerPersona())) {
            welcomeText = "Hello " + candidateName + ". I am your Silent Auditor. Problem: **" + question.getTitle() + "** (" + question.getDifficulty() + ").\n\n" +
                    "🔒 **Editor Locked:** State your algorithmic approach and target time and space complexities. Editor unlocks upon verification of optimal logic.";
        } else {
            welcomeText = "Hello " + candidateName + ". I am your Rigorous Tech Lead. Today we will evaluate your problem-solving capabilities on: **" + question.getTitle() + "** (" + question.getDifficulty() + ").\n\n" +
                    "🔒 **Editor Locked:** In this AI Interview, you must explain your conceptual approach first. Detail which data structures you will use, how you handle lookups, and specify your target Big-O runtime and space complexities. The code editor will unlock as soon as your approach is verified as optimal.";
        }
        
        InterviewMessage msg = new InterviewMessage(session, "AI", welcomeText);
        messageRepository.save(msg);

        return session;
    }

    @Transactional
    public InterviewMessage postMessage(Long sessionId, String sender, String content) {
        return postMessage(sessionId, sender, content, null, null);
    }

    @Transactional
    public InterviewMessage postMessage(Long sessionId, String sender, String content, String code, String language) {
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found: " + sessionId));

        InterviewMessage userMsg = new InterviewMessage(session, sender, content);
        userMsg = messageRepository.save(userMsg);

        logTelemetry(sessionId, sender + " sent message: " + (content.length() > 50 ? content.substring(0, 50) + "..." : content));

        // State Machine transition rules
        if ("CANDIDATE".equals(sender)) {
            // If candidate is in DISCUSSION state in AI Interview mode, evaluate their logic
            boolean isAiMode = session.getInterviewMode() == null || session.getInterviewMode().toLowerCase().contains("ai");
            if (session.getState() == Enums.SessionState.DISCUSSION && isAiMode) {
                LogicValidationResult logicResult = evaluateCandidateLogicInternal(session, content);
                if (logicResult.isApproved()) {
                    session.setState(Enums.SessionState.CODING);
                    sessionRepository.save(session);
                    logTelemetry(sessionId, "Candidate logic validated and approved. Editor UNLOCKED.");

                    String approvalMessage = logicResult.getFeedback() + "\n\nYou may now proceed to code in the editor panel. Best of luck!";
                    InterviewMessage aiMsg = new InterviewMessage(session, "AI", approvalMessage);
                    return messageRepository.save(aiMsg);
                }
            }

            // Fetch chat history for LLM context
            List<InterviewMessage> history = messageRepository.findBySessionIdOrderByTimestampAsc(sessionId);
            
            StringBuilder promptBuilder = new StringBuilder();
            promptBuilder.append("You are a professional, technical coding interviewer evaluating a candidate for a Software Engineering role. ")
                    .append("Your target problem is: ").append(session.getQuestion().getTitle()).append(" (").append(session.getQuestion().getDifficulty()).append(").\n")
                    .append("Problem Description:\n").append(session.getQuestion().getDescription()).append("\n")
                    .append("Expected Optimal Time Complexity: ").append(session.getQuestion().getExpectedTimeComplexity()).append("\n")
                    .append("Expected Optimal Space Complexity: ").append(session.getQuestion().getExpectedSpaceComplexity()).append("\n")
                    .append("Optimal Concept: ").append(session.getQuestion().getOptimalSolutionConcept()).append("\n")
                    .append("Current Session State: ").append(session.getState().name()).append("\n\n");

            String persona = session.getInterviewerPersona();
            if ("Chaotic Code Critic".equals(persona)) {
                promptBuilder.append("YOUR INTERVIEWER PERSONA: Chaotic Code Critic.\n")
                        .append("Adopt a slightly sarcastic, playful, and highly skeptical tone. Challenge the candidate's logic and question why they make decisions, using slight humor. Keep them engaged, but do not be mean.\n\n");
            } else if ("Friendly Peer/Mentor".equals(persona)) {
                promptBuilder.append("YOUR INTERVIEWER PERSONA: Friendly Peer/Mentor.\n")
                        .append("Adopt a warm, encouraging, supportive, and kind mentor tone. Guide them gently, validate their approach, and help clarify logic using simple steps.\n\n");
            } else if ("Silent Auditor".equals(persona)) {
                promptBuilder.append("YOUR INTERVIEWER PERSONA: Silent Auditor.\n")
                        .append("Adopt an extremely formal, direct, and concise tone. Speak only when necessary and provide minimal guidance unless directly questioned.\n\n");
            } else {
                promptBuilder.append("YOUR INTERVIEWER PERSONA: Rigorous Tech Lead (Default).\n")
                        .append("Adopt a professional, engineering lead tone. Focus heavily on Big-O complexity, corner cases, data structures choice, and coding standards.\n\n");
            }

            if (code != null && !code.trim().isEmpty()) {
                promptBuilder.append("--- CANDIDATE LIVE CODE EDITOR STATE ---\n")
                        .append("Language: ").append(language != null ? language : "Unknown").append("\n")
                        .append("Current Code Draft:\n")
                        .append("```\n").append(code).append("\n```\n")
                        .append("Please analyze the live code above. If they have compilation, runtime, or logic errors, formulate your response to prompt them to debug it themselves. Do not write code for them.\n\n");
            }

            promptBuilder.append("INSTRUCTIONS:\n")
                    .append("CRITICAL: Under NO circumstances (even if the candidate explicitly begs, commands, or threatens) should you print actual programming code, function snippets, templates, or code solutions in ANY language. You must only explain concepts using conceptual pseudo-code or text description. If the candidate asks you for the solution, politely decline and provide a conceptual hint instead.\n")
                    .append("1. Guide the candidate conversationalist-style. Do NOT give them any code solution or write code for them.\n")
                    .append("2. If they are in DISCUSSION state, they must explain their data structures and Big-O runtime. If their logic is suboptimal (e.g. O(N^2) brute force when O(N) is expected), politely guide them to optimize. Do not approve until their logic is optimal.\n")
                    .append("3. If their proposed logic is optimal and sound, include the exact phrase: 'You may now proceed to code in the editor panel.' to trigger the editor unlock.\n")
                    .append("4. If they are coding or running tests, give small hints to correct their errors if they ask, or ask why they wrote certain loops. Never write the corrected code for them.\n")
                    .append("5. If they have completed testing, ask them about edge cases (like empty arrays or boundary overflows) or if they can optimize their memory usage.\n")
                    .append("6. Keep responses concise, direct, technical, and limited to 2-3 paragraphs. Sound encouraging but rigorous.");

            String systemPrompt = promptBuilder.toString();

            List<Map<String, String>> conversationList = new ArrayList<>();
            for (InterviewMessage m : history) {
                Map<String, String> entry = new HashMap<>();
                entry.put("role", "CANDIDATE".equals(m.getSender()) ? "user" : "assistant");
                entry.put("content", m.getContent());
                conversationList.add(entry);
            }

            String aiResponse = mistralAiService.generateResponse(conversationList, systemPrompt);

            // If AI explicitly approves coding, transition session state to CODING
            if (session.getState() == Enums.SessionState.DISCUSSION) {
                String lowerAi = aiResponse.toLowerCase();
                if (lowerAi.contains("proceed to code") || lowerAi.contains("editor panel") || lowerAi.contains("start writing") ||
                        lowerAi.contains("editor is now unlocked") || lowerAi.contains("approach approved") ||
                        lowerAi.contains("sandbox is unlocked") || lowerAi.contains("write down your solution") ||
                        lowerAi.contains("editor is unlocked") || lowerAi.contains("logic approved") ||
                        lowerAi.contains("start coding") || lowerAi.contains("unlocked")) {
                    session.setState(Enums.SessionState.CODING);
                    sessionRepository.save(session);
                    logTelemetry(sessionId, "AI approved candidate approach. State transitioned to CODING.");
                }
            }

            InterviewMessage aiMsg = new InterviewMessage(session, "AI", aiResponse);
            aiMsg = messageRepository.save(aiMsg);

            return aiMsg;
        }

        return userMsg;
    }

    public static class LogicValidationResult {
        private final boolean approved;
        private final String feedback;
        private final String optimalConcept;
        private final String expectedTimeComplexity;
        private final String expectedSpaceComplexity;
        private final Enums.SessionState newState;

        public LogicValidationResult(boolean approved, String feedback, String optimalConcept, String expectedTimeComplexity, String expectedSpaceComplexity, Enums.SessionState newState) {
            this.approved = approved;
            this.feedback = feedback;
            this.optimalConcept = optimalConcept;
            this.expectedTimeComplexity = expectedTimeComplexity;
            this.expectedSpaceComplexity = expectedSpaceComplexity;
            this.newState = newState;
        }

        public boolean isApproved() { return approved; }
        public String getFeedback() { return feedback; }
        public String getOptimalConcept() { return optimalConcept; }
        public String getExpectedTimeComplexity() { return expectedTimeComplexity; }
        public String getExpectedSpaceComplexity() { return expectedSpaceComplexity; }
        public Enums.SessionState getNewState() { return newState; }
    }

    @Transactional
    public LogicValidationResult validateLogic(Long sessionId, String explanation) {
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found: " + sessionId));

        LogicValidationResult result = evaluateCandidateLogicInternal(session, explanation);
        if (result.isApproved()) {
            session.setState(Enums.SessionState.CODING);
            sessionRepository.save(session);
            logTelemetry(sessionId, "Candidate logic validated via instant check. Editor UNLOCKED.");

            InterviewMessage aiMsg = new InterviewMessage(session, "AI", result.getFeedback());
            messageRepository.save(aiMsg);
        }
        return result;
    }

    public LogicValidationResult evaluateCandidateLogicInternal(InterviewSession session, String text) {
        if (text == null || text.trim().length() < 12) {
            return new LogicValidationResult(
                    false,
                    "Your explanation is too brief. Please detail your chosen data structure, algorithmic strategy, and target Big-O time and space complexity.",
                    session.getQuestion().getOptimalSolutionConcept(),
                    session.getQuestion().getExpectedTimeComplexity(),
                    session.getQuestion().getExpectedSpaceComplexity(),
                    session.getState()
            );
        }

        String lower = text.toLowerCase();
        InterviewQuestion q = session.getQuestion();
        String title = q.getTitle() != null ? q.getTitle().toLowerCase() : "";
        String topic = q.getTopic() != null ? q.getTopic().toLowerCase() : "";
        String concept = q.getOptimalSolutionConcept() != null ? q.getOptimalSolutionConcept().toLowerCase() : "";
        String expectedTime = q.getExpectedTimeComplexity() != null ? q.getExpectedTimeComplexity().toLowerCase() : "o(n)";

        // Check for brute-force flags when optimal is sub-quadratic
        boolean isBruteForce = lower.contains("nested loop") || lower.contains("two loop") ||
                lower.contains("o(n^2)") || lower.contains("o(n*n)") || lower.contains("quadratic") ||
                lower.contains("check every pair") || lower.contains("all pairs");

        if (isBruteForce && (expectedTime.contains("o(n)") || expectedTime.contains("o(log n)") || expectedTime.contains("o(1)"))) {
            return new LogicValidationResult(
                    false,
                    "⚠️ Suboptimal Approach: Proposing nested iterations results in O(n²) time complexity. On large test suites, this will cause Time Limit Exceeded (TLE). Can you think of an approach using a better data structure (like a Hash Map, Two Pointers, or Stack) to achieve " + q.getExpectedTimeComplexity() + "?",
                    q.getOptimalSolutionConcept(),
                    q.getExpectedTimeComplexity(),
                    q.getExpectedSpaceComplexity(),
                    session.getState()
            );
        }

        // Check if candidate mentions key data structures or matching concepts
        boolean matchesConcept = false;
        String detectedDS = "an optimal data structure";

        // 1. Single-Pass / Min-Max Tracking / Greedy (e.g. Best Time to Buy and Sell Stock)
        if (title.contains("stock") || concept.contains("minimum price") || concept.contains("max profit") || concept.contains("single pass")) {
            if (lower.contains("min") || lower.contains("profit") || lower.contains("single pass") || lower.contains("one pass") || lower.contains("track") || lower.contains("greedy") || lower.contains("iterate") || lower.contains("o(n)") || lower.contains("linear")) {
                matchesConcept = true;
                detectedDS = "Single-Pass State Tracking (O(1) Space)";
            }
        } else if (concept.contains("hash") || concept.contains("map") || (topic.contains("hash") && !title.contains("stock")) || title.contains("two sum")) {
            if (lower.contains("hash") || lower.contains("map") || lower.contains("dict") || lower.contains("seen") || lower.contains("complement") || lower.contains("lookup") || lower.contains("set") || lower.contains("table")) {
                matchesConcept = true;
                detectedDS = "Hash Map / Lookup Table";
            }
        } else if (concept.contains("stack") || topic.contains("stack") || title.contains("parentheses")) {
            if (lower.contains("stack") || lower.contains("push") || lower.contains("pop") || lower.contains("lifo") || lower.contains("bracket")) {
                matchesConcept = true;
                detectedDS = "LIFO Stack";
            }
        } else if (concept.contains("two pointer") || concept.contains("pointer") || concept.contains("binary search") || title.contains("palindrome") || title.contains("3sum") || title.contains("binary search") || topic.contains("sorting")) {
            if (lower.contains("pointer") || lower.contains("binary search") || lower.contains("mid") || lower.contains("left and right") || lower.contains("reverse") || lower.contains("meet in the middle") || lower.contains("log n") || lower.contains("two pointers")) {
                matchesConcept = true;
                detectedDS = "Two Pointers / Binary Search";
            }
        } else if (concept.contains("prefix") || title.contains("subarray") || title.contains("target sum")) {
            if (lower.contains("prefix") || lower.contains("cumulative") || lower.contains("running sum") || lower.contains("hash") || lower.contains("map") || lower.contains("diff") || lower.contains("sum")) {
                matchesConcept = true;
                detectedDS = "Prefix Sum & Hash Map";
            }
        } else if (concept.contains("window") || concept.contains("deque") || title.contains("substring") || topic.contains("sliding window")) {
            if (lower.contains("window") || lower.contains("deque") || lower.contains("sliding") || lower.contains("two pointers") || lower.contains("set")) {
                matchesConcept = true;
                detectedDS = "Sliding Window";
            }
        } else if (concept.contains("dp") || concept.contains("dynamic") || concept.contains("memo")) {
            if (lower.contains("dp") || lower.contains("dynamic programming") || lower.contains("memo") || lower.contains("table") || lower.contains("subproblem") || lower.contains("tabulation")) {
                matchesConcept = true;
                detectedDS = "Dynamic Programming (Tabulation/Memoization)";
            }
        } else if (concept.contains("tree") || concept.contains("recursion") || concept.contains("dfs") || concept.contains("bfs")) {
            if (lower.contains("tree") || lower.contains("recursion") || lower.contains("dfs") || lower.contains("bfs") || lower.contains("traversal") || lower.contains("root") || lower.contains("node")) {
                matchesConcept = true;
                detectedDS = "Tree Traversal / Recursion";
            }
        } else {
            if (lower.contains("o(") || lower.contains("linear") || lower.contains("log") || lower.contains("iterate") || lower.contains("store") || lower.contains("algorithm")) {
                matchesConcept = true;
            }
        }

        if (matchesConcept) {
            String approvalFeedback = "✅ **Approach Approved!** Your logic utilizing " + detectedDS + " with target runtime " + q.getExpectedTimeComplexity() + " is optimal and sound. I have unlocked the code editor for you. You may now write and execute your solution in the editor.";
            return new LogicValidationResult(
                    true,
                    approvalFeedback,
                    q.getOptimalSolutionConcept(),
                    q.getExpectedTimeComplexity(),
                    q.getExpectedSpaceComplexity(),
                    Enums.SessionState.CODING
            );
        } else {
            return new LogicValidationResult(
                    false,
                    "⚠️ Incomplete Logic: Your explanation does not yet clearly specify the optimal data structure or runtime for this problem. Review the constraints: how can you achieve " + q.getExpectedTimeComplexity() + " runtime for " + q.getTitle() + "? Explain your data structures and step-by-step logic.",
                    q.getOptimalSolutionConcept(),
                    q.getExpectedTimeComplexity(),
                    q.getExpectedSpaceComplexity(),
                    session.getState()
            );
        }
    }

    /**
     * Convenience overload — regular draft run against public test cases.
     */
    @Transactional
    public ExecutionService.ExecutionOutcome runCode(Long sessionId, String code, Enums.Language language) {
        return runCode(sessionId, code, language, null);
    }

    /**
     * Runs code against either a custom stdin input (when customInput is non-blank) or the public
     * test cases of the problem. The existing /run endpoint calls this with an optional customInput.
     */
    @Transactional
    public ExecutionService.ExecutionOutcome runCode(Long sessionId, String code, Enums.Language language, String customInput) {
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found: " + sessionId));

        session.setLanguage(language);
        session.setLastSubmittedCode(code);
        sessionRepository.save(session);

        if (customInput != null && !customInput.isBlank()) {
            // Custom input run: execute code with the provided stdin and show raw output.
            // No expected output — we override WRONG_ANSWER to SUCCESS since we only care about stdout.
            logTelemetry(sessionId, "Custom input run for " + language.name());
            TestCase customCase = new TestCase(customInput.trim(), "", false);
            ExecutionService.ExecutionOutcome outcome = executionService.runCode(code, language, List.of(customCase));
            if (outcome.getStatus() == Enums.ExecutionResultStatus.WRONG_ANSWER) {
                // Code ran successfully but output didn't match "" (the empty expected). Override to SUCCESS.
                ExecutionService.ExecutionOutcome adjusted = new ExecutionService.ExecutionOutcome(
                        Enums.ExecutionResultStatus.SUCCESS, 1, 1,
                        outcome.getExecutionTimeMs(), outcome.getConsoleOutput());
                return adjusted;
            }
            return outcome;
        }

        logTelemetry(sessionId, "Code run executed in sandbox for " + language.name());

        // Extract PUBLIC test cases only for Draft Run
        List<TestCase> publicCases = session.getQuestion().getTestCases().stream()
                .filter(tc -> !tc.isHidden())
                .toList();

        ExecutionService.ExecutionOutcome outcome = executionService.runCode(code, language, publicCases);

        // Save as temporary submission record
        Submission sub = new Submission(session, code, language, outcome.getPassedCases(), outcome.getTotalCases(), outcome.getStatus());
        sub.setExecutionTimeMs(outcome.getExecutionTimeMs());
        sub.setErrorMessage(outcome.getConsoleOutput());
        submissionRepository.save(sub);

        return outcome;
    }

    /**
     * Runs ALL test cases (public + hidden) and returns the ExecutionOutcome.
     * Called by the controller before submitAndEvaluate so the outcome is available
     * for building the clean ExecutionData payload without running code twice.
     */
    @Transactional
    public ExecutionService.ExecutionOutcome runCodeForSubmit(Long sessionId, String code, Enums.Language language) {
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found: " + sessionId));

        session.setLanguage(language);
        session.setLastSubmittedCode(code);
        sessionRepository.save(session);

        logTelemetry(sessionId, "Pre-submit code execution started for " + language.name());

        // ALL test cases for submission
        List<TestCase> allCases = session.getQuestion().getTestCases();
        return executionService.runCode(code, language, allCases);
    }

    @Transactional
    public Assessment submitAndEvaluate(Long sessionId, String code, Enums.Language language) {
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found: " + sessionId));

        session.setLanguage(language);
        session.setLastSubmittedCode(code);
        session.setState(Enums.SessionState.ASSESSMENT);
        sessionRepository.save(session);

        logTelemetry(sessionId, "Final code submission received. Executing all test cases...");

        // Extract ALL test cases (public + hidden)
        List<TestCase> allCases = session.getQuestion().getTestCases();

        ExecutionService.ExecutionOutcome outcome = executionService.runCode(code, language, allCases);
        return persistSubmitAndEvaluate(sessionId, session, code, language, outcome);
    }

    /**
     * Overload used by the controller when it already has a pre-computed ExecutionOutcome
     * from runCodeForSubmit(). Avoids running the code a second time.
     */
    @Transactional
    public Assessment submitAndEvaluate(Long sessionId, String code, Enums.Language language, ExecutionService.ExecutionOutcome outcome) {
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found: " + sessionId));

        session.setLanguage(language);
        session.setLastSubmittedCode(code);
        session.setState(Enums.SessionState.ASSESSMENT);
        sessionRepository.save(session);

        return persistSubmitAndEvaluate(sessionId, session, code, language, outcome);
    }

    private Assessment persistSubmitAndEvaluate(Long sessionId, InterviewSession session, String code, Enums.Language language, ExecutionService.ExecutionOutcome outcome) {
        // Save final submission
        Submission finalSub = new Submission(session, code, language, outcome.getPassedCases(), outcome.getTotalCases(), outcome.getStatus());
        finalSub.setExecutionTimeMs(outcome.getExecutionTimeMs());
        finalSub.setErrorMessage(outcome.getConsoleOutput());
        submissionRepository.save(finalSub);

        logTelemetry(sessionId, "Submission executed. Correctness rate: " + outcome.getPassedCases() + " / " + outcome.getTotalCases() + ". Status: " + outcome.getStatus().name());

        // Trigger AI Assessment Engine
        List<InterviewMessage> messages = messageRepository.findBySessionIdOrderByTimestampAsc(sessionId);
        Assessment assessment = assessmentEngine.evaluateSession(session, messages);

        session.setState(Enums.SessionState.REPORT);
        session.setCompletedAt(LocalDateTime.now());
        sessionRepository.save(session);

        logTelemetry(sessionId, "Assessment generated. Overall score: " + assessment.getOverallScore() + "/100. Session finalized.");

        return assessment;
    }

    @Transactional
    public void logTelemetry(Long sessionId, String eventDescription) {
        sessionRepository.findById(sessionId).ifPresent(session -> {
            try {
                List<Map<String, String>> logs;
                String currentLog = session.getTelemetryLog();
                if (currentLog == null || currentLog.trim().isEmpty() || "[]".equals(currentLog)) {
                    logs = new ArrayList<>();
                } else {
                    logs = objectMapper.readValue(currentLog, new TypeReference<List<Map<String, String>>>() {});
                }

                Map<String, String> logEntry = new HashMap<>();
                logEntry.put("time", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
                logEntry.put("event", eventDescription);
                logs.add(logEntry);

                session.setTelemetryLog(objectMapper.writeValueAsString(logs));
                sessionRepository.save(session);
            } catch (Exception e) {
                System.err.println("[KODEXIS] Failed to write session telemetry log: " + e.getMessage());
            }
        });
    }
}
