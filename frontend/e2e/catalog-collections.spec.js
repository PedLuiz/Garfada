import { test, expect } from './support/fixtures'
import { loginWithNewUser } from './support/api'
import { restaurantCard } from './support/selectors'

test.describe('catalogo, filtros e colecoes', () => {
  test.beforeEach(async ({ page, request }) => {
    await loginWithNewUser(page, request)
  })

  test('filtra restaurantes e abre o detalhe pelo card', async ({ page }) => {
    await page.goto('/catalogo')

    await expect(restaurantCard(page, 'r1')).toBeVisible()
    await expect(restaurantCard(page, 'r2')).toBeVisible()
    await expect(page.getByText('8 opções')).toBeVisible()

    await page.getByLabel('Busca').fill('sakura')
    await page.getByLabel('Cozinha').selectOption('Japonesa')
    await page.getByLabel('Preço').selectOption('$$$')
    await page.getByLabel('Avaliação mínima').selectOption('4.5')

    await expect(restaurantCard(page, 'r2')).toBeVisible()
    await expect(restaurantCard(page, 'r1')).toBeHidden()
    await expect(page.getByText('1 opção')).toBeVisible()
    await expect(page.getByText('4 filtros ativos')).toBeVisible()

    await restaurantCard(page, 'r2').getByRole('link').first().click()
    await expect(page).toHaveURL(/\/restaurantes\/r2$/)
    await expect(page.getByRole('heading', { name: 'Sakura Izakaya' })).toBeVisible()
    await expect(page.getByText('Omakase 8 tempos')).toBeVisible()
  })

  test('salva e remove restaurante da lista de desejos', async ({ page }) => {
    await page.goto('/catalogo')

    const card = restaurantCard(page, 'r1')
    await card.hover()
    await card.getByRole('button', { name: 'Salvar' }).click()

    await expect(page.getByText('Restaurante salvo na sua lista.')).toBeVisible()

    await page.getByRole('link', { name: 'Lista de Desejos' }).click()
    await expect(page).toHaveURL(/\/lista-desejos$/)
    await expect(restaurantCard(page, 'r1')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Casa Mineira Contemporânea' })).toBeVisible()

    await restaurantCard(page, 'r1').getByRole('button', { name: 'Na Lista' }).click()
    await expect(restaurantCard(page, 'r1')).toBeHidden()
    await expect(page.getByText('Sua lista está vazia')).toBeVisible()
  })

  test('marca e remove restaurante do historico de visitados', async ({ page }) => {
    await page.goto('/catalogo')

    const card = restaurantCard(page, 'r3')
    await card.hover()
    await card.getByRole('button', { name: 'Marcar visita' }).click()

    await expect(page.getByText('Visita registrada com sucesso.')).toBeVisible()

    await page.getByRole('link', { name: 'Visitados' }).click()
    await expect(page).toHaveURL(/\/visitados$/)
    await expect(restaurantCard(page, 'r3')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Forno da Vila' })).toBeVisible()

    await restaurantCard(page, 'r3').getByRole('button', { name: 'Visitado' }).click()
    await expect(restaurantCard(page, 'r3')).toBeHidden()
    await expect(page.getByText('Nenhuma visita registrada')).toBeVisible()
  })
})
