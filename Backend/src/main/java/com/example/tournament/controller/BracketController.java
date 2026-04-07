package com.example.tournament.controller;

import com.example.tournament.dto.BracketResponse;
import com.example.tournament.service.BracketService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tournaments/{tournamentId}/bracket")
public class BracketController {

    private final BracketService bracketService;

    public BracketController(BracketService bracketService) {
        this.bracketService = bracketService;
    }

    @GetMapping
    public BracketResponse get(@PathVariable Long tournamentId) {
        return bracketService.getByTournament(tournamentId);
    }

    @PostMapping("/generate")
    public BracketResponse generate(@PathVariable Long tournamentId) {
        return bracketService.generate(tournamentId);
    }
}
