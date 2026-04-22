import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppData } from '../context/AppDataContext'
import { PageHeader } from '../components/common/PageHeader'
import { TextInput } from '../components/forms/TextInput'
import { TextAreaInput } from '../components/forms/TextAreaInput'
import { SelectInput } from '../components/forms/SelectInput'
import type { TournamentStatus } from '../types'

interface FormState {
  name: string
  gameTitle: string
  description: string
  format: string
  maxParticipants: string
  status: TournamentStatus
}

const initial: FormState = {
  name: '',
  gameTitle: '',
  description: '',
  format: 'Double Elimination',
  maxParticipants: '32',
  status: 'UPCOMING',
}

export function CreateTournamentPage() {
  const navigate = useNavigate()
  const { addTournament } = useAppData()
  const [form, setForm] = useState<FormState>(initial)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {}
    if (!form.name.trim()) e.name = 'Tournament name is required.'
    if (!form.gameTitle.trim()) e.gameTitle = 'Game title is required.'
    if (!form.description.trim()) e.description = 'Add a short description for spectators.'
    if (!form.format.trim()) e.format = 'Format is required.'
    const max = Number(form.maxParticipants)
    if (!Number.isFinite(max) || max < 2) {
      e.maxParticipants = 'Max participants must be at least 2.'
    }
    if (max > 512) e.maxParticipants = 'Please keep max participants ≤ 512 for this demo.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    const id = await addTournament({
      name: form.name.trim(),
      gameTitle: form.gameTitle.trim(),
      description: form.description.trim(),
      format: form.format.trim(),
      maxParticipants: Math.floor(Number(form.maxParticipants)),
      status: form.status,
    })
    navigate(`/tournaments/${id}`)
  }

  return (
    <div>
      <PageHeader
        title="Create tournament"
        subtitle="Draft data stays in the browser for now—persist through your Spring service later."
        actions={
          <Link
            to="/tournaments"
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
          >
            Cancel
          </Link>
        }
      />

      <form
        onSubmit={submit}
        className="mx-auto max-w-3xl space-y-5 rounded-2xl border border-slate-800/90 bg-slate-900/40 p-6 shadow-inner shadow-slate-950/30"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            label="Tournament name"
            name="name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            error={errors.name}
            required
          />
          <TextInput
            label="Game title"
            name="gameTitle"
            value={form.gameTitle}
            onChange={(e) => setForm((f) => ({ ...f, gameTitle: e.target.value }))}
            error={errors.gameTitle}
            required
          />
        </div>
        <TextAreaInput
          label="Description"
          name="description"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          error={errors.description}
          placeholder="What should players know before registering?"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectInput
            label="Format"
            name="format"
            value={form.format}
            onChange={(e) => setForm((f) => ({ ...f, format: e.target.value }))}
            options={[
              { value: 'Single Elimination', label: 'Single Elimination' },
              { value: 'Double Elimination', label: 'Double Elimination' },
              { value: 'Round Robin', label: 'Round Robin' },
              { value: 'Swiss', label: 'Swiss' },
            ]}
            error={errors.format}
          />
          <TextInput
            label="Max participants"
            name="maxParticipants"
            type="number"
            min={2}
            value={form.maxParticipants}
            onChange={(e) => setForm((f) => ({ ...f, maxParticipants: e.target.value }))}
            error={errors.maxParticipants}
          />
        </div>
        <SelectInput
          label="Initial status"
          name="status"
          value={form.status}
          onChange={(e) =>
            setForm((f) => ({ ...f, status: e.target.value as TournamentStatus }))
          }
          options={[
            { value: 'UPCOMING', label: 'Upcoming' },
            { value: 'ACTIVE', label: 'Active' },
            { value: 'COMPLETED', label: 'Completed' },
          ]}
        />
        <div className="flex flex-wrap justify-end gap-2 border-t border-slate-800 pt-5">
          <Link
            to="/tournaments"
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-900/30 hover:bg-indigo-500"
          >
            Create tournament
          </button>
        </div>
      </form>
    </div>
  )
}
