import { describe, expect, it } from 'vitest'
import seed from '../../data/hotels.json'
import type { Hotel, Room } from '../../types/hotel'
import { hasOpenDates, isValidStay, openNights, roomsAvailableFor } from './availability'

const hotels: Hotel[] = seed
const grand = hotels.find((h) => h.id === 'hotel-01')! // king: Jul 10-12, queen: Jul 10-11
const noDates = hotels.find((h) => h.id === 'hotel-04')!
const ids = (rooms: Room[]) => rooms.map((r) => r.room_id)

describe('roomsAvailableFor', () => {
  it('opens a room only when every night of the stay is available', () => {
    const twoNights = roomsAvailableFor(grand, '2026-07-10', '2026-07-12')
    expect(ids(twoNights.open)).toEqual(['room-01a', 'room-01b'])

    const threeNights = roomsAvailableFor(grand, '2026-07-10', '2026-07-13')
    expect(ids(threeNights.open)).toEqual(['room-01a'])
    expect(ids(threeNights.closed)).toEqual(['room-01b'])
  })

  it('does not require the check-out date itself', () => {
    const { open } = roomsAvailableFor(grand, '2026-07-12', '2026-07-13')
    expect(ids(open)).toEqual(['room-01a'])
  })

  it('opens nothing for an invalid or zero-length range', () => {
    expect(roomsAvailableFor(grand, '2026-07-12', '2026-07-10').open).toEqual([])
    expect(roomsAvailableFor(grand, '2026-07-10', '2026-07-10').open).toEqual([])
    expect(isValidStay('2026-07-10', '2026-07-11')).toBe(true)
    expect(isValidStay('2026-07-10', '2026-07-10')).toBe(false)
  })

  it('opens nothing when the hotel has no available dates', () => {
    const { open, closed } = roomsAvailableFor(noDates, '2026-07-10', '2026-07-11')
    expect(open).toEqual([])
    expect(closed).toHaveLength(noDates.rooms.length)
  })
})

describe('openNights / hasOpenDates', () => {
  it('unions room dates, sorted and unique', () => {
    expect(openNights(grand)).toEqual(['2026-07-10', '2026-07-11', '2026-07-12'])
    expect(openNights(noDates)).toEqual([])
    expect(hasOpenDates(grand)).toBe(true)
    expect(hasOpenDates(noDates)).toBe(false)
  })
})
