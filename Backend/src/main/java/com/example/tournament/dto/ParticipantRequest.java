package com.example.tournament.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ParticipantRequest(
        @NotBlank @Size(max = 128) String gamerTag,
        @Size(max = 255) String email,
        Integer seedNumber) {}
