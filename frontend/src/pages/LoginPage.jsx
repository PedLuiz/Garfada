import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import loginRestaurantImage from '../assets/auth/login-restaurant.png'
import { AuthShowcaseLayout } from '../components/common/AuthShowcaseLayout'
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
    <AuthShowcaseLayout
      imageSrc={loginRestaurantImage}
      imageAlt="Ambiente elegante de restaurante ao entardecer"
      imageTitle="Bem vindo de volta"
      panelCompact
    >
      <h1 className="font-display text-3xl text-[#2f180d] sm:text-4xl">Entrar</h1>
      <p className="mt-2 max-w-md text-sm text-[#6f3d26] sm:text-base">
        Acesse sua conta para continuar explorando restaurantes e compartilhando experiencias.
      </p>

      <form className="mt-7 space-y-4" onSubmit={handleSubmit} noValidate>
        <Input
          label="E-mail ou username"
          name="identifier"
          placeholder="voce@email.com ou @username"
          value={form.identifier}
          onChange={(event) => handleChange('identifier', event.target.value)}
          error={errors.identifier}
          className="border-[#efc8a9] bg-white"
        />
        <Input
          label="Senha"
          name="password"
          type="password"
          placeholder="••••••••"
          value={form.password}
          onChange={(event) => handleChange('password', event.target.value)}
          error={errors.password}
          className="border-[#efc8a9] bg-white"
        />

        {submitError && <p className="rounded-xl border border-[#f0c6a5] bg-[#fff2e6] px-3 py-2 text-sm text-[#a94c22]">{submitError}</p>}

        <Button type="submit" className="mt-1 h-12 w-full bg-[#b54824] text-base text-white hover:bg-[#97381a]" isLoading={isSubmitting}>
          Entrar
        </Button>
      </form>

      <p className="mt-5 text-sm text-[#74422b]">
        Ainda nao tem conta?{' '}
        <Link to="/cadastro" className="font-semibold text-[#b54824] hover:text-[#8e3418] hover:underline">
          Criar conta
        </Link>
      </p>
    </AuthShowcaseLayout>
  )
}
