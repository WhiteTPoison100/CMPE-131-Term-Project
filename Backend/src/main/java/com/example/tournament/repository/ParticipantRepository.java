package com.example.tournament.repository;

import com.example.tournament.entity.Participant;
import com.example.tournament.entity.Tournament;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ParticipantRepository extends JpaRepository<Participant, Long> {

    List<Participant> findByTournamentOrderBySeedNumberAscIdAsc(Tournament tournament);

    long countByTournament(Tournament tournament);

    void deleteByTournament(Tournament tournament);
}
