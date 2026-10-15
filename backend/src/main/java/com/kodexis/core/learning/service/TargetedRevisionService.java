package com.kodexis.core.learning.service;

import com.kodexis.core.learning.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class TargetedRevisionService {

    private final KnowledgeIngestionService ingestionService;
    private final BayesianKnowledgeTracingService bktService;

    @Autowired
    public TargetedRevisionService(KnowledgeIngestionService ingestionService, BayesianKnowledgeTracingService bktService) {
        this.ingestionService = ingestionService;
        this.bktService = bktService;
    }

    public static class RevisionPack {
        private String userId;
        private List<String> weakTopicNames = new ArrayList<>();
        private List<Flashcard> flashcards = new ArrayList<>();
        private List<SlideSummary> slideSummaries = new ArrayList<>();
        private List<AudioBrief> audioBriefs = new ArrayList<>();

        public RevisionPack() {}

        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }

        public List<String> getWeakTopicNames() { return weakTopicNames; }
        public void setWeakTopicNames(List<String> weakTopicNames) { this.weakTopicNames = weakTopicNames; }

        public List<Flashcard> getFlashcards() { return flashcards; }
        public void setFlashcards(List<Flashcard> flashcards) { this.flashcards = flashcards; }

        public List<SlideSummary> getSlideSummaries() { return slideSummaries; }
        public void setSlideSummaries(List<SlideSummary> slideSummaries) { this.slideSummaries = slideSummaries; }

        public List<AudioBrief> getAudioBriefs() { return audioBriefs; }
        public void setAudioBriefs(List<AudioBrief> audioBriefs) { this.audioBriefs = audioBriefs; }
    }

    public static class SlideSummary {
        private String topicName;
        private String title;
        private String sourceCitation;
        private List<String> keyBulletPoints = new ArrayList<>();
        private String diagramCaption;
        private String visualDataUrl;

        public SlideSummary() {}

        public String getTopicName() { return topicName; }
        public void setTopicName(String topicName) { this.topicName = topicName; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getSourceCitation() { return sourceCitation; }
        public void setSourceCitation(String sourceCitation) { this.sourceCitation = sourceCitation; }

        public List<String> getKeyBulletPoints() { return keyBulletPoints; }
        public void setKeyBulletPoints(List<String> keyBulletPoints) { this.keyBulletPoints = keyBulletPoints; }

        public String getDiagramCaption() { return diagramCaption; }
        public void setDiagramCaption(String diagramCaption) { this.diagramCaption = diagramCaption; }

        public String getVisualDataUrl() { return visualDataUrl; }
        public void setVisualDataUrl(String visualDataUrl) { this.visualDataUrl = visualDataUrl; }
    }

    public static class AudioBrief {
        private String id;
        private String topicName;
        private String title;
        private String durationFormatted;
        private String transcript;
        private String sourceCitation;

        public AudioBrief() {}

        public AudioBrief(String id, String topicName, String title, String durationFormatted, String transcript, String sourceCitation) {
            this.id = id;
            this.topicName = topicName;
            this.title = title;
            this.durationFormatted = durationFormatted;
            this.transcript = transcript;
            this.sourceCitation = sourceCitation;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getTopicName() { return topicName; }
        public void setTopicName(String topicName) { this.topicName = topicName; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDurationFormatted() { return durationFormatted; }
        public void setDurationFormatted(String durationFormatted) { this.durationFormatted = durationFormatted; }

        public String getTranscript() { return transcript; }
        public void setTranscript(String transcript) { this.transcript = transcript; }

        public String getSourceCitation() { return sourceCitation; }
        public void setSourceCitation(String sourceCitation) { this.sourceCitation = sourceCitation; }
    }

    public RevisionPack generateTargetedRevision(String userId) {
        RevisionPack pack = new RevisionPack();
        pack.setUserId(userId);

        LearnerMastery mastery = bktService.getOrCreateLearnerMastery(userId);

        // Find weak topics (mastery < 0.65) or default to bottom topics
        List<CourseTopic> allTopics = ingestionService.getAllTopics();
        List<CourseTopic> sortedByWeakness = allTopics.stream()
                .sorted(Comparator.comparingDouble(t -> mastery.getTopicMastery().getOrDefault(t.getId(), 0.20)))
                .collect(Collectors.toList());

        List<CourseTopic> targetTopics = sortedByWeakness.stream().limit(3).collect(Collectors.toList());
        pack.setWeakTopicNames(targetTopics.stream().map(CourseTopic::getName).collect(Collectors.toList()));

        // 1. Generate Flashcards for weak concepts
        for (CourseTopic topic : targetTopics) {
            List<MultimodalContentUnit> units = ingestionService.getContentUnitsForTopic(topic.getId());
            for (MultimodalContentUnit unit : units) {
                Flashcard fc = new Flashcard(
                        "fc-" + UUID.randomUUID().toString().substring(0, 8),
                        topic.getId(),
                        topic.getName(),
                        unit.getSubtopic(),
                        "Explain the operational mechanism of " + unit.getSubtopic() + " and its primary safety invariant.",
                        unit.getTextSnippet().split("\\.")[0] + ". " + (unit.getTextSnippet().split("\\.").length > 1 ? unit.getTextSnippet().split("\\.")[1] : ""),
                        unit.isHasVisualFigure() ? unit.getFigureTitle() : "Invariant Check",
                        unit.getCitationReference()
                );
                pack.getFlashcards().add(fc);

                // 2. Generate Slide Summaries
                SlideSummary ss = new SlideSummary();
                ss.setTopicName(topic.getName());
                ss.setTitle(unit.getTitle());
                ss.setSourceCitation(unit.getCitationReference());
                ss.getKeyBulletPoints().add("Core Principle: " + unit.getTextSnippet().split("\\.")[0] + ".");
                if (unit.isHasVisualFigure()) {
                    ss.getKeyBulletPoints().add("Visual Finding: " + unit.getFigureDescription());
                    ss.setDiagramCaption(unit.getFigureCaption());
                    ss.setVisualDataUrl(unit.getVisualDataUrl());
                }
                pack.getSlideSummaries().add(ss);

                // 3. Generate Audio Briefs (Requirement 6b)
                AudioBrief brief = new AudioBrief(
                        "audio-" + UUID.randomUUID().toString().substring(0, 8),
                        topic.getName(),
                        "60-Second Audio Revision: " + unit.getSubtopic(),
                        "01:15",
                        "Welcome to your KODEXIS Audio Brief. Today we review " + unit.getSubtopic() + " from " + unit.getDocumentName() + ". " +
                        unit.getTextSnippet() + " Remember: this citation is officially anchored at " + unit.getCitationReference() + ". Keep this invariant in mind for your upcoming mock exam.",
                        unit.getCitationReference()
                );
                pack.getAudioBriefs().add(brief);
            }
        }

        return pack;
    }
}
