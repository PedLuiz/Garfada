import { test, expect } from './support/fixtures'
import { loginWithNewUser } from './support/api'
import { restaurantCard } from './support/selectors'

test.describe('smoke mobile', () => {
  test('navega pelo catalogo e abre detalhe em viewport mobile', async ({ page, request }) => {
    await loginWithNewUser(page, request)

    await page.goto('/catalogo')
    await expect(page.getByRole('heading', { name: 'Catálogo' })).toBeVisible()
    await expect(restaurantCard(page, 'r2')).toBeVisible()

    await page.getByRole('link', { name: 'Feed' }).click()
    await expect(page).toHaveURL(/\/feed$/)
    await expect(page.getByRole('heading', { name: 'Feed' })).toBeVisible()

    await page.getByRole('link', { name: 'Catálogo' }).click()
    await restaurantCard(page, 'r2').getByRole('link').first().click()

    await expect(page).toHaveURL(/\/restaurantes\/r2$/)
    await expect(page.getByRole('heading', { name: 'Sakura Izakaya' })).toBeVisible()
    await expect(page.getByText('Ramen de missô picante')).toBeVisible()
  })
})
