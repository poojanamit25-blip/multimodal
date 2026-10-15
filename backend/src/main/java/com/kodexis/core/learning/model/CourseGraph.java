package com.kodexis.core.learning.model;

import java.util.ArrayList;
import java.util.List;

public class CourseGraph {
    private List<GraphNode> nodes = new ArrayList<>();
    private List<GraphEdge> edges = new ArrayList<>();

    public static class GraphNode {
        private String id;
        private String label;
        private String category;
        private String type; // "TOPIC" or "CONCEPT"
        private double mastery; // 0.0 to 1.0
        private String status; // "LOCKED", "IN_PROGRESS", "MASTERED"
        private int x; // Layout coordinates for visual flow map
        private int y;
        private int estimatedMinutes;
        private int unitCount;

        public GraphNode() {}

        public GraphNode(String id, String label, String category, String type, double mastery, String status, int x, int y) {
            this.id = id;
            this.label = label;
            this.category = category;
            this.type = type;
            this.mastery = mastery;
            this.status = status;
            this.x = x;
            this.y = y;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public double getMastery() { return mastery; }
        public void setMastery(double mastery) { this.mastery = mastery; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public int getX() { return x; }
        public void setX(int x) { this.x = x; }

        public int getY() { return y; }
        public void setY(int y) { this.y = y; }

        public int getEstimatedMinutes() { return estimatedMinutes; }
        public void setEstimatedMinutes(int estimatedMinutes) { this.estimatedMinutes = estimatedMinutes; }

        public int getUnitCount() { return unitCount; }
        public void setUnitCount(int unitCount) { this.unitCount = unitCount; }
    }

    public static class GraphEdge {
        private String id;
        private String source;
        private String target;
        private String relationship; // "PREREQUISITE_FOR"

        public GraphEdge() {}

        public GraphEdge(String id, String source, String target, String relationship) {
            this.id = id;
            this.source = source;
            this.target = target;
            this.relationship = relationship;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getSource() { return source; }
        public void setSource(String source) { this.source = source; }

        public String getTarget() { return target; }
        public void setTarget(String target) { this.target = target; }

        public String getRelationship() { return relationship; }
        public void setRelationship(String relationship) { this.relationship = relationship; }
    }

    public CourseGraph() {}

    public List<GraphNode> getNodes() { return nodes; }
    public void setNodes(List<GraphNode> nodes) { this.nodes = nodes; }

    public List<GraphEdge> getEdges() { return edges; }
    public void setEdges(List<GraphEdge> edges) { this.edges = edges; }
}
