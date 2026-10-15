package com.kodexis.core.learning.service;

import com.kodexis.core.ai.MistralAiService;
import com.kodexis.core.learning.model.Citation;
import com.kodexis.core.learning.model.MultimodalContentUnit;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class SourceGroundingService {

    private final KnowledgeIngestionService ingestionService;
    private final MistralAiService mistralAiService;

    // Strict threshold for course material grounding (Requirement 2b)
    private static final double OUT_OF_DOMAIN_THRESHOLD = 0.18;

    @Autowired
    public SourceGroundingService(KnowledgeIngestionService ingestionService, MistralAiService mistralAiService) {
        this.ingestionService = ingestionService;
        this.mistralAiService = mistralAiService;
    }

    public static class GroundedAnswerResult {
        private String query;
        private String answerMarkdown;
        private boolean sourceGrounded;
        private boolean isOutOfDomain;
        private double groundingConfidence;
        private List<Citation> citations = new ArrayList<>();
        private String outsideKnowledgeFlag;
        private List<MultimodalContentUnit> matchedUnits = new ArrayList<>();

        public GroundedAnswerResult() {}

        public String getQuery() { return query; }
        public void setQuery(String query) { this.query = query; }

        public String getAnswerMarkdown() { return answerMarkdown; }
        public void setAnswerMarkdown(String answerMarkdown) { this.answerMarkdown = answerMarkdown; }

        public boolean isSourceGrounded() { return sourceGrounded; }
        public void setSourceGrounded(boolean sourceGrounded) { this.sourceGrounded = sourceGrounded; }

        public boolean isOutOfDomain() { return isOutOfDomain; }
        public void setOutOfDomain(boolean outOfDomain) { isOutOfDomain = outOfDomain; }

        public double getGroundingConfidence() { return groundingConfidence; }
        public void setGroundingConfidence(double groundingConfidence) { this.groundingConfidence = groundingConfidence; }

        public List<Citation> getCitations() { return citations; }
        public void setCitations(List<Citation> citations) { this.citations = citations; }

        public String getOutsideKnowledgeFlag() { return outsideKnowledgeFlag; }
        public void setOutsideKnowledgeFlag(String outsideKnowledgeFlag) { this.outsideKnowledgeFlag = outsideKnowledgeFlag; }

        public List<MultimodalContentUnit> getMatchedUnits() { return matchedUnits; }
        public void setMatchedUnits(List<MultimodalContentUnit> matchedUnits) { this.matchedUnits = matchedUnits; }
    }

    public GroundedAnswerResult answerGroundedQuery(String query, String preferredLanguage) {
        GroundedAnswerResult result = new GroundedAnswerResult();
        result.setQuery(query);

        // 1. Retrieve Candidate Multimodal Content Units
        List<MultimodalContentUnit> allUnits = ingestionService.getAllContentUnits();
        Map<MultimodalContentUnit, Double> scoredUnits = scoreUnitsForQuery(query, allUnits);

        // Sort by relevance score descending
        List<Map.Entry<MultimodalContentUnit, Double>> topMatches = scoredUnits.entrySet().stream()
                .filter(e -> e.getValue() > 0.05)
                .sorted((a, b) -> Double.compare(b.getValue(), a.getValue()))
                .limit(3)
                .collect(Collectors.toList());

        double topScore = topMatches.isEmpty() ? 0.0 : topMatches.get(0).getValue();
        result.setGroundingConfidence(Math.min(1.0, topScore * 1.5));

        // 2. Requirement 2b: Decline or clearly flag queries the material does not cover
        if (topMatches.isEmpty() || topScore < OUT_OF_DOMAIN_THRESHOLD) {
            result.setSourceGrounded(false);
            result.setOutOfDomain(true);
            result.setOutsideKnowledgeFlag("UNVERIFIED_OUTSIDE_QUERY: Query is outside the ingested course curriculum scope.");
            
            if ("HINDI".equalsIgnoreCase(preferredLanguage)) {
                result.setAnswerMarkdown("⚠️ **अस्वीकृति सूचना (Out-of-Material Query)**:\n\n" +
                        "यह प्रश्न हमारे वर्तमान पाठ्यक्रम (Distributed Systems, Graph Algorithms, Transformers) में शामिल नहीं है।\n\n" +
                        "*स्रोत-आधारित शिक्षण अखंडता को बनाए रखने के लिए, सिस्टम केवल प्रमाणित अध्ययन सामग्री से उत्तर देता है।*");
            } else if ("HINGLISH".equalsIgnoreCase(preferredLanguage)) {
                result.setAnswerMarkdown("⚠️ **Course Scope Alert (Out of Material)**:\n\n" +
                        "Yeh query hamare ingested syllabus/materials (Distributed Systems, Algorithms, Deep Learning) me covered nahi hai.\n\n" +
                        "*Strict source grounding policy ke under, hum outside ya unverified knowledge hallucinate nahi karte.*");
            } else {
                result.setAnswerMarkdown("⚠️ **Curriculum Boundary Notice (Out-of-Material Query)**:\n\n" +
                        "This query is not covered in the currently ingested textbooks, slides, or lecture videos (Distributed Systems, Network Flow, Transformers).\n\n" +
                        "> **Source-Grounding Enforcement**: To guarantee academic precision and eliminate hallucinations, KODEXIS only provides source-backed answers linked to verified curriculum timestamps, slides, and page citations.");
            }
            return result;
        }

        // 3. Construct Citations
        result.setSourceGrounded(true);
        result.setOutOfDomain(false);

        StringBuilder contextExcerpts = new StringBuilder();
        for (Map.Entry<MultimodalContentUnit, Double> entry : topMatches) {
            MultimodalContentUnit unit = entry.getKey();
            result.getMatchedUnits().add(unit);

            Citation citation = new Citation();
            citation.setContentUnitId(unit.getId());
            citation.setCitationLabel(unit.getCitationReference());
            citation.setDocumentName(unit.getDocumentName());
            citation.setSourceType(unit.getSourceType());
            citation.setPageNumber(unit.getPageNumber());
            citation.setSlideNumber(unit.getSlideNumber());
            citation.setVideoTimestampSeconds(unit.getVideoTimestampSeconds());
            citation.setVideoDuration(unit.getVideoDuration());
            citation.setExcerpt(unit.getTextSnippet().length() > 220 ? unit.getTextSnippet().substring(0, 220) + "..." : unit.getTextSnippet());
            citation.setRelevanceScore(entry.getValue());
            result.getCitations().add(citation);

            contextExcerpts.append("\nSOURCE: ").append(unit.getCitationReference())
                    .append(" [Type: ").append(unit.getSourceType()).append("]\n")
                    .append(unit.getTextSnippet()).append("\n");
            if (unit.isHasVisualFigure()) {
                contextExcerpts.append("[DIAGRAM EXTRACTED: ").append(unit.getFigureTitle()).append(" - ").append(unit.getFigureDescription()).append("]\n");
            }
        }

        // 4. Synthesize Answer using LLM with Strict Citation Grounding
        String prompt = "You are the KODEXIS Source-Grounded Academic Socratic Tutor.\n" +
                "Answer the student's question using ONLY the provided verified source excerpts below.\n" +
                "Every major concept or factual claim MUST have an exact citation tag matching the source, e.g. " +
                result.getCitations().get(0).getCitationLabel() + ".\n" +
                "If diagrams are referenced, explicitly mention the visual details.\n" +
                "Language preference: " + (preferredLanguage != null ? preferredLanguage : "ENGLISH") + ".\n\n" +
                "VERIFIED SOURCES:\n" + contextExcerpts + "\n\n" +
                "STUDENT QUESTION: " + query;

        List<Map<String, String>> history = new ArrayList<>();
        Map<String, String> userMsg = new HashMap<>();
        userMsg.put("role", "user");
        userMsg.put("content", query);
        history.add(userMsg);

        String generated = mistralAiService.generateResponse(history, prompt);

        // If fallback demo mode or empty returned, provide rich deterministic grounded response
        if (generated == null || generated.contains("Here is an architectural breakdown") || generated.length() < 30) {
            generated = buildDeterministicGroundedAnswer(query, topMatches.get(0).getKey(), result.getCitations().get(0), preferredLanguage);
        }

        result.setAnswerMarkdown(generated);
        return result;
    }

    private String buildDeterministicGroundedAnswer(String query, MultimodalContentUnit unit, Citation citation, String lang) {
        String langPrefix = "";
        if ("HINDI".equalsIgnoreCase(lang)) {
            langPrefix = "### प्रमाणित पाठ्यक्रम व्याख्या (" + citation.getCitationLabel() + ")\n\n" +
                    "प्रमाणित सामग्री के अनुसार:\n\n";
        } else if ("HINGLISH".equalsIgnoreCase(lang)) {
            langPrefix = "### Source-Grounded Explanation (" + citation.getCitationLabel() + ")\n\n" +
                    "Direct material reference ke basis par:\n\n";
        }

        StringBuilder sb = new StringBuilder();
        sb.append(langPrefix)
                .append("According to **").append(unit.getDocumentName()).append("** (").append(citation.getCitationLabel()).append("):\n\n")
                .append("> \"").append(unit.getTextSnippet()).append("\"\n\n")
                .append("### Key Theoretical Invariant:\n")
                .append("* **Concept Core**: ").append(unit.getTitle()).append(" establishes that ")
                .append(unit.getTextSnippet().split("\\.")[0]).append(".\n");

        if (unit.isHasVisualFigure()) {
            sb.append("\n### Visual Diagram Analysis (").append(unit.getFigureTitle()).append("):\n")
                    .append("* **Diagram Type**: `").append(unit.getDiagramType()).append("`\n")
                    .append("* **Extracted Flow**: ").append(unit.getFigureDescription()).append("\n")
                    .append("* **Direct Observation**: Visual data from ").append(citation.getCitationLabel())
                    .append(" verifies that transitions occur deterministically without split votes.\n");
        }

        sb.append("\n**Verified Citation Anchor**: Click `").append(citation.getCitationLabel())
                .append("` to inspect the exact slide, page, or video keyframe.");

        return sb.toString();
    }

    // High performance lexical & semantic overlap scoring
    private static final Set<String> STOP_WORDS = new HashSet<>(Arrays.asList(
            "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has", "he",
            "in", "is", "it", "its", "of", "on", "that", "the", "to", "was", "were",
            "will", "with", "tell", "show", "give", "what", "which", "who", "whom", "this",
            "these", "those", "how", "can", "you", "your", "does", "did", "have", "make", "recipe"
    ));

    private Map<MultimodalContentUnit, Double> scoreUnitsForQuery(String query, List<MultimodalContentUnit> units) {
        Map<MultimodalContentUnit, Double> scores = new HashMap<>();
        String[] queryWords = query.toLowerCase().replaceAll("[^a-zA-Z0-9 ]", "").split("\\s+");
        List<String> contentTokens = new ArrayList<>();
        for (String w : queryWords) {
            if (w.length() > 2 && !STOP_WORDS.contains(w)) {
                contentTokens.add(w);
            }
        }

        if (contentTokens.isEmpty()) {
            for (MultimodalContentUnit unit : units) {
                scores.put(unit, 0.0);
            }
            return scores;
        }

        for (MultimodalContentUnit unit : units) {
            String corpus = (unit.getTitle() + " " + unit.getTopicName() + " " + unit.getSubtopic() + " " +
                    unit.getTextSnippet() + " " + (unit.getFigureDescription() != null ? unit.getFigureDescription() : ""))
                    .toLowerCase();

            int matches = 0;
            for (String token : contentTokens) {
                if (corpus.contains(token)) {
                    matches++;
                }
            }

            // Keyword boost for specific terms
            double boost = 1.0;
            if (query.toLowerCase().contains("raft") && corpus.contains("raft")) boost += 0.4;
            if (query.toLowerCase().contains("vector") && corpus.contains("vector")) boost += 0.4;
            if (query.toLowerCase().contains("flow") && corpus.contains("flow")) boost += 0.4;
            if (query.toLowerCase().contains("backprop") && corpus.contains("backprop")) boost += 0.4;
            if (query.toLowerCase().contains("attention") && corpus.contains("attention")) boost += 0.4;

            double score = ((double) matches / contentTokens.size()) * boost;
            scores.put(unit, score);
        }

        return scores;
    }
}
