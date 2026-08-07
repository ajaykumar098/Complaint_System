package com.complaintsystem.dto;

import jakarta.validation.constraints.NotBlank;

public class AdminResponseRequest {

    @NotBlank(message = "Response text is required")
    private String responseText;

    public AdminResponseRequest() {}

    public AdminResponseRequest(String responseText) {
        this.responseText = responseText;
    }

    public String getResponseText() {
        return responseText;
    }

    public void setResponseText(String responseText) {
        this.responseText = responseText;
    }
}
