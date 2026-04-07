package com.example.tournament.service;

import com.example.tournament.dto.ParticipantRequest;
import com.example.tournament.dto.ParticipantResponse;
import com.example.tournament.entity.Participant;
import com.example.tournament.entity.Tournament;
import com.example.tournament.exception.ApiException;
import com.example.tournament.repository.BracketRepository;
import com.example.tournament.repository.ParticipantRepository;
import com.example.tournament.repository.TournamentRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class ParticipantService {

    private final ParticipantRepository participantRepository;
    private final TournamentRepository tournamentRepository;
    private final BracketRepository bracketRepository;

    public ParticipantService(
            ParticipantRepository participantRepository,
            TournamentRepository tournamentRepository,
            BracketRepository bracketRepository) {
        this.participantRepository = participantRepository;
        this.tournamentRepository = tournamentRepository;
        this.bracketRepository = bracketRepository;
    }

    @Transactional(readOnly = true)
    public List<ParticipantResponse> listByTournament(Long tournamentId) {
        Tournament t = tournamentRepository
                .findById(tournamentId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Tournament not found: " + tournamentId));
        return participantRepository.findByTournamentOrderBySeedNumberAscIdAsc(t).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ParticipantResponse add(Long tournamentId, ParticipantRequest request) {
        Tournament t = tournamentRepository
                .findById(tournamentId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Tournament not found: " + tournamentId));
        if (bracketRepository.findByTournament(t).isPresent()) {
            throw new ApiException(HttpStatus.CONFLICT, "Cannot add participants after a bracket has been generated.");
        }
        long count = participantRepository.countByTournament(t);
        if (count >= t.getMaxParticipants()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Tournament is full (maxParticipants=" + t.getMaxParticipants() + ").");
        }
        String email = StringUtils.hasText(request.email()) ? request.email().trim() : null;
        Participant p = Participant.builder()
                .gamerTag(request.gamerTag().trim())
                .email(email)
                .seedNumber(request.seedNumber())
                .tournament(t)
                .build();
        return toResponse(participantRepository.save(p));
    }

    @Transactional
    public void remove(Long tournamentId, Long participantId) {
        Tournament t = tournamentRepository
                .findById(tournamentId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Tournament not found: " + tournamentId));
        if (bracketRepository.findByTournament(t).isPresent()) {
            throw new ApiException(HttpStatus.CONFLICT, "Cannot remove participants after a bracket has been generated.");
        }
        Participant p = participantRepository
                .findById(participantId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Participant not found: " + participantId));
        if (!p.getTournament().getId().equals(t.getId())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Participant does not belong to this tournament.");
        }
        participantRepository.delete(p);
    }

    private ParticipantResponse toResponse(Participant p) {
        return new ParticipantResponse(
                p.getId(), p.getGamerTag(), p.getEmail(), p.getSeedNumber(), p.getTournament().getId());
    }
}
