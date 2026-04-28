package com.example.tournament.service;

import com.example.tournament.dto.BracketResponse;
import com.example.tournament.dto.MatchResponse;
import com.example.tournament.entity.ActivityAction;
import com.example.tournament.entity.Bracket;
import com.example.tournament.entity.Tournament;
import com.example.tournament.entity.TournamentStatus;
import com.example.tournament.exception.ApiException;
import com.example.tournament.repository.BracketRepository;
import com.example.tournament.repository.MatchRepository;
import com.example.tournament.repository.ParticipantRepository;
import com.example.tournament.repository.TournamentRepository;
import com.example.tournament.util.BracketBuildResult;
import com.example.tournament.util.BracketWire;
import com.example.tournament.util.DoubleEliminationBracketFactory;
import com.example.tournament.util.SecurityUtils;
import jakarta.persistence.EntityManager;
import java.time.Instant;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BracketService {

    private final TournamentRepository tournamentRepository;
    private final ParticipantRepository participantRepository;
    private final BracketRepository bracketRepository;
    private final MatchRepository matchRepository;
    private final EntityManager entityManager;
    private final MatchDtoMapper matchDtoMapper;
    private final ActivityLogService activityLogService;

    public BracketService(
            TournamentRepository tournamentRepository,
            ParticipantRepository participantRepository,
            BracketRepository bracketRepository,
            MatchRepository matchRepository,
            EntityManager entityManager,
            MatchDtoMapper matchDtoMapper,
            ActivityLogService activityLogService) {
        this.tournamentRepository = tournamentRepository;
        this.participantRepository = participantRepository;
        this.bracketRepository = bracketRepository;
        this.matchRepository = matchRepository;
        this.entityManager = entityManager;
        this.matchDtoMapper = matchDtoMapper;
        this.activityLogService = activityLogService;
    }

    @Transactional(readOnly = true)
    public BracketResponse getByTournament(Long tournamentId) {
        Tournament t = tournamentRepository
                .findById(tournamentId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Tournament not found: " + tournamentId));
        Bracket b = bracketRepository
                .findByTournament(t)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "No bracket for tournament: " + tournamentId));
        List<MatchResponse> matches =
                matchRepository.findByTournamentOrderByBracketTypeAscRoundNumberAscIdAsc(t).stream()
                        .map(matchDtoMapper::toResponse)
                        .toList();
        return new BracketResponse(b.getId(), t.getId(), b.getCreatedAt(), matches);
    }

    /**
     * Deletes any existing bracket/matches for the tournament, then builds a new double-elimination graph.
     */
    @Transactional
    public BracketResponse generate(Long tournamentId) {
        Tournament t = tournamentRepository
                .findById(tournamentId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Tournament not found: " + tournamentId));
        var participants = participantRepository.findByTournamentOrderBySeedNumberAscIdAsc(t);
        if (participants.size() < 2) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Need at least 2 participants to generate a bracket.");
        }

        bracketRepository.findByTournament(t).ifPresent(b -> {
            matchRepository.deleteByTournament(t);
            bracketRepository.delete(b);
            entityManager.flush();
        });

        Bracket bracket = Bracket.builder().tournament(t).createdAt(Instant.now()).build();
        bracketRepository.save(bracket);

        BracketBuildResult built = DoubleEliminationBracketFactory.build(t, bracket, participants);
        matchRepository.saveAll(built.matches());
        entityManager.flush();

        applyWires(built.matches(), built.wires());
        matchRepository.saveAll(built.matches());

        if (t.getStatus() == TournamentStatus.UPCOMING) {
            t.setStatus(TournamentStatus.ACTIVE);
        }
        tournamentRepository.save(t);

        List<MatchResponse> responses = built.matches().stream().map(matchDtoMapper::toResponse).toList();

        // Audit log
        String actor = SecurityUtils.requireUsername();
        activityLogService.log(actor, ActivityAction.BRACKET_GENERATED, null,
                t.getName() + " (" + participants.size() + " participants)");

        return new BracketResponse(bracket.getId(), t.getId(), bracket.getCreatedAt(), responses);
    }

    private static void applyWires(List<com.example.tournament.entity.Match> matches, List<BracketWire> wires) {
        for (BracketWire wire : wires) {
            com.example.tournament.entity.Match from = matches.get(wire.fromIndex());
            if (wire.winToIndex() != null) {
                from.setNextMatchWinner(matches.get(wire.winToIndex()));
                from.setWinnerGoesToSlot(wire.winSlot());
            } else {
                from.setNextMatchWinner(null);
                from.setWinnerGoesToSlot(null);
            }
            if (wire.loseToIndex() != null) {
                from.setNextMatchLoser(matches.get(wire.loseToIndex()));
                from.setLoserGoesToSlot(wire.loseSlot());
            } else {
                from.setNextMatchLoser(null);
                from.setLoserGoesToSlot(null);
            }
        }
    }
}
