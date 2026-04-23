package com.example.tournament.dto;

import jakarta.validation.constraints.NotBlank;

public record SyncRequest(
        @NotBlank String idToken,
        String displayName
) {}
