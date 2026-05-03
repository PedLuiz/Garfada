import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'

export function NotFoundPage() {
  return (
    <div className="mx-auto mt-16 max-w-xl rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
      <h1 className="font-display text-4xl text-[var(--text-primary)]">Página não encontrada</h1>
      <p className="mt-3 text-sm text-[var(--text-secondary)]">
        O caminho que você tentou acessar não existe ou foi movido.
      </p>
      <Link to="/">
        <Button className="mt-6">Voltar para início</Button>
      </Link>
    </div>
  )
}
