import { useState } from 'react'
import { Button } from '../ui/Button'
import { Textarea } from '../ui/Textarea'

export function ReviewForm({ onSubmit, onCancel, initialRating = 4, initialComment = '' }) {
  const [rating, setRating] = useState(initialRating)
  const [comment, setComment] = useState(initialComment)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (rating < 1 || rating > 5) {
      setError('Escolha uma nota entre 1 e 5 estrelas.')
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
        <p className="text-sm font-medium text-[var(--text-primary)]">Sua nota</p>
        <div className="mt-2 flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                star <= rating
                  ? 'bg-[var(--highlight)] text-[var(--deep-accent)]'
                  : 'bg-[var(--bg)] text-[var(--text-secondary)]'
              }`}
              onClick={() => setRating(star)}
            >
              {star} ★
            </button>
          ))}
        </div>
      </div>

      <Textarea
        label="Comentário"
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
