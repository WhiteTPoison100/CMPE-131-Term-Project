package com.example.tournament.util;

/**
 * Describes how a completed match feeds winners/losers into downstream matches (by index in the persisted list).
 */
public record BracketWire(int fromIndex, Integer winToIndex, Integer winSlot, Integer loseToIndex, Integer loseSlot) {}
