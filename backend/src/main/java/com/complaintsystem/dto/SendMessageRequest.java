package com.complaintsystem.dto;

import jakarta.validation.constraints.NotBlank;

public class SendMessageRequest {

    @NotBlank(message = "Sender ID is required")
    private String senderId;

    @NotBlank(message = "Sender type is required")
    private String senderType;

    @NotBlank(message = "Message is required")
    private String message;

    public SendMessageRequest() {}

    public SendMessageRequest(String senderId, String senderType, String message) {
        this.senderId = senderId;
        this.senderType = senderType;
        this.message = message;
    }

    public String getSenderId() {
        return senderId;
    }

    public void setSenderId(String senderId) {
        this.senderId = senderId;
    }

    public String getSenderType() {
        return senderType;
    }

    public void setSenderType(String senderType) {
        this.senderType = senderType;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
