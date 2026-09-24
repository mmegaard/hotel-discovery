import type { HotelFilters } from '../types/hotel'

// URL <-> HotelFilters. Pure, lenient on the way in (malformed values are
// dropped, never thrown), minimal on the way out (defaults are omitted so
// /hotels stays clean and equal filters produce equal URLs).

export const PRICE_MIN = 50
export const PRICE_MAX = 600
export const PRICE_STEP = 5

function parsePrice(raw: string | null): number | undefined {
  if (raw === null || raw.trim() === '') return undefined
  const n = Number(raw)
  return Number.isInteger(n) && n >= PRICE_MIN && n <= PRICE_MAX ? n : undefined
}

function parseStars(raw: string | null): number[] | undefined {
  if (raw === null) return undefined
  const stars = [...new Set(raw.split(',').map(Number))]
    .filter((n) => Number.isInteger(n) && n >= 1 && n <= 5)
    .sort((a, b) => b - a)
  return stars.length ? stars : undefined
}

export function parseFilters(params: URLSearchParams): HotelFilters {
  const city = params.get('city')?.trim()
  let minPrice = parsePrice(params.get('minPrice'))
  let maxPrice = parsePrice(params.get('maxPrice'))
  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    minPrice = maxPrice = undefined
  }
  return {
    ...(city ? { city } : {}),
    ...(parseStars(params.get('stars')) ? { stars: parseStars(params.get('stars')) } : {}),
    ...(minPrice !== undefined ? { minPrice } : {}),
    ...(maxPrice !== undefined ? { maxPrice } : {}),
  }
}

export function serializeFilters(filters: HotelFilters): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.city) params.set('city', filters.city)
  if (filters.stars?.length) params.set('stars', [...filters.stars].sort((a, b) => b - a).join(','))
  if (filters.minPrice !== undefined && filters.minPrice !== PRICE_MIN)
    params.set('minPrice', String(filters.minPrice))
  if (filters.maxPrice !== undefined && filters.maxPrice !== PRICE_MAX)
    params.set('maxPrice', String(filters.maxPrice))
  return params
}
