import { describe, expect, it } from 'vitest'
import { getAvailableRooms, getHotel, searchHotels } from './hotelApi'

describe('hotelApi', () => {
  it('searchHotels maps UI filters onto the backend params', async () => {
    const all = await searchHotels({})
    expect(all).toHaveLength(40)
    const narrowed = await searchHotels({
      city: 'Chicago',
      stars: [5],
      minPrice: 100,
      maxPrice: 300,
    })
    expect(narrowed.map((h) => h.id)).toContain('hotel-01')
    expect(narrowed.every((h) => h.address.city === 'Chicago' && h.star_rating === 5)).toBe(true)
  })

  it('getHotel returns the hotel, or undefined for an unknown id', async () => {
    expect((await getHotel('hotel-01'))?.name).toBe('The Grand Luminary')
    expect(await getHotel('hotel-99')).toBeUndefined()
  })

  it('getAvailableRooms returns open rooms, or undefined for an unknown id', async () => {
    const rooms = await getAvailableRooms('hotel-01', '2026-07-10', '2026-07-12')
    expect(rooms?.map((r) => r.room_id)).toEqual(['room-01a', 'room-01b'])
    expect(await getAvailableRooms('hotel-99', '2026-07-10', '2026-07-12')).toBeUndefined()
  })
})
