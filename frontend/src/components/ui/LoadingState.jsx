export function LoadingState({ title = 'Carregando conteúdo', description = 'Estamos preparando sua experiência.' }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center shadow-sm shadow-black/5">
      <div className="mx-auto mb-3 size-7 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
      <h3 className="font-display text-lg text-[var(--text-primary)]">{title}</h3>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">{description}</p>
    </div>
  )
}
