package com.complaintsystem.controller;

import com.complaintsystem.dto.AIChatRequest;
import com.complaintsystem.dto.AIChatResponse;
import com.complaintsystem.service.GeminiService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    private final GeminiService geminiService;

    @Autowired
    public AIController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @PostMapping("/chat")
    public ResponseEntity<AIChatResponse> chat(@Valid @RequestBody AIChatRequest request) {
        String reply = geminiService.getAIResponse(request.getUserId(), request.getMessage());
        return ResponseEntity.ok(new AIChatResponse(reply));
    }
}
