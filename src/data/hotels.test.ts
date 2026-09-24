import { describe, expect, it } from 'vitest'
import type { Hotel } from '../types/hotel'
import hotels from './hotels.json'

const seed: Hotel[] = hotels

describe('hotels.json seed', () => {
  it('has 40 hotels with 42 rooms and unique ids', () => {
    expect(seed).toHaveLength(40)
    expect(seed.flatMap((h) => h.rooms)).toHaveLength(42)
    expect(new Set(seed.map((h) => h.id)).size).toBe(40)
    expect(new Set(seed.flatMap((h) => h.rooms.map((r) => r.room_id))).size).toBe(42)
  })

  it('keeps every available date inside the July 2026 demo window', () => {
    const dates = seed.flatMap((h) => h.rooms.flatMap((r) => r.available_dates))
    expect(dates.every((d) => d >= '2026-07-10' && d <= '2026-07-14')).toBe(true)
  })
})
