package com.example.tournament.repository;

import com.example.tournament.entity.Match;
import com.example.tournament.entity.Tournament;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MatchRepository extends JpaRepository<Match, Long> {

    List<Match> findByTournamentOrderByBracketTypeAscRoundNumberAscIdAsc(Tournament tournament);

    void deleteByTournament(Tournament tournament);
}
