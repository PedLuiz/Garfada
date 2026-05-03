import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'

const highlights = [
  {
    title: 'Avaliações com contexto',
    description:
      'Registre sabor, atendimento, ambiente e faixa de preço para lembrar exatamente como foi cada experiência.',
    icon: NoteIcon,
    glow: 'from-[#fff2de] to-[#ffe3c3]',
  },
  {
    title: 'Lista de desejos inteligente',
    description:
      'Monte roteiros por bairro, ocasião e companhia para decidir rapidamente onde vai ser seu próximo jantar.',
    icon: BookmarkIcon,
    glow: 'from-[#ffe9dd] to-[#ffd7c3]',
  },
  {
    title: 'Comunidade que inspira',
    description:
      'Acompanhe pessoas com gostos parecidos com o seu e descubra lugares que fazem sentido para o seu paladar.',
    icon: GroupIcon,
    glow: 'from-[#fff0e4] to-[#ffe5d3]',
  },
]

const testimonials = [
  {
    quote: '“A Garfada virou meu mapa oficial de jantares. Sempre encontro sugestões que realmente combinam comigo.”',
    person: 'Amanda, Belo Horizonte',
    rating: 5,
  },
  {
    quote: '“Comecei a salvar minhas experiências em detalhes e hoje monto roteiros sem perder tempo pesquisando do zero.”',
    person: 'Rafael, São Paulo',
    rating: 5,
  },
  {
    quote: '“Melhor parte é seguir quem entende do tipo de comida que eu amo. Descobri vários restaurantes incríveis.”',
    person: 'Luiza, Curitiba',
    rating: 5,
  },
]

const steps = [
  {
    number: '01',
    title: 'Encontre',
    description: 'Explore recomendações de pessoas reais e descubra novos lugares por estilo de cozinha.',
    icon: CompassIcon,
  },
  {
    number: '02',
    title: 'Registre',
    description: 'Avalie suas visitas com contexto para construir seu próprio histórico gastronômico.',
    icon: NoteIcon,
  },
  {
    number: '03',
    title: 'Compartilhe',
    description: 'Publique suas descobertas e inspire amigos a viverem experiências memoráveis.',
    icon: SparkIcon,
  },
]

function NoteIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 3.8h9.3L20 8.5V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.8a1 1 0 0 1 1-1Z" />
      <path d="M14.8 3.8V9h5.2" />
      <path d="M8.3 12.2h7.4M8.3 15.5h7.4" />
    </svg>
  )
}

function BookmarkIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M7 4h10a1 1 0 0 1 1 1v15.2l-6-3.7-6 3.7V5a1 1 0 0 1 1-1Z" />
    </svg>
  )
}

function GroupIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15.8 19a4.5 4.5 0 0 0-7.6 0" />
      <path d="M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M5.2 18.5a4 4 0 0 1 2.5-3.6M18.8 18.5a4 4 0 0 0-2.5-3.6" />
      <path d="M7.3 11.1a2.4 2.4 0 1 0-2.3-2.4M16.7 11.1A2.4 2.4 0 1 1 19 8.7" />
    </svg>
  )
}

function CompassIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.8 8.2-2.5 7-7 2.5 2.5-7 7-2.5Z" />
    </svg>
  )
}

function SparkIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12 3 2.2 5.3L19.5 10l-5.3 1.7L12 17l-2.2-5.3L4.5 10l5.3-1.7L12 3Z" />
      <path d="M19.2 15.4 20.3 18l2.6 1.1-2.6 1.1-1.1 2.6-1.1-2.6-2.6-1.1 2.6-1.1 1.1-2.6Z" />
    </svg>
  )
}

function ArrowRightIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  )
}

function CheckIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m20 7-11 11-5-5" />
    </svg>
  )
}

function StarIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 3.2 14.7 8l5.5.8-4 3.9 1 5.5-5.2-2.4-5.2 2.4 1-5.5-4-3.9 5.5-.8L12 3.2Z" />
    </svg>
  )
}

