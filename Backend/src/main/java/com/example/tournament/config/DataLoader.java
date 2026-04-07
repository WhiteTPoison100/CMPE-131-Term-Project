package com.example.tournament.config;

import com.example.tournament.entity.Role;
import com.example.tournament.entity.User;
import com.example.tournament.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataLoader {

    @Bean
    @Order(1)
    CommandLineRunner seedUsers(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (!userRepository.existsByUsername("organizer")) {
                userRepository.save(User.builder()
                        .username("organizer")
                        .password(passwordEncoder.encode("organizer123"))
                        .role(Role.TO)
                        .build());
            }
            if (!userRepository.existsByUsername("viewer")) {
                userRepository.save(User.builder()
                        .username("viewer")
                        .password(passwordEncoder.encode("viewer123"))
                        .role(Role.VIEWER)
                        .build());
            }
        };
    }
}
