import { apiClient } from './apiClient'
import type { BracketType, Match, MatchStatus, Participant, Tournament, TournamentStatus } from '../types'

// Backend raw response shapes

interface BackendTournament {
  id: number
  name: string
  gameTitle: string
  description: string | null
  format: string
  maxParticipants: number
  status: string
  createdByUsername: string
  createdAt: string
}

interface BackendParticipant {
  id: number
  gamerTag: string
  email: string | null
  seedNumber: number | null
  tournamentId: number
}

interface BackendMatch {
  id: number
  roundNumber: number
  bracketType: string
  player1Id: number | null
  player1Tag: string | null
  player2Id: number | null
  player2Tag: string | null
  score1: number | null
  score2: number | null
  winnerId: number | null
  status: string
  tournamentId: number
}

interface BackendBracketResponse {
  id: number
  tournamentId: number
  createdAt: string
  matches: BackendMatch[]
}

// Mapping functions

function toTournament(b: BackendTournament): Tournament {
  return {
    id: String(b.id),
    name: b.name,
    gameTitle: b.gameTitle,
    description: b.description ?? '',
    format: b.format,
    maxParticipants: b.maxParticipants,
    status: b.status as TournamentStatus,
    createdAt: b.createdAt,
  }
}

function toParticipant(b: BackendParticipant): Participant {
  return {
    id: String(b.id),
    tournamentId: String(b.tournamentId),
    gamerTag: b.gamerTag,
    email: b.email ?? '',
    seed: b.seedNumber ?? 0,
  }
}

function toMatch(b: BackendMatch): Match {
  let winner: string | null = null
  if (b.winnerId !== null) {
    if (b.winnerId === b.player1Id) winner = b.player1Tag ?? null
    else if (b.winnerId === b.player2Id) winner = b.player2Tag ?? null
  }
  return {
    id: String(b.id),
    tournamentId: String(b.tournamentId),
    bracketType: b.bracketType as BracketType,
    round: b.roundNumber,
    matchNumber: 1,
    player1: b.player1Tag ?? 'TBD',
    player2: b.player2Tag ?? 'TBD',
    score1: b.score1,
    score2: b.score2,
    winner,
    status: b.status as MatchStatus,
  }
}

// Service functions

export async function fetchTournaments(): Promise<Tournament[]> {
  const { data } = await apiClient.get<BackendTournament[]>('/tournaments')
  return data.map(toTournament)
}

export async function fetchTournamentById(id: string): Promise<Tournament> {
  const { data } = await apiClient.get<BackendTournament>(`/tournaments/${id}`)
  return toTournament(data)
}

export async function createTournamentApi(
  payload: Omit<Tournament, 'id' | 'createdAt'>,
): Promise<Tournament> {
  const { data } = await apiClient.post<BackendTournament>('/tournaments', payload)
  return toTournament(data)
}

export async function updateTournamentApi(
  id: string,
  payload: Partial<Omit<Tournament, 'id' | 'createdAt'>>,
): Promise<Tournament> {
  const { data } = await apiClient.put<BackendTournament>(`/tournaments/${id}`, payload)
  return toTournament(data)
}

export async function deleteTournamentApi(id: string): Promise<void> {
  await apiClient.delete(`/tournaments/${id}`)
}

export async function fetchParticipants(tournamentId: string): Promise<Participant[]> {
  const { data } = await apiClient.get<BackendParticipant[]>(
    `/tournaments/${tournamentId}/participants`,
  )
  return data.map(toParticipant)
}

export async function addParticipantApi(
  tournamentId: string,
  input: { gamerTag: string; email: string; seedNumber: number },
): Promise<Participant> {
  const { data } = await apiClient.post<BackendParticipant>(
    `/tournaments/${tournamentId}/participants`,
    input,
  )
  return toParticipant(data)
}

export async function removeParticipantApi(
  tournamentId: string,
  participantId: string,
): Promise<void> {
  await apiClient.delete(`/tournaments/${tournamentId}/participants/${participantId}`)
}

export async function fetchMatches(tournamentId: string): Promise<Match[]> {
  const { data } = await apiClient.get<BackendMatch[]>(`/tournaments/${tournamentId}/matches`)
  return data.map(toMatch)
}

export async function generateBracketApi(tournamentId: string): Promise<Match[]> {
  const { data } = await apiClient.post<BackendBracketResponse>(
    `/tournaments/${tournamentId}/bracket/generate`,
  )
  return data.matches.map(toMatch)
}

export async function submitScoreApi(
  matchId: string,
  score1: number,
  score2: number,
): Promise<Match> {
  const { data } = await apiClient.post<BackendMatch>(`/matches/${matchId}/score`, {
    score1,
    score2,
  })
  return toMatch(data)
}
