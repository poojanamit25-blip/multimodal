package com.kodexis.core.learning.service;

import com.kodexis.core.learning.model.CourseGraph;
import com.kodexis.core.learning.model.CourseTopic;
import com.kodexis.core.learning.model.LearnerMastery;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CourseFlowMapService {

    private final KnowledgeIngestionService ingestionService;
    private final BayesianKnowledgeTracingService bktService;

    @Autowired
    public CourseFlowMapService(KnowledgeIngestionService ingestionService, BayesianKnowledgeTracingService bktService) {
        this.ingestionService = ingestionService;
        this.bktService = bktService;
    }

    public CourseGraph generateCourseFlowMap(String userId) {
        CourseGraph graph = new CourseGraph();
        LearnerMastery mastery = bktService.getOrCreateLearnerMastery(userId);

        List<CourseTopic> topics = ingestionService.getAllTopics();

        // Layout coordinates map (x, y) for interactive DAG presentation
        int[][] positions = new int[][]{
                {100, 100}, // Topic 1 (Consensus)
                {380, 100}, // Topic 2 (Consistency) - depends on 1
                {100, 280}, // Topic 3 (Graphs)
                {380, 280}, // Topic 4 (DP)
                {660, 100}, // Topic 5 (DL Foundations)
                {940, 100}  // Topic 6 (Transformers) - depends on 5
        };

        for (int i = 0; i < topics.size(); i++) {
            CourseTopic topic = topics.get(i);
            double topicMastery = mastery.getTopicMastery().getOrDefault(topic.getId(), 0.20);

            // Determine status based on prerequisites and current mastery
            String status = "AVAILABLE";
            if (topicMastery >= 0.75) {
                status = "MASTERED";
            } else if (!topic.getPrerequisiteTopicIds().isEmpty()) {
                boolean allPrereqsMet = topic.getPrerequisiteTopicIds().stream()
                        .allMatch(prereqId -> mastery.getTopicMastery().getOrDefault(prereqId, 0.0) >= 0.60);
                status = allPrereqsMet ? "IN_PROGRESS" : "LOCKED";
            } else if (topicMastery > 0.30) {
                status = "IN_PROGRESS";
            }

            int[] pos = i < positions.length ? positions[i] : new int[]{100 + (i * 200), 200};
            CourseGraph.GraphNode node = new CourseGraph.GraphNode(
                    topic.getId(),
                    topic.getName(),
                    topic.getCategory(),
                    "TOPIC",
                    Math.round(topicMastery * 100.0) / 100.0,
                    status,
                    pos[0],
                    pos[1]
            );
            node.setEstimatedMinutes(topic.getEstimatedHours() * 60);
            node.setUnitCount(ingestionService.getContentUnitsForTopic(topic.getId()).size());
            graph.getNodes().add(node);

            // Prerequisite Edges
            for (String prereqId : topic.getPrerequisiteTopicIds()) {
                CourseGraph.GraphEdge edge = new CourseGraph.GraphEdge(
                        prereqId + "->" + topic.getId(),
                        prereqId,
                        topic.getId(),
                        "PREREQUISITE_FOR"
                );
                graph.getEdges().add(edge);
            }
        }

        // Add additional pedagogical progression edges
        graph.getEdges().add(new CourseGraph.GraphEdge("topic-algo-graphs->topic-algo-dp", "topic-algo-graphs", "topic-algo-dp", "RECOMMENDED_NEXT"));
        graph.getEdges().add(new CourseGraph.GraphEdge("topic-dist-consistency->topic-dl-foundations", "topic-dist-consistency", "topic-dl-foundations", "INTERDISCIPLINARY"));

        return graph;
    }
}
