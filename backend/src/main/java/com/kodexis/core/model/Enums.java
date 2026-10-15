package com.kodexis.core.model;

public class Enums {
    
    public enum Role {
        ROLE_CANDIDATE,
        ROLE_ADMIN
    }

    public enum SessionState {
        WAITING,
        PROBLEM_PRESENTED,
        DISCUSSION,
        PLANNING,
        CODING,
        EXECUTION,
        DEBUGGING,
        SUBMISSION,
        FOLLOW_UP,
        ASSESSMENT,
        REPORT
    }

    public enum Language {
        JAVA,
        PYTHON,
        CPP,
        JAVASCRIPT,
        C,
        CSHARP,
        GO
    }

    public enum Difficulty {
        BEGINNER,
        EASY,
        MEDIUM,
        HARD,
        EXPERT
    }

    public enum SkillLevel {
        WEAK,
        DEVELOPING,
        INTERMEDIATE,
        STRONG,
        EXPERT
    }

    public enum ExecutionResultStatus {
        SUCCESS,
        WRONG_ANSWER,
        COMPILE_ERROR,
        RUNTIME_ERROR,
        TIMEOUT,
        LIMIT_EXCEEDED
    }
}
