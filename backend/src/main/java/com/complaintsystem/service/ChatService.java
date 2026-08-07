package com.complaintsystem.service;

import com.complaintsystem.dto.SendMessageRequest;
import com.complaintsystem.entity.ChatMessage;
import com.complaintsystem.entity.Complaint;
import com.complaintsystem.entity.Notification;
import com.complaintsystem.repository.ChatMessageRepository;
import com.complaintsystem.repository.ComplaintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final ComplaintRepository complaintRepository;
    private final NotificationService notificationService;

    @Autowired
    public ChatService(ChatMessageRepository chatMessageRepository, ComplaintRepository complaintRepository, NotificationService notificationService) {
        this.chatMessageRepository = chatMessageRepository;
        this.complaintRepository = complaintRepository;
        this.notificationService = notificationService;
    }

    public ChatMessage sendMessage(Long complaintId, SendMessageRequest request) {
        Complaint complaint = complaintRepository.findById(complaintId).orElse(null);
        if (complaint == null) {
            return null;
        }

        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setComplaint(complaint);
        chatMessage.setMessage(request.getMessage());
        
        // Map sender type to enum
        ChatMessage.Sender senderType = "ADMIN".equalsIgnoreCase(request.getSenderType()) 
            ? ChatMessage.Sender.ADMIN 
            : ChatMessage.Sender.CITIZEN;
        chatMessage.setSenderType(senderType);

        ChatMessage savedMessage = chatMessageRepository.save(chatMessage);

        // Create notification when admin sends a message
        if (senderType == ChatMessage.Sender.ADMIN) {
            String messagePreview = request.getMessage();
            if (messagePreview.length() > 50) {
                messagePreview = messagePreview.substring(0, 50) + "...";
            }
            notificationService.createNotification(complaint, Notification.NotificationType.ADMIN_RESPONSE, 
                "Admin sent an update: " + messagePreview);
        }

        return savedMessage;
    }

    public List<ChatMessage> getChatMessages(Long complaintId) {
        Complaint complaint = complaintRepository.findById(complaintId).orElse(null);
        if (complaint == null) {
            return null;
        }

        return chatMessageRepository.findByComplaintIdOrderByCreatedAtAsc(complaint.getId());
    }
}
