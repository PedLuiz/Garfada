import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, test, vi } from 'vitest'

vi.mock('../../components/common/AppNavbar', () => ({
  AppNavbar: () => <nav>Navbar mock</nav>,
}))

const { AppLayout } = await import('../AppLayout')
const { PublicLayout } = await import('../PublicLayout')

describe('layouts', () => {
  test('AppLayout renderiza navbar e conteúdo privado aninhado', () => {
    render(
      <MemoryRouter initialEntries={['/catalogo']}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/catalogo" element={<p>Conteúdo privado</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Navbar mock')).toBeInTheDocument()
    expect(screen.getByText('Conteúdo privado')).toBeInTheDocument()
  })

  test('PublicLayout omite o cabeçalho na rota da página inicial', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<p>Landing pública</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Landing pública')).toBeInTheDocument()
    expect(screen.queryByText('Descubra. Avalie. Compartilhe.')).not.toBeInTheDocument()
  })

  test('PublicLayout renderiza cabeçalho da marca fora da rota da página inicial', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/login" element={<p>Login público</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Garfada' })).toHaveAttribute('href', '/')
    expect(screen.getByText('Descubra. Avalie. Compartilhe.')).toBeInTheDocument()
    expect(screen.getByText('Login público')).toBeInTheDocument()
  })
})
