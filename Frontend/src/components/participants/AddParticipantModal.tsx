import { useState } from 'react'
import { Modal } from '../common/Modal'
import { TextInput } from '../forms/TextInput'

interface AddParticipantModalProps {
  open: boolean
  onClose: () => void
  tournamentId: string
  nextSeed: number
  onCreate: (input: { tournamentId: string; gamerTag: string; email: string; seed: number }) => void
}

export function AddParticipantModal({
  open,
  onClose,
  tournamentId,
  nextSeed,
  onCreate,
}: AddParticipantModalProps) {
  const [tag, setTag] = useState('')
  const [email, setEmail] = useState('')
  const [seed, setSeed] = useState(String(nextSeed))
  const [errors, setErrors] = useState<Record<string, string>>({})

  const submit = () => {
    const e: Record<string, string> = {}
    if (!tag.trim()) e.tag = 'Gamer tag is required.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = 'Enter a valid email.'
    const n = Number(seed)
    if (!Number.isFinite(n) || n < 1) e.seed = 'Seed must be a positive number.'
    setErrors(e)
    if (Object.keys(e).length) return
    onCreate({
      tournamentId,
      gamerTag: tag.trim(),
      email: email.trim().toLowerCase(),
      seed: Math.floor(n),
    })
    setTag('')
    setEmail('')
    setSeed(String(nextSeed + 1))
    onClose()
  }

  return (
    <Modal
      open={open}
      title="Add participant"
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            onClick={submit}
          >
            Add participant
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <TextInput
          label="Gamer tag / team name"
          name="gamerTag"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          error={errors.tag}
          autoComplete="off"
        />
        <TextInput
          label="Email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />
        <TextInput
          label="Seed number"
          name="seed"
          type="number"
          min={1}
          value={seed}
          onChange={(e) => setSeed(e.target.value)}
          error={errors.seed}
        />
      </div>
    </Modal>
  )
}
