interface TextAreaInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
}

export function TextAreaInput({ label, error, id, className = '', ...rest }: TextAreaInputProps) {
  const tid = id ?? rest.name
  return (
    <div className="w-full">
      <label htmlFor={tid} className="mb-1.5 block text-sm font-medium text-slate-300">
        {label}
      </label>
      <textarea
        id={tid}
        className={`min-h-[108px] w-full rounded-xl border bg-slate-950/60 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:ring-2 ${
          error
            ? 'border-red-500/50 focus:border-red-400 focus:ring-red-500/30'
            : 'border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/25'
        } ${className}`}
        {...rest}
      />
      {error ? <p className="mt-1.5 text-xs text-red-400">{error}</p> : null}
    </div>
  )
}
