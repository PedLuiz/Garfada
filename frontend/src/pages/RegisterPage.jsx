import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useAuth } from '../hooks/useAuth'

const initialForm = {
  name: '',
  email: '',
  username: '',
  password: '',
  confirmPassword: '',
  acceptedTerms: false,
}

function validate(form) {
  const errors = {}

  if (!form.name.trim()) {
    errors.name = 'Informe seu nome.'
  }

  if (!form.email.trim()) {
    errors.email = 'Informe seu e-mail.'
  } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
    errors.email = 'Digite um e-mail válido.'
  }

  if (!form.username.trim()) {
    errors.username = 'Escolha um username.'
  } else if (form.username.trim().length < 3) {
    errors.username = 'Use pelo menos 3 caracteres.'
  }

  if (!form.password.trim()) {
    errors.password = 'Informe uma senha.'
  } else if (form.password.length < 6) {
    errors.password = 'A senha precisa ter pelo menos 6 caracteres.'
  }

  if (form.confirmPassword !== form.password) {
    errors.confirmPassword = 'As senhas não conferem.'
  }

  if (!form.acceptedTerms) {
    errors.acceptedTerms = 'Você precisa aceitar para continuar.'
  }

  return errors
}

export function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors])

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

    const validation = validate(form)
    setErrors(validation)

    if (Object.keys(validation).length > 0) {
      return
    }

    setIsSubmitting(true)

    try {
      await register({
        name: form.name,
        email: form.email,
        username: form.username,
        password: form.password,
      })
      navigate('/catalogo', { replace: true })
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Falha ao criar conta.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-xl rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm shadow-black/5 lg:p-8">
      <h1 className="font-display text-3xl text-[var(--text-primary)]">Criar conta no Garfada</h1>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">Comece a registrar suas experiências gastronômicas.</p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
        <Input
          label="Nome"
          name="name"
          placeholder="Seu nome completo"
          value={form.name}
          onChange={(event) => handleChange('name', event.target.value)}
          error={errors.name}
        />

        <Input
          label="E-mail"
          name="email"
          type="email"
          placeholder="voce@email.com"
          value={form.email}
          onChange={(event) => handleChange('email', event.target.value)}
          error={errors.email}
        />

        <Input
          label="Username"
          name="username"
          placeholder="como você será encontrado"
          value={form.username}
          onChange={(event) => handleChange('username', event.target.value)}
          error={errors.username}
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

        <Input
          label="Confirmar senha"
          name="confirmPassword"
          type="password"
          placeholder="repita sua senha"
          value={form.confirmPassword}
          onChange={(event) => handleChange('confirmPassword', event.target.value)}
          error={errors.confirmPassword}
        />

        <label className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
          <input
            type="checkbox"
            className="mt-1 size-4 rounded border-[var(--border)]"
            checked={form.acceptedTerms}
            onChange={(event) => handleChange('acceptedTerms', event.target.checked)}
          />
          Aceito os termos de uso e política de comunidade do Garfada.
        </label>
        {errors.acceptedTerms && <p className="text-sm text-[var(--secondary)]">{errors.acceptedTerms}</p>}

        {submitError && <p className="text-sm text-[var(--secondary)]">{submitError}</p>}

        <Button type="submit" className="w-full" isLoading={isSubmitting} disabled={hasErrors && isSubmitting}>
          Criar conta
        </Button>
      </form>

      <p className="mt-5 text-sm text-[var(--text-secondary)]">
        Já tem conta?{' '}
        <Link to="/login" className="font-medium text-[var(--accent)] hover:underline">
          Entrar
        </Link>
      </p>
    </section>
  )
}
