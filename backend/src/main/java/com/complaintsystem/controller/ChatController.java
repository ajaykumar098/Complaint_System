package com.complaintsystem.controller;

import com.complaintsystem.dto.SendMessageRequest;
import com.complaintsystem.entity.ChatMessage;
import com.complaintsystem.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    @Autowired
    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/complaints/{complaintId}/messages")
    public ResponseEntity<?> sendMessage(@PathVariable Long complaintId, @Valid @RequestBody SendMessageRequest request) {
        ChatMessage chatMessage = chatService.sendMessage(complaintId, request);
        if (chatMessage == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(chatMessage);
    }

    @GetMapping("/complaints/{complaintId}/messages")
    public ResponseEntity<?> getChatMessages(@PathVariable Long complaintId) {
        List<ChatMessage> messages = chatService.getChatMessages(complaintId);
        if (messages == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(messages);
    }
}
