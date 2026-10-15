package com.kodexis.core.learning.model;

import java.util.ArrayList;
import java.util.List;

public class Concept {
    private String id;
    private String topicId;
    private String name;
    private String definition;
    private String difficulty; // "BEGINNER", "INTERMEDIATE", "ADVANCED"
    private List<String> prerequisiteConceptIds = new ArrayList<>();
    private List<String> keyFormulasOrRules = new ArrayList<>();

    public Concept() {}

    public Concept(String id, String topicId, String name, String definition, String difficulty) {
        this.id = id;
        this.topicId = topicId;
        this.name = name;
        this.definition = definition;
        this.difficulty = difficulty;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTopicId() { return topicId; }
    public void setTopicId(String topicId) { this.topicId = topicId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDefinition() { return definition; }
    public void setDefinition(String definition) { this.definition = definition; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public List<String> getPrerequisiteConceptIds() { return prerequisiteConceptIds; }
    public void setPrerequisiteConceptIds(List<String> prerequisiteConceptIds) { this.prerequisiteConceptIds = prerequisiteConceptIds; }

    public List<String> getKeyFormulasOrRules() { return keyFormulasOrRules; }
    public void setKeyFormulasOrRules(List<String> keyFormulasOrRules) { this.keyFormulasOrRules = keyFormulasOrRules; }
}
