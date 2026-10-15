package com.kodexis.core.learning.model;

import java.util.ArrayList;
import java.util.List;

public class MultimodalContentUnit {
    public enum SourceType {
        VIDEO,
        SLIDE,
        TEXTBOOK
    }

    private String id;
    private String title;
    private SourceType sourceType;
    private String documentName;
    private String topicId;
    private String topicName;
    private String subtopic;
    private List<String> conceptIds = new ArrayList<>();
    private List<String> conceptNames = new ArrayList<>();

    // Origin Location
    private Integer pageNumber; // for textbooks
    private Integer slideNumber; // for slide decks
    private Integer videoTimestampSeconds; // for lecture videos (e.g. 245 = 04:05)
    private String videoDuration; // formatted string "04:05"
    private String videoUrl; // embedded / simulated URL

    // Content Body
    private String textSnippet;
    private String ocrExtractedText;

    // Visual & Diagram Metadata (Requirement 1d)
    private boolean hasVisualFigure;
    private String figureTitle;
    private String figureCaption;
    private String diagramType; // "ARCHITECTURE_DIAGRAM", "FLOWCHART", "STATE_MACHINE", "PLOT", "TREE"
    private String figureDescription; // Detailed semantic visual explanation extracted from diagram
    private String visualDataUrl; // SVG or data URL preview

    public MultimodalContentUnit() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public SourceType getSourceType() { return sourceType; }
    public void setSourceType(SourceType sourceType) { this.sourceType = sourceType; }

    public String getDocumentName() { return documentName; }
    public void setDocumentName(String documentName) { this.documentName = documentName; }

    public String getTopicId() { return topicId; }
    public void setTopicId(String topicId) { this.topicId = topicId; }

    public String getTopicName() { return topicName; }
    public void setTopicName(String topicName) { this.topicName = topicName; }

    public String getSubtopic() { return subtopic; }
    public void setSubtopic(String subtopic) { this.subtopic = subtopic; }

    public List<String> getConceptIds() { return conceptIds; }
    public void setConceptIds(List<String> conceptIds) { this.conceptIds = conceptIds; }

    public List<String> getConceptNames() { return conceptNames; }
    public void setConceptNames(List<String> conceptNames) { this.conceptNames = conceptNames; }

    public Integer getPageNumber() { return pageNumber; }
    public void setPageNumber(Integer pageNumber) { this.pageNumber = pageNumber; }

    public Integer getSlideNumber() { return slideNumber; }
    public void setSlideNumber(Integer slideNumber) { this.slideNumber = slideNumber; }

    public Integer getVideoTimestampSeconds() { return videoTimestampSeconds; }
    public void setVideoTimestampSeconds(Integer videoTimestampSeconds) { 
        this.videoTimestampSeconds = videoTimestampSeconds; 
        if (videoTimestampSeconds != null) {
            int mins = videoTimestampSeconds / 60;
            int secs = videoTimestampSeconds % 60;
            this.videoDuration = String.format("%02d:%02d", mins, secs);
        }
    }

    public String getVideoDuration() { return videoDuration; }
    public void setVideoDuration(String videoDuration) { this.videoDuration = videoDuration; }

    public String getVideoUrl() { return videoUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }

    public String getTextSnippet() { return textSnippet; }
    public void setTextSnippet(String textSnippet) { this.textSnippet = textSnippet; }

    public String getOcrExtractedText() { return ocrExtractedText; }
    public void setOcrExtractedText(String ocrExtractedText) { this.ocrExtractedText = ocrExtractedText; }

    public boolean isHasVisualFigure() { return hasVisualFigure; }
    public void setHasVisualFigure(boolean hasVisualFigure) { this.hasVisualFigure = hasVisualFigure; }

    public String getFigureTitle() { return figureTitle; }
    public void setFigureTitle(String figureTitle) { this.figureTitle = figureTitle; }

    public String getFigureCaption() { return figureCaption; }
    public void setFigureCaption(String figureCaption) { this.figureCaption = figureCaption; }

    public String getDiagramType() { return diagramType; }
    public void setDiagramType(String diagramType) { this.diagramType = diagramType; }

    public String getFigureDescription() { return figureDescription; }
    public void setFigureDescription(String figureDescription) { this.figureDescription = figureDescription; }

    public String getVisualDataUrl() { return visualDataUrl; }
    public void setVisualDataUrl(String visualDataUrl) { this.visualDataUrl = visualDataUrl; }

    public String getCitationReference() {
        if (sourceType == SourceType.SLIDE && slideNumber != null) {
            return String.format("[%s - Slide %d]", documentName, slideNumber);
        } else if (sourceType == SourceType.TEXTBOOK && pageNumber != null) {
            return String.format("[%s - Page %d]", documentName, pageNumber);
        } else if (sourceType == SourceType.VIDEO && videoDuration != null) {
            return String.format("[%s @ %s]", documentName, videoDuration);
        }
        return String.format("[%s]", documentName);
    }
}
