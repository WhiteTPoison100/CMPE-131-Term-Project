package com.example.tournament.dto;

import java.time.Instant;
import java.util.List;

public record BracketResponse(Long id, Long tournamentId, Instant createdAt, List<MatchResponse> matches) {}
