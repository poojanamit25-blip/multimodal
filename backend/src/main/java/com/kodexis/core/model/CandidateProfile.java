package com.kodexis.core.model;

import jakarta.persistence.*;

@Entity
@Table(name = "candidate_profiles")
public class CandidateProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "target_role")
    private String targetRole;

    @Column(name = "target_companies")
    private String targetCompanies;

    @Enumerated(EnumType.STRING)
    @Column(name = "experience_level")
    private Enums.Difficulty experienceLevel;

    @Enumerated(EnumType.STRING)
    @Column(name = "preferred_language")
    private Enums.Language preferredLanguage;

    // Skill Matrix Columns
    @Enumerated(EnumType.STRING)
    private Enums.SkillLevel arraysProficiency = Enums.SkillLevel.DEVELOPING;

    @Enumerated(EnumType.STRING)
    private Enums.SkillLevel stringsProficiency = Enums.SkillLevel.DEVELOPING;

    @Enumerated(EnumType.STRING)
    private Enums.SkillLevel hashingProficiency = Enums.SkillLevel.DEVELOPING;

    @Enumerated(EnumType.STRING)
    private Enums.SkillLevel linkedListsProficiency = Enums.SkillLevel.DEVELOPING;

    @Enumerated(EnumType.STRING)
    private Enums.SkillLevel stacksQueuesProficiency = Enums.SkillLevel.DEVELOPING;

    @Enumerated(EnumType.STRING)
    private Enums.SkillLevel treesProficiency = Enums.SkillLevel.DEVELOPING;

    @Enumerated(EnumType.STRING)
    private Enums.SkillLevel graphsProficiency = Enums.SkillLevel.DEVELOPING;

    @Enumerated(EnumType.STRING)
    private Enums.SkillLevel recursionProficiency = Enums.SkillLevel.DEVELOPING;

    @Enumerated(EnumType.STRING)
    private Enums.SkillLevel dynamicProgrammingProficiency = Enums.SkillLevel.DEVELOPING;

    @Enumerated(EnumType.STRING)
    private Enums.SkillLevel greedyProficiency = Enums.SkillLevel.DEVELOPING;

    @Enumerated(EnumType.STRING)
    private Enums.SkillLevel backtrackingProficiency = Enums.SkillLevel.DEVELOPING;

    @Enumerated(EnumType.STRING)
    private Enums.SkillLevel sortingSearchingProficiency = Enums.SkillLevel.DEVELOPING;

    @Enumerated(EnumType.STRING)
    private Enums.SkillLevel systemDesignProficiency = Enums.SkillLevel.DEVELOPING;

    @Column(name = "readiness_score")
    private Integer readinessScore = 50; // Initial default score

    public CandidateProfile() {}

    public CandidateProfile(User user, String fullName) {
        this.user = user;
        this.fullName = fullName;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getTargetRole() { return targetRole; }
    public void setTargetRole(String targetRole) { this.targetRole = targetRole; }

    public String getTargetCompanies() { return targetCompanies; }
    public void setTargetCompanies(String targetCompanies) { this.targetCompanies = targetCompanies; }

    public Enums.Difficulty getExperienceLevel() { return experienceLevel; }
    public void setExperienceLevel(Enums.Difficulty experienceLevel) { this.experienceLevel = experienceLevel; }

    public Enums.Language getPreferredLanguage() { return preferredLanguage; }
    public void setPreferredLanguage(Enums.Language preferredLanguage) { this.preferredLanguage = preferredLanguage; }

    public Enums.SkillLevel getArraysProficiency() { return arraysProficiency; }
    public void setArraysProficiency(Enums.SkillLevel arraysProficiency) { this.arraysProficiency = arraysProficiency; }

    public Enums.SkillLevel getStringsProficiency() { return stringsProficiency; }
    public void setStringsProficiency(Enums.SkillLevel stringsProficiency) { this.stringsProficiency = stringsProficiency; }

    public Enums.SkillLevel getHashingProficiency() { return hashingProficiency; }
    public void setHashingProficiency(Enums.SkillLevel hashingProficiency) { this.hashingProficiency = hashingProficiency; }

    public Enums.SkillLevel getLinkedListsProficiency() { return linkedListsProficiency; }
    public void setLinkedListsProficiency(Enums.SkillLevel linkedListsProficiency) { this.linkedListsProficiency = linkedListsProficiency; }

    public Enums.SkillLevel getStacksQueuesProficiency() { return stacksQueuesProficiency; }
    public void setStacksQueuesProficiency(Enums.SkillLevel stacksQueuesProficiency) { this.stacksQueuesProficiency = stacksQueuesProficiency; }

    public Enums.SkillLevel getTreesProficiency() { return treesProficiency; }
    public void setTreesProficiency(Enums.SkillLevel treesProficiency) { this.treesProficiency = treesProficiency; }

    public Enums.SkillLevel getGraphsProficiency() { return graphsProficiency; }
    public void setGraphsProficiency(Enums.SkillLevel graphsProficiency) { this.graphsProficiency = graphsProficiency; }

    public Enums.SkillLevel getRecursionProficiency() { return recursionProficiency; }
    public void setRecursionProficiency(Enums.SkillLevel recursionProficiency) { this.recursionProficiency = recursionProficiency; }

    public Enums.SkillLevel getDynamicProgrammingProficiency() { return dynamicProgrammingProficiency; }
    public void setDynamicProgrammingProficiency(Enums.SkillLevel dynamicProgrammingProficiency) { this.dynamicProgrammingProficiency = dynamicProgrammingProficiency; }

    public Enums.SkillLevel getGreedyProficiency() { return greedyProficiency; }
    public void setGreedyProficiency(Enums.SkillLevel greedyProficiency) { this.greedyProficiency = greedyProficiency; }

    public Enums.SkillLevel getBacktrackingProficiency() { return backtrackingProficiency; }
    public void setBacktrackingProficiency(Enums.SkillLevel backtrackingProficiency) { this.backtrackingProficiency = backtrackingProficiency; }

    public Enums.SkillLevel getSortingSearchingProficiency() { return sortingSearchingProficiency; }
    public void setSortingSearchingProficiency(Enums.SkillLevel sortingSearchingProficiency) { this.sortingSearchingProficiency = sortingSearchingProficiency; }

    public Enums.SkillLevel getSystemDesignProficiency() { return systemDesignProficiency; }
    public void setSystemDesignProficiency(Enums.SkillLevel systemDesignProficiency) { this.systemDesignProficiency = systemDesignProficiency; }

    public Integer getReadinessScore() { return readinessScore; }
    public void setReadinessScore(Integer readinessScore) { this.readinessScore = readinessScore; }
}
