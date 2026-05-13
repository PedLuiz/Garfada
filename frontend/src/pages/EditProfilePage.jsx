import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { LoadingState } from '../components/ui/LoadingState'
import { Textarea } from '../components/ui/Textarea'
import { Avatar } from '../components/ui/Avatar'
import { useAuth } from '../hooks/useAuth'
import { userService } from '../services/userService'

export function EditProfilePage() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const { me, setMe, refreshMe } = useAuth()
  const [form, setForm] = useState({
    name: '',
    username: '',
    bio: '',
    avatarUrl: '',
    favoriteCuisines: '',
  })
  const [errors, setErrors] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    async function bootstrap() {
      if (!me) {
        const freshProfile = await refreshMe()

        if (freshProfile) {
          setForm({
            name: freshProfile.name,
            username: freshProfile.username,
            bio: freshProfile.bio,
            avatarUrl: freshProfile.avatarUrl,
            favoriteCuisines: freshProfile.favoriteCuisines.join(', '),
          })
        }

        return
      }

      setForm({
        name: me.name,
        username: me.username,
        bio: me.bio,
        avatarUrl: me.avatarUrl,
        favoriteCuisines: me.favoriteCuisines.join(', '),
      })
    }

    bootstrap()
  }, [me, refreshMe])

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

  function handleFilePick() {
    fileInputRef.current?.click()
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const previewUrl = URL.createObjectURL(file)
    handleChange('avatarUrl', previewUrl)
  }

  function validate() {
    const validation = {}

    if (!form.name.trim()) {
      validation.name = 'Informe seu nome.'
    }

    if (!form.username.trim()) {
      validation.username = 'Informe um username.'
    }

    if (form.username.trim().length < 3) {
      validation.username = 'O username precisa ter ao menos 3 caracteres.'
    }

    return validation
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitError('')

    const validation = validate()
    setErrors(validation)

    if (Object.keys(validation).length > 0) {
      return
    }

    setIsSaving(true)

    try {
      const updatedProfile = await userService.updateProfile({
        name: form.name.trim(),
        username: form.username.trim(),
        bio: form.bio.trim(),
        avatarUrl: form.avatarUrl.trim(),
        favoriteCuisines: form.favoriteCuisines
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
      })

      setMe(updatedProfile)
      navigate('/meu-perfil', { replace: true })
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Falha ao salvar perfil.')
    } finally {
      setIsSaving(false)
    }
  }

  if (!me && !form.name) {
    return <LoadingState title="Carregando editor" description="Buscando dados do seu perfil." />
  }

  return (
    <section className="mx-auto w-full max-w-3xl rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm shadow-black/5 lg:p-8">
      <h1 className="font-display text-3xl text-[var(--text-primary)]">Editar Perfil</h1>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">
        Atualize sua apresentação para a comunidade descobrir melhor seu estilo gastronômico.
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div className="rounded-2xl border border-dashed border-[var(--border)] p-4">
          <p className="text-sm font-medium text-[var(--text-primary)]">Avatar</p>
          <div className="mt-3 flex items-center gap-4">
            <Avatar src={form.avatarUrl} name={form.name || 'Perfil'} size="lg" />
            <div className="space-y-2">
              <Button type="button" variant="secondary" onClick={handleFilePick}>
                Upload
              </Button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        <Input
          label="Nome"
          name="name"
          value={form.name}
          onChange={(event) => handleChange('name', event.target.value)}
          error={errors.name}
        />

        <Input
          label="Username"
          name="username"
          value={form.username}
          onChange={(event) => handleChange('username', event.target.value)}
          error={errors.username}
        />

        <Textarea
          label="Bio"
          name="bio"
          rows={4}
          value={form.bio}
          onChange={(event) => handleChange('bio', event.target.value)}
        />

        <Input
          label="Culinárias favoritas"
          name="favoriteCuisines"
          placeholder="Brasileira, Japonesa, Italiana"
          value={form.favoriteCuisines}
          onChange={(event) => handleChange('favoriteCuisines', event.target.value)}
          hint="Separe por vírgulas para criar suas preferências."
        />

        {submitError && <p className="text-sm text-[var(--secondary)]">{submitError}</p>}

        <div className="flex flex-wrap gap-2">
          <Button type="submit" isLoading={isSaving}>
            Salvar perfil
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/meu-perfil')}>
            Cancelar
          </Button>
        </div>
      </form>
    </section>
  )
}
