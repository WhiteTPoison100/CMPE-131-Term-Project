package com.example.tournament.util;

import com.example.tournament.entity.Bracket;
import com.example.tournament.entity.Match;
import com.example.tournament.entity.MatchBracketType;
import com.example.tournament.entity.MatchStatus;
import com.example.tournament.entity.Participant;
import com.example.tournament.entity.Tournament;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Builds a <strong>standard double-elimination</strong> match graph for small, power-of-two fields.
 * <p>
 * Supported sizes: 2, 4, and 8 participants (typical demo sizes). The wiring for 4 and 8 follows
 * the usual “upper bracket / lower bracket / grand final” layout used in many collegiate examples.
 * </p>
 */
public final class DoubleEliminationBracketFactory {

    private DoubleEliminationBracketFactory() {}

    public static BracketBuildResult build(Tournament tournament, Bracket bracket, List<Participant> participants) {
        List<Participant> ordered = orderParticipants(participants);
        int n = ordered.size();
        if (n < 2) {
            throw new IllegalArgumentException("Need at least 2 participants to generate a bracket.");
        }
        if ((n & (n - 1)) != 0) {
            throw new IllegalArgumentException("Participant count must be a power of 2 (2, 4, 8).");
        }
        return switch (n) {
            case 2 -> buildTwo(tournament, bracket, ordered);
            case 4 -> buildFour(tournament, bracket, ordered);
            case 8 -> buildEight(tournament, bracket, ordered);
            default -> throw new IllegalArgumentException("This demo supports bracket sizes 2, 4, or 8 only.");
        };
    }

    private static List<Participant> orderParticipants(List<Participant> participants) {
        List<Participant> copy = new ArrayList<>(participants);
        copy.sort(Comparator.comparing(Participant::getSeedNumber, Comparator.nullsLast(Comparator.naturalOrder()))
                .thenComparing(Participant::getId));
        return copy;
    }

    private static BracketBuildResult buildTwo(Tournament tournament, Bracket bracket, List<Participant> p) {
        List<BracketWire> wires = new ArrayList<>();
        Match m0 = baseMatch(tournament, bracket, 1, MatchBracketType.GRAND_FINAL);
        m0.setPlayer1(p.get(0));
        m0.setPlayer2(p.get(1));
        m0.setStatus(MatchStatus.READY);
        wires.add(new BracketWire(0, null, null, null, null));
        return new BracketBuildResult(List.of(m0), wires);
    }

    /** Four players: WB (3) + LB (2) + GF (1) = 6 matches (2n - 2). */
    private static BracketBuildResult buildFour(Tournament tournament, Bracket bracket, List<Participant> p) {
        List<BracketWire> w = new ArrayList<>();
        List<Match> m = new ArrayList<>();
        m.add(baseMatch(tournament, bracket, 1, MatchBracketType.WINNERS));
        m.add(baseMatch(tournament, bracket, 1, MatchBracketType.WINNERS));
        m.add(baseMatch(tournament, bracket, 2, MatchBracketType.WINNERS));
        m.add(baseMatch(tournament, bracket, 1, MatchBracketType.LOSERS));
        m.add(baseMatch(tournament, bracket, 2, MatchBracketType.LOSERS));
        m.add(baseMatch(tournament, bracket, 1, MatchBracketType.GRAND_FINAL));

        m.get(0).setPlayer1(p.get(0));
        m.get(0).setPlayer2(p.get(1));
        m.get(1).setPlayer1(p.get(2));
        m.get(1).setPlayer2(p.get(3));
        setReadyIfBothFilled(m.get(0));
        setReadyIfBothFilled(m.get(1));

        w.add(new BracketWire(0, 2, 1, 3, 1));
        w.add(new BracketWire(1, 2, 2, 3, 2));
        w.add(new BracketWire(2, 5, 1, 4, 2));
        w.add(new BracketWire(3, 4, 1, null, null));
        w.add(new BracketWire(4, 5, 2, null, null));
        w.add(new BracketWire(5, null, null, null, null));

        return new BracketBuildResult(m, w);
    }

    /** Eight players: 14 matches (2n - 2). */
    private static BracketBuildResult buildEight(Tournament tournament, Bracket bracket, List<Participant> p) {
        List<BracketWire> w = new ArrayList<>();
        List<Match> m = new ArrayList<>();
        m.add(baseMatch(tournament, bracket, 1, MatchBracketType.WINNERS));
        m.add(baseMatch(tournament, bracket, 1, MatchBracketType.WINNERS));
        m.add(baseMatch(tournament, bracket, 1, MatchBracketType.WINNERS));
        m.add(baseMatch(tournament, bracket, 1, MatchBracketType.WINNERS));
        m.add(baseMatch(tournament, bracket, 2, MatchBracketType.WINNERS));
        m.add(baseMatch(tournament, bracket, 2, MatchBracketType.WINNERS));
        m.add(baseMatch(tournament, bracket, 3, MatchBracketType.WINNERS));
        m.add(baseMatch(tournament, bracket, 1, MatchBracketType.LOSERS));
        m.add(baseMatch(tournament, bracket, 1, MatchBracketType.LOSERS));
        m.add(baseMatch(tournament, bracket, 2, MatchBracketType.LOSERS));
        m.add(baseMatch(tournament, bracket, 2, MatchBracketType.LOSERS));
        m.add(baseMatch(tournament, bracket, 3, MatchBracketType.LOSERS));
        m.add(baseMatch(tournament, bracket, 4, MatchBracketType.LOSERS));
        m.add(baseMatch(tournament, bracket, 1, MatchBracketType.GRAND_FINAL));

        m.get(0).setPlayer1(p.get(0));
        m.get(0).setPlayer2(p.get(1));
        m.get(1).setPlayer1(p.get(2));
        m.get(1).setPlayer2(p.get(3));
        m.get(2).setPlayer1(p.get(4));
        m.get(2).setPlayer2(p.get(5));
        m.get(3).setPlayer1(p.get(6));
        m.get(3).setPlayer2(p.get(7));
        setReadyIfBothFilled(m.get(0));
        setReadyIfBothFilled(m.get(1));
        setReadyIfBothFilled(m.get(2));
        setReadyIfBothFilled(m.get(3));

        w.add(new BracketWire(0, 4, 1, 7, 1));
        w.add(new BracketWire(1, 4, 2, 7, 2));
        w.add(new BracketWire(2, 5, 1, 8, 1));
        w.add(new BracketWire(3, 5, 2, 8, 2));
        w.add(new BracketWire(4, 6, 1, 9, 2));
        w.add(new BracketWire(5, 6, 2, 10, 2));
        w.add(new BracketWire(6, 13, 1, 12, 2));
        w.add(new BracketWire(7, 9, 1, null, null));
        w.add(new BracketWire(8, 10, 1, null, null));
        w.add(new BracketWire(9, 11, 1, null, null));
        w.add(new BracketWire(10, 11, 2, null, null));
        w.add(new BracketWire(11, 12, 1, null, null));
        w.add(new BracketWire(12, 13, 2, null, null));
        w.add(new BracketWire(13, null, null, null, null));

        return new BracketBuildResult(m, w);
    }

    private static Match baseMatch(Tournament tournament, Bracket bracket, int round, MatchBracketType type) {
        return Match.builder()
                .tournament(tournament)
                .bracket(bracket)
                .roundNumber(round)
                .bracketType(type)
                .status(MatchStatus.PENDING)
                .build();
    }

    private static void setReadyIfBothFilled(Match match) {
        if (match.getPlayer1() != null && match.getPlayer2() != null) {
            match.setStatus(MatchStatus.READY);
        }
    }
}
