package com.example.tournament.dto;

import com.example.tournament.entity.TournamentStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TournamentRequest(
        @NotBlank @Size(max = 255) String name,
        @NotBlank @Size(max = 255) String gameTitle,
        @Size(max = 2000) String description,
        @NotBlank @Size(max = 64) String format,
        @NotNull @Min(2) Integer maxParticipants,
        TournamentStatus status) {}
