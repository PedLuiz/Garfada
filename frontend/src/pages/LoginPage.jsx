import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useAuth } from '../hooks/useAuth'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ identifier: '', password: '' })
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function validate() {
    const validation = {}

    if (!form.identifier.trim()) {
      validation.identifier = 'Informe e-mail ou username.'
    }

    if (!form.password.trim()) {
      validation.password = 'Informe a senha.'
    }

    return validation
  }

  function handleChange(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => {
      if (!current[field]) {
        return current
      }

      const next = { ...current }
      delete next[field]
      return next
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitError('')

    const validation = validate()
    setErrors(validation)

    if (Object.keys(validation).length > 0) {
      return
    }

    setIsSubmitting(true)

    try {
      await login(form)
      navigate('/catalogo', { replace: true })
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Falha ao entrar.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-xl rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm shadow-black/5 lg:p-8">
      <h1 className="font-display text-3xl text-[var(--text-primary)]">Entrar</h1>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">Acesse sua conta para continuar explorando o Garfada.</p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
        <Input
          label="E-mail ou username"
          name="identifier"
          placeholder="voce@email.com ou @username"
          value={form.identifier}
          onChange={(event) => handleChange('identifier', event.target.value)}
          error={errors.identifier}
        />
        <Input
          label="Senha"
          name="password"
          type="password"
          placeholder="••••••••"
          value={form.password}
          onChange={(event) => handleChange('password', event.target.value)}
          error={errors.password}
        />

        {submitError && <p className="text-sm text-[var(--secondary)]">{submitError}</p>}

        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Entrar
        </Button>
      </form>

      <p className="mt-5 text-sm text-[var(--text-secondary)]">
        Ainda não tem conta?{' '}
        <Link to="/cadastro" className="font-medium text-[var(--accent)] hover:underline">
          Criar conta
        </Link>
      </p>
    </section>
  )
}
