package com.complaintsystem.service;

import com.complaintsystem.dto.AdminLoginRequest;
import com.complaintsystem.dto.AuthResponse;
import com.complaintsystem.dto.LoginRequest;
import com.complaintsystem.dto.RegisterRequest;
import com.complaintsystem.entity.User;
import com.complaintsystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.username}")
    private String adminUsername;

    @Value("${app.admin.password-hash}")
    private String adminPasswordHash;

    @Autowired
    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return AuthResponse.failure("Email already registered");
        }

        String hashedPassword = passwordEncoder.encode(request.getPassword());

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(hashedPassword);
        user.setMobile(request.getMobile());
        user.setIsAdmin(false);

        User savedUser = userRepository.save(user);

        return AuthResponse.success(
            "Registration successful",
            savedUser.getId(),
            savedUser.getName(),
            savedUser.getEmail(),
            savedUser.getMobile(),
            false
        );
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
            .orElse(null);

        if (user == null) {
            return AuthResponse.failure("Invalid email or password");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return AuthResponse.failure("Invalid email or password");
        }

        return AuthResponse.success(
            "Login successful",
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getMobile(),
            user.getIsAdmin()
        );
    }

    public AuthResponse adminLogin(AdminLoginRequest request) {
        if (!request.getUsername().equals(adminUsername)) {
            return AuthResponse.failure("Invalid admin credentials");
        }

        if (!passwordEncoder.matches(request.getPassword(), adminPasswordHash)) {
            return AuthResponse.failure("Invalid admin credentials");
        }

        return AuthResponse.success(
            "Admin login successful",
            null,
            adminUsername,
            null,
            null,
            true
        );
    }
}
