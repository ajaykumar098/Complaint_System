package com.complaintsystem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public class CreateComplaintRequest {

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Priority is required")
    private String priority;

    @NotBlank(message = "User ID is required")
    private String userId;

    @NotBlank(message = "User name is required")
    private String userName;

    private String userMobile;

    private String userEmail;

    private String locationAddress;

    private Double locationLat;

    private Double locationLng;

    private List<MultipartFile> evidenceFiles;

    public CreateComplaintRequest() {}

    public CreateComplaintRequest(String description, String priority, String userId, String userName, String userMobile, String userEmail, String locationAddress, Double locationLat, Double locationLng, List<MultipartFile> evidenceFiles) {
        this.description = description;
        this.priority = priority;
        this.userId = userId;
        this.userName = userName;
        this.userMobile = userMobile;
        this.userEmail = userEmail;
        this.locationAddress = locationAddress;
        this.locationLat = locationLat;
        this.locationLng = locationLng;
        this.evidenceFiles = evidenceFiles;
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

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserMobile() {
        return userMobile;
    }

    public void setUserMobile(String userMobile) {
        this.userMobile = userMobile;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getLocationAddress() {
        return locationAddress;
    }

    public void setLocationAddress(String locationAddress) {
        this.locationAddress = locationAddress;
    }

    public Double getLocationLat() {
        return locationLat;
    }

    public void setLocationLat(Double locationLat) {
        this.locationLat = locationLat;
    }

    public Double getLocationLng() {
        return locationLng;
    }

    public void setLocationLng(Double locationLng) {
        this.locationLng = locationLng;
    }

    public List<MultipartFile> getEvidenceFiles() {
        return evidenceFiles;
    }

    public void setEvidenceFiles(List<MultipartFile> evidenceFiles) {
        this.evidenceFiles = evidenceFiles;
    }
}
