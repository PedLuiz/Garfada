import { cn } from '../../utils/cn'

export function Textarea({ label, error, id, className, ...props }) {
  const textareaId = id ?? props.name

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-[var(--text-primary)]">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={cn(
          'w-full rounded-xl border bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
          error
            ? 'border-[var(--secondary)] focus-visible:outline-[var(--secondary)]'
            : 'border-[var(--border)] focus-visible:outline-[var(--primary)]',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-[var(--secondary)]">{error}</p>}
    </div>
  )
}
