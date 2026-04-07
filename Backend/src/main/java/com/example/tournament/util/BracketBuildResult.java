package com.example.tournament.util;

import com.example.tournament.entity.Match;
import java.util.List;

public record BracketBuildResult(List<Match> matches, List<BracketWire> wires) {}
