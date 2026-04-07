package com.example.tournament.dto;

import com.example.tournament.entity.MatchBracketType;
import com.example.tournament.entity.MatchStatus;

public record MatchResponse(
        Long id,
        Integer roundNumber,
        MatchBracketType bracketType,
        Long player1Id,
        String player1Tag,
        Long player2Id,
        String player2Tag,
        Integer score1,
        Integer score2,
        Long winnerId,
        Long loserId,
        MatchStatus status,
        Long nextMatchWinnerId,
        Long nextMatchLoserId,
        Long tournamentId,
        Long bracketId) {}
