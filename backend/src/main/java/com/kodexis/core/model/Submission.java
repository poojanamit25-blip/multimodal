package com.kodexis.core.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "submissions")
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    @JsonIgnore
    private InterviewSession session;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Enums.Language language;

    @Column(name = "passed_cases", nullable = false)
    private int passedCases;

    @Column(name = "total_cases", nullable = false)
    private int totalCases;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Enums.ExecutionResultStatus status;

    @Column(name = "execution_time_ms")
    private Long executionTimeMs = 0L;

    @Column(name = "memory_kb")
    private Long memoryKb = 0L;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "submitted_at", nullable = false)
    private LocalDateTime submittedAt;

    public Submission() {
        this.submittedAt = LocalDateTime.now();
    }

    public Submission(InterviewSession session, String code, Enums.Language language, int passedCases, int totalCases, Enums.ExecutionResultStatus status) {
        this();
        this.session = session;
        this.code = code;
        this.language = language;
        this.passedCases = passedCases;
        this.totalCases = totalCases;
        this.status = status;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public InterviewSession getSession() { return session; }
    public void setSession(InterviewSession session) { this.session = session; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public Enums.Language getLanguage() { return language; }
    public void setLanguage(Enums.Language language) { this.language = language; }

    public int getPassedCases() { return passedCases; }
    public void setPassedCases(int passedCases) { this.passedCases = passedCases; }

    public int getTotalCases() { return totalCases; }
    public void setTotalCases(int totalCases) { this.totalCases = totalCases; }

    public Enums.ExecutionResultStatus getStatus() { return status; }
    public void setStatus(Enums.ExecutionResultStatus status) { this.status = status; }

    public Long getExecutionTimeMs() { return executionTimeMs; }
    public void setExecutionTimeMs(Long executionTimeMs) { this.executionTimeMs = executionTimeMs; }

    public Long getMemoryKb() { return memoryKb; }
    public void setMemoryKb(Long memoryKb) { this.memoryKb = memoryKb; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
}
