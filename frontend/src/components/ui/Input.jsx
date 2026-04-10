import { cn } from '../../utils/cn'

export function Input({ label, error, hint, id, className, ...props }) {
  const inputId = id ?? props.name

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-[var(--text-primary)]">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'h-11 w-full rounded-xl border bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
          error
            ? 'border-[var(--secondary)] focus-visible:outline-[var(--secondary)]'
            : 'border-[var(--border)] focus-visible:outline-[var(--primary)]',
          className,
        )}
        {...props}
      />
      {error ? (
        <p className="text-xs text-[var(--secondary)]">{error}</p>
      ) : (
        hint && <p className="text-xs text-[var(--text-secondary)]">{hint}</p>
      )}
    </div>
  )
}
