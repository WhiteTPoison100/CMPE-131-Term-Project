package com.example.tournament.dto;

import com.example.tournament.entity.TournamentStatus;
import java.time.Instant;

public record TournamentResponse(
        Long id,
        String name,
        String gameTitle,
        String description,
        String format,
        Integer maxParticipants,
        TournamentStatus status,
        String createdByUsername,
        Instant createdAt) {}
