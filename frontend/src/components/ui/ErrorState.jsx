import { Button } from './Button'

export function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-2xl border border-[color-mix(in_srgb,var(--secondary)_45%,var(--border))] bg-[var(--surface)] p-6 text-center">
      <h3 className="font-display text-xl text-[var(--text-primary)]">Não foi possível carregar</h3>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">{message}</p>
      {onRetry && (
        <Button className="mt-4" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  )
}
