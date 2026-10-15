package com.kodexis.core.controller;

import com.kodexis.core.model.CandidateProfile;
import com.kodexis.core.model.InterviewQuestion;
import com.kodexis.core.model.InterviewSession;
import com.kodexis.core.model.TestCase;
import com.kodexis.core.model.User;
import com.kodexis.core.repository.CandidateProfileRepository;
import com.kodexis.core.repository.InterviewQuestionRepository;
import com.kodexis.core.repository.InterviewSessionRepository;
import com.kodexis.core.repository.TestCaseRepository;
import com.kodexis.core.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final InterviewQuestionRepository questionRepository;
    private final TestCaseRepository testCaseRepository;
    private final UserRepository userRepository;
    private final CandidateProfileRepository profileRepository;
    private final InterviewSessionRepository sessionRepository;

    // In-memory backing for platform feature flags
    private final Map<String, Map<String, Object>> featuresMap = new ConcurrentHashMap<>();

    public AdminController(
            InterviewQuestionRepository questionRepository,
            TestCaseRepository testCaseRepository,
            UserRepository userRepository,
            CandidateProfileRepository profileRepository,
            InterviewSessionRepository sessionRepository) {
        this.questionRepository = questionRepository;
        this.testCaseRepository = testCaseRepository;
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.sessionRepository = sessionRepository;

        // Initialize default system features
        seedDefaultFeatures();
    }

    private void seedDefaultFeatures() {
        addFeatureRecord("FULLSCREEN_PROCTORING_PROMPT", "Fullscreen Coding Prompt",
                "Prompts candidates to switch to fullscreen mode when starting to code for proctoring compliance.",
                "Proctoring", true);
        addFeatureRecord("TAB_SWITCH_TRACKER", "Tab Switch Violation Counter",
                "Monitors and counts browser tab/window switches during the interview, displaying warnings and recording telemetry.",
                "Proctoring", true);
        addFeatureRecord("STRICT_LOGIC_GATE", "Phase 1 Conceptual Logic Gate",
                "Requires candidate to explain and defend data structures & Big-O complexity before unlocking the code editor.",
                "AI Interviewer", true);
        addFeatureRecord("SAMPLE_CASES_MARKDOWN", "Rich Markdown Test Cases & Walkthrough",
                "Renders comprehensive problem descriptions and sample test cases using styled React Markdown.",
                "Interface", true);
        addFeatureRecord("YOUTUBE_AUTOPSY_REDIRECT", "YouTube DSA Tutorial Recommendations",
                "Redirects recommended practice topics on autopsy report to targeted YouTube search queries instead of static links.",
                "Assessment", true);
        addFeatureRecord("SOCRATIC_VOICE_ORB", "Socratic Voice Tutor & Live Orb",
                "Enables live conversational reasoning and voice guidance with the AI Interviewer during coding sessions.",
                "AI Interviewer", true);
        addFeatureRecord("STUDY_CALENDAR_TRACKING", "Study Calendar & Revision Planner",
                "Adaptive spaced-repetition revision calendar and daily consistency tracking.",
                "General", true);
        addFeatureRecord("CODE_QUALITY_INSPECTOR", "Real-time AST Code Quality Inspector",
                "Computes cyclomatic complexity, code smells, and stylistic defects in real time.",
                "Assessment", true);
    }

    private void addFeatureRecord(String key, String name, String desc, String category, boolean enabled) {
        Map<String, Object> feat = new HashMap<>();
        feat.put("id", "feat-" + key.toLowerCase().replace('_', '-'));
        feat.put("key", key);
        feat.put("name", name);
        feat.put("description", desc);
        feat.put("category", category);
        feat.put("enabled", enabled);
        feat.put("createdAt", new Date().toString());
        feat.put("isSystem", true);
        featuresMap.put(key, feat);
    }

    // ==========================================
    // QUESTIONS CRUD
    // ==========================================

    @GetMapping("/questions")
    public ResponseEntity<List<InterviewQuestion>> getAllQuestions() {
        return ResponseEntity.ok(questionRepository.findAll());
    }

    @PostMapping("/questions")
    public ResponseEntity<InterviewQuestion> createQuestion(@RequestBody InterviewQuestion question) {
        if (question.getTestCases() != null) {
            for (TestCase tc : question.getTestCases()) {
                tc.setQuestion(question);
            }
        }
        InterviewQuestion saved = questionRepository.save(question);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/questions/{id}")
    public ResponseEntity<?> updateQuestion(@PathVariable Long id, @RequestBody InterviewQuestion questionDetails) {
        Optional<InterviewQuestion> optQuestion = questionRepository.findById(id);
        if (optQuestion.isPresent()) {
            InterviewQuestion q = optQuestion.get();
            q.setTitle(questionDetails.getTitle());
            q.setDescription(questionDetails.getDescription());
            q.setDifficulty(questionDetails.getDifficulty());
            q.setTopic(questionDetails.getTopic());
            q.setExpectedTimeComplexity(questionDetails.getExpectedTimeComplexity());
            q.setExpectedSpaceComplexity(questionDetails.getExpectedSpaceComplexity());
            q.setOptimalSolutionConcept(questionDetails.getOptimalSolutionConcept());
            q.setJavaTemplate(questionDetails.getJavaTemplate());
            q.setPythonTemplate(questionDetails.getPythonTemplate());
            q.setJavascriptTemplate(questionDetails.getJavascriptTemplate());
            q.setCppTemplate(questionDetails.getCppTemplate());
            q.setCTemplate(questionDetails.getCTemplate());

            if (questionDetails.getTestCases() != null) {
                q.getTestCases().clear();
                for (TestCase tc : questionDetails.getTestCases()) {
                    q.addTestCase(tc);
                }
            }

            InterviewQuestion updated = questionRepository.save(q);
            return ResponseEntity.ok(updated);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Question not found"));
        }
    }

    @DeleteMapping("/questions/{id}")
    public ResponseEntity<?> deleteQuestion(@PathVariable Long id) {
        Optional<InterviewQuestion> optQuestion = questionRepository.findById(id);
        if (optQuestion.isPresent()) {
            questionRepository.delete(optQuestion.get());
            return ResponseEntity.ok(Map.of("message", "Question deleted successfully"));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Question not found"));
        }
    }

    // ==========================================
    // CANDIDATE PLATFORM USAGE & AUDIT LOGS
    // ==========================================

    @GetMapping("/users-logs")
    public ResponseEntity<List<Map<String, Object>>> getCandidateUsersAndLogs() {
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> response = new ArrayList<>();

        for (User user : users) {
            Map<String, Object> uMap = new HashMap<>();
            uMap.put("userId", user.getId());
            uMap.put("username", user.getUsername());
            uMap.put("role", user.getRole().name());
            uMap.put("createdAt", user.getCreatedAt());

            Optional<CandidateProfile> optProfile = profileRepository.findByUser(user);
            if (optProfile.isPresent()) {
                CandidateProfile p = optProfile.get();
                uMap.put("fullName", p.getFullName());
                uMap.put("targetRole", p.getTargetRole());
                uMap.put("targetCompanies", p.getTargetCompanies());
                uMap.put("experienceLevel", p.getExperienceLevel() != null ? p.getExperienceLevel().name() : "MEDIUM");
                uMap.put("readinessScore", p.getReadinessScore() != null ? p.getReadinessScore() : 75);
                uMap.put("preferredLanguage", p.getPreferredLanguage() != null ? p.getPreferredLanguage().name() : "PYTHON");

                // Skill matrix
                Map<String, String> skills = new HashMap<>();
                skills.put("arrays", p.getArraysProficiency() != null ? p.getArraysProficiency().name() : "DEVELOPING");
                skills.put("strings", p.getStringsProficiency() != null ? p.getStringsProficiency().name() : "DEVELOPING");
                skills.put("hashing", p.getHashingProficiency() != null ? p.getHashingProficiency().name() : "DEVELOPING");
                skills.put("linkedLists", p.getLinkedListsProficiency() != null ? p.getLinkedListsProficiency().name() : "DEVELOPING");
                skills.put("trees", p.getTreesProficiency() != null ? p.getTreesProficiency().name() : "DEVELOPING");
                skills.put("graphs", p.getGraphsProficiency() != null ? p.getGraphsProficiency().name() : "DEVELOPING");
                uMap.put("skills", skills);
            } else {
                uMap.put("fullName", user.getUsername());
                uMap.put("targetRole", "Software Engineer");
                uMap.put("experienceLevel", "MEDIUM");
                uMap.put("readinessScore", 70);
            }

            // Completed interview sessions
            List<InterviewSession> sessions = sessionRepository.findByUserOrderByStartedAtDesc(user);
            uMap.put("sessionsCount", sessions.size());

            List<Map<String, Object>> recentSessions = new ArrayList<>();
            for (InterviewSession s : sessions) {
                Map<String, Object> sMap = new HashMap<>();
                sMap.put("sessionId", s.getId());
                sMap.put("questionTitle", s.getQuestion() != null ? s.getQuestion().getTitle() : "Practice Problem");
                sMap.put("difficulty", s.getDifficulty() != null ? s.getDifficulty().name() : "MEDIUM");
                sMap.put("state", s.getState() != null ? s.getState().name() : "COMPLETED");
                sMap.put("startedAt", s.getStartedAt());
                sMap.put("completedAt", s.getCompletedAt());
                sMap.put("telemetryLog", s.getTelemetryLog());
                recentSessions.add(sMap);
            }
            uMap.put("sessions", recentSessions);

            response.add(uMap);
        }

        return ResponseEntity.ok(response);
    }

    // ==========================================
    // PLATFORM FEATURE FLAGS
    // ==========================================

    @GetMapping("/features")
    public ResponseEntity<List<Map<String, Object>>> getFeatures() {
        return ResponseEntity.ok(new ArrayList<>(featuresMap.values()));
    }

    @PostMapping("/features")
    public ResponseEntity<Map<String, Object>> createFeature(@RequestBody Map<String, Object> featurePayload) {
        String key = (String) featurePayload.get("key");
        if (key == null || key.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Feature key is required"));
        }
        key = key.trim().toUpperCase().replace(' ', '_');
        featurePayload.put("key", key);
        if (!featurePayload.containsKey("id")) {
            featurePayload.put("id", "feat-" + System.currentTimeMillis());
        }
        if (!featurePayload.containsKey("createdAt")) {
            featurePayload.put("createdAt", new Date().toString());
        }
        featuresMap.put(key, featurePayload);
        return ResponseEntity.status(HttpStatus.CREATED).body(featurePayload);
    }

    @PutMapping("/features/{key}/toggle")
    public ResponseEntity<?> toggleFeature(@PathVariable String key) {
        String upperKey = key.toUpperCase();
        Map<String, Object> feat = featuresMap.get(upperKey);
        if (feat != null) {
            boolean current = Boolean.TRUE.equals(feat.get("enabled"));
            feat.put("enabled", !current);
            return ResponseEntity.ok(feat);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Feature not found"));
    }

    @DeleteMapping("/features/{key}")
    public ResponseEntity<?> deleteFeature(@PathVariable String key) {
        String upperKey = key.toUpperCase();
        if (featuresMap.containsKey(upperKey)) {
            featuresMap.remove(upperKey);
            return ResponseEntity.ok(Map.of("message", "Feature removed successfully"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Feature not found"));
    }
}
