package com.example.tournament.service;

import com.example.tournament.dto.TournamentRequest;
import com.example.tournament.dto.TournamentResponse;
import com.example.tournament.entity.Tournament;
import com.example.tournament.entity.TournamentStatus;
import com.example.tournament.entity.User;
import com.example.tournament.exception.ApiException;
import com.example.tournament.repository.BracketRepository;
import com.example.tournament.repository.MatchRepository;
import com.example.tournament.repository.ParticipantRepository;
import com.example.tournament.repository.TournamentRepository;
import com.example.tournament.repository.UserRepository;
import com.example.tournament.util.SecurityUtils;
import java.time.Instant;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TournamentService {

    private final TournamentRepository tournamentRepository;
    private final UserRepository userRepository;
    private final MatchRepository matchRepository;
    private final BracketRepository bracketRepository;
    private final ParticipantRepository participantRepository;

    public TournamentService(
            TournamentRepository tournamentRepository,
            UserRepository userRepository,
            MatchRepository matchRepository,
            BracketRepository bracketRepository,
            ParticipantRepository participantRepository) {
        this.tournamentRepository = tournamentRepository;
        this.userRepository = userRepository;
        this.matchRepository = matchRepository;
        this.bracketRepository = bracketRepository;
        this.participantRepository = participantRepository;
    }

    @Transactional(readOnly = true)
    public List<TournamentResponse> list() {
        return tournamentRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public TournamentResponse get(Long id) {
        return toResponse(find(id));
    }

    @Transactional
    public TournamentResponse create(TournamentRequest request) {
        String username = SecurityUtils.requireUsername();
        User creator = userRepository.findByUsername(username).orElseThrow();
        TournamentStatus status = request.status() != null ? request.status() : TournamentStatus.UPCOMING;
        Tournament t = Tournament.builder()
                .name(request.name().trim())
                .gameTitle(request.gameTitle().trim())
                .description(request.description())
                .format(request.format().trim())
                .maxParticipants(request.maxParticipants())
                .status(status)
                .createdBy(creator)
                .createdAt(Instant.now())
                .build();
        return toResponse(tournamentRepository.save(t));
    }

    @Transactional
    public TournamentResponse update(Long id, TournamentRequest request) {
        Tournament t = find(id);
        t.setName(request.name().trim());
        t.setGameTitle(request.gameTitle().trim());
        t.setDescription(request.description());
        t.setFormat(request.format().trim());
        t.setMaxParticipants(request.maxParticipants());
        if (request.status() != null) {
            t.setStatus(request.status());
        }
        return toResponse(tournamentRepository.save(t));
    }

    @Transactional
    public void delete(Long id) {
        Tournament t = find(id);
        matchRepository.deleteByTournament(t);
        bracketRepository.deleteByTournament(t);
        participantRepository.deleteByTournament(t);
        tournamentRepository.delete(t);
    }

    @Transactional(readOnly = true)
    public Tournament find(Long id) {
        return tournamentRepository
                .findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Tournament not found: " + id));
    }

    private TournamentResponse toResponse(Tournament t) {
        return new TournamentResponse(
                t.getId(),
                t.getName(),
                t.getGameTitle(),
                t.getDescription(),
                t.getFormat(),
                t.getMaxParticipants(),
                t.getStatus(),
                t.getCreatedBy().getUsername(),
                t.getCreatedAt());
    }
}
