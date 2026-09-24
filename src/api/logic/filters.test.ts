import { describe, expect, it } from 'vitest'
import seed from '../../data/hotels.json'
import type { Hotel } from '../../types/hotel'
import { cityOptions, filterHotels, lowestPriceInRange, starOptions } from './filters'

const hotels: Hotel[] = seed
const grand = hotels.find((h) => h.id === 'hotel-01')! // Chicago, 5 stars, rooms $299 and $199

describe('filterHotels', () => {
  it('returns every hotel when no filter is set', () => {
    expect(filterHotels(hotels, {})).toHaveLength(40)
  })

  it('matches city exactly, ignoring case', () => {
    const chicago = filterHotels(hotels, { city: 'chicago' })
    expect(chicago).toHaveLength(4)
    expect(chicago.every((h) => h.address.city === 'Chicago')).toBe(true)
    expect(filterHotels(hotels, { city: 'Chi' })).toHaveLength(0)
  })

  it('matches when ANY room is inside the price range', () => {
    expect(filterHotels([grand], { minPrice: 250, maxPrice: 300 })).toEqual([grand])
    expect(filterHotels([grand], { minPrice: 150, maxPrice: 200 })).toEqual([grand])
    expect(filterHotels([grand], { minPrice: 200, maxPrice: 250 })).toEqual([])
    expect(filterHotels([grand], { maxPrice: 199 })).toEqual([grand])
    expect(filterHotels([grand], { minPrice: 300 })).toEqual([])
  })

  it('matches any of several selected star ratings; empty selection means all', () => {
    const fourOrFive = filterHotels(hotels, { stars: [4, 5] })
    expect(fourOrFive.every((h) => h.star_rating === 4 || h.star_rating === 5)).toBe(true)
    expect(fourOrFive.length).toBeGreaterThan(0)
    expect(filterHotels(hotels, { stars: [] })).toHaveLength(40)
    expect(filterHotels(hotels, { stars: [1] })).toHaveLength(0)
  })

  it('combines filters and can produce no results', () => {
    expect(filterHotels(hotels, { city: 'Chicago', stars: [5], maxPrice: 100 })).toHaveLength(0)
  })
})

describe('lowestPriceInRange', () => {
  it('returns the cheapest room inside the bounds, not the cheapest overall', () => {
    expect(lowestPriceInRange(grand, {})).toBe(199)
    expect(lowestPriceInRange(grand, { minPrice: 200 })).toBe(299)
    expect(lowestPriceInRange(grand, { minPrice: 300 })).toBeUndefined()
  })
})

describe('cityOptions', () => {
  it('lists 10 cities with country and count, sorted by name', () => {
    const options = cityOptions(hotels)
    expect(options).toHaveLength(10)
    expect(options.map((o) => o.city)).toEqual([...options.map((o) => o.city)].sort())
    expect(options.find((o) => o.city === 'Chicago')).toEqual({
      city: 'Chicago',
      country: 'USA',
      count: 4,
    })
  })
})

describe('starOptions', () => {
  it('prices each rating against the other filters, ignoring the star selection', () => {
    const options = starOptions(hotels, { city: 'Chicago', stars: [2] })
    expect(options.map((o) => o.stars)).toEqual([5, 4, 3, 2, 1])
    expect(options.find((o) => o.stars === 5)?.fromPrice).toBe(199)
    expect(options.find((o) => o.stars === 1)?.fromPrice).toBeUndefined()
  })
})
