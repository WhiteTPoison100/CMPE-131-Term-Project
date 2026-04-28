package com.example.tournament.controller;

import com.example.tournament.dto.UpdateProfileRequest;
import com.example.tournament.entity.User;
import com.example.tournament.repository.UserRepository;
import com.example.tournament.util.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /** Get current user's profile */
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getMe() {
        String username = SecurityUtils.requireUsername();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(toMap(user));
    }

    /** Update display name and/or photo URL */
    @PatchMapping("/me")
    public ResponseEntity<Map<String, Object>> updateMe(@RequestBody UpdateProfileRequest req) {
        String username = SecurityUtils.requireUsername();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (req.displayName() != null && !req.displayName().isBlank()) {
            user.setDisplayName(req.displayName().trim());
        }
        if (req.photoUrl() != null) {
            user.setPhotoUrl(req.photoUrl().isBlank() ? null : req.photoUrl().trim());
        }

        userRepository.save(user);
        return ResponseEntity.ok(toMap(user));
    }

    /**
     * Soft-delete: marks the account as inactive.
     * The user is then logged out on the frontend. They can be reactivated by an admin.
     */
    @PostMapping("/me/deactivate")
    public ResponseEntity<Void> deactivateMe() {
        String username = SecurityUtils.requireUsername();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(false);
        userRepository.save(user);
        return ResponseEntity.noContent().build();
    }

    /**
     * Hard-delete: permanently removes the account and all associated data.
     * The user is then logged out on the frontend.
     */
    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteMe() {
        String username = SecurityUtils.requireUsername();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        userRepository.delete(user);
        return ResponseEntity.noContent().build();
    }

    private Map<String, Object> toMap(User u) {
        return Map.of(
            "id",           u.getId(),
            "username",     u.getUsername(),
            "displayName",  u.getDisplayName() != null ? u.getDisplayName() : u.getUsername(),
            "email",        u.getEmail() != null ? u.getEmail() : "",
            "role",         u.getRole().name(),
            "authProvider", u.getAuthProvider() != null ? u.getAuthProvider().name() : "DEMO",
            "photoUrl",     u.getPhotoUrl() != null ? u.getPhotoUrl() : ""
        );
    }
}
