package com.kodexis.core.controller;

import com.kodexis.core.model.CandidateProfile;
import com.kodexis.core.model.Enums;
import com.kodexis.core.model.User;
import com.kodexis.core.repository.CandidateProfileRepository;
import com.kodexis.core.repository.UserRepository;
import com.kodexis.core.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final CandidateProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(UserRepository userRepository,
                          CandidateProfileRepository profileRepository,
                          PasswordEncoder passwordEncoder,
                          JwtService jwtService) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public static class AuthRequest {
        public String username;
        public String password;
        public String fullName; // Used for registration
    }

    public static class OnboardRequest {
        public String targetRole;
        public String targetCompanies;
        public Enums.Difficulty experienceLevel;
        public Enums.Language preferredLanguage;
    }

    @GetMapping("/ping")
    public ResponseEntity<?> ping() {
        return ResponseEntity.ok(Map.of("status", "UP", "timestamp", System.currentTimeMillis()));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthRequest request) {
        if (userRepository.existsByUsername(request.username)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Username already exists"));
        }

        User user = new User(request.username, passwordEncoder.encode(request.password), Enums.Role.ROLE_CANDIDATE);
        userRepository.save(user);

        CandidateProfile profile = new CandidateProfile(user, request.fullName != null ? request.fullName : request.username);
        profileRepository.save(profile);

        String token = jwtService.generateToken(user.getUsername());
        return ResponseEntity.ok(Map.of(
                "token", token,
                "username", user.getUsername(),
                "role", user.getRole().name(),
                "fullName", profile.getFullName()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        Optional<User> optUser = userRepository.findByUsername(request.username);
        if (optUser.isPresent()) {
            User user = optUser.get();
            if (passwordEncoder.matches(request.password, user.getPassword())) {
                String token = jwtService.generateToken(user.getUsername());
                CandidateProfile profile = profileRepository.findByUser(user).orElse(null);
                
                Map<String, Object> resp = new HashMap<>();
                resp.put("token", token);
                resp.put("username", user.getUsername());
                resp.put("role", user.getRole().name());
                resp.put("fullName", profile != null ? profile.getFullName() : user.getUsername());
                resp.put("isOnboarded", profile != null && profile.getTargetRole() != null);
                return ResponseEntity.ok(resp);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid credentials"));
            }
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not found"));
        }
    }

    @PostMapping("/onboard")
    public ResponseEntity<?> onboard(@RequestBody OnboardRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> optUser = userRepository.findByUsername(username);
        if (optUser.isPresent()) {
            Optional<CandidateProfile> optProfile = profileRepository.findByUser(optUser.get());
            if (optProfile.isPresent()) {
                CandidateProfile profile = optProfile.get();
                profile.setTargetRole(request.targetRole);
                profile.setTargetCompanies(request.targetCompanies);
                profile.setExperienceLevel(request.experienceLevel);
                profile.setPreferredLanguage(request.preferredLanguage);
                profile.setReadinessScore(60); // Base starting score after onboarding
                profileRepository.save(profile);
                return ResponseEntity.ok(Map.of("message", "Onboarding completed successfully"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Profile not found"));
            }
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not authenticated"));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> optUser = userRepository.findByUsername(username);
        if (optUser.isPresent()) {
            User user = optUser.get();
            CandidateProfile profile = profileRepository.findByUser(user).orElse(null);
            Map<String, Object> resp = new HashMap<>();
            resp.put("username", user.getUsername());
            resp.put("role", user.getRole().name());
            if (profile != null) {
                resp.put("fullName", profile.getFullName());
                resp.put("targetRole", profile.getTargetRole());
                resp.put("targetCompanies", profile.getTargetCompanies());
                resp.put("experienceLevel", profile.getExperienceLevel() != null ? profile.getExperienceLevel().name() : null);
                resp.put("preferredLanguage", profile.getPreferredLanguage() != null ? profile.getPreferredLanguage().name() : null);
                resp.put("readinessScore", profile.getReadinessScore());
                resp.put("isOnboarded", profile.getTargetRole() != null);
            } else {
                resp.put("isOnboarded", false);
            }
            return ResponseEntity.ok(resp);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not authenticated"));
        }
    }
}
