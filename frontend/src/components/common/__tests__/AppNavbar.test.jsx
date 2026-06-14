import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, test, vi } from 'vitest'

const logout = vi.fn()
let me = {
  id: 'u_1',
  name: 'Ana Maria',
  username: 'ana',
  avatarUrl: '',
}

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    me,
    logout,
  }),
}))

const { AppNavbar } = await import('../AppNavbar')

describe('AppNavbar', () => {
  beforeEach(() => {
    logout.mockClear()
    me = {
      id: 'u_1',
      name: 'Ana Maria',
      username: 'ana',
      avatarUrl: '',
    }
  })

  test('renderiza navegação e link do perfil do usuário autenticado', () => {
    render(<MemoryRouter initialEntries={['/catalogo']}><AppNavbar /></MemoryRouter>)

    expect(screen.getByRole('link', { name: /garfada/i })).toHaveAttribute('href', '/catalogo')
    expect(screen.getByRole('link', { name: 'Catálogo' })).toHaveAttribute('href', '/catalogo')
    expect(screen.getByRole('link', { name: /ana/i })).toHaveAttribute('href', '/meu-perfil')
  })

  test('chama logout quando o usuário clica em Sair', async () => {
    render(<MemoryRouter><AppNavbar /></MemoryRouter>)

    await userEvent.click(screen.getByRole('button', { name: 'Sair' }))

    expect(logout).toHaveBeenCalledTimes(1)
  })

  test('renderiza sem identidade de perfil quando me está indisponível', () => {
    me = null

    render(<MemoryRouter><AppNavbar /></MemoryRouter>)

    expect(screen.queryByText('ana')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sair' })).toBeInTheDocument()
  })
})
