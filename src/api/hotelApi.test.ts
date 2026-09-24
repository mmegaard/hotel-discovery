import { describe, expect, it } from 'vitest'
import { getAvailableRooms, getFilterOptions, getHotel, searchHotels } from './hotelApi'

describe('hotelApi', () => {
  it('searchHotels maps UI filters onto the backend params and returns a page with its total', async () => {
    const all = await searchHotels({})
    expect(all.hotels).toHaveLength(40)
    expect(all.total).toBe(40)
    const narrowed = await searchHotels({
      city: 'Chicago',
      stars: [5],
      minPrice: 100,
      maxPrice: 300,
    })
    expect(narrowed.hotels.map((h) => h.id)).toContain('hotel-01')
    expect(narrowed.total).toBe(narrowed.hotels.length)
    expect(narrowed.hotels.every((h) => h.address.city === 'Chicago' && h.star_rating === 5)).toBe(
      true,
    )
  })

  it('getFilterOptions returns all cities, per-rating prices under the filters, and the catalogue size', async () => {
    const options = await getFilterOptions({ city: 'Chicago', stars: [2] })
    expect(options.cities).toHaveLength(10)
    expect(options.totalHotels).toBe(40)
    expect(options.stars.map((s) => s.stars)).toEqual([5, 4, 3, 2, 1])
    expect(options.stars[0].fromPrice).toBe(199) // 5 stars in Chicago; the star selection is ignored
    expect(options.stars[4].fromPrice).toBeUndefined()
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
