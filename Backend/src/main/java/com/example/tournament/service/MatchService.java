package com.example.tournament.service;

import com.example.tournament.dto.MatchResponse;
import com.example.tournament.dto.ScoreSubmitRequest;
import com.example.tournament.entity.ActivityAction;
import com.example.tournament.entity.Match;
import com.example.tournament.entity.MatchBracketType;
import com.example.tournament.entity.MatchStatus;
import com.example.tournament.entity.Participant;
import com.example.tournament.entity.Tournament;
import com.example.tournament.entity.TournamentStatus;
import com.example.tournament.exception.ApiException;
import com.example.tournament.repository.MatchRepository;
import com.example.tournament.repository.TournamentRepository;
import com.example.tournament.util.SecurityUtils;
import java.util.ArrayList;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MatchService {

    private final MatchRepository matchRepository;
    private final TournamentRepository tournamentRepository;
    private final MatchDtoMapper matchDtoMapper;
    private final ActivityLogService activityLogService;

    public MatchService(
            MatchRepository matchRepository,
            TournamentRepository tournamentRepository,
            MatchDtoMapper matchDtoMapper,
            ActivityLogService activityLogService) {
        this.matchRepository = matchRepository;
        this.tournamentRepository = tournamentRepository;
        this.matchDtoMapper = matchDtoMapper;
        this.activityLogService = activityLogService;
    }

    @Transactional(readOnly = true)
    public List<MatchResponse> listByTournament(Long tournamentId) {
        Tournament t = tournamentRepository
                .findById(tournamentId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Tournament not found: " + tournamentId));
        return matchRepository.findByTournamentOrderByBracketTypeAscRoundNumberAscIdAsc(t).stream()
                .map(matchDtoMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public MatchResponse get(Long matchId) {
        return matchDtoMapper.toResponse(find(matchId));
    }

    /**
     * Records a result, advances winner/loser into downstream matches, and marks the tournament completed after the
     * grand final.
     */
    @Transactional
    public MatchResponse submitScore(Long matchId, ScoreSubmitRequest request) {
        Match m = find(matchId);
        if (m.getStatus() != MatchStatus.READY) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Match is not ready for scoring (status=" + m.getStatus() + ").");
        }
        if (m.getPlayer1() == null || m.getPlayer2() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Match does not have two competitors yet.");
        }
        int s1 = request.score1();
        int s2 = request.score2();
        if (s1 == s2) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Scores cannot be tied.");
        }
        Participant win = s1 > s2 ? m.getPlayer1() : m.getPlayer2();
        Participant lose = s1 > s2 ? m.getPlayer2() : m.getPlayer1();

        m.setScore1(s1);
        m.setScore2(s2);
        m.setWinner(win);
        m.setLoser(lose);
        m.setStatus(MatchStatus.COMPLETED);

        List<Match> dirty = new ArrayList<>();
        dirty.add(m);
        dirty.addAll(advance(m));

        matchRepository.saveAll(dirty);

        if (m.getBracketType() == MatchBracketType.GRAND_FINAL) {
            Tournament t = m.getTournament();
            t.setStatus(TournamentStatus.COMPLETED);
            tournamentRepository.save(t);
        }

        // Audit log
        String actor = SecurityUtils.requireUsername();
        String p1tag = m.getPlayer1() != null ? m.getPlayer1().getGamerTag() : "TBD";
        String p2tag = m.getPlayer2() != null ? m.getPlayer2().getGamerTag() : "TBD";
        String detail = p1tag + " " + s1 + " – " + s2 + " " + p2tag
                + " (Match #" + matchId + ")";
        activityLogService.log(actor, ActivityAction.SCORE_SUBMITTED, null, detail);

        return matchDtoMapper.toResponse(find(matchId));
    }

    private List<Match> advance(Match completed) {
        List<Match> touched = new ArrayList<>();
        Participant w = completed.getWinner();
        Participant l = completed.getLoser();
        if (completed.getNextMatchWinner() != null && completed.getWinnerGoesToSlot() != null) {
            Match target = completed.getNextMatchWinner();
            place(target, w, completed.getWinnerGoesToSlot());
            touched.add(target);
        }
        if (completed.getNextMatchLoser() != null && completed.getLoserGoesToSlot() != null) {
            Match target = completed.getNextMatchLoser();
            place(target, l, completed.getLoserGoesToSlot());
            touched.add(target);
        }
        return touched;
    }

    private static void place(Match target, Participant p, int slot) {
        if (slot == 1) {
            if (target.getPlayer1() != null && !target.getPlayer1().getId().equals(p.getId())) {
                throw new ApiException(HttpStatus.CONFLICT, "Player 1 slot already filled for match " + target.getId());
            }
            target.setPlayer1(p);
        } else if (slot == 2) {
            if (target.getPlayer2() != null && !target.getPlayer2().getId().equals(p.getId())) {
                throw new ApiException(HttpStatus.CONFLICT, "Player 2 slot already filled for match " + target.getId());
            }
            target.setPlayer2(p);
        } else {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Invalid advancement slot: " + slot);
        }
        refreshReady(target);
    }

    private static void refreshReady(Match m) {
        if (m.getStatus() == MatchStatus.COMPLETED) {
            return;
        }
        if (m.getPlayer1() != null && m.getPlayer2() != null) {
            m.setStatus(MatchStatus.READY);
        } else {
            m.setStatus(MatchStatus.PENDING);
        }
    }

    private Match find(Long id) {
        return matchRepository
                .findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Match not found: " + id));
    }
}
