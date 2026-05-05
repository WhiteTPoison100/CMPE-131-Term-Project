import { useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import type { Match } from '../../types'
import { Modal } from '../common/Modal'
import { TextInput } from '../forms/TextInput'
import { MatchStatusBadge } from '../common/StatusBadge'

interface ScoreSubmissionModalProps {
  match: Match | null
  open: boolean
  onClose: () => void
  onSubmit: (matchId: string, score1: number, score2: number) => Promise<{ ok: boolean; message?: string }>
}

interface ScoreFormProps {
  match: Match
  onClose: () => void
  onSubmit: ScoreSubmissionModalProps['onSubmit']
}

function ScoreForm({ match, onClose, onSubmit }: ScoreFormProps) {
  const [s1, setS1] = useState(() => (match.score1 != null ? String(match.score1) : ''))
  const [s2, setS2] = useState(() => (match.score2 != null ? String(match.score2) : ''))
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async () => {
    setError(null)
    const n1 = Number(s1)
    const n2 = Number(s2)
    if (!Number.isFinite(n1) || !Number.isFinite(n2) || s1.trim() === '' || s2.trim() === '') {
      setError('Enter valid numeric scores.')
      return
    }
    if (n1 < 0 || n2 < 0) {
      setError('Scores cannot be negative.')
      return
    }
    setIsSubmitting(true)
    const res = await onSubmit(match.id, Math.floor(n1), Math.floor(n2))
    setIsSubmitting(false)
    if (!res.ok) {
      setError(res.message ?? 'Unable to save.')
      return
    }
    setIsSuccess(true)
    setTimeout(onClose, 1000)
  }

  const isBusy = isSubmitting || isSuccess

  return (
    <div className="space-y-4">
      {/* ── Animated progress bar ─────────────────────────────────────────── */}
      {isSubmitting && (
        <div className="relative h-1 w-full overflow-hidden rounded-full bg-slate-800">
          <div className="animate-progress-bar absolute inset-y-0 left-0 rounded-full bg-indigo-500" />
        </div>
      )}

      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-white">
            {match.player1} <span className="text-slate-500">vs</span> {match.player2}
          </p>
          <MatchStatusBadge status={match.status} />
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Bracket {match.bracketType.replace('_', ' ')} · Round {match.round} · Match{' '}
          {match.matchNumber}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput
          label={`${match.player1} score`}
          name="score1"
          type="number"
          min={0}
          value={s1}
          onChange={(e) => setS1(e.target.value)}
          disabled={isBusy}
        />
        <TextInput
          label={`${match.player2} score`}
          name="score2"
          type="number"
          min={0}
          value={s2}
          onChange={(e) => setS2(e.target.value)}
          disabled={isBusy}
        />
      </div>

      {/* ── Feedback row ──────────────────────────────────────────────────── */}
      {isSuccess ? (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Scores saved!
        </div>
      ) : error ? (
        <p className="text-sm text-red-400">{error}</p>
      ) : null}

      <p className="text-xs text-slate-500">
        Demo rule: ties are rejected so a winner can be highlighted in the UI.
      </p>

      <div className="flex justify-end gap-2 border-t border-slate-800 pt-4">
        <button
          type="button"
          disabled={isBusy}
          className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition-opacity hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={isBusy}
          onClick={handleSubmit}
          className="flex min-w-[120px] items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-900/30 transition-opacity hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Saved!
            </>
          ) : (
            'Submit result'
          )}
        </button>
      </div>
    </div>
  )
}

export function ScoreSubmissionModal({
  match,
  open,
  onClose,
  onSubmit,
}: ScoreSubmissionModalProps) {
  return (
    <Modal
      open={open && Boolean(match)}
      title="Submit match result"
      onClose={onClose}
      size="lg"
    >
      {match && open ? <ScoreForm key={match.id} match={match} onClose={onClose} onSubmit={onSubmit} /> : null}
    </Modal>
  )
}
