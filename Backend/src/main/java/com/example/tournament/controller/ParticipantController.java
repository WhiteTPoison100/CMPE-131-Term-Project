package com.example.tournament.controller;

import com.example.tournament.dto.ParticipantRequest;
import com.example.tournament.dto.ParticipantResponse;
import com.example.tournament.service.ParticipantService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tournaments/{tournamentId}/participants")
public class ParticipantController {

    private final ParticipantService participantService;

    public ParticipantController(ParticipantService participantService) {
        this.participantService = participantService;
    }

    @GetMapping
    public List<ParticipantResponse> list(@PathVariable Long tournamentId) {
        return participantService.listByTournament(tournamentId);
    }

    @PostMapping
    public ParticipantResponse add(
            @PathVariable Long tournamentId, @Valid @RequestBody ParticipantRequest request) {
        return participantService.add(tournamentId, request);
    }

    @PreAuthorize("hasRole('TO') or hasRole('VIEWER')")
    @DeleteMapping("/{participantId}")
    public void remove(@PathVariable Long tournamentId, @PathVariable Long participantId) {
        participantService.remove(tournamentId, participantId);
    }
}
