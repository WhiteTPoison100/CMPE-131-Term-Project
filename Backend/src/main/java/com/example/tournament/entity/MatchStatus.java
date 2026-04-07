package com.example.tournament.entity;

public enum MatchStatus {
    /** Slots not yet filled (or waiting for feeder matches). */
    PENDING,
    /** Both competitors assigned; ready to play or in progress. */
    READY,
    /** Final scores recorded; advancement applied. */
    COMPLETED
}
