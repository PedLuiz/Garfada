import { Input } from '../ui/Input'
import { Select } from '../ui/Select'

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

export function RestaurantFilters({ filters, onChange }) {
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
