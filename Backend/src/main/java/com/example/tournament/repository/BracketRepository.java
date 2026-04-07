package com.example.tournament.repository;

import com.example.tournament.entity.Bracket;
import com.example.tournament.entity.Tournament;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BracketRepository extends JpaRepository<Bracket, Long> {

    Optional<Bracket> findByTournament(Tournament tournament);

    void deleteByTournament(Tournament tournament);
}
