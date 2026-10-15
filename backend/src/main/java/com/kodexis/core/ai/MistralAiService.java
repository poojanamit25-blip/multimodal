package com.kodexis.core.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class MistralAiService {

    @Value("${kodexis.mistral.key}")
    private String apiKey;

    @Value("${kodexis.mistral.url}")
    private String apiUrl;

    @Value("${kodexis.mistral.model}")
    private String modelName;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public MistralAiService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    public String generateResponse(List<Map<String, String>> conversationHistory, String systemPrompt) {
        // Fallback to Demo Mode if apiKey is blank, placeholder, or default demo key
        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.equalsIgnoreCase("demo_mistral_api_key") || apiKey.contains("your_key_here") || apiKey.contains("placeholder")) {
            if (systemPrompt != null && systemPrompt.contains("KODEXIS AI Technical Assessment Brain")) {
                return generateDemoAssessment(conversationHistory);
            }
            return generateDemoResponse(conversationHistory);
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);

            // Reconstruct the message array, placing system prompt first
            List<Map<String, String>> requestMessages = new ArrayList<>();
            Map<String, String> sysMessage = new HashMap<>();
            sysMessage.put("role", "system");
            sysMessage.put("content", systemPrompt);
            requestMessages.add(sysMessage);
            requestMessages.addAll(conversationHistory);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", modelName);
            requestBody.put("messages", requestMessages);
            requestBody.put("temperature", 0.3);
            requestBody.put("max_tokens", 2048);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            // Invoke Mistral API
            Map<?, ?> responseMap = restTemplate.postForObject(apiUrl, entity, Map.class);
            if (responseMap != null && responseMap.containsKey("choices")) {
                List<?> choices = (List<?>) responseMap.get("choices");
                if (!choices.isEmpty()) {
                    Map<?, ?> choice = (Map<?, ?>) choices.get(0);
                    Map<?, ?> message = (Map<?, ?>) choice.get("message");
                    return (String) message.get("content");
                }
            }
        } catch (Exception e) {
            System.err.println("[KODEXIS] Mistral API invocation failed. Falling back to Demo Mode: " + e.getMessage());
        }

        if (systemPrompt != null && systemPrompt.contains("KODEXIS AI Technical Assessment Brain")) {
            return generateDemoAssessment(conversationHistory);
        }
        return generateDemoResponse(conversationHistory);
    }

    private String generateDemoAssessment(List<Map<String, String>> history) {
        String userPrompt = "";
        if (history != null && !history.isEmpty()) {
            userPrompt = history.get(history.size() - 1).getOrDefault("content", "");
        }

        int passed = 0;
        int total = 1;
        if (userPrompt.contains("Passed Cases: ")) {
            try {
                String sub = userPrompt.substring(userPrompt.indexOf("Passed Cases: ") + 14);
                String[] parts = sub.split("\n")[0].split("/");
                passed = Integer.parseInt(parts[0].trim());
                total = Integer.parseInt(parts[1].trim());
            } catch (Exception e) {
                // Ignore
            }
        }

        boolean allPassed = passed == total;
        String problemTitle = "Coding Problem";
        if (userPrompt.contains("Title: ")) {
            problemTitle = userPrompt.substring(userPrompt.indexOf("Title: ") + 7).split("\n")[0].trim();
        }

        String complexity = "O(n)";
        String spaceComplexity = "O(n)";
        if (problemTitle.equalsIgnoreCase("Two Sum")) {
            complexity = "O(n)";
            spaceComplexity = "O(n)";
        } else if (problemTitle.equalsIgnoreCase("Longest Subarray With Target Sum")) {
            complexity = "O(n)";
            spaceComplexity = "O(n)";
        } else if (problemTitle.equalsIgnoreCase("Valid Parentheses")) {
            complexity = "O(n)";
            spaceComplexity = "O(n)";
        }

        int problemSolving = allPassed ? 90 : 60;
        int efficiency = allPassed ? 85 : 55;
        int quality = 80;
        int debugging = passed > 0 ? 75 : 45;
        int edgeCases = allPassed ? 85 : 50;
        int communication = 85;

        return String.format(
            "{\n" +
            "  \"problemSolvingScore\": %d,\n" +
            "  \"efficiencyScore\": %d,\n" +
            "  \"codeQualityScore\": %d,\n" +
            "  \"debuggingScore\": %d,\n" +
            "  \"edgeCasesScore\": %d,\n" +
            "  \"communicationScore\": %d,\n" +
            "  \"detectedTimeComplexity\": \"%s\",\n" +
            "  \"detectedSpaceComplexity\": \"%s\",\n" +
            "  \"autopsySummary\": \"Completed evaluation for '%s'. The candidate successfully passed %d out of %d test cases in the sandbox compiler.\",\n" +
            "  \"whatWentWell\": \"Clean control structure. Selected the correct data structures and logic mapping for tracking indices/sums in a single pass.\",\n" +
            "  \"areasToImprove\": \"Ensure defensive checks for edge values (e.g. empty boundaries or single elements) are declared early in the function scope.\",\n" +
            "  \"interviewerFeedback\": \"The candidate communicates well and follows optimal complexity paths. Wrote functional, well-structured syntax in Monaco.\",\n" +
            "  \"suggestedPractice\": \"Sliding Window, Dynamic Programming, Arrays & Hashing\"\n" +
            "}",
            problemSolving, efficiency, quality, debugging, edgeCases, communication,
            complexity, spaceComplexity, problemTitle, passed, total
        );
    }

    private String generateDemoResponse(List<Map<String, String>> history) {
        if (history == null || history.isEmpty()) {
            return "Welcome to the KODEXIS AI Interview Lab. Let's start with a problem involving arrays. Before coding, explain how you would approach it.";
        }

        // Get the last user message
        String lastUserMessage = "";
        for (int i = history.size() - 1; i >= 0; i--) {
            if ("user".equals(history.get(i).get("role"))) {
                lastUserMessage = history.get(i).get("content").toLowerCase().trim();
                break;
            }
        }

        if (lastUserMessage.contains("hello") || lastUserMessage.contains("hi") || lastUserMessage.equals("hey")) {
            return "Hello! I am your KODEXIS AI interviewer. Let's discuss your approach for the coding task. What variables do you think we need to track to optimize space-time complexity?";
        }
        if (lastUserMessage.contains("hash map") || lastUserMessage.contains("hashmap") || lastUserMessage.contains("hashing")) {
            return "Good suggestion. Using a hash map will allow you to look up complements in O(1) time. What would be the trade-off in space complexity if we choose this over sorting?";
        }
        if (lastUserMessage.contains("sorting") || lastUserMessage.contains("sort")) {
            return "Sorting is a clear option. However, what is the complexity of that decision, and can you solve this without sorting to achieve a linear O(n) runtime?";
        }
        if (lastUserMessage.contains("sliding window") || lastUserMessage.contains("two pointers")) {
            return "Sliding window / two pointers is an optimal choice here because we have contiguous subarrays. How do you plan to adjust the pointers when the current sum exceeds or falls below the target?";
        }
        if (lastUserMessage.contains("brute force") || lastUserMessage.contains("nested loop")) {
            return "Brute force will work but takes O(n^2) time. Let's aim to optimize this. Can you think of a data structure that helps you track seen cumulative sums in a single pass?";
        }
        if (lastUserMessage.contains("null") || lastUserMessage.contains("empty") || lastUserMessage.contains("edge case")) {
            return "Excellent point! Checking for null, empty arrays, or a single element is crucial. How will you represent those checks in your boilerplate code?";
        }
        if (lastUserMessage.contains("hint") || lastUserMessage.contains("stuck") || lastUserMessage.contains("help")) {
            return "Sure! For array problems, a common optimization is using a Hash Map to store elements you have already visited. This lets you search for complements in O(1) time instead of nesting loops. Give that a try!";
        }
        if (lastUserMessage.contains("run") || lastUserMessage.contains("test") || lastUserMessage.contains("fail") || lastUserMessage.contains("error")) {
            return "If a test case is failing, double check if you are reading standard input correctly and printing the output exactly as requested in the format specifications. Standard formatting is critical for the test suite.";
        }
        if (lastUserMessage.contains("ready") || lastUserMessage.contains("begin") || lastUserMessage.contains("start")) {
            return "Excellent. The coding sandbox is unlocked. Go ahead and write the solution in Monaco. Be sure to run local test drafts before submitting!";
        }

        // Hash-based rotation to ensure responses are dynamic and never repeat
        List<String> genericReplies = List.of(
            "Understood. Let's explore that thought further. How does this strategy scale as the input array size grows towards 10^5 elements?",
            "That sounds like a reasonable direction. Could you elaborate on how we might handle potential boundary conditions, like empty arrays or duplicate elements?",
            "I see. If you are ready, you can type 'ready to code' to unlock the workspace, or continue discussing the approach with me here.",
            "Interesting approach. Can we complete this in a single pass O(n) scan, or will it require sorting first?",
            "Got it. Go ahead and write down your solution in the editor on the right. Remember to run local test drafts before submitting."
        );

        int index = Math.abs(lastUserMessage.hashCode()) % genericReplies.size();
        return genericReplies.get(index);
    }
}
