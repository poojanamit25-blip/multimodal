package com.kodexis.core.service;

import com.kodexis.core.model.CandidateProfile;
import com.kodexis.core.model.Enums;
import com.kodexis.core.model.InterviewQuestion;
import com.kodexis.core.repository.InterviewQuestionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;

@Service
public class AdaptiveDifficultyEngine {

    private final InterviewQuestionRepository questionRepository;
    private final Random random = new Random();

    public AdaptiveDifficultyEngine(InterviewQuestionRepository questionRepository) {
        this.questionRepository = questionRepository;
    }

    public static class QuestionRecommendation {
        private final InterviewQuestion question;
        private final String adjustmentReason;

        public QuestionRecommendation(InterviewQuestion question, String adjustmentReason) {
            this.question = question;
            this.adjustmentReason = adjustmentReason;
        }

        public InterviewQuestion getQuestion() { return question; }
        public String getAdjustmentReason() { return adjustmentReason; }
    }

    public QuestionRecommendation recommendQuestion(CandidateProfile profile, Enums.Difficulty requestedDifficulty) {
        Enums.Difficulty resolvedDifficulty = requestedDifficulty;
        String reason = "Selected based on your requested preference.";

        if (profile != null) {
            int readiness = profile.getReadinessScore();
            if (readiness >= 80) {
                // Upscale difficulty if requested EASY/MEDIUM
                if (requestedDifficulty == Enums.Difficulty.EASY) {
                    resolvedDifficulty = Enums.Difficulty.MEDIUM;
                    reason = "Difficulty increased to MEDIUM because your overall readiness score is high (" + readiness + "%). Keep pushing!";
                } else if (requestedDifficulty == Enums.Difficulty.MEDIUM) {
                    resolvedDifficulty = Enums.Difficulty.HARD;
                    reason = "Difficulty increased to HARD. You are demonstrating strong proficiency (" + readiness + "%), triggering hard assessment parameters.";
                }
            } else if (readiness < 40) {
                // Downscale difficulty to focus on fundamentals
                if (requestedDifficulty == Enums.Difficulty.HARD || requestedDifficulty == Enums.Difficulty.EXPERT) {
                    resolvedDifficulty = Enums.Difficulty.MEDIUM;
                    reason = "Recommended difficulty adjusted to MEDIUM to help you master core concepts before attempting Hard problems.";
                } else if (requestedDifficulty == Enums.Difficulty.MEDIUM) {
                    resolvedDifficulty = Enums.Difficulty.EASY;
                    reason = "Difficulty adjusted to EASY. Focus on logic flow correctness and simple edge cases first.";
                }
            }
        }

        List<InterviewQuestion> matches = questionRepository.findByDifficulty(resolvedDifficulty);
        if (matches.isEmpty()) {
            // Fallback: fetch all and pick one
            matches = questionRepository.findAll();
        }

        InterviewQuestion selected = matches.isEmpty() ? null : matches.get(random.nextInt(matches.size()));
        return new QuestionRecommendation(selected, reason);
    }
}
