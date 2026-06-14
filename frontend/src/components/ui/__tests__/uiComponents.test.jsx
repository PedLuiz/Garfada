import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'
import { Avatar } from '../Avatar'
import { Badge } from '../Badge'
import { Button } from '../Button'
import { EmptyState } from '../EmptyState'
import { ErrorState } from '../ErrorState'
import { Input } from '../Input'
import { LoadingState } from '../LoadingState'
import { Select } from '../Select'
import { Skeleton } from '../Skeleton'
import { Tabs } from '../Tabs'
import { Textarea } from '../Textarea'

describe('componentes de UI', () => {
  test('Button renderiza estado de carregamento e impede cliques', async () => {
    const onClick = vi.fn()
    render(<Button isLoading onClick={onClick}>Salvar</Button>)

    const button = screen.getByRole('button', { name: /carregando/i })
    expect(button).toBeDisabled()

    await userEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  test('Input, Textarea e Select conectam labels aos controles e mostram erros/dicas', async () => {
    const onChange = vi.fn()
    render(
      <>
        <Input label="Nome" name="name" hint="Nome público" defaultValue="Ana" onChange={onChange} />
        <Input label="Email" name="email" error="Email inválido" />
        <Textarea label="Bio" name="bio" error="Bio muito longa" />
        <Select
          label="Cozinha"
          name="cuisine"
          options={[
            { value: 'Italiana', label: 'Italiana' },
            { value: 'Japonesa', label: 'Japonesa' },
          ]}
        />
      </>,
    )

    await userEvent.type(screen.getByLabelText('Nome'), ' Maria')
    expect(onChange).toHaveBeenCalled()
    expect(screen.getByText('Nome público')).toBeInTheDocument()
    expect(screen.getByText('Email inválido')).toBeInTheDocument()
    expect(screen.getByText('Bio muito longa')).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Cozinha' })).toHaveDisplayValue('Italiana')
  })

  test('Avatar renderiza imagem quando src existe e iniciais como alternativa', () => {
    const { rerender } = render(<Avatar src="/ana.png" name="Ana Maria" />)

    expect(screen.getByRole('img', { name: 'Avatar de Ana Maria' })).toHaveAttribute('src', '/ana.png')

    rerender(<Avatar name="Ana Maria" />)
    expect(screen.getByLabelText('Avatar de Ana Maria')).toHaveTextContent('AM')
  })

  test('Badge, LoadingState e Skeleton renderizam conteúdo visível', () => {
    render(
      <>
        <Badge variant="success">Aberto</Badge>
        <LoadingState title="Carregando restaurantes" description="Só um instante" />
        <Skeleton className="custom" />
      </>,
    )

    expect(screen.getByText('Aberto')).toBeInTheDocument()
    expect(screen.getByText('Carregando restaurantes')).toBeInTheDocument()
    expect(screen.getByText('Só um instante')).toBeInTheDocument()
  })

  test('Tabs informam valores selecionados via onChange', async () => {
    const onChange = vi.fn()
    render(<Tabs tabs={[
      { value: 'reviews', label: 'Reviews' },
      { value: 'visited', label: 'Visitados' },
    ]} activeTab="reviews" onChange={onChange} />)

    await userEvent.click(screen.getByRole('button', { name: 'Visitados' }))

    expect(onChange).toHaveBeenCalledWith('visited')
  })

  test('EmptyState e ErrorState chamam ações opcionais', async () => {
    const onAction = vi.fn()
    const onRetry = vi.fn()
    render(
      <>
        <EmptyState title="Nada aqui" description="Sem dados" actionLabel="Adicionar" onAction={onAction} />
        <ErrorState message="Falha de rede" onRetry={onRetry} />
      </>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Adicionar' }))
    await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))

    expect(onAction).toHaveBeenCalledTimes(1)
    expect(onRetry).toHaveBeenCalledTimes(1)
  })
})
