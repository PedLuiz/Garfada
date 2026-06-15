import { useCallback, useState } from 'react'
import { FeedActivityCard } from '../components/common/FeedActivityCard'
import { PageHeading } from '../components/common/PageHeading'
import { UserPreviewCard } from '../components/common/UserPreviewCard'
import { Input } from '../components/ui/Input'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorState } from '../components/ui/ErrorState'
import { LoadingState } from '../components/ui/LoadingState'
import { useAuth } from '../hooks/useAuth'
import { useAsyncData } from '../hooks/useAsyncData'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { socialService } from '../services/socialService'

export function FeedPage() {
  const { refreshMe } = useAuth()
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query)

  const loadFeedData = useCallback(async () => {
    const [feed, users] = await Promise.all([
      socialService.getFeed(),
      socialService.searchUsers(debouncedQuery),
    ])

    return {
      feed,
      users,
    }
  }, [debouncedQuery])

  const { data, loading, error, reload } = useAsyncData(loadFeedData)

  async function handleFollow(userId) {
    await socialService.followUser(userId)
    await refreshMe()
    await reload()
  }

  if (loading) {
    return <LoadingState title="Carregando feed" description="Buscando atividades sociais e sugestões." />
  }

  if (error) {
    return <ErrorState message={error.message} onRetry={reload} />
  }

  if (!data) {
    return null
  }

  return (
    <div className="space-y-6">
      <PageHeading
        title="Feed"
        description="Acompanhe atividades da comunidade e encontre novos perfis para seguir."
      />

      <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="space-y-4">
          <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <Input
              label="Buscar usuários"
              name="userSearch"
              placeholder="Digite nome ou @username"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </article>

          <article className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <h2 className="font-display text-xl text-[var(--text-primary)]">Sugestões</h2>

            {data.users.length === 0 && (
              <EmptyState
                title="Sem resultados"
                description="Nenhum usuário encontrado para esse termo de busca."
              />
            )}

            {data.users.map((user) => (
              <UserPreviewCard key={user.id} user={user} onFollow={handleFollow} />
            ))}
          </article>
        </aside>

        <section className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <h2 className="font-display text-xl text-[var(--text-primary)]">Atividades recentes</h2>

          {data.feed.length === 0 && (
            <EmptyState
              title="Feed sem atividades"
              description="As interações da sua rede aparecerão aqui conforme as pessoas avaliam e visitam restaurantes."
            />
          )}

          {data.feed.map((item) => (
            <FeedActivityCard key={item.id} item={item} />
          ))}
        </section>
      </section>
    </div>
  )
}
