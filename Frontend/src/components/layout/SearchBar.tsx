import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, Swords, Trophy, Users, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAppData } from '../../context/AppDataContext'

// ── Status badge colours ──────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, { text: string; bg: string }> = {
  ACTIVE:    { text: '#22c55e', bg: 'rgba(34,197,94,0.12)'   },
  UPCOMING:  { text: '#89ceff', bg: 'rgba(137,206,255,0.12)' },
  COMPLETED: { text: '#94a3b8', bg: 'rgba(148,163,184,0.10)' },
}

// ── Component ─────────────────────────────────────────────────────────────────

export function SearchBar() {
  const navigate = useNavigate()
  const { tournaments, participants } = useAppData()

  const [query, setQuery]   = useState('')
  const [open, setOpen]     = useState(false)
  const [pos, setPos]       = useState<React.CSSProperties>({})
  const [active, setActive] = useState(-1)

  const inputRef      = useRef<HTMLInputElement>(null)
  const containerRef  = useRef<HTMLDivElement>(null)

  const q = query.trim().toLowerCase()

  // ── Filter results ────────────────────────────────────────────────────────

  const matchedTournaments = q.length >= 1
    ? tournaments.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.gameTitle.toLowerCase().includes(q)
      ).slice(0, 4)
    : []

  const matchedPlayers = q.length >= 1
    ? participants.filter(p =>
        p.gamerTag.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q)
      ).filter((p, i, arr) =>
        // dedupe by gamerTag
        arr.findIndex(x => x.gamerTag === p.gamerTag) === i
      ).slice(0, 4)
    : []

  const hasResults = matchedTournaments.length > 0 || matchedPlayers.length > 0

  // flat list for keyboard nav
  const allResults = [
    ...matchedTournaments.map(t => ({ kind: 'tournament' as const, id: t.id, label: t.name, sub: t.gameTitle, status: t.status })),
    ...matchedPlayers.map(p => ({ kind: 'player' as const, id: p.id, label: p.gamerTag, sub: p.email, tournamentId: p.tournamentId })),
  ]

  // ── Position dropdown below the input ────────────────────────────────────

  const updatePos = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setPos({
        position: 'fixed',
        top: rect.bottom + 6,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      })
    }
  }

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    setActive(-1)
    updatePos()
    setOpen(true)
  }

  const handleFocus = () => {
    updatePos()
    setOpen(true)
  }

  const handleSelect = (item: typeof allResults[number]) => {
    setOpen(false)
    setQuery('')
    if (item.kind === 'tournament') {
      navigate(`/tournaments/${item.id}`)
    } else {
      navigate(`/tournaments/${item.tournamentId}`)
    }
  }

  const handleClear = () => {
    setQuery('')
    setActive(-1)
    inputRef.current?.focus()
  }

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive(v => Math.min(v + 1, allResults.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive(v => Math.max(v - 1, -1))
    } else if (e.key === 'Enter' && active >= 0) {
      e.preventDefault()
      handleSelect(allResults[active])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current && !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Highlight matching part of string
  const highlight = (text: string) => {
    if (!q) return <>{text}</>
    const idx = text.toLowerCase().indexOf(q)
    if (idx === -1) return <>{text}</>
    return (
      <>
        {text.slice(0, idx)}
        <span className="text-indigo-300 font-semibold">{text.slice(idx, idx + q.length)}</span>
        {text.slice(idx + q.length)}
      </>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      {/* Input */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder="Search tournaments, players…"
          autoComplete="off"
          className="w-full rounded-xl border border-white/5 bg-white/[0.04] py-2 pl-9 pr-8 text-sm text-slate-300 outline-none placeholder:text-slate-600 focus:border-indigo-500/40 focus:bg-white/[0.06] focus:ring-2 focus:ring-indigo-500/20 transition"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-600 hover:text-slate-400"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {createPortal(
        <AnimatePresence>
          {open && q.length >= 1 && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0,  scale: 1    }}
              exit={{   opacity: 0, y: -6, scale: 0.98  }}
              transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
              style={{
                ...pos,
                backgroundColor: '#0c1424',
                border: '1px solid rgba(99,102,241,0.18)',
                borderRadius: 14,
                boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03)',
                overflow: 'hidden',
              }}
            >
              {!hasResults ? (
                <div className="flex items-center gap-3 px-4 py-5 text-sm text-slate-600">
                  <Search className="h-4 w-4 opacity-40" />
                  No results for <span className="text-slate-400">"{query}"</span>
                </div>
              ) : (
                <>
                  {/* Tournaments section */}
                  {matchedTournaments.length > 0 && (
                    <div>
                      <p className="px-4 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                        Tournaments
                      </p>
                      {matchedTournaments.map((t, i) => {
                        const globalIdx = i
                        const sc = STATUS_COLOR[t.status] ?? STATUS_COLOR.UPCOMING
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onMouseDown={() => handleSelect({ kind: 'tournament', id: t.id, label: t.name, sub: t.gameTitle, status: t.status })}
                            className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-white/[0.04] ${active === globalIdx ? 'bg-indigo-500/[0.07]' : ''}`}
                          >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10">
                              <Trophy className="h-3.5 w-3.5 text-violet-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm text-slate-200">{highlight(t.name)}</p>
                              <p className="truncate text-xs text-slate-600">{highlight(t.gameTitle)}</p>
                            </div>
                            <span
                              className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
                              style={{ color: sc.text, backgroundColor: sc.bg }}
                            >
                              {t.status}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {/* Players section */}
                  {matchedPlayers.length > 0 && (
                    <div style={{ borderTop: matchedTournaments.length > 0 ? '1px solid rgba(255,255,255,0.05)' : undefined }}>
                      <p className="px-4 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                        Players
                      </p>
                      {matchedPlayers.map((p, i) => {
                        const globalIdx = matchedTournaments.length + i
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onMouseDown={() => handleSelect({ kind: 'player', id: p.id, label: p.gamerTag, sub: p.email, tournamentId: p.tournamentId })}
                            className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-white/[0.04] ${active === globalIdx ? 'bg-indigo-500/[0.07]' : ''}`}
                          >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-sm font-bold text-indigo-300">
                              {p.gamerTag.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm text-slate-200">{highlight(p.gamerTag)}</p>
                              <p className="truncate text-xs text-slate-600">{highlight(p.email)}</p>
                            </div>
                            <Users className="h-3.5 w-3.5 shrink-0 text-slate-700" />
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {/* Footer hint */}
                  <div
                    className="flex items-center gap-3 px-4 py-2"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
                  >
                    <Swords className="h-3 w-3 text-slate-700" />
                    <span className="text-[10px] text-slate-700">
                      Press <kbd className="rounded bg-white/[0.05] px-1 py-0.5 text-slate-500">↑↓</kbd> to navigate,{' '}
                      <kbd className="rounded bg-white/[0.05] px-1 py-0.5 text-slate-500">Enter</kbd> to open,{' '}
                      <kbd className="rounded bg-white/[0.05] px-1 py-0.5 text-slate-500">Esc</kbd> to close
                    </span>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  )
}
