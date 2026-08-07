package com.complaintsystem.dto;

import jakarta.validation.constraints.NotBlank;

public class AIChatRequest {

    @NotBlank(message = "User ID is required")
    private String userId;

    @NotBlank(message = "Message is required")
    private String message;

    public AIChatRequest() {}

    public AIChatRequest(String userId, String message) {
        this.userId = userId;
        this.message = message;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
