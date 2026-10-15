package com.kodexis.core.learning.model;

import java.util.ArrayList;
import java.util.List;

public class CourseTopic {
    private String id;
    private String name;
    private String description;
    private List<String> subtopics = new ArrayList<>();
    private List<String> prerequisiteTopicIds = new ArrayList<>();
    private String category; // e.g., "Distributed Systems", "Algorithms", "Machine Learning"
    private int estimatedHours;

    public CourseTopic() {}

    public CourseTopic(String id, String name, String description, String category, int estimatedHours) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.category = category;
        this.estimatedHours = estimatedHours;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<String> getSubtopics() { return subtopics; }
    public void setSubtopics(List<String> subtopics) { this.subtopics = subtopics; }

    public List<String> getPrerequisiteTopicIds() { return prerequisiteTopicIds; }
    public void setPrerequisiteTopicIds(List<String> prerequisiteTopicIds) { this.prerequisiteTopicIds = prerequisiteTopicIds; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public int getEstimatedHours() { return estimatedHours; }
    public void setEstimatedHours(int estimatedHours) { this.estimatedHours = estimatedHours; }
}
