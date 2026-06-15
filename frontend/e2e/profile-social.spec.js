import { test, expect } from './support/fixtures'
import { loginWithNewUser, registerUser } from './support/api'
import { userPreviewCard } from './support/selectors'

test.describe('perfil e fluxo social', () => {
  test('edita perfil e reflete os dados atualizados', async ({ page, request }) => {
    const session = await loginWithNewUser(page, request)
    const updatedName = `${session.credentials.name} Atualizado`
    const updatedBio = `Bio criada por E2E ${Date.now()}`

    await page.goto('/perfil/editar')
    await expect(page.getByRole('heading', { name: 'Editar Perfil' })).toBeVisible()

    await page.getByLabel('Nome').fill(updatedName)
    await page.getByLabel('Bio').fill(updatedBio)
    await page.getByLabel('Culinárias favoritas').fill('Italiana, Japonesa')
    await page.getByRole('button', { name: 'Salvar perfil' }).click()

    await expect(page).toHaveURL(/\/meu-perfil$/)
    await expect(page.getByText(updatedName)).toBeVisible()
    await expect(page.getByText(updatedBio)).toBeVisible()
    await expect(page.getByText('Italiana')).toBeVisible()
    await expect(page.getByText('Japonesa')).toBeVisible()
  })

  test('busca outro usuario, segue e abre o perfil publico', async ({ page, request }) => {
    const target = await registerUser(request, {
      name: `Alvo Social ${Date.now()}`,
    })
    await loginWithNewUser(page, request)

    await page.goto('/feed')
    await expect(page.getByRole('heading', { name: 'Feed' })).toBeVisible()

    await page.getByLabel('Buscar usuários').fill(target.credentials.username)

    const targetCard = userPreviewCard(page, target.user.id)
    await expect(targetCard).toBeVisible()
    await targetCard.getByRole('button', { name: 'Seguir' }).click()
    await expect(targetCard.getByRole('button', { name: 'Seguindo' })).toBeVisible()

    await targetCard.getByRole('link', { name: new RegExp(target.credentials.name) }).click()
    await expect(page).toHaveURL(new RegExp(`/usuarios/${target.user.id}$`))
    await expect(page.getByText(target.credentials.name)).toBeVisible()
    await expect(page.getByText(`@${target.credentials.username}`)).toBeVisible()
    await expect(page.getByRole('button', { name: 'Seguindo' })).toBeVisible()
  })
})
