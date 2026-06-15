import { useState } from 'react'
import { Button } from '../ui/Button'
import { Textarea } from '../ui/Textarea'

export function ReviewForm({ onSubmit, onCancel, rating = 0, initialComment = '' }) {
  const [comment, setComment] = useState(initialComment)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (rating < 1 || rating > 5) {
      setError('Selecione uma nota nas estrelas ao lado do botão Avaliar.')
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit({ rating, comment })
      setComment('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar avaliação.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4" onSubmit={handleSubmit}>
      <div>
        <p className="text-sm font-medium text-[var(--text-primary)]">Sua nota atual</p>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          {rating > 0 ? `${rating}/5 estrelas` : 'Selecione a nota nas estrelas ao lado do botão Avaliar.'}
        </p>
      </div>

      <Textarea
        label="Comentário"
        name="comment"
        placeholder="Como foi sua experiência?"
        rows={4}
        value={comment}
        onChange={(event) => setComment(event.target.value)}
      />

      {error && <p className="text-sm text-[var(--secondary)]">{error}</p>}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" isLoading={isSubmitting}>
          Publicar avaliação
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
