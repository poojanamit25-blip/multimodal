package com.kodexis.core.controller;

import com.kodexis.core.model.*;
import com.kodexis.core.repository.AssessmentRepository;
import com.kodexis.core.repository.InterviewMessageRepository;
import com.kodexis.core.repository.InterviewSessionRepository;
import com.kodexis.core.repository.UserRepository;
import com.kodexis.core.sandbox.ExecutionService;
import com.kodexis.core.service.InterviewService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/interviews")
public class InterviewController {

    private final InterviewService interviewService;
    private final InterviewSessionRepository sessionRepository;
    private final InterviewMessageRepository messageRepository;
    private final AssessmentRepository assessmentRepository;
    private final UserRepository userRepository;

    public InterviewController(InterviewService interviewService,
                               InterviewSessionRepository sessionRepository,
                               InterviewMessageRepository messageRepository,
                               AssessmentRepository assessmentRepository,
                               UserRepository userRepository) {
        this.interviewService = interviewService;
        this.sessionRepository = sessionRepository;
        this.messageRepository = messageRepository;
        this.assessmentRepository = assessmentRepository;
        this.userRepository = userRepository;
    }

    public static class StartRequest {
        public Enums.Difficulty difficulty;
        public Enums.Language language;
        public Integer durationMinutes;
        public String interviewMode;
        public String candidateAlias;
        public String targetRole;
        public String candidateMood;
        public String interviewerPersona;
    }

    public static class MessageRequest {
        public String content;
        public String code;
        public String language;
    }

    public static class CodeRequest {
        public String code;
        public Enums.Language language;
        // Optional: if set, run code against this custom stdin input instead of public test cases
        public String customInput;
    }

    /**
     * Clean result object produced by the Coding Sandbox for consumption by Member 3
     * (Multi-Factor Assessment module). Contains raw execution data only.
     * Member 3 is responsible for calculating final assessment scores.
     */
    public static class ExecutionData {
        public Long sessionId;
        public Long questionId;
        public String language;
        public String sourceCode;
        public String status;
        public int passedCases;
        public int totalCases;
        public long executionTimeMs;
        public Long memoryUsedKb;   // null when sandbox does not track memory
        public Object testResults;  // List of TestCaseResult details

        public ExecutionData(Long sessionId, Long questionId, String language, String sourceCode,
                             String status, int passedCases, int totalCases,
                             long executionTimeMs, Long memoryUsedKb, Object testResults) {
            this.sessionId = sessionId;
            this.questionId = questionId;
            this.language = language;
            this.sourceCode = sourceCode;
            this.status = status;
            this.passedCases = passedCases;
            this.totalCases = totalCases;
            this.executionTimeMs = executionTimeMs;
            this.memoryUsedKb = memoryUsedKb;
            this.testResults = testResults;
        }
    }

    /**
     * Full submit response. Contains:
     * - assessment: the completed KODEXIS multi-factor Assessment entity
     * - executionData: clean sandbox execution result for Member 3 integration
     */
    public static class SubmitResponse {
        public Assessment assessment;
        public ExecutionData executionData;

        public SubmitResponse(Assessment assessment, ExecutionData executionData) {
            this.assessment = assessment;
            this.executionData = executionData;
        }
    }

    public static class LogicRequest {
        public String explanation;
    }

