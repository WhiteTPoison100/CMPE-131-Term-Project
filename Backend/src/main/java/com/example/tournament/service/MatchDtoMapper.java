package com.example.tournament.service;

import com.example.tournament.dto.MatchResponse;
import com.example.tournament.entity.Match;
import org.springframework.stereotype.Component;

@Component
public class MatchDtoMapper {

    public MatchResponse toResponse(Match m) {
        return new MatchResponse(
                m.getId(),
                m.getRoundNumber(),
                m.getBracketType(),
                m.getPlayer1() != null ? m.getPlayer1().getId() : null,
                m.getPlayer1() != null ? m.getPlayer1().getGamerTag() : null,
                m.getPlayer2() != null ? m.getPlayer2().getId() : null,
                m.getPlayer2() != null ? m.getPlayer2().getGamerTag() : null,
                m.getScore1(),
                m.getScore2(),
                m.getWinner() != null ? m.getWinner().getId() : null,
                m.getLoser() != null ? m.getLoser().getId() : null,
                m.getStatus(),
                m.getNextMatchWinner() != null ? m.getNextMatchWinner().getId() : null,
                m.getNextMatchLoser() != null ? m.getNextMatchLoser().getId() : null,
                m.getTournament().getId(),
                m.getBracket().getId());
    }
}
