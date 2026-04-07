package com.example.tournament.controller;

import com.example.tournament.dto.TournamentRequest;
import com.example.tournament.dto.TournamentResponse;
import com.example.tournament.service.TournamentService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tournaments")
public class TournamentController {

    private final TournamentService tournamentService;

    public TournamentController(TournamentService tournamentService) {
        this.tournamentService = tournamentService;
    }

    @GetMapping
    public List<TournamentResponse> list() {
        return tournamentService.list();
    }

    @GetMapping("/{id}")
    public TournamentResponse get(@PathVariable Long id) {
        return tournamentService.get(id);
    }

    @PostMapping
    public TournamentResponse create(@Valid @RequestBody TournamentRequest request) {
        return tournamentService.create(request);
    }

    @PutMapping("/{id}")
    public TournamentResponse update(@PathVariable Long id, @Valid @RequestBody TournamentRequest request) {
        return tournamentService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        tournamentService.delete(id);
    }
}
