import { describe, expect, test } from 'vitest'
import {
  buildStarArray,
  formatDate,
  formatFeedAction,
  formatPriceRange,
  getInitials,
} from '../format'

describe('utilitários de formatação', () => {
  test('formata datas com a convenção pt-BR de mês curto', () => {
    expect(formatDate('2026-06-14T12:00:00.000Z')).toMatch(/14 de jun\.? de 2026/)
  })

  test('formata faixas de preço conhecidas e alternativa', () => {
    expect(formatPriceRange('$')).toBe('$ · Econômico')
    expect(formatPriceRange('$$$$$')).toBe('$$$$$ · Faixa de preço')
    expect(formatPriceRange()).toBe('Não informado')
  })

  test('formata rótulos de ações do feed com alternativa', () => {
    expect(formatFeedAction('review')).toBe('avaliou')
    expect(formatFeedAction('wishlist')).toBe('adicionou à lista de desejos')
    expect(formatFeedAction('unknown')).toBe('interagiu com')
  })

  test('monta iniciais a partir de um ou dois tokens do nome', () => {
    expect(getInitials('Ana Maria Silva')).toBe('AM')
    expect(getInitials(' pedro ')).toBe('P')
    expect(getInitials()).toBe('')
  })

  test('monta arrays de estrelas com arredondamento', () => {
    expect(buildStarArray(3.4)).toEqual([true, true, true, false, false])
    expect(buildStarArray(3.5, 4)).toEqual([true, true, true, true])
  })
})
