import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import registerDishImage from '../assets/auth/register-dish.png'
import { AuthShowcaseLayout } from '../components/common/AuthShowcaseLayout'
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
    <AuthShowcaseLayout
      imageSrc={registerDishImage}
      imageAlt="Prato gourmet em mesa de restaurante"
      panelBadge="Bem-vindo ao Garfada"
      imageTitle="Transforme cada refeição em descoberta"
      imageTitleClassName="text-white"
      imageDescription="Crie sua conta para registrar experiências, seguir pessoas com gosto parecido e salvar seus próximos restaurantes."
      panelPills={['Perfil gastronômico', 'Feed da comunidade', 'Histórico de visitas']}
      panelTextClassName="text-white"
    >
      <h1 className="font-display text-3xl text-[#2f180d] sm:text-4xl">Criar conta no Garfada</h1>
      <p className="mt-2 max-w-md text-sm text-[#6f3d26] sm:text-base">
        Comece agora a organizar suas descobertas gastronômicas em um único lugar.
      </p>

      <form className="mt-7 space-y-4" onSubmit={handleSubmit} noValidate>
        <Input
          label="Nome"
          name="name"
          placeholder="Seu nome completo"
          value={form.name}
          onChange={(event) => handleChange('name', event.target.value)}
          error={errors.name}
          className="border-[#efc8a9] bg-white"
        />

        <Input
          label="E-mail"
          name="email"
          type="email"
          placeholder="você@email.com"
          value={form.email}
          onChange={(event) => handleChange('email', event.target.value)}
          error={errors.email}
          className="border-[#efc8a9] bg-white"
        />

        <Input
          label="Username"
          name="username"
          placeholder="como você será encontrado"
          value={form.username}
          onChange={(event) => handleChange('username', event.target.value)}
          error={errors.username}
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

        <Input
          label="Confirmar senha"
          name="confirmPassword"
          type="password"
          placeholder="repita sua senha"
          value={form.confirmPassword}
          onChange={(event) => handleChange('confirmPassword', event.target.value)}
          error={errors.confirmPassword}
          className="border-[#efc8a9] bg-white"
        />

        <label className="mt-1 flex items-start gap-2 text-sm text-[#72422c]">
          <input
            type="checkbox"
            className="mt-1 size-4 rounded border-[#d99e75] text-[#b54824]"
            checked={form.acceptedTerms}
            onChange={(event) => handleChange('acceptedTerms', event.target.checked)}
          />
          Aceito os termos de uso e a política de comunidade do Garfada.
        </label>
        {errors.acceptedTerms && <p className="text-sm text-[#a94c22]">{errors.acceptedTerms}</p>}

        {submitError && <p className="rounded-xl border border-[#f0c6a5] bg-[#fff2e6] px-3 py-2 text-sm text-[#a94c22]">{submitError}</p>}

        <Button
          type="submit"
          className="mt-1 h-12 w-full bg-[#b54824] text-base text-white hover:bg-[#97381a]"
          isLoading={isSubmitting}
          disabled={hasErrors && isSubmitting}
        >
          Criar conta
        </Button>
      </form>

      <p className="mt-5 text-sm text-[#74422b]">
        Já tem conta?{' '}
        <Link to="/login" className="font-semibold text-[#b54824] hover:text-[#8e3418] hover:underline">
          Entrar
        </Link>
      </p>
    </AuthShowcaseLayout>
  )
}
