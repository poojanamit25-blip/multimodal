package com.kodexis.core.learning.service;

import com.kodexis.core.learning.model.CourseTopic;
import com.kodexis.core.learning.model.LearnerMastery;
import com.kodexis.core.learning.model.StudySchedule;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class StudySchedulePlannerService {

    private final KnowledgeIngestionService ingestionService;
    private final BayesianKnowledgeTracingService bktService;

    @Autowired
    public StudySchedulePlannerService(KnowledgeIngestionService ingestionService, BayesianKnowledgeTracingService bktService) {
        this.ingestionService = ingestionService;
        this.bktService = bktService;
    }

    public StudySchedule generateAdaptiveSchedule(String userId, String examName, int daysUntilExam) {
        int days = daysUntilExam > 0 ? daysUntilExam : 14;
        String exam = (examName != null && !examName.trim().isEmpty()) ? examName : "Technical Systems & Algorithms Core Assessment";

        StudySchedule schedule = new StudySchedule();
        schedule.setExamName(exam);
        schedule.setDaysRemainingUntilExam(days);

        LearnerMastery mastery = bktService.getOrCreateLearnerMastery(userId);

        // Compute current overall mastery
        List<CourseTopic> topics = ingestionService.getAllTopics();
        double avgMastery = topics.stream()
                .mapToDouble(t -> mastery.getTopicMastery().getOrDefault(t.getId(), 0.20))
                .average()
                .orElse(0.20);
        schedule.setCurrentOverallMastery(Math.round(avgMastery * 100.0) / 100.0);

        // Sort topics ascending by mastery (weakest first)
        List<CourseTopic> sortedTopics = topics.stream()
                .sorted(Comparator.comparingDouble(t -> mastery.getTopicMastery().getOrDefault(t.getId(), 0.20)))
                .collect(Collectors.toList());

        if (sortedTopics.isEmpty()) {
            CourseTopic fallback = new CourseTopic("topic-core-cs", "Core Algorithms & Data Structures", "Core technical interview preparation curriculum", "Computer Science", 10);
            fallback.getSubtopics().addAll(Arrays.asList("Algorithmic Complexity", "Hash Maps & Pointers", "Trees & Dynamic Programming", "System Architecture"));
            sortedTopics.add(fallback);
        }

        // 1. Generate Ebbinghaus Forgetting Curves (R = e^(-t/S))
        List<StudySchedule.ForgettingCurveDataPoint> curve = new ArrayList<>();
        double s0 = 2.5; // Initial memory stability without review (in days)
        double currentOptimizedStability = 3.0;

        for (int d = 0; d <= days; d++) {
            // Baseline passive retention: steep decay
            double baselineRetention = Math.exp(-((double) d) / s0);

            // Spaced review booster days
            if (d == 1 || d == 3 || d == 7 || d == 11) {
                currentOptimizedStability *= 2.2;
            }
            double reviewDaysSinceLast = (d <= 1) ? d : (d <= 3 ? d - 1 : (d <= 7 ? d - 3 : d - 7));
            double optimizedRetention = Math.min(1.0, 0.96 * Math.exp(-((double) reviewDaysSinceLast) / currentOptimizedStability) + 0.08);

            curve.add(new StudySchedule.ForgettingCurveDataPoint(
                    d,
                    Math.round(baselineRetention * 100.0) / 100.0,
                    Math.round(Math.min(1.0, optimizedRetention) * 100.0) / 100.0
            ));
        }
        schedule.setRetentionCurve(curve);
        schedule.setProjectedExamDayRetention(curve.get(curve.size() - 1).getOptimizedRetentionWithSpacedReview());

        // 2. Generate Day-by-Day Study Milestones
        LocalDate startDate = LocalDate.now();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM dd");

        String[] formats = new String[]{"FLASHCARDS", "ADAPTIVE_QUIZ", "AUDIO_BRIEF", "SLIDE_REVIEW"};

        for (int i = 1; i <= days; i++) {
            CourseTopic focusTopic = sortedTopics.get((i - 1) % sortedTopics.size());
            double topicMastery = mastery.getTopicMastery().getOrDefault(focusTopic.getId(), 0.20);

            StudySchedule.DailyStudyPlan plan = new StudySchedule.DailyStudyPlan();
            plan.setDayNumber(i);
            plan.setDateString(startDate.plusDays(i - 1).format(fmt));
            plan.setFocusTopic(focusTopic.getName());
            plan.setFocusTopicCategory(focusTopic.getCategory());
            plan.setCurrentMastery(Math.round(topicMastery * 100.0) / 100.0);
            plan.setEstimatedMinutes(topicMastery < 0.50 ? 45 : 30);
            plan.setRecommendedFormat(formats[(i - 1) % formats.length]);
            plan.getHighYieldConcepts().addAll(focusTopic.getSubtopics());

            schedule.getDailyPlans().add(plan);
        }

        return schedule;
    }
}
