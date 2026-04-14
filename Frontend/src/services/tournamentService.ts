import { apiClient } from './apiClient'
import type { Match, Participant, Tournament } from '../types'

/** Placeholder CRUD — swap mock context calls for these when APIs ship */

export async function fetchTournaments(): Promise<Tournament[]> {
  const { data } = await apiClient.get<Tournament[]>('/tournaments')
  return data
}

export async function fetchTournamentById(id: string): Promise<Tournament> {
  const { data } = await apiClient.get<Tournament>(`/tournaments/${id}`)
  return data
}

export async function createTournamentApi(
  payload: Omit<Tournament, 'id' | 'createdAt'>,
): Promise<Tournament> {
  const { data } = await apiClient.post<Tournament>('/tournaments', payload)
  return data
}

export async function updateTournamentApi(
  id: string,
  payload: Partial<Tournament>,
): Promise<Tournament> {
  const { data } = await apiClient.patch<Tournament>(`/tournaments/${id}`, payload)
  return data
}

export async function deleteTournamentApi(id: string): Promise<void> {
  await apiClient.delete(`/tournaments/${id}`)
}

export async function fetchParticipants(tournamentId: string): Promise<Participant[]> {
  const { data } = await apiClient.get<Participant[]>(
    `/tournaments/${tournamentId}/participants`,
  )
  return data
}

export async function fetchMatches(tournamentId: string): Promise<Match[]> {
  const { data } = await apiClient.get<Match[]>(`/tournaments/${tournamentId}/matches`)
  return data
}

export async function submitScoreApi(
  matchId: string,
  score1: number,
  score2: number,
): Promise<Match> {
  const { data } = await apiClient.post<Match>(`/matches/${matchId}/score`, { score1, score2 })
  return data
}
