package com.example.tournament.dto;

import jakarta.validation.constraints.NotNull;

public record ScoreSubmitRequest(@NotNull Integer score1, @NotNull Integer score2) {}
