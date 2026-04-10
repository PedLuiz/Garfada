const PRICE_RANGE_LABELS = {
  $: 'Econômico',
  $$: 'Moderado',
  $$$: 'Elevado',
  $$$$: 'Premium',
}

const FEED_ACTION_LABELS = {
  review: 'avaliou',
  visited: 'marcou como visitado',
  wishlist: 'adicionou à lista de desejos',
  follow: 'começou a seguir',
}

export function formatDate(dateString) {
  const date = new Date(dateString)

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function formatPriceRange(priceRange) {
  if (!priceRange) {
    return 'Não informado'
  }

  return `${priceRange} · ${PRICE_RANGE_LABELS[priceRange] ?? 'Faixa de preço'}`
}

export function formatFeedAction(type) {
  return FEED_ACTION_LABELS[type] ?? 'interagiu com'
}

export function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((token) => token[0]?.toUpperCase())
    .join('')
}

export function buildStarArray(rating = 0, max = 5) {
  return Array.from({ length: max }, (_, index) => index + 1 <= Math.round(rating))
}
