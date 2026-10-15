package com.kodexis.core.learning.service;

import com.kodexis.core.learning.model.StudyCalendarEvent;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class StudyCalendarService {

    private final Map<String, List<StudyCalendarEvent>> userEventsMap = new ConcurrentHashMap<>();
    private static final DateTimeFormatter ISO_DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public StudyCalendarService() {
        // Default seed events will be initialized on first request per user
    }

    public synchronized List<StudyCalendarEvent> getEventsForUser(String userId) {
        String uid = (userId != null && !userId.trim().isEmpty()) ? userId : "guest_student";
        if (!userEventsMap.containsKey(uid) || userEventsMap.get(uid).isEmpty()) {
            initSampleEvents(uid);
        }
        return new ArrayList<>(userEventsMap.getOrDefault(uid, new ArrayList<>()));
    }

    public synchronized List<StudyCalendarEvent> getEventsForDate(String userId, String date) {
        return getEventsForUser(userId).stream()
                .filter(e -> date != null && date.equals(e.getDate()))
                .collect(Collectors.toList());
    }

    public synchronized StudyCalendarEvent createEvent(String userId, StudyCalendarEvent event) {
        String uid = (userId != null && !userId.trim().isEmpty()) ? userId : "guest_student";
        List<StudyCalendarEvent> list = userEventsMap.computeIfAbsent(uid, k -> new ArrayList<>());

        if (event.getId() == null || event.getId().trim().isEmpty()) {
            event.setId(UUID.randomUUID().toString());
        }
        event.setUserId(uid);
        if (event.getCreatedAt() == 0) {
            event.setCreatedAt(System.currentTimeMillis());
        }
        if (event.getDate() == null || event.getDate().trim().isEmpty()) {
            event.setDate(LocalDate.now().format(ISO_DATE_FMT));
        }

        list.add(event);
        return event;
    }

    public synchronized StudyCalendarEvent updateEvent(String userId, String eventId, StudyCalendarEvent updated) {
        String uid = (userId != null && !userId.trim().isEmpty()) ? userId : "guest_student";
        List<StudyCalendarEvent> list = userEventsMap.computeIfAbsent(uid, k -> new ArrayList<>());

        for (int i = 0; i < list.size(); i++) {
            StudyCalendarEvent cur = list.get(i);
            if (cur.getId().equals(eventId)) {
                if (updated.getTitle() != null) cur.setTitle(updated.getTitle());
                if (updated.getDate() != null) cur.setDate(updated.getDate());
                if (updated.getTime() != null) cur.setTime(updated.getTime());
                if (updated.getDurationMinutes() > 0) cur.setDurationMinutes(updated.getDurationMinutes());
                if (updated.getType() != null) cur.setType(updated.getType());
                if (updated.getPriority() != null) cur.setPriority(updated.getPriority());
                if (updated.getConcepts() != null) cur.setConcepts(updated.getConcepts());
                if (updated.getNotes() != null) cur.setNotes(updated.getNotes());
                cur.setCompleted(updated.isCompleted());
                return cur;
            }
        }
        // If not found, create it
        updated.setId(eventId);
        return createEvent(uid, updated);
    }

    public synchronized boolean deleteEvent(String userId, String eventId) {
        String uid = (userId != null && !userId.trim().isEmpty()) ? userId : "guest_student";
        List<StudyCalendarEvent> list = userEventsMap.get(uid);
        if (list == null) return false;
        return list.removeIf(e -> e.getId().equals(eventId));
    }

    public synchronized StudyCalendarEvent toggleComplete(String userId, String eventId) {
        String uid = (userId != null && !userId.trim().isEmpty()) ? userId : "guest_student";
        List<StudyCalendarEvent> list = userEventsMap.computeIfAbsent(uid, k -> new ArrayList<>());
        for (StudyCalendarEvent cur : list) {
            if (cur.getId().equals(eventId)) {
                cur.setCompleted(!cur.isCompleted());
                return cur;
            }
        }
        return null;
    }

    private void initSampleEvents(String userId) {
        List<StudyCalendarEvent> sampleList = new ArrayList<>();
        LocalDate today = LocalDate.now();

        // Event 1: Today
        StudyCalendarEvent e1 = new StudyCalendarEvent(
                "Core Algorithm Review: Hash Maps & Two Pointers",
                today.format(ISO_DATE_FMT),
                "09:30 AM",
                45,
                "STUDY_SESSION",
                "HIGH",
                Arrays.asList("Two Pointers", "Hash Set Deduplication", "Time Complexity O(N)"),
                "Master two sum variants and pointer convergence logic before the mock interview."
        );
        e1.setUserId(userId);
        sampleList.add(e1);

        // Event 2: Today afternoon
        StudyCalendarEvent e2 = new StudyCalendarEvent(
                "Adaptive Diagnostic Quiz: Algorithmic Complexity",
                today.format(ISO_DATE_FMT),
                "03:00 PM",
                30,
                "ADAPTIVE_QUIZ",
                "MEDIUM",
                Arrays.asList("Big-O Notation", "Space Complexity", "Recursion Depth"),
                "Complete the 10-question adaptive assessment to establish baseline BKT mastery."
        );
        e2.setUserId(userId);
        sampleList.add(e2);

        // Event 3: Tomorrow
        StudyCalendarEvent e3 = new StudyCalendarEvent(
                "AI Mock Interview: Sliding Window & Substrings",
                today.plusDays(1).format(ISO_DATE_FMT),
                "11:00 AM",
                60,
                "MOCK_INTERVIEW",
                "HIGH",
                Arrays.asList("Sliding Window", "Frequency Map", "Edge Cases"),
                "Two-phase gated interview session. Pass conceptual logic defense first."
        );
        e3.setUserId(userId);
        sampleList.add(e3);

        // Event 4: Day 3
        StudyCalendarEvent e4 = new StudyCalendarEvent(
                "Ebbinghaus Spaced Review: Binary Trees & Traversals",
                today.plusDays(3).format(ISO_DATE_FMT),
                "10:00 AM",
                45,
                "SPACED_REVISION",
                "HIGH",
                Arrays.asList("Inorder Traversal", "Level-order BFS", "Tree Height"),
                "Optimal spacing retention review for Tree structures."
        );
        e4.setUserId(userId);
        sampleList.add(e4);

        // Event 5: Day 5
        StudyCalendarEvent e5 = new StudyCalendarEvent(
                "Flashcard Sprint: Distributed Consensus & CAP Theorem",
                today.plusDays(5).format(ISO_DATE_FMT),
                "02:00 PM",
                25,
                "FLASHCARDS",
                "MEDIUM",
                Arrays.asList("CAP Theorem", "Paxos/Raft", "Eventual Consistency"),
                "High-speed flashcard drill using Leitner spaced intervals."
        );
        e5.setUserId(userId);
        sampleList.add(e5);

        // Event 6: Day 8
        StudyCalendarEvent e6 = new StudyCalendarEvent(
                "Deep Study: Dynamic Programming & Memoization",
                today.plusDays(8).format(ISO_DATE_FMT),
                "04:00 PM",
                90,
                "STUDY_SESSION",
                "HIGH",
                Arrays.asList("Overlapping Subproblems", "Optimal Substructure", "1D/2D Tabulation"),
                "Tackle classic DP: Coin Change, Longest Common Subsequence, Knapsack."
        );
        e6.setUserId(userId);
        sampleList.add(e6);

        // Event 7: Day 12
        StudyCalendarEvent e7 = new StudyCalendarEvent(
                "Full Simulation OA: Timed Company Sandbox",
                today.plusDays(12).format(ISO_DATE_FMT),
                "10:00 AM",
                90,
                "MOCK_INTERVIEW",
                "HIGH",
                Arrays.asList("Hard Algorithms", "Full Test Suite", "Piston Execution"),
                "Simulated OA timed sandbox environment."
        );
        e7.setUserId(userId);
        sampleList.add(e7);

        // Event 8: Day 14
        StudyCalendarEvent e8 = new StudyCalendarEvent(
                "Distributed Systems & Data Structures Final Milestone",
                today.plusDays(14).format(ISO_DATE_FMT),
                "09:00 AM",
                120,
                "EXAM_DEADLINE",
                "HIGH",
                Arrays.asList("Comprehensive Review", "All Topics", "Post-Assessment Report"),
                "Final readiness evaluation. Projected retention target: > 92%."
        );
        e8.setUserId(userId);
        sampleList.add(e8);

        userEventsMap.put(userId, sampleList);
    }
}
