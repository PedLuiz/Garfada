import { render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

vi.mock('../router/AppRouter', () => ({
  AppRouter: () => <p>Router renderizado</p>,
}))

const { default: App } = await import('../App')

describe('App', () => {
  test('renderiza o roteador da aplicação', () => {
    render(<App />)

    expect(screen.getByText('Router renderizado')).toBeInTheDocument()
  })
})
