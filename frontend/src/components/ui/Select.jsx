import { cn } from '../../utils/cn'

export function Select({ label, error, id, options = [], className, ...props }) {
  const selectId = id ?? props.name

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-[var(--text-primary)]">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          'h-11 w-full rounded-xl border bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
          error
            ? 'border-[var(--secondary)] focus-visible:outline-[var(--secondary)]'
            : 'border-[var(--border)] focus-visible:outline-[var(--primary)]',
          className,
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-[var(--secondary)]">{error}</p>}
    </div>
  )
}
