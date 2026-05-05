/* eslint-disable react-refresh/only-export-components -- context module exports provider + hook */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react'
import type { BracketType, Match, Participant, Tournament } from '../types'
import {
  fetchTournaments,
  fetchParticipants,
  fetchMatches,
  createTournamentApi,
  deleteTournamentApi,
  addParticipantApi,
  removeParticipantApi,
  generateBracketApi,
  submitScoreApi,
} from '../services/tournamentService'

type AppAction =
  | { type: 'SET_TOURNAMENTS'; payload: Tournament[] }
  | { type: 'ADD_TOURNAMENT'; payload: Tournament }
  | { type: 'UPDATE_TOURNAMENT'; id: string; payload: Partial<Tournament> }
  | { type: 'DELETE_TOURNAMENT'; id: string }
  | { type: 'SET_ALL_PARTICIPANTS'; payload: Participant[] }
  | { type: 'ADD_PARTICIPANT'; payload: Participant }
  | { type: 'REMOVE_PARTICIPANT'; id: string }
  | { type: 'SET_ALL_MATCHES'; payload: Match[] }
  | { type: 'SET_MATCHES'; tournamentId: string; matches: Match[] }
  | { type: 'UPDATE_MATCH'; id: string; payload: Partial<Match> }

interface AppState {
  tournaments: Tournament[]
  participants: Participant[]
  matches: Match[]
}

const initialState: AppState = {
  tournaments: [],
  participants: [],
  matches: [],
}

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_TOURNAMENTS':
      return { ...state, tournaments: action.payload }
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
    case 'SET_ALL_PARTICIPANTS':
      return { ...state, participants: action.payload }
    case 'ADD_PARTICIPANT':
      return { ...state, participants: [...state.participants, action.payload] }
    case 'REMOVE_PARTICIPANT':
      return {
        ...state,
        participants: state.participants.filter((p) => p.id !== action.id),
      }
    case 'SET_ALL_MATCHES':
      return { ...state, matches: action.payload }
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

interface AppDataContextValue {
  loading: boolean
  tournaments: Tournament[]
  participants: Participant[]
  matches: Match[]
  participantCountFor: (tournamentId: string) => number
  getTournament: (id: string) => Tournament | undefined
  getParticipants: (tournamentId: string) => Participant[]
  getMatches: (tournamentId: string) => Match[]
  addTournament: (input: Omit<Tournament, 'id' | 'createdAt'>) => Promise<string>
  updateTournament: (id: string, patch: Partial<Tournament>) => void
  deleteTournament: (id: string) => void
  addParticipant: (input: Omit<Participant, 'id'>) => void
  removeParticipant: (id: string) => void
  generateBracket: (tournamentId: string) => Promise<{ ok: boolean; message?: string }>
  updateMatchScore: (
    matchId: string,
    score1: number,
    score2: number,
  ) => Promise<{ ok: boolean; message?: string }>
}

const AppDataContext = createContext<AppDataContextValue | null>(null)

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function bootstrap() {
      try {
        const tournaments = await fetchTournaments()
        dispatch({ type: 'SET_TOURNAMENTS', payload: tournaments })
        if (tournaments.length > 0) {
          const [allParticipants, allMatches] = await Promise.all([
            Promise.all(tournaments.map((t) => fetchParticipants(t.id))).then((r) => r.flat()),
            Promise.all(tournaments.map((t) => fetchMatches(t.id))).then((r) => r.flat()),
          ])
          dispatch({ type: 'SET_ALL_PARTICIPANTS', payload: allParticipants })
          dispatch({ type: 'SET_ALL_MATCHES', payload: allMatches })
        }
      } catch (err) {
        console.error('Failed to load data from backend:', err)
      } finally {
        setLoading(false)
      }
    }
    bootstrap()
  }, [])

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

  const addTournament = useCallback(async (input: Omit<Tournament, 'id' | 'createdAt'>) => {
    const tournament = await createTournamentApi(input)
    dispatch({ type: 'ADD_TOURNAMENT', payload: tournament })
    return tournament.id
  }, [])

  const updateTournament = useCallback((id: string, patch: Partial<Tournament>) => {
    dispatch({ type: 'UPDATE_TOURNAMENT', id, payload: patch })
  }, [])

  const deleteTournament = useCallback((id: string) => {
    dispatch({ type: 'DELETE_TOURNAMENT', id })
    deleteTournamentApi(id).catch((err) => console.error('Failed to delete tournament:', err))
  }, [])

  const addParticipant = useCallback(async (input: Omit<Participant, 'id'>) => {
    try {
      const participant = await addParticipantApi(input.tournamentId, {
        gamerTag: input.gamerTag,
        email: input.email,
        seedNumber: input.seed,
      })
      dispatch({ type: 'ADD_PARTICIPANT', payload: participant })
    } catch (err) {
      console.error('Failed to add participant:', err)
    }
  }, [])

  const removeParticipant = useCallback(
    (id: string) => {
      const participant = state.participants.find((p) => p.id === id)
      if (!participant) return
      dispatch({ type: 'REMOVE_PARTICIPANT', id })
      removeParticipantApi(participant.tournamentId, id).catch((err) =>
        console.error('Failed to remove participant:', err),
      )
    },
    [state.participants],
  )

  const generateBracket = useCallback(async (tournamentId: string) => {
    try {
      const matches = await generateBracketApi(tournamentId)
      dispatch({ type: 'SET_MATCHES', tournamentId, matches })
      dispatch({ type: 'UPDATE_TOURNAMENT', id: tournamentId, payload: { status: 'ACTIVE' } })
      return { ok: true }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to generate bracket.'
      return { ok: false, message: msg }
    }
  }, [])

  const updateMatchScore = useCallback(
    async (matchId: string, score1: number, score2: number) => {
      try {
        const updated = await submitScoreApi(matchId, score1, score2)
        dispatch({ type: 'UPDATE_MATCH', id: matchId, payload: updated })
        return { ok: true }
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Score submission failed.'
        return { ok: false, message: msg }
      }
    },
    [],
  )

  const value = useMemo(
    () => ({
      loading,
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
      loading,
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
