import { nightsOf, type IsoDate } from '../../lib/dates'
import type { Hotel, Room } from '../../types/hotel'

// Pure availability rules. A stay covers the nights [checkIn, checkOut): the
// guest sleeps on check-in night and leaves on check-out morning, so the
// check-out date itself never has to be available. A room is open for the stay
// only when every one of those nights is in its available_dates.

export function isValidStay(checkIn: IsoDate, checkOut: IsoDate): boolean {
  return nightsOf(checkIn, checkOut).length > 0
}

export function isRoomOpen(room: Room, checkIn: IsoDate, checkOut: IsoDate): boolean {
  const nights = nightsOf(checkIn, checkOut)
  if (nights.length === 0) return false
  const available = new Set(room.available_dates)
  return nights.every((night) => available.has(night))
}

export interface RoomAvailability {
  open: Room[]
  closed: Room[]
}

/** Splits the hotel's rooms into those open for every night of the stay and the
 *  rest. An invalid range (check-out on or before check-in) opens nothing. */
export function roomsAvailableFor(
  hotel: Hotel,
  checkIn: IsoDate,
  checkOut: IsoDate,
): RoomAvailability {
  const open: Room[] = []
  const closed: Room[] = []
  for (const room of hotel.rooms) (isRoomOpen(room, checkIn, checkOut) ? open : closed).push(room)
  return { open, closed }
}

/** Every night on which at least one room is available, sorted, no duplicates. */
export function openNights(hotel: Hotel): IsoDate[] {
  return [...new Set(hotel.rooms.flatMap((r) => r.available_dates))].sort()
}

export function hasOpenDates(hotel: Hotel): boolean {
  return hotel.rooms.some((r) => r.available_dates.length > 0)
}
