import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { cn } from '../../utils/cn'

const cuisineOptions = [
  { value: 'all', label: 'Todas as cozinhas' },
  { value: 'Brasileira', label: 'Brasileira' },
  { value: 'Japonesa', label: 'Japonesa' },
  { value: 'Italiana', label: 'Italiana' },
  { value: 'Peruana', label: 'Peruana' },
  { value: 'Churrasco', label: 'Churrasco' },
  { value: 'Vegetariana', label: 'Vegetariana' },
  { value: 'Indiana', label: 'Indiana' },
  { value: 'Francesa', label: 'Francesa' },
]

const priceOptions = [
  { value: 'all', label: 'Qualquer faixa de preço' },
  { value: '$', label: '$ Econômico' },
  { value: '$$', label: '$$ Moderado' },
  { value: '$$$', label: '$$$ Elevado' },
]

const ratingOptions = [
  { value: '0', label: 'Sem nota mínima' },
  { value: '3', label: '3.0+' },
  { value: '3.5', label: '3.5+' },
  { value: '4', label: '4.0+' },
  { value: '4.5', label: '4.5+' },
]

const priceLabelMap = Object.fromEntries(priceOptions.map((option) => [option.value, option.label]))
const cuisineLabelMap = Object.fromEntries(cuisineOptions.map((option) => [option.value, option.label]))
const ratingLabelMap = Object.fromEntries(ratingOptions.map((option) => [option.value, option.label]))

function getActiveFilters(filters) {
  const active = []

  if (filters.search.trim()) {
    active.push({ label: 'Busca', value: filters.search.trim() })
  }

  if (filters.location.trim()) {
    active.push({ label: 'Localização', value: filters.location.trim() })
  }

  if (filters.cuisine !== 'all') {
    active.push({ label: 'Cozinha', value: cuisineLabelMap[filters.cuisine] ?? filters.cuisine })
  }

  if (filters.priceRange !== 'all') {
    active.push({ label: 'Preço', value: priceLabelMap[filters.priceRange] ?? filters.priceRange })
  }

  if (filters.minRating !== '0') {
    active.push({ label: 'Nota', value: ratingLabelMap[filters.minRating] ?? filters.minRating })
  }

  return active
}

export function RestaurantFilters({ filters, onChange, variant = 'catalog', onReset, activeFiltersCount = 0 }) {
  const activeFilters = getActiveFilters(filters)

  if (variant === 'catalog') {
    return (
      <section className="rounded-[1.5rem] border border-[color-mix(in_srgb,var(--accent)_18%,var(--border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface)_80%,white_20%)_0%,var(--surface)_100%)] p-4 shadow-sm shadow-black/5 lg:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-display text-xl text-[var(--text-primary)]">Encontre seu próximo lugar</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Combine localização, cozinha e nível de preço para filtrar com precisão.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <p
              aria-live="polite"
              className="rounded-full border border-[color-mix(in_srgb,var(--accent)_18%,var(--border))] bg-[color-mix(in_srgb,var(--accent)_8%,var(--surface))] px-3 py-1 text-xs font-semibold text-[var(--accent)]"
            >
              {activeFiltersCount} filtro{activeFiltersCount === 1 ? '' : 's'} ativo
              {activeFiltersCount === 1 ? '' : 's'}
            </p>
            {onReset && (
              <button
                type="button"
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
                  activeFiltersCount > 0
                    ? 'bg-[var(--secondary)] text-white hover:bg-[#bd4f31] focus-visible:outline-[var(--secondary)]'
                    : 'border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus-visible:outline-[var(--accent)]',
                )}
                onClick={onReset}
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <Input
            label="Busca"
            name="search"
            placeholder="Nome ou descrição"
            value={filters.search}
            onChange={(event) => onChange('search', event.target.value)}
            className="border-[color-mix(in_srgb,var(--accent)_22%,var(--border))] bg-[color-mix(in_srgb,var(--surface)_74%,white_26%)] focus-visible:outline-[var(--accent)]"
          />
          <Input
            label="Localização"
            name="location"
            placeholder="Bairro, rua ou cidade"
            value={filters.location}
            onChange={(event) => onChange('location', event.target.value)}
            className="border-[color-mix(in_srgb,var(--accent)_22%,var(--border))] bg-[color-mix(in_srgb,var(--surface)_74%,white_26%)] focus-visible:outline-[var(--accent)]"
          />
          <Select
            label="Cozinha"
            name="cuisine"
            value={filters.cuisine}
            onChange={(event) => onChange('cuisine', event.target.value)}
            options={cuisineOptions}
            className="border-[color-mix(in_srgb,var(--accent)_22%,var(--border))] bg-[color-mix(in_srgb,var(--surface)_74%,white_26%)] focus-visible:outline-[var(--accent)]"
          />
          <Select
            label="Preço"
            name="priceRange"
            value={filters.priceRange}
            onChange={(event) => onChange('priceRange', event.target.value)}
            options={priceOptions}
            className="border-[color-mix(in_srgb,var(--accent)_22%,var(--border))] bg-[color-mix(in_srgb,var(--surface)_74%,white_26%)] focus-visible:outline-[var(--accent)]"
          />
          <Select
            label="Avaliação mínima"
            name="minRating"
            value={filters.minRating}
            onChange={(event) => onChange('minRating', event.target.value)}
            options={ratingOptions}
            className="border-[color-mix(in_srgb,var(--accent)_22%,var(--border))] bg-[color-mix(in_srgb,var(--surface)_74%,white_26%)] focus-visible:outline-[var(--accent)]"
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {activeFilters.length > 0 ? (
            activeFilters.map((item) => (
              <p
                key={item.label}
                className="rounded-full border border-[color-mix(in_srgb,var(--accent)_18%,var(--border))] bg-[var(--surface)] px-2.5 py-1 text-xs text-[var(--text-secondary)]"
              >
                <span className="font-semibold text-[var(--accent)]">{item.label}:</span> {item.value}
              </p>
            ))
          ) : (
            <p className="text-xs text-[var(--text-secondary)]">
              Use os campos acima para refinar os resultados do catálogo.
            </p>
          )}
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm shadow-black/5">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
        <Input
          label="Busca"
          name="search"
          placeholder="Nome ou descrição"
          value={filters.search}
          onChange={(event) => onChange('search', event.target.value)}
        />
        <Input
          label="Localização"
          name="location"
          placeholder="Bairro, rua ou cidade"
          value={filters.location}
          onChange={(event) => onChange('location', event.target.value)}
        />
        <Select
          label="Cozinha"
          name="cuisine"
          value={filters.cuisine}
          onChange={(event) => onChange('cuisine', event.target.value)}
          options={cuisineOptions}
        />
        <Select
          label="Preço"
          name="priceRange"
          value={filters.priceRange}
          onChange={(event) => onChange('priceRange', event.target.value)}
          options={priceOptions}
        />
        <Select
          label="Avaliação mínima"
          name="minRating"
          value={filters.minRating}
          onChange={(event) => onChange('minRating', event.target.value)}
          options={ratingOptions}
        />
      </div>
    </section>
  )
}
