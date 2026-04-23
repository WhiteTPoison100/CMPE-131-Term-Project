package com.example.tournament.config;

import com.example.tournament.entity.Role;
import com.example.tournament.entity.User;
import com.example.tournament.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataLoader {

    private static final Logger log = LoggerFactory.getLogger(DataLoader.class);

    /**
     * Runs first (Order 0): loosens the password column so Firebase users
     * (who have no password) can be inserted without a constraint violation.
     * ddl-auto:update adds new columns but never removes NOT NULL from existing ones.
     */
    @Bean
    @Order(0)
    CommandLineRunner migrateSchema(JdbcTemplate jdbc) {
        return args -> {
            try {
                jdbc.execute("ALTER TABLE users MODIFY COLUMN password VARCHAR(255) NULL");
                log.info("Schema migration: password column set to NULL");
            } catch (Exception e) {
                // Already nullable or another benign state — safe to ignore
                log.debug("Schema migration skipped (likely already applied): {}", e.getMessage());
            }
        };
    }

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
