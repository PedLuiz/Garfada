import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'

const features = [
  {
    title: 'Avalie com contexto',
    description: 'Registre notas, comentários e detalhes da sua experiência gastronômica.',
  },
  {
    title: 'Salve restaurantes',
    description: 'Monte sua lista de desejos para planejar próximas visitas com facilidade.',
  },
  {
    title: 'Marque visitas',
    description: 'Acompanhe seu histórico de lugares visitados e evolução do seu gosto.',
  },
  {
    title: 'Siga pessoas',
    description: 'Descubra novos restaurantes com base nas avaliações de quem você confia.',
  },
]

export function LandingPage() {
  return (
    <div className="space-y-10 lg:space-y-14">
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm shadow-black/5 lg:p-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex rounded-full bg-[color-mix(in_srgb,var(--highlight)_30%,var(--surface))] px-3 py-1 text-xs font-semibold text-[var(--deep-accent)]">
            Sua jornada gastronômica em um só lugar
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold text-[var(--text-primary)] lg:text-5xl">
            Garfada transforma restaurantes em histórias para lembrar
          </h1>
          <p className="mt-4 text-base text-[var(--text-secondary)] lg:text-lg">
            Descubra lugares, acompanhe avaliações da comunidade e organize tudo o que você quer provar.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/cadastro">
              <Button size="lg" className="w-full sm:w-auto">
                Criar conta
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Entrar
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl text-[var(--text-primary)] lg:text-3xl">Tudo para viver o lado social da comida</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {features.map((feature) => (
            <article key={feature.title} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <h3 className="font-display text-xl text-[var(--text-primary)]">{feature.title}</h3>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
