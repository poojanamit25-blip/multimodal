package com.kodexis.core.learning.model;

public class Citation {
    private String contentUnitId;
    private String citationLabel; // e.g. "[Distributed Systems Slide 14]"
    private String documentName;
    private MultimodalContentUnit.SourceType sourceType;
    private Integer pageNumber;
    private Integer slideNumber;
    private Integer videoTimestampSeconds;
    private String videoDuration;
    private String excerpt;
    private double relevanceScore;

    public Citation() {}

    public Citation(String contentUnitId, String citationLabel, String documentName,
                    MultimodalContentUnit.SourceType sourceType, String excerpt, double relevanceScore) {
        this.contentUnitId = contentUnitId;
        this.citationLabel = citationLabel;
        this.documentName = documentName;
        this.sourceType = sourceType;
        this.excerpt = excerpt;
        this.relevanceScore = relevanceScore;
    }

    public String getContentUnitId() { return contentUnitId; }
    public void setContentUnitId(String contentUnitId) { this.contentUnitId = contentUnitId; }

    public String getCitationLabel() { return citationLabel; }
    public void setCitationLabel(String citationLabel) { this.citationLabel = citationLabel; }

    public String getDocumentName() { return documentName; }
    public void setDocumentName(String documentName) { this.documentName = documentName; }

    public MultimodalContentUnit.SourceType getSourceType() { return sourceType; }
    public void setSourceType(MultimodalContentUnit.SourceType sourceType) { this.sourceType = sourceType; }

    public Integer getPageNumber() { return pageNumber; }
    public void setPageNumber(Integer pageNumber) { this.pageNumber = pageNumber; }

    public Integer getSlideNumber() { return slideNumber; }
    public void setSlideNumber(Integer slideNumber) { this.slideNumber = slideNumber; }

    public Integer getVideoTimestampSeconds() { return videoTimestampSeconds; }
    public void setVideoTimestampSeconds(Integer videoTimestampSeconds) { this.videoTimestampSeconds = videoTimestampSeconds; }

    public String getVideoDuration() { return videoDuration; }
    public void setVideoDuration(String videoDuration) { this.videoDuration = videoDuration; }

    public String getExcerpt() { return excerpt; }
    public void setExcerpt(String excerpt) { this.excerpt = excerpt; }

    public double getRelevanceScore() { return relevanceScore; }
    public void setRelevanceScore(double relevanceScore) { this.relevanceScore = relevanceScore; }
}
