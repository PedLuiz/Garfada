import { test, expect } from './support/fixtures'
import { DEFAULT_PASSWORD, buildUser, registerUser } from './support/api'

test.describe('autenticacao e rotas protegidas', () => {
  test('redireciona usuario anonimo de rota protegida para login', async ({ page }) => {
    await page.goto('/catalogo')

    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible()
  })

  test('cria conta pela UI e abre o catalogo autenticado', async ({ page }) => {
    const user = buildUser()

    await page.goto('/cadastro')
    await page.getByLabel('Nome').fill(user.name)
    await page.getByLabel('E-mail').fill(user.email)
    await page.getByLabel('Username').fill(user.username)
    await page.getByLabel(/^Senha$/).fill(user.password)
    await page.getByLabel('Confirmar senha').fill(user.password)
    await page.getByLabel(/Aceito os termos/i).check()
    await page.getByRole('button', { name: 'Criar conta' }).click()

    await expect(page).toHaveURL(/\/catalogo$/)
    await expect(page.getByRole('heading', { name: 'Catálogo' })).toBeVisible()
    await expect(page.getByText(user.username)).toBeVisible()
  })

  test('valida login invalido, faz login e encerra sessao', async ({ page, request }) => {
    const { credentials } = await registerUser(request)

    await page.goto('/login')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await expect(page.getByText('Informe e-mail ou username.')).toBeVisible()
    await expect(page.getByText('Informe a senha.')).toBeVisible()

    await page.getByLabel('E-mail ou username').fill(credentials.username)
    await page.getByLabel('Senha').fill('senha-errada')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await expect(page.getByText('Credenciais inválidas. Confira e tente novamente.')).toBeVisible()

    await page.getByLabel('Senha').fill(DEFAULT_PASSWORD)
    await page.getByRole('button', { name: 'Entrar' }).click()
    await expect(page).toHaveURL(/\/catalogo$/)
    await expect(page.getByRole('heading', { name: 'Catálogo' })).toBeVisible()

    await page.getByRole('button', { name: 'Sair' }).click()
    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible()
  })
})
