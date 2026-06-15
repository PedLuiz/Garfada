import { test, expect } from './support/fixtures'
import { loginWithNewUser } from './support/api'

test.describe('detalhe de restaurante e avaliacoes', () => {
  test.beforeEach(async ({ page, request }) => {
    await loginWithNewUser(page, request)
  })

  test('exibe detalhes, valida nota e publica comentario', async ({ page }) => {
    const uniqueComment = `Experiencia E2E ${Date.now()} muito bem registrada.`

    await page.goto('/restaurantes/r3')

    await expect(page.getByRole('heading', { name: 'Forno da Vila' })).toBeVisible()
    await expect(page.getByText('Prévia do cardápio')).toBeVisible()
    await expect(page.getByText('Tagliatelle al ragù')).toBeVisible()
    await expect(page.getByText('Média Geral')).toBeVisible()

    await page.getByRole('button', { name: 'Avaliar' }).click()
    await expect(page.getByText('Selecione uma nota de 1 a 5 estrelas antes de avaliar.')).toBeVisible()

    await page.getByRole('radio', { name: '5 estrelas' }).click()
    await expect(page.getByText('Nota: 5/5')).toBeVisible()
    await page.getByRole('button', { name: 'Escrever comentário' }).click()
    await page.getByLabel('Comentário').fill(uniqueComment)
    await page.getByRole('button', { name: 'Publicar avaliação' }).click()

    await expect(page.getByText('Avaliação publicada com sucesso.')).toBeVisible()
    await expect(page.getByText(uniqueComment)).toBeVisible()
  })

  test('alterna lista de desejos e visitados no detalhe', async ({ page }) => {
    await page.goto('/restaurantes/r5')

    await page.getByRole('button', { name: 'Adicionar à lista de desejos' }).click()
    await expect(page.getByText('Adicionado à lista de desejos.')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Remover da lista de desejos' })).toBeVisible()

    await page.getByRole('button', { name: 'Marcar Visitado' }).click()
    await expect(page.getByText('Restaurante marcado como visitado.')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Visitado' })).toBeVisible()

    await page.getByRole('button', { name: 'Remover da lista de desejos' }).click()
    await expect(page.getByText('Removido da lista de desejos.')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Adicionar à lista de desejos' })).toBeVisible()
  })
})
