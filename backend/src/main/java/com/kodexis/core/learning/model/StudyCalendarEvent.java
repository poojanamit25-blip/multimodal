package com.kodexis.core.learning.model;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class StudyCalendarEvent {
    private String id;
    private String userId;
    private String title;
    private String date; // YYYY-MM-DD
    private String time; // e.g. "10:00 AM"
    private int durationMinutes;
    private String type; // STUDY_SESSION, MOCK_INTERVIEW, ADAPTIVE_QUIZ, SPACED_REVISION, FLASHCARDS, EXAM_DEADLINE
    private String priority; // HIGH, MEDIUM, LOW
    private List<String> concepts = new ArrayList<>();
    private String notes;
    private boolean completed;
    private long createdAt;

    public StudyCalendarEvent() {
        this.id = UUID.randomUUID().toString();
        this.createdAt = System.currentTimeMillis();
        this.completed = false;
        this.priority = "MEDIUM";
        this.type = "STUDY_SESSION";
        this.durationMinutes = 45;
        this.time = "10:00 AM";
    }

    public StudyCalendarEvent(String title, String date, String time, int durationMinutes, String type, String priority, List<String> concepts, String notes) {
        this();
        this.title = title;
        this.date = date;
        if (time != null && !time.trim().isEmpty()) this.time = time;
        if (durationMinutes > 0) this.durationMinutes = durationMinutes;
        if (type != null && !type.trim().isEmpty()) this.type = type;
        if (priority != null && !priority.trim().isEmpty()) this.priority = priority;
        if (concepts != null) this.concepts = concepts;
        this.notes = notes;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }

    public int getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(int durationMinutes) { this.durationMinutes = durationMinutes; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public List<String> getConcepts() { return concepts; }
    public void setConcepts(List<String> concepts) { this.concepts = concepts; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }

    public long getCreatedAt() { return createdAt; }
    public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
}
