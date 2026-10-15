package com.kodexis.core.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "interview_questions")
public class InterviewQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 4000, nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Enums.Difficulty difficulty;

    @Column(nullable = false)
    private String topic;

    @Column(name = "expected_time_complexity")
    private String expectedTimeComplexity;

    @Column(name = "expected_space_complexity")
    private String expectedSpaceComplexity;

    @Column(name = "optimal_solution_concept", length = 2000)
    private String optimalSolutionConcept;

    // Boilerplates
    @Column(name = "java_template", length = 2000)
    private String javaTemplate;

    @Column(name = "python_template", length = 2000)
    private String pythonTemplate;

    @Column(name = "javascript_template", length = 2000)
    private String javascriptTemplate;

    @Column(name = "cpp_template", length = 2000)
    private String cppTemplate;

    @Column(name = "c_template", length = 2000)
    private String cTemplate;

    @Column(name = "csharp_template", length = 2000)
    private String csharpTemplate;

    @Column(name = "go_template", length = 2000)
    private String goTemplate;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<TestCase> testCases = new ArrayList<>();

    public InterviewQuestion() {}

    public InterviewQuestion(String title, String description, Enums.Difficulty difficulty, String topic) {
        this.title = title;
        this.description = description;
        this.difficulty = difficulty;
        this.topic = topic;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Enums.Difficulty getDifficulty() { return difficulty; }
    public void setDifficulty(Enums.Difficulty difficulty) { this.difficulty = difficulty; }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public String getExpectedTimeComplexity() { return expectedTimeComplexity; }
    public void setExpectedTimeComplexity(String expectedTimeComplexity) { this.expectedTimeComplexity = expectedTimeComplexity; }

    public String getExpectedSpaceComplexity() { return expectedSpaceComplexity; }
    public void setExpectedSpaceComplexity(String expectedSpaceComplexity) { this.expectedSpaceComplexity = expectedSpaceComplexity; }

    public String getOptimalSolutionConcept() { return optimalSolutionConcept; }
    public void setOptimalSolutionConcept(String optimalSolutionConcept) { this.optimalSolutionConcept = optimalSolutionConcept; }

    public String getJavaTemplate() { return javaTemplate; }
    public void setJavaTemplate(String javaTemplate) { this.javaTemplate = javaTemplate; }

    public String getPythonTemplate() { return pythonTemplate; }
    public void setPythonTemplate(String pythonTemplate) { this.pythonTemplate = pythonTemplate; }

    public String getJavascriptTemplate() { return javascriptTemplate; }
    public void setJavascriptTemplate(String javascriptTemplate) { this.javascriptTemplate = javascriptTemplate; }

    public String getCppTemplate() { return cppTemplate; }
    public void setCppTemplate(String cppTemplate) { this.cppTemplate = cppTemplate; }

    public String getCTemplate() { return cTemplate; }
    public void setCTemplate(String cTemplate) { this.cTemplate = cTemplate; }

    public String getCsharpTemplate() { return csharpTemplate; }
    public void setCsharpTemplate(String csharpTemplate) { this.csharpTemplate = csharpTemplate; }

    public String getGoTemplate() { return goTemplate; }
    public void setGoTemplate(String goTemplate) { this.goTemplate = goTemplate; }

    public List<TestCase> getTestCases() { return testCases; }
    public void setTestCases(List<TestCase> testCases) { this.testCases = testCases; }

    public void addTestCase(TestCase testCase) {
        testCases.add(testCase);
        testCase.setQuestion(this);
    }
}
