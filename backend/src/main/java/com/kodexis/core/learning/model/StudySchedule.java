package com.kodexis.core.learning.model;

import java.util.ArrayList;
import java.util.List;

public class StudySchedule {
    private String examName;
    private int daysRemainingUntilExam;
    private double currentOverallMastery;
    private double projectedExamDayRetention;
    private List<DailyStudyPlan> dailyPlans = new ArrayList<>();
    private List<ForgettingCurveDataPoint> retentionCurve = new ArrayList<>();

    public static class DailyStudyPlan {
        private int dayNumber;
        private String dateString;
        private String focusTopic;
        private String focusTopicCategory;
        private double currentMastery;
        private int estimatedMinutes;
        private String recommendedFormat; // "FLASHCARDS", "SLIDE_REVIEW", "ADAPTIVE_QUIZ", "AUDIO_BRIEF"
        private List<String> highYieldConcepts = new ArrayList<>();

        public DailyStudyPlan() {}

        public int getDayNumber() { return dayNumber; }
        public void setDayNumber(int dayNumber) { this.dayNumber = dayNumber; }

        public String getDateString() { return dateString; }
        public void setDateString(String dateString) { this.dateString = dateString; }

        public String getFocusTopic() { return focusTopic; }
        public void setFocusTopic(String focusTopic) { this.focusTopic = focusTopic; }

        public String getFocusTopicCategory() { return focusTopicCategory; }
        public void setFocusTopicCategory(String focusTopicCategory) { this.focusTopicCategory = focusTopicCategory; }

        public double getCurrentMastery() { return currentMastery; }
        public void setCurrentMastery(double currentMastery) { this.currentMastery = currentMastery; }

        public int getEstimatedMinutes() { return estimatedMinutes; }
        public void setEstimatedMinutes(int estimatedMinutes) { this.estimatedMinutes = estimatedMinutes; }

        public String getRecommendedFormat() { return recommendedFormat; }
        public void setRecommendedFormat(String recommendedFormat) { this.recommendedFormat = recommendedFormat; }

        public List<String> getHighYieldConcepts() { return highYieldConcepts; }
        public void setHighYieldConcepts(List<String> highYieldConcepts) { this.highYieldConcepts = highYieldConcepts; }
    }

    public static class ForgettingCurveDataPoint {
        private int day;
        private double baselineRetentionWithoutReview; // R = e^(-t/S)
        private double optimizedRetentionWithSpacedReview; // Retention with spaced review milestones

        public ForgettingCurveDataPoint() {}

        public ForgettingCurveDataPoint(int day, double baseline, double optimized) {
            this.day = day;
            this.baselineRetentionWithoutReview = baseline;
            this.optimizedRetentionWithSpacedReview = optimized;
        }

        public int getDay() { return day; }
        public void setDay(int day) { this.day = day; }

        public double getBaselineRetentionWithoutReview() { return baselineRetentionWithoutReview; }
        public void setBaselineRetentionWithoutReview(double baselineRetentionWithoutReview) { this.baselineRetentionWithoutReview = baselineRetentionWithoutReview; }

        public double getOptimizedRetentionWithSpacedReview() { return optimizedRetentionWithSpacedReview; }
        public void setOptimizedRetentionWithSpacedReview(double optimizedRetentionWithSpacedReview) { this.optimizedRetentionWithSpacedReview = optimizedRetentionWithSpacedReview; }
    }

    public StudySchedule() {}

    public String getExamName() { return examName; }
    public void setExamName(String examName) { this.examName = examName; }

    public int getDaysRemainingUntilExam() { return daysRemainingUntilExam; }
    public void setDaysRemainingUntilExam(int daysRemainingUntilExam) { this.daysRemainingUntilExam = daysRemainingUntilExam; }

    public double getCurrentOverallMastery() { return currentOverallMastery; }
    public void setCurrentOverallMastery(double currentOverallMastery) { this.currentOverallMastery = currentOverallMastery; }

    public double getProjectedExamDayRetention() { return projectedExamDayRetention; }
    public void setProjectedExamDayRetention(double projectedExamDayRetention) { this.projectedExamDayRetention = projectedExamDayRetention; }

    public List<DailyStudyPlan> getDailyPlans() { return dailyPlans; }
    public void setDailyPlans(List<DailyStudyPlan> dailyPlans) { this.dailyPlans = dailyPlans; }

    public List<ForgettingCurveDataPoint> getRetentionCurve() { return retentionCurve; }
    public void setRetentionCurve(List<ForgettingCurveDataPoint> retentionCurve) { this.retentionCurve = retentionCurve; }
}
