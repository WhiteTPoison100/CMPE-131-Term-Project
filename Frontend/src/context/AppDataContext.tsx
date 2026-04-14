/* eslint-disable react-refresh/only-export-components -- context module exports provider + hook */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'
import type { BracketType, Match, MatchStatus, Participant, Tournament } from '../types'
import { initialMatches, initialParticipants, initialTournaments } from '../data/mockData'

type AppAction =
  | { type: 'ADD_TOURNAMENT'; payload: Tournament }
  | { type: 'UPDATE_TOURNAMENT'; id: string; payload: Partial<Tournament> }
  | { type: 'DELETE_TOURNAMENT'; id: string }
  | { type: 'ADD_PARTICIPANT'; payload: Participant }
  | { type: 'REMOVE_PARTICIPANT'; id: string }
  | { type: 'SET_MATCHES'; tournamentId: string; matches: Match[] }
  | { type: 'UPDATE_MATCH'; id: string; payload: Partial<Match> }

interface AppState {
  tournaments: Tournament[]
  participants: Participant[]
  matches: Match[]
}

const initialState: AppState = {
  tournaments: initialTournaments,
  participants: initialParticipants,
  matches: initialMatches,
}

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_TOURNAMENT':
      return { ...state, tournaments: [action.payload, ...state.tournaments] }
    case 'UPDATE_TOURNAMENT':
      return {
        ...state,
        tournaments: state.tournaments.map((t) =>
          t.id === action.id ? { ...t, ...action.payload } : t,
        ),
      }
    case 'DELETE_TOURNAMENT': {
      const id = action.id
      return {
        tournaments: state.tournaments.filter((t) => t.id !== id),
        participants: state.participants.filter((p) => p.tournamentId !== id),
        matches: state.matches.filter((m) => m.tournamentId !== id),
      }
    }
    case 'ADD_PARTICIPANT':
      return { ...state, participants: [...state.participants, action.payload] }
    case 'REMOVE_PARTICIPANT':
      return {
        ...state,
        participants: state.participants.filter((p) => p.id !== action.id),
      }
    case 'SET_MATCHES': {
      const rest = state.matches.filter((m) => m.tournamentId !== action.tournamentId)
      return { ...state, matches: [...rest, ...action.matches] }
    }
    case 'UPDATE_MATCH':
      return {
        ...state,
        matches: state.matches.map((m) =>
          m.id === action.id ? { ...m, ...action.payload } : m,
        ),
      }
    default:
      return state
  }
}

