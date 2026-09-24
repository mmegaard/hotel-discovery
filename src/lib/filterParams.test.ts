import { describe, expect, it } from 'vitest'
import { parseFilters, serializeFilters } from './filterParams'

const parse = (qs: string) => parseFilters(new URLSearchParams(qs))

describe('parseFilters', () => {
  it('reads every filter', () => {
    expect(parse('city=Seattle&stars=4,5&minPrice=100&maxPrice=300')).toEqual({
      city: 'Seattle',
      stars: [5, 4],
      minPrice: 100,
      maxPrice: 300,
    })
  })

  it('drops malformed or out-of-range values without throwing', () => {
    expect(parse('')).toEqual({})
    expect(parse('city=%20&stars=9,x,5,5&minPrice=abc&maxPrice=10000')).toEqual({ stars: [5] })
    expect(parse('minPrice=300&maxPrice=100')).toEqual({})
    expect(parse('minPrice=55.5')).toEqual({})
  })
})

describe('serializeFilters', () => {
  it('omits empty and default values and round-trips', () => {
    expect(serializeFilters({}).toString()).toBe('')
    expect(serializeFilters({ minPrice: 50, maxPrice: 600, stars: [] }).toString()).toBe('')
    const qs = serializeFilters({
      city: 'Seattle',
      stars: [4, 5],
      minPrice: 100,
      maxPrice: 300,
    }).toString()
    expect(qs).toBe('city=Seattle&stars=5%2C4&minPrice=100&maxPrice=300')
    expect(parse(qs)).toEqual({ city: 'Seattle', stars: [5, 4], minPrice: 100, maxPrice: 300 })
  })
})
