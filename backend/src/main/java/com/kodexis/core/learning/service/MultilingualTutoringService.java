package com.kodexis.core.learning.service;

import com.kodexis.core.learning.model.Citation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class MultilingualTutoringService {

    private final SourceGroundingService groundingService;

    @Autowired
    public MultilingualTutoringService(SourceGroundingService groundingService) {
        this.groundingService = groundingService;
    }

    public static class SocraticVoiceExchange {
        private String studentQuery;
        private String language; // "ENGLISH", "HINDI", "HINGLISH"
        private String tutorResponseText;
        private String speechSynthesisText; // Clean spoken text without markdown for audio playback
        private boolean isGrounded;
        private List<Citation> citations = new ArrayList<>();
        private String socraticPromptFollowup;

        public SocraticVoiceExchange() {}

        public String getStudentQuery() { return studentQuery; }
        public void setStudentQuery(String studentQuery) { this.studentQuery = studentQuery; }

        public String getLanguage() { return language; }
        public void setLanguage(String language) { this.language = language; }

        public String getTutorResponseText() { return tutorResponseText; }
        public void setTutorResponseText(String tutorResponseText) { this.tutorResponseText = tutorResponseText; }

        public String getSpeechSynthesisText() { return speechSynthesisText; }
        public void setSpeechSynthesisText(String speechSynthesisText) { this.speechSynthesisText = speechSynthesisText; }

        public boolean isGrounded() { return isGrounded; }
        public void setGrounded(boolean grounded) { isGrounded = grounded; }

        public List<Citation> getCitations() { return citations; }
        public void setCitations(List<Citation> citations) { this.citations = citations; }

        public String getSocraticPromptFollowup() { return socraticPromptFollowup; }
        public void setSocraticPromptFollowup(String socraticPromptFollowup) { this.socraticPromptFollowup = socraticPromptFollowup; }
    }

    public SocraticVoiceExchange conductSocraticVoiceSession(String query, String language) {
        String lang = (language != null && !language.trim().isEmpty()) ? language.toUpperCase() : "ENGLISH";

        SourceGroundingService.GroundedAnswerResult grounded = groundingService.answerGroundedQuery(query, lang);

        SocraticVoiceExchange exchange = new SocraticVoiceExchange();
        exchange.setStudentQuery(query);
        exchange.setLanguage(lang);
        exchange.setGrounded(grounded.isSourceGrounded());
        exchange.getCitations().addAll(grounded.getCitations());

        if (!grounded.isSourceGrounded()) {
            exchange.setTutorResponseText(grounded.getAnswerMarkdown());
            exchange.setSpeechSynthesisText("Notice: This question falls outside our ingested curriculum materials. I can only tutor you on verified course concepts.");
            exchange.setSocraticPromptFollowup("Would you like to explore Raft consensus, vector clocks, or transformer attention mechanisms instead?");
            return exchange;
        }

        // Multilingual Formulations (Requirement 6d)
        if ("HINDI".equalsIgnoreCase(lang)) {
            String cleanText = "यह अवधारणा आपकी संदर्भ सामग्री " + (grounded.getCitations().isEmpty() ? "" : grounded.getCitations().get(0).getCitationLabel()) +
                    " पर आधारित है। चलिए इसे समझते हैं। " + grounded.getMatchedUnits().get(0).getTextSnippet().split("\\.")[0] + "।";
            exchange.setTutorResponseText(grounded.getAnswerMarkdown());
            exchange.setSpeechSynthesisText(cleanText);
            exchange.setSocraticPromptFollowup("क्या आप बता सकते हैं कि इस स्थिति में सिस्टम की सुरक्षा कैसे सुनिश्चित होती है?");
        } else if ("HINGLISH".equalsIgnoreCase(lang)) {
            String cleanText = "Iss concept ka direct reference hai " + (grounded.getCitations().isEmpty() ? "" : grounded.getCitations().get(0).getCitationLabel()) +
                    ". " + grounded.getMatchedUnits().get(0).getTextSnippet().split("\\.")[0] + ".";
            exchange.setTutorResponseText(grounded.getAnswerMarkdown());
            exchange.setSpeechSynthesisText(cleanText);
            exchange.setSocraticPromptFollowup("Think about this: Agar election timeout fix ho jaye, toh split vote problem kaise solve hogi?");
        } else {
            String cleanText = "Based on " + (grounded.getCitations().isEmpty() ? "your curriculum" : grounded.getCitations().get(0).getCitationLabel()) +
                    ", " + grounded.getMatchedUnits().get(0).getTextSnippet().split("\\.")[0] + ".";
            exchange.setTutorResponseText(grounded.getAnswerMarkdown());
            exchange.setSpeechSynthesisText(cleanText);
            exchange.setSocraticPromptFollowup("Now, consider this Socratic question: What happens to the cluster if two nodes timeout at the exact same millisecond?");
        }

        return exchange;
    }
}
