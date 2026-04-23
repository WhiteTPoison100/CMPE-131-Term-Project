/** Shared domain types — align with future Spring Boot DTOs */

export type UserRole = 'TO' | 'VIEWER'

export type TournamentStatus = 'UPCOMING' | 'ACTIVE' | 'COMPLETED'

export type MatchStatus = 'PENDING' | 'READY' | 'COMPLETED'

export type BracketType = 'WINNERS' | 'LOSERS' | 'GRAND_FINAL'

export type FirebaseProvider = 'PASSWORD' | 'GOOGLE'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  firebaseProvider?: FirebaseProvider
}

export interface Tournament {
  id: string
  name: string
  gameTitle: string
  description: string
  format: string
  maxParticipants: number
  status: TournamentStatus
  createdAt: string
}

export interface Participant {
  id: string
  tournamentId: string
  gamerTag: string
  email: string
  seed: number
}

export interface Match {
  id: string
  tournamentId: string
  bracketType: BracketType
  round: number
  matchNumber: number
  player1: string
  player2: string
  score1: number | null
  score2: number | null
  winner: string | null
  status: MatchStatus
}

export interface DashboardStats {
  totalTournaments: number
  activeTournaments: number
  completedTournaments: number
  totalParticipants: number
  pendingMatches: number
}