function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`
}

function buildDoubleElimMatches(
  tournamentId: string,
  tags: string[],
): Match[] {
  const matches: Match[] = []
  if (tags.length < 2) return matches

  const pairs: [string, string][] = []
  for (let i = 0; i < tags.length; i += 2) {
    const a = tags[i]
    const b = tags[i + 1] ?? 'BYE'
    pairs.push([a, b === 'BYE' ? 'BYE' : b])
  }

  pairs.forEach(([p1, p2], idx) => {
    const isBye = p2 === 'BYE'
    matches.push({
      id: newId(`m-w1-${idx}`),
      tournamentId,
      bracketType: 'WINNERS',
      round: 1,
      matchNumber: idx + 1,
      player1: p1,
      player2: isBye ? '—' : p2,
      score1: isBye ? 1 : null,
      score2: isBye ? 0 : null,
      winner: isBye ? p1 : null,
      status: isBye ? 'COMPLETED' : 'READY',
    })
  })

  matches.push({
    id: newId('m-l1'),
    tournamentId,
    bracketType: 'LOSERS',
    round: 1,
    matchNumber: 1,
    player1: 'TBD',
    player2: 'TBD',
    score1: null,
    score2: null,
    winner: null,
    status: 'PENDING',
  })

  matches.push({
    id: newId('m-gf'),
    tournamentId,
    bracketType: 'GRAND_FINAL',
    round: 1,
    matchNumber: 1,
    player1: 'TBD',
    player2: 'TBD',
    score1: null,
    score2: null,
    winner: null,
    status: 'PENDING',
  })

  return matches
}

interface AppDataContextValue {
  tournaments: Tournament[]
  participants: Participant[]
  matches: Match[]
  participantCountFor: (tournamentId: string) => number
  getTournament: (id: string) => Tournament | undefined
  getParticipants: (tournamentId: string) => Participant[]
  getMatches: (tournamentId: string) => Match[]
  addTournament: (input: Omit<Tournament, 'id' | 'createdAt'>) => string
  updateTournament: (id: string, patch: Partial<Tournament>) => void
  deleteTournament: (id: string) => void
  addParticipant: (input: Omit<Participant, 'id'>) => void
  removeParticipant: (id: string) => void
  generateBracket: (tournamentId: string) => { ok: boolean; message?: string }
  updateMatchScore: (
    matchId: string,
    score1: number,
    score2: number,
  ) => { ok: boolean; message?: string }
}

const AppDataContext = createContext<AppDataContextValue | null>(null)

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const participantCountFor = useCallback(
    (tournamentId: string) =>
      state.participants.filter((p) => p.tournamentId === tournamentId).length,
    [state.participants],
  )

  const getTournament = useCallback(
    (id: string) => state.tournaments.find((t) => t.id === id),
    [state.tournaments],
  )

  const getParticipants = useCallback(
    (tournamentId: string) =>
      [...state.participants.filter((p) => p.tournamentId === tournamentId)].sort(
        (a, b) => a.seed - b.seed,
      ),
    [state.participants],
  )

  const getMatches = useCallback(
    (tournamentId: string) => state.matches.filter((m) => m.tournamentId === tournamentId),
    [state.matches],
  )

  const addTournament = useCallback((input: Omit<Tournament, 'id' | 'createdAt'>) => {
    const id = newId('t')
    const tournament: Tournament = {
      ...input,
      id,
      createdAt: new Date().toISOString(),
    }
    dispatch({ type: 'ADD_TOURNAMENT', payload: tournament })
    return id
  }, [])

  const updateTournament = useCallback((id: string, patch: Partial<Tournament>) => {
    dispatch({ type: 'UPDATE_TOURNAMENT', id, payload: patch })
  }, [])

  const deleteTournament = useCallback((id: string) => {
    dispatch({ type: 'DELETE_TOURNAMENT', id })
  }, [])

  const addParticipant = useCallback((input: Omit<Participant, 'id'>) => {
    dispatch({
      type: 'ADD_PARTICIPANT',
      payload: { ...input, id: newId('p') },
    })
  }, [])

  const removeParticipant = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_PARTICIPANT', id })
  }, [])

  const generateBracket = useCallback(
    (tournamentId: string) => {
      const tags = getParticipants(tournamentId).map((p) => p.gamerTag)
      if (tags.length < 2) {
        return { ok: false, message: 'Need at least two participants to generate a bracket.' }
      }
      const built = buildDoubleElimMatches(tournamentId, tags)
      dispatch({ type: 'SET_MATCHES', tournamentId, matches: built })
      return { ok: true }
    },
    [getParticipants],
  )

  const updateMatchScore = useCallback((matchId: string, score1: number, score2: number) => {
    const match = state.matches.find((m) => m.id === matchId)
    if (!match) return { ok: false, message: 'Match not found.' }
    if (match.player1 === 'TBD' || match.player2 === 'TBD' || match.player1 === '—') {
      return { ok: false, message: 'Players must be assigned before submitting scores.' }
    }
    if (score1 === score2) {
      return { ok: false, message: 'Scores cannot be tied in this draft UI.' }
    }
    const winner = score1 > score2 ? match.player1 : match.player2
    const status: MatchStatus = 'COMPLETED'
    dispatch({
      type: 'UPDATE_MATCH',
      id: matchId,
      payload: { score1, score2, winner, status },
    })
    return { ok: true }
  }, [state.matches])

  const value = useMemo(
    () => ({
      tournaments: state.tournaments,
      participants: state.participants,
      matches: state.matches,
      participantCountFor,
      getTournament,
      getParticipants,
      getMatches,
      addTournament,
      updateTournament,
      deleteTournament,
      addParticipant,
      removeParticipant,
      generateBracket,
      updateMatchScore,
    }),
    [
      state.tournaments,
      state.participants,
      state.matches,
      participantCountFor,
      getTournament,
      getParticipants,
      getMatches,
      addTournament,
      updateTournament,
      deleteTournament,
      addParticipant,
      removeParticipant,
      generateBracket,
      updateMatchScore,
    ],
  )

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext)
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider')
  return ctx
}

export type { BracketType }
