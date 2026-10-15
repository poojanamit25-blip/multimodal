package com.kodexis.core.learning.model;

import java.util.ArrayList;
import java.util.List;

public class SimulationCohortReport {
    private int totalSimulatedStudents;
    private int sessionsPerStudent;
    private double overallMasteryGainAverage; // e.g. +48.5%
    private double questionRepetitionRate; // e.g. 0.0%
    private long totalQuestionsAnswered;
    private List<StudentProfileSimulation> studentSimulations = new ArrayList<>();

    public static class StudentProfileSimulation {
        private String profileName; // "Rapid Learner", "Struggling Learner", "Inconsistent / Guessing", "Steady Learner"
        private String personaDescription;
        private double baselineMastery;
        private double finalMastery;
        private double masteryGain;
        private int totalAttempts;
        private int uniqueQuestionsSeen;
        private int repeatedQuestionsCount;
        private double repetitionRatePercentage;
        private List<Double> sessionMasteryTrajectory = new ArrayList<>();

        public StudentProfileSimulation() {}

        public String getProfileName() { return profileName; }
        public void setProfileName(String profileName) { this.profileName = profileName; }

        public String getPersonaDescription() { return personaDescription; }
        public void setPersonaDescription(String personaDescription) { this.personaDescription = personaDescription; }

        public double getBaselineMastery() { return baselineMastery; }
        public void setBaselineMastery(double baselineMastery) { this.baselineMastery = baselineMastery; }

        public double getFinalMastery() { return finalMastery; }
        public void setFinalMastery(double finalMastery) { this.finalMastery = finalMastery; }

        public double getMasteryGain() { return masteryGain; }
        public void setMasteryGain(double masteryGain) { this.masteryGain = masteryGain; }

        public int getTotalAttempts() { return totalAttempts; }
        public void setTotalAttempts(int totalAttempts) { this.totalAttempts = totalAttempts; }

        public int getUniqueQuestionsSeen() { return uniqueQuestionsSeen; }
        public void setUniqueQuestionsSeen(int uniqueQuestionsSeen) { this.uniqueQuestionsSeen = uniqueQuestionsSeen; }

        public int getRepeatedQuestionsCount() { return repeatedQuestionsCount; }
        public void setRepeatedQuestionsCount(int repeatedQuestionsCount) { this.repeatedQuestionsCount = repeatedQuestionsCount; }

        public double getRepetitionRatePercentage() { return repetitionRatePercentage; }
        public void setRepetitionRatePercentage(double repetitionRatePercentage) { this.repetitionRatePercentage = repetitionRatePercentage; }

        public List<Double> getSessionMasteryTrajectory() { return sessionMasteryTrajectory; }
        public void setSessionMasteryTrajectory(List<Double> sessionMasteryTrajectory) { this.sessionMasteryTrajectory = sessionMasteryTrajectory; }
    }

    public SimulationCohortReport() {}

    public int getTotalSimulatedStudents() { return totalSimulatedStudents; }
    public void setTotalSimulatedStudents(int totalSimulatedStudents) { this.totalSimulatedStudents = totalSimulatedStudents; }

    public int getSessionsPerStudent() { return sessionsPerStudent; }
    public void setSessionsPerStudent(int sessionsPerStudent) { this.sessionsPerStudent = sessionsPerStudent; }

    public double getOverallMasteryGainAverage() { return overallMasteryGainAverage; }
    public void setOverallMasteryGainAverage(double overallMasteryGainAverage) { this.overallMasteryGainAverage = overallMasteryGainAverage; }

    public double getQuestionRepetitionRate() { return questionRepetitionRate; }
    public void setQuestionRepetitionRate(double questionRepetitionRate) { this.questionRepetitionRate = questionRepetitionRate; }

    public long getTotalQuestionsAnswered() { return totalQuestionsAnswered; }
    public void setTotalQuestionsAnswered(long totalQuestionsAnswered) { this.totalQuestionsAnswered = totalQuestionsAnswered; }

    public List<StudentProfileSimulation> getStudentSimulations() { return studentSimulations; }
    public void setStudentSimulations(List<StudentProfileSimulation> studentSimulations) { this.studentSimulations = studentSimulations; }
}