export function LandingPage() {
  return (
    <div className="space-y-8 lg:space-y-12">
      <section className="relative overflow-hidden rounded-[2.2rem] border border-[#f0cba9] bg-gradient-to-br from-[#fffaf4] via-[#ffffff] to-[#ffe6cc] px-5 py-6 shadow-[0_22px_65px_rgba(181,96,38,0.16)] sm:px-8 lg:px-10 lg:py-9">
        <div className="pointer-events-none absolute -left-24 bottom-16 size-64 rounded-full bg-[#ffd8ad]/60 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 -top-16 size-72 rounded-full bg-[#f7bc73]/45 blur-3xl" />

        <nav className="relative flex flex-wrap items-center justify-between gap-4">
          <Link to="/" className="font-display text-2xl font-semibold tracking-tight text-[#451d0d]">
            Garfada
          </Link>

          <ul className="hidden items-center gap-7 text-sm font-medium text-[#6c3b24] lg:flex">
            <li>
              <a href="#como-funciona" className="transition-colors hover:text-[#b54824]">
                Como funciona
              </a>
            </li>
            <li>
              <a href="#comunidade" className="transition-colors hover:text-[#b54824]">
                Comunidade
              </a>
            </li>
            <li>
              <a href="#roteiros" className="transition-colors hover:text-[#b54824]">
                Roteiros
              </a>
            </li>
          </ul>

          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="secondary" size="sm" className="border-[#ddb896] bg-[#fff7ed] text-[#6f361f] hover:border-[#c17c4f]">
                Entrar
              </Button>
            </Link>
            <Link to="/cadastro">
              <Button size="sm" className="bg-[#b54824] hover:bg-[#95371a] focus-visible:outline-[#b54824]">
                Criar conta
              </Button>
            </Link>
          </div>
        </nav>

        <div className="relative mt-10 grid gap-9 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div>
            <h1 className="font-display text-4xl leading-[1.08] font-semibold tracking-tight text-[#2d170d] sm:text-5xl lg:text-[3.65rem]">
              Seu próximo restaurante começa na Garfada
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#704027] sm:text-lg">
              Descubra lugares com avaliações reais, salve experiências que marcaram sua semana e monte roteiros gastronômicos
              para cada ocasião.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/cadastro">
                <Button size="lg" className="w-full bg-[#b54824] text-white shadow-[0_10px_28px_rgba(157,58,28,0.35)] hover:bg-[#95371a] sm:w-auto">
                  Criar conta grátis
                </Button>
              </Link>
              <a href="#comunidade" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full border-[#dcb28f] bg-[#fff7eb] text-[#60301c] hover:border-[#be7549] sm:w-auto"
                >
                  Explorar avaliações
                  <ArrowRightIcon className="size-4" />
                </Button>
              </a>
            </div>

            <ul className="mt-8 space-y-3 text-sm text-[#5b311e] sm:text-base">
              <li className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-full bg-[#ffe4c6] text-[#a34220]">
                  <CheckIcon className="size-3.5" />
                </span>
                Recomendação baseada no seu estilo de comida.
              </li>
              <li className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-full bg-[#ffe4c6] text-[#a34220]">
                  <CheckIcon className="size-3.5" />
                </span>
                Históricos organizados por ocasiões e bairros.
              </li>
              <li className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-full bg-[#ffe4c6] text-[#a34220]">
                  <CheckIcon className="size-3.5" />
                </span>
                Feed de avaliações para encontrar joias escondidas.
              </li>
            </ul>
          </div>

          <div className="relative mx-auto w-full max-w-[26rem]">
            <div className="mb-3 hidden w-fit rounded-2xl border border-[#efc39d] bg-white px-3 py-2 text-xs font-semibold text-[#7e3f23] shadow-[0_12px_25px_rgba(166,83,28,0.18)] sm:block">
              Roteiro de sábado pronto
            </div>

            <div className="rounded-[2rem] border border-[#dfa67a] bg-[#fff3e5] p-5 shadow-[0_24px_55px_rgba(173,88,32,0.2)]">
              <div className="mb-4 rounded-2xl bg-[#c45a28] px-4 py-3 text-xs font-semibold text-[#fff5eb]">Hoje em alta na Garfada</div>
              <div className="space-y-3">
                <article className="rounded-2xl border border-[#f1d6bf] bg-white p-4 text-[#361a0f]">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8e492a]">Restaurante</p>
                  <h3 className="mt-1 font-display text-lg">Casa Brasa</h3>
                  <p className="mt-1 text-sm text-[#6d3b28]">Carnes na brasa e cozinha mineira contemporânea.</p>
                </article>
                <article className="rounded-2xl border border-[#f1d6bf] bg-[#fff7ef] p-4 text-[#3d1e12]">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#98482a]">Mais salvo</p>
                  <h3 className="mt-1 font-display text-lg">Brotto Pasta Bar</h3>
                  <p className="mt-1 text-sm text-[#75402d]">Massas frescas, carta curta e clima de jantar especial.</p>
                </article>
                <article className="rounded-2xl border border-[#f1d6bf] bg-[#ffeede] p-4 text-[#422113]">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8b3f22]">Descoberta local</p>
                  <h3 className="mt-1 font-display text-lg">Ateliê do Mar</h3>
                  <p className="mt-1 text-sm text-[#733824]">Frutos do mar criativos para noites de celebração.</p>
                </article>
              </div>
            </div>

            <div className="mt-3 ml-auto hidden max-w-[19rem] rounded-2xl border border-[#f0c8a6] bg-[#fff3e6] p-3 shadow-[0_14px_32px_rgba(96,39,14,0.18)] sm:block">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#94492a]">Comunidade</p>
              <div className="mt-1 flex items-center gap-1 text-[#f19a21]">
                {[...Array(5)].map((_, index) => (
                  <StarIcon key={index} className="size-3.5" />
                ))}
              </div>
              <p className="mt-1 text-xs leading-snug text-[#6d3c29]">Avaliações que combinam com seu gosto.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="roteiros" className="space-y-5">
        <div>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-[#2f1a0f] lg:text-4xl">
            Uma plataforma feita para quem vive comida como experiência
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-[#6f3e28] sm:text-base">
            Da primeira impressão do prato ao atendimento final: a Garfada organiza tudo para você escolher melhor, repetir acertos
            e compartilhar descobertas.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {highlights.map((highlight) => {
            const Icon = highlight.icon

            return (
              <article
                key={highlight.title}
                className={`rounded-3xl border border-[#ead2bc] bg-gradient-to-br ${highlight.glow} p-6 shadow-[0_14px_32px_rgba(100,40,15,0.1)] transition-transform duration-300 hover:-translate-y-1`}
              >
                <span className="flex size-11 items-center justify-center rounded-2xl bg-white/85 text-[#9f431f] shadow-sm">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-4 font-display text-2xl font-semibold text-[#32180d]">{highlight.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#70412c]">{highlight.description}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section
        id="comunidade"
        className="grid gap-8 rounded-[2rem] border border-[#f0caa6] bg-gradient-to-br from-[#fff9f2] via-[#ffffff] to-[#ffe7d0] p-6 text-[#3f1f11] shadow-[0_24px_50px_rgba(176,94,35,0.14)] lg:grid-cols-[0.95fr_1.05fr] lg:items-start lg:p-10"
      >
        <div>
          <h2 className="font-display text-3xl font-semibold leading-tight text-[#3f1f11] lg:text-4xl">
            Descubra joias escondidas com uma comunidade que realmente ama comer bem
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#6f3d28] sm:text-base">
            Siga pessoas com paladar parecido com o seu, salve recomendações confiáveis e transforme cada fim de semana em um novo
            roteiro gastronômico.
          </p>
          <a
            href="#como-funciona"
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[#d58e5a] bg-[#b54824] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#983a1c]"
          >
            Ver como funciona
            <ArrowRightIcon className="size-4" />
          </a>
        </div>

        <div className="grid gap-3">
          {testimonials.map((testimonial) => (
            <article key={testimonial.person} className="rounded-2xl border border-[#f0cfb2] bg-white p-4 shadow-[0_10px_20px_rgba(177,95,38,0.08)]">
              <div className="mb-2 flex items-center gap-1 text-[#f8af3b]">
                {[...Array(testimonial.rating)].map((_, index) => (
                  <StarIcon key={`${testimonial.person}-${index}`} className="size-4" />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-[#6d3a25]">{testimonial.quote}</p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#a45631]">{testimonial.person}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="como-funciona" className="space-y-5">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-[#2f1a0f] lg:text-4xl">Como funciona</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon

            return (
              <article key={step.number} className="rounded-3xl border border-[#ead3be] bg-[#fffdf8] p-6 shadow-[0_12px_26px_rgba(95,42,13,0.08)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold tracking-[0.16em] text-[#a7542f]">{step.number}</span>
                  <span className="flex size-10 items-center justify-center rounded-2xl bg-[#fff1df] text-[#a24a24]">
                    <Icon className="size-5" />
                  </span>
                </div>
                <h3 className="mt-4 font-display text-2xl text-[#31190f]">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#704029]">{step.description}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section className="rounded-[2rem] border border-[#e4c7aa] bg-gradient-to-r from-[#fff4e8] via-[#ffe9d5] to-[#ffe1c4] p-7 text-center shadow-[0_14px_28px_rgba(96,39,13,0.14)] lg:p-10">
        <h2 className="font-display text-3xl font-semibold text-[#31180d] lg:text-4xl">
          Pronto para viver sua melhor fase gastronômica?
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-[#6b3a25] sm:text-base">
          Crie seu perfil, salve os restaurantes que quer conhecer e compartilhe cada descoberta com quem também ama comer bem.
        </p>
        <div className="mt-6 flex justify-center">
          <Link to="/cadastro">
            <Button size="lg" className="bg-[#b54824] px-8 text-white shadow-[0_10px_24px_rgba(157,58,28,0.35)] hover:bg-[#95371a]">
              Começar agora
            </Button>
          </Link>
        </div>
      </section>

      <footer className="flex flex-col gap-3 border-t border-[#ebd7c7] pb-2 pt-5 text-sm text-[#8b5739] sm:flex-row sm:items-center sm:justify-between">
        <p>Garfada © {new Date().getFullYear()}</p>
        <div className="flex flex-wrap gap-4">
          <Link to="/login" className="hover:text-[#b54824]">
            Entrar
          </Link>
          <Link to="/cadastro" className="hover:text-[#b54824]">
            Criar conta
          </Link>
          <a href="#como-funciona" className="hover:text-[#b54824]">
            Como funciona
          </a>
        </div>
      </footer>
    </div>
  )
}
