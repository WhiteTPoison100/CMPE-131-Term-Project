package com.example.tournament.dto;

public record UpdateProfileRequest(
        String displayName,
        String photoUrl
) {}
