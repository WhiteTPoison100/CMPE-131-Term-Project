package com.example.tournament.dto;

public record ParticipantResponse(Long id, String gamerTag, String email, Integer seedNumber, Long tournamentId) {}
