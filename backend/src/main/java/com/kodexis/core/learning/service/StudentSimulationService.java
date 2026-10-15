package com.kodexis.core.learning.service;

import com.kodexis.core.learning.model.QuizQuestion;
import com.kodexis.core.learning.model.SimulationCohortReport;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class StudentSimulationService {

    private final AdaptiveQuizService quizService;
    private final BayesianKnowledgeTracingService bktService;
    private final QuestionVerificationService verificationService;

    @Autowired
    public StudentSimulationService(AdaptiveQuizService quizService,
                                    BayesianKnowledgeTracingService bktService,
                                    QuestionVerificationService verificationService) {
        this.quizService = quizService;
        this.bktService = bktService;
        this.verificationService = verificationService;
    }

    public SimulationCohortReport runCohortSimulation(int sessionsCount) {
        int sessions = sessionsCount > 0 ? sessionsCount : 8;

        SimulationCohortReport report = new SimulationCohortReport();
        report.setTotalSimulatedStudents(4);
        report.setSessionsPerStudent(sessions);

        List<SimulationCohortReport.StudentProfileSimulation> simulations = new ArrayList<>();
        double totalGains = 0.0;
        long totalAttempts = 0;

        // 1. Rapid Learner
        simulations.add(simulateStudent("sim-student-rapid", "Rapid Acquirer",
                "High baseline comprehension; absorbs concepts rapidly with minimal slips (P(S)=0.05).",
                0.35, 0.90, sessions));

        // 2. Steady Learner
        simulations.add(simulateStudent("sim-student-steady", "Steady Diligent Learner",
                "Average baseline; demonstrates steady, linear mastery progression across continuous review.",
                0.20, 0.75, sessions));

        // 3. Struggling Learner
        simulations.add(simulateStudent("sim-student-struggling", "Struggling Learner",
                "Low initial baseline; exhibits recurring slips and requires multi-stage scaffolding and feedback.",
                0.15, 0.50, sessions));

        // 4. Inconsistent / Guessing Learner
        simulations.add(simulateStudent("sim-student-guessing", "High-Guess Inconsistent Learner",
                "High guess probability (P(G)=0.45); high variance in response accuracy.",
                0.20, 0.60, sessions));

        for (var sim : simulations) {
            totalGains += sim.getMasteryGain();
            totalAttempts += sim.getTotalAttempts();
        }

        report.setOverallMasteryGainAverage(totalGains / simulations.size());
        report.setTotalQuestionsAnswered(totalAttempts);

        // Overall Question Repetition Rate across all student trajectories
        double avgRepetitionRate = simulations.stream()
                .mapToDouble(SimulationCohortReport.StudentProfileSimulation::getRepetitionRatePercentage)
                .average()
                .orElse(0.0);
        report.setQuestionRepetitionRate(avgRepetitionRate);
        report.setStudentSimulations(simulations);

        return report;
    }

    private SimulationCohortReport.StudentProfileSimulation simulateStudent(String studentId, String name,
                                                                          String desc, double baseMastery,
                                                                          double targetCorrectRate, int sessions) {
        // Reset tracking for clean simulation run
        verificationService.resetHistoryForUser(studentId);

        SimulationCohortReport.StudentProfileSimulation sim = new SimulationCohortReport.StudentProfileSimulation();
        sim.setProfileName(name);
        sim.setPersonaDescription(desc);
        sim.setBaselineMastery(baseMastery);

        List<Double> trajectory = new ArrayList<>();
        trajectory.add(baseMastery);

        Set<String> seenHashes = new HashSet<>();
        int repeatedCount = 0;
        int totalQuestions = 0;
        double currentMastery = baseMastery;

        Random random = new Random(studentId.hashCode());

        for (int s = 1; s <= sessions; s++) {
            // Adaptive Quiz Generation using student ID to trigger zero-duplication filter
            List<QuizQuestion> questions = quizService.generateAdaptiveQuiz(studentId, "ALL", null, null, 2);

            for (QuizQuestion q : questions) {
                totalQuestions++;
                if (seenHashes.contains(q.getQuestionHash())) {
                    repeatedCount++;
                } else {
                    seenHashes.add(q.getQuestionHash());
                }

                // Simulate answer based on student profile correct rate
                boolean isCorrect = random.nextDouble() < (targetCorrectRate + (s * 0.02));
                currentMastery = bktService.updateBKT(studentId, q.getTopicId(), q.getConceptId(), isCorrect);
            }
            trajectory.add(Math.round(currentMastery * 100.0) / 100.0);
        }

        sim.setFinalMastery(trajectory.get(trajectory.size() - 1));
        sim.setMasteryGain(Math.round((sim.getFinalMastery() - sim.getBaselineMastery()) * 100.0) / 100.0);
        sim.setTotalAttempts(totalQuestions);
        sim.setUniqueQuestionsSeen(seenHashes.size());
        sim.setRepeatedQuestionsCount(repeatedCount);
        sim.setRepetitionRatePercentage(totalQuestions > 0 ? ((double) repeatedCount / totalQuestions) * 100.0 : 0.0);
        sim.setSessionMasteryTrajectory(trajectory);

        return sim;
    }
}