    @PostMapping
    public ResponseEntity<?> startSession(@RequestBody StartRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = null;
        if (username != null && !username.equalsIgnoreCase("anonymousUser")) {
            user = userRepository.findByUsername(username).orElse(null);
        }
        if (user == null) {
            user = userRepository.findByUsername("vicky").orElseGet(() ->
                    userRepository.findAll().stream().findFirst().orElseGet(() -> {
                        User fallback = new User("vicky", "password", Enums.Role.ROLE_CANDIDATE);
                        return userRepository.save(fallback);
                    })
            );
        }

        InterviewSession session = interviewService.startSession(
                user,
                request.difficulty != null ? request.difficulty : Enums.Difficulty.MEDIUM,
                request.language != null ? request.language : Enums.Language.PYTHON,
                request.durationMinutes != null ? request.durationMinutes : 45,
                request.interviewMode != null ? request.interviewMode : "Full Simulation",
                request.candidateAlias,
                request.targetRole,
                request.candidateMood,
                request.interviewerPersona
        );
        return ResponseEntity.ok(session);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getSession(@PathVariable Long id) {
        Optional<InterviewSession> optSession = sessionRepository.findById(id);
        if (optSession.isEmpty()) {
            optSession = sessionRepository.findAll().stream().findFirst();
        }
        if (optSession.isEmpty()) {
            // Auto create session if DB is freshly seeded
            User user = userRepository.findByUsername("vicky").orElseGet(() -> {
                User fallback = new User("vicky", "password", Enums.Role.ROLE_CANDIDATE);
                return userRepository.save(fallback);
            });
            InterviewSession fallbackSession = interviewService.startSession(
                    user, Enums.Difficulty.MEDIUM, Enums.Language.PYTHON, 45, "Full Simulation"
            );
            return ResponseEntity.ok(fallbackSession);
        }
        return ResponseEntity.ok(optSession.get());
    }

    @GetMapping("/{id}/messages")
    public ResponseEntity<?> getMessages(@PathVariable Long id) {
        List<InterviewMessage> history = messageRepository.findBySessionIdOrderByTimestampAsc(id);
        return ResponseEntity.ok(history);
    }

    @PostMapping("/{id}/message")
    public ResponseEntity<?> postMessage(@PathVariable Long id, @RequestBody MessageRequest request) {
        try {
            InterviewMessage aiResponse = interviewService.postMessage(id, "CANDIDATE", request.content, request.code, request.language);
            return ResponseEntity.ok(aiResponse);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/validate-logic")
    public ResponseEntity<?> validateLogic(@PathVariable Long id, @RequestBody LogicRequest request) {
        try {
            InterviewService.LogicValidationResult result = interviewService.validateLogic(id, request.explanation);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/run")
    public ResponseEntity<?> runCode(@PathVariable Long id, @RequestBody CodeRequest request) {
        try {
            ExecutionService.ExecutionOutcome outcome = interviewService.runCode(id, request.code, request.language, request.customInput);
            return ResponseEntity.ok(outcome);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<?> submitCode(@PathVariable Long id, @RequestBody CodeRequest request) {
        try {
            // interviewService.submitAndEvaluate returns Assessment; the execution outcome
            // is also needed so we re-run using the run endpoint data already saved.
            ExecutionService.ExecutionOutcome outcome = interviewService.runCodeForSubmit(id, request.code, request.language);
            Assessment assessment = interviewService.submitAndEvaluate(id, request.code, request.language, outcome);

            // Build clean ExecutionData payload for Member 3
            Optional<com.kodexis.core.model.InterviewSession> optSession = sessionRepository.findById(id);
            Long questionId = optSession.map(s -> s.getQuestion().getId()).orElse(null);

            ExecutionData execData = new ExecutionData(
                id,
                questionId,
                request.language != null ? request.language.name() : "UNKNOWN",
                request.code,
                outcome.getStatus().name(),
                outcome.getPassedCases(),
                outcome.getTotalCases(),
                outcome.getExecutionTimeMs(),
                outcome.getMemoryUsedKb(),
                outcome.getDetails()
            );

            return ResponseEntity.ok(new SubmitResponse(assessment, execData));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}/assessment")
    public ResponseEntity<?> getAssessment(@PathVariable Long id) {
        Optional<Assessment> optAssessment = assessmentRepository.findBySessionId(id);
        if (optAssessment.isPresent()) {
            return ResponseEntity.ok(optAssessment.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Assessment report not found for this session"));
        }
    }
}
