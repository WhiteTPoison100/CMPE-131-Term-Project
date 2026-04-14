interface Option {
  value: string
  label: string
}

interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  options: Option[]
  error?: string
}

export function SelectInput({
  label,
  options,
  error,
  id,
  className = '',
  ...rest
}: SelectInputProps) {
  const selectId = id ?? rest.name
  return (
    <div className="w-full">
      <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-slate-300">
        {label}
      </label>
      <select
        id={selectId}
        className={`w-full rounded-xl border bg-slate-950/60 px-3.5 py-2.5 text-sm text-white outline-none transition focus:ring-2 ${
          error
            ? 'border-red-500/50 focus:border-red-400 focus:ring-red-500/30'
            : 'border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/25'
        } ${className}`}
        {...rest}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error ? <p className="mt-1.5 text-xs text-red-400">{error}</p> : null}
    </div>
  )
}
