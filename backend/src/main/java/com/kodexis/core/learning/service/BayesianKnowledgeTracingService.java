package com.kodexis.core.learning.service;

import com.kodexis.core.learning.model.BKTParameters;
import com.kodexis.core.learning.model.Concept;
import com.kodexis.core.learning.model.LearnerMastery;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class BayesianKnowledgeTracingService {

    private final KnowledgeIngestionService ingestionService;
    private final Map<String, LearnerMastery> learnerStores = new ConcurrentHashMap<>();
    private final BKTParameters defaultBktParams = new BKTParameters(0.20, 0.15, 0.10, 0.20);

    @Autowired
    public BayesianKnowledgeTracingService(KnowledgeIngestionService ingestionService) {
        this.ingestionService = ingestionService;
    }

    public LearnerMastery getOrCreateLearnerMastery(String userId) {
        return learnerStores.computeIfAbsent(userId, id -> {
            LearnerMastery mastery = new LearnerMastery(id);
            // Initialize baseline mastery from BKT prior for all topics
            ingestionService.getAllTopics().forEach(topic -> {
                mastery.getTopicMastery().put(topic.getId(), defaultBktParams.getPriorProbability());
                mastery.getTopicOpportunityCount().put(topic.getId(), 0);
                mastery.getTopicCorrectCount().put(topic.getId(), 0);
            });
            ingestionService.getAllConcepts().forEach(concept -> {
                mastery.getConceptMastery().put(concept.getId(), defaultBktParams.getPriorProbability());
            });
            return mastery;
        });
    }

    /**
     * Updates concept and topic mastery using standard Bayesian Knowledge Tracing (Requirement 4a)
     */
    public synchronized double updateBKT(String userId, String topicId, String conceptId, boolean correct) {
        LearnerMastery learner = getOrCreateLearnerMastery(userId);
        learner.setLastActiveTimestamp(System.currentTimeMillis());

        double pS = defaultBktParams.getSlipProbability();
        double pG = defaultBktParams.getGuessProbability();
        double pT = defaultBktParams.getTransitionProbability();

        // 1. Concept level BKT
        double pPrior = learner.getConceptMastery().getOrDefault(conceptId, defaultBktParams.getPriorProbability());
        double pLearnedGivenObs;

        if (correct) {
            // P(L|Correct) = [P(L) * (1 - pS)] / [P(L) * (1 - pS) + (1 - P(L)) * pG]
            double numerator = pPrior * (1.0 - pS);
            double denominator = (pPrior * (1.0 - pS)) + ((1.0 - pPrior) * pG);
            pLearnedGivenObs = denominator > 0 ? (numerator / denominator) : pPrior;
        } else {
            // P(L|Incorrect) = [P(L) * pS] / [P(L) * pS + (1 - P(L)) * (1 - pG)]
            double numerator = pPrior * pS;
            double denominator = (pPrior * pS) + ((1.0 - pPrior) * (1.0 - pG));
            pLearnedGivenObs = denominator > 0 ? (numerator / denominator) : pPrior;
        }

        // Apply transition probability: P(L_t+1) = P(L|Obs) + (1 - P(L|Obs)) * pT
        double pUpdated = pLearnedGivenObs + ((1.0 - pLearnedGivenObs) * pT);
        pUpdated = Math.max(0.05, Math.min(0.99, pUpdated));

        learner.getConceptMastery().put(conceptId, pUpdated);

        // 2. Aggregate to Topic Mastery
        List<Concept> topicConcepts = ingestionService.getConceptsForTopic(topicId);
        double avgConceptMastery = topicConcepts.stream()
                .mapToDouble(c -> learner.getConceptMastery().getOrDefault(c.getId(), defaultBktParams.getPriorProbability()))
                .average()
                .orElse(pUpdated);

        double priorTopicMastery = learner.getTopicMastery().getOrDefault(topicId, defaultBktParams.getPriorProbability());
        learner.getTopicMastery().put(topicId, avgConceptMastery);

        // Update interaction counts
        learner.getTopicOpportunityCount().put(topicId, learner.getTopicOpportunityCount().getOrDefault(topicId, 0) + 1);
        if (correct) {
            learner.getTopicCorrectCount().put(topicId, learner.getTopicCorrectCount().getOrDefault(topicId, 0) + 1);
        }

        // 3. Log event into history
        String topicName = ingestionService.getTopicById(topicId).map(t -> t.getName()).orElse(topicId);
        LearnerMastery.MasteryUpdateEvent event = new LearnerMastery.MasteryUpdateEvent(
                System.currentTimeMillis(), topicId, topicName, conceptId, correct, priorTopicMastery, avgConceptMastery
        );
        learner.getHistory().add(event);

        return avgConceptMastery;
    }

    public Map<String, Double> getTopicMasterySummary(String userId) {
        LearnerMastery mastery = getOrCreateLearnerMastery(userId);
        return new HashMap<>(mastery.getTopicMastery());
    }
}
