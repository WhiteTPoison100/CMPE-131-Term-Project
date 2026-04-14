interface LoadingSpinnerProps {
  label?: string
  className?: string
}

export function LoadingSpinner({ label = 'Loading…', className = '' }: LoadingSpinnerProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-16 text-slate-400 ${className}`}
    >
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-slate-700 border-t-indigo-400"
        role="status"
        aria-label={label}
      />
      <p className="text-sm">{label}</p>
    </div>
  )
}
