package com.complaintsystem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class UpdateComplaintRequest {

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Priority is required")
    private String priority;

    public UpdateComplaintRequest() {}

    public UpdateComplaintRequest(String description, String priority) {
        this.description = description;
        this.priority = priority;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }
}
