package com.complaintsystem.service;

import com.complaintsystem.entity.Complaint;
import com.complaintsystem.repository.ComplaintRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    @Value("${gemini.api-key}")
    private String geminiApiKey;

    private final ComplaintRepository complaintRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Autowired
    public GeminiService(ComplaintRepository complaintRepository) {
        this.complaintRepository = complaintRepository;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    public String getAIResponse(String userId, String userMessage) {
        if (geminiApiKey == null || geminiApiKey.isEmpty() || geminiApiKey.equals("${GEMINI_API_KEY}")) {
            return "Sorry, AI service is not configured. Please contact support.";
        }

        try {
            // Fetch user's complaints
            List<Complaint> complaints = complaintRepository.findByUserId(userId);

            // Build context string
            StringBuilder context = new StringBuilder();
            if (complaints.isEmpty()) {
                context.append("No complaints found for this user.");
            } else {
                for (Complaint complaint : complaints) {
                    context.append(String.format(
                        "Complaint ID: %s\nStatus: %s\nPriority: %s\nDescription: %s\nCreated: %s\n",
                        complaint.getComplaintId(),
                        complaint.getStatus(),
                        complaint.getPriority(),
                        complaint.getDescription(),
                        complaint.getCreatedAt()
                    ));
                    if (complaint.getAdminResponse() != null && complaint.getAdminResponse().getResponseText() != null) {
                        context.append(String.format("Admin Response: %s\n", complaint.getAdminResponse().getResponseText()));
                    }
                    context.append("\n");
                }
            }

            // Construct prompt
            String prompt = String.format(
                "You are a helpful assistant for a citizen complaint tracking system. Answer the user's question using ONLY the following complaint data. Be concise and friendly. If the answer isn't in the data, say so.\n\nComplaint Data:\n%s\n\nUser Question: %s",
                context.toString(),
                userMessage
            );

            // Call Gemini API
            String apiUrl = String.format(
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=%s",
                geminiApiKey
            );

            // Build request body
            Map<String, Object> requestBody = new HashMap<>();
            Map<String, Object> content = new HashMap<>();
            Map<String, Object> part = new HashMap<>();
            part.put("text", prompt);
            content.put("parts", new Object[]{part});
            requestBody.put("contents", new Object[]{content});

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(apiUrl, entity, String.class);

            // Extract reply from Gemini response
            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && candidates.size() > 0) {
                JsonNode contentNode = candidates.get(0).path("content");
                JsonNode parts = contentNode.path("parts");
                if (parts.isArray() && parts.size() > 0) {
                    return parts.get(0).path("text").asText();
                }
            }

            return "Sorry, I couldn't process your request. Please try again.";

        } catch (Exception e) {
            e.printStackTrace();
            return "Sorry, I'm having trouble right now. Please try again.";
        }
    }
}
