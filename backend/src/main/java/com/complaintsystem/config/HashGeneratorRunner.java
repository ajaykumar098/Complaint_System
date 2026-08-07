package com.complaintsystem.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class HashGeneratorRunner implements CommandLineRunner {

    @Override
    public void run(String... args) {
        // Hash generation complete - this runner can be removed or disabled
    }
}
