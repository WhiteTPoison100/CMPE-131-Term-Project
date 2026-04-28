package com.example.tournament.entity;

public enum ActivityAction {
    ROLE_PROMOTED,       // actor promoted targetUser VIEWER → TO
    ROLE_DEMOTED,        // actor demoted  targetUser TO → VIEWER
    TOURNAMENT_CREATED,  // actor created a tournament (detail = name)
    TOURNAMENT_DELETED,  // actor deleted a tournament (detail = name)
    BRACKET_GENERATED,   // actor generated bracket   (detail = tournament name)
    SCORE_SUBMITTED      // actor submitted match score (detail = match id + scores)
}
