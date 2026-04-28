package com.example.tournament.controller;

import com.example.tournament.entity.ActivityAction;
import com.example.tournament.entity.Role;
import com.example.tournament.entity.User;
import com.example.tournament.repository.UserRepository;
import com.example.tournament.service.ActivityLogService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final ActivityLogService activityLogService;

    public AdminController(UserRepository userRepository, ActivityLogService activityLogService) {
        this.userRepository = userRepository;
        this.activityLogService = activityLogService;
    }

    // ── User list ────────────────────────────────────────────────────────────

    @GetMapping("/users")
    @PreAuthorize("hasRole('TO')")
    public List<Map<String, Object>> listUsers() {
        return userRepository.findAll().stream().map(u -> Map.<String, Object>of(
            "id",               u.getId(),
            "username",         u.getUsername(),
            "email",            u.getEmail() != null ? u.getEmail() : "",
            "displayName",      u.getDisplayName() != null ? u.getDisplayName() : u.getUsername(),
            "role",             u.getRole().name(),
            "authProvider",     u.getAuthProvider() != null ? u.getAuthProvider().name() : "DEMO",
            "firebaseProvider",  u.getFirebaseProvider() != null ? u.getFirebaseProvider().name() : "",
            "promotedBy",       u.getPromotedBy() != null ? u.getPromotedBy() : ""
        )).toList();
    }

    // ── Role change ──────────────────────────────────────────────────────────

    @PatchMapping("/users/{id}/role")
    @PreAuthorize("hasRole('TO')")
    public ResponseEntity<Map<String, Object>> changeRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails principal
    ) {
        String actor = principal.getUsername();

        String newRoleStr = body.get("role");
        if (newRoleStr == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "role is required"));
        }

        Role newRole;
        try {
            newRole = Role.valueOf(newRoleStr);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid role: " + newRoleStr));
        }

        User target = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Cannot change your own role
        if (target.getUsername().equals(actor)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Cannot change your own role"));
        }

        // ── Promotion-lock guard ────────────────────────────────────────────
        // A newly-promoted TO cannot demote the person who promoted them
        User actorUser = userRepository.findByUsername(actor)
                .orElseThrow(() -> new RuntimeException("Actor not found"));

        if (newRole == Role.VIEWER
                && actorUser.getPromotedBy() != null
                && actorUser.getPromotedBy().equals(target.getUsername())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "message", "You cannot demote " + target.getUsername() + " — they are the one who promoted you."
            ));
        }

        Role oldRole = target.getRole();
        target.setRole(newRole);

        // Track who promoted this user (clear when demoted)
        if (newRole == Role.TO) {
            target.setPromotedBy(actor);
        } else {
            target.setPromotedBy(null);
        }

        userRepository.save(target);

        // ── Write audit log ─────────────────────────────────────────────────
        ActivityAction action = newRole == Role.TO ? ActivityAction.ROLE_PROMOTED : ActivityAction.ROLE_DEMOTED;
        String detail = oldRole.name() + " → " + newRole.name();
        activityLogService.log(actor, action, target.getUsername(), detail);

        return ResponseEntity.ok(Map.of(
            "id",         target.getId(),
            "username",   target.getUsername(),
            "role",       target.getRole().name(),
            "promotedBy", target.getPromotedBy() != null ? target.getPromotedBy() : ""
        ));
    }

    // ── Activity log ─────────────────────────────────────────────────────────

    @GetMapping("/activity")
    @PreAuthorize("hasRole('TO')")
    public List<Map<String, Object>> getActivity() {
        return activityLogService.findRecent();
    }
}
