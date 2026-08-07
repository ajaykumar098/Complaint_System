package com.complaintsystem.dto;

public class AuthResponse {

    private boolean success;
    private String message;
    private Long userId;
    private String name;
    private String email;
    private String mobile;
    private boolean isAdmin;

    public AuthResponse() {}

    public AuthResponse(boolean success, String message, Long userId, String name, String email, String mobile, boolean isAdmin) {
        this.success = success;
        this.message = message;
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.mobile = mobile;
        this.isAdmin = isAdmin;
    }

    public static AuthResponse success(String message, Long userId, String name, String email, String mobile, boolean isAdmin) {
        return new AuthResponse(true, message, userId, name, email, mobile, isAdmin);
    }

    public static AuthResponse failure(String message) {
        return new AuthResponse(false, message, null, null, null, null, false);
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public boolean isAdmin() {
        return isAdmin;
    }

    public void setIsAdmin(boolean isAdmin) {
        this.isAdmin = isAdmin;
    }

    public String getMobile() {
        return mobile;
    }

    public void setMobile(String mobile) {
        this.mobile = mobile;
    }
}
