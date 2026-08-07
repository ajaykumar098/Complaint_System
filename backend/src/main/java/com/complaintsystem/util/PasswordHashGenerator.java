package com.complaintsystem.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHashGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(10);
        String password = "Ajay@1234567";
        String hash = encoder.encode(password);
        System.out.println("BCrypt hash for '" + password + "':");
        System.out.println(hash);
    }
}
