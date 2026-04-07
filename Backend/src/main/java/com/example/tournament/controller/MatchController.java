package com.example.tournament.controller;

import com.example.tournament.dto.MatchResponse;
import com.example.tournament.dto.ScoreSubmitRequest;
import com.example.tournament.service.MatchService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping
public class MatchController {

    private final MatchService matchService;

    public MatchController(MatchService matchService) {
        this.matchService = matchService;
    }

    @GetMapping("/api/tournaments/{tournamentId}/matches")
    public List<MatchResponse> listByTournament(@PathVariable Long tournamentId) {
        return matchService.listByTournament(tournamentId);
    }

    @GetMapping("/api/matches/{matchId}")
    public MatchResponse get(@PathVariable Long matchId) {
        return matchService.get(matchId);
    }

    @PostMapping("/api/matches/{matchId}/score")
    public MatchResponse submitScore(
            @PathVariable Long matchId, @Valid @RequestBody ScoreSubmitRequest request) {
        return matchService.submitScore(matchId, request);
    }
}
