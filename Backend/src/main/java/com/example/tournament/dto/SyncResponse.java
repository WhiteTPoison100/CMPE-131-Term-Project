package com.example.tournament.dto;

public record SyncResponse(
        String token,
        String username,
        String role,
        String email,
        String displayName,
        String firebaseProvider
) {}
