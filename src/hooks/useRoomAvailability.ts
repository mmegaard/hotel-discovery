import { getAvailableRooms } from '../api/hotelApi'
import { isValidStay } from '../api/logic/availability'
import type { IsoDate } from '../lib/dates'
import type { Hotel, Room } from '../types/hotel'
import { useQuery, type QueryStatus } from './useQuery'

export interface RoomAvailabilityState {
  /** Rooms open every night of the stay. */
  open: Room[]
  /** The hotel's other rooms, in catalogue order. */
  closed: Room[]
  /** idle until both dates form a valid stay. */
  status: QueryStatus
}

/** GET /hotels/:id/rooms for the stay. The API returns the open rooms; the
 *  closed list is the hotel's remaining rooms, derived here so the UI can name
 *  them. */
export function useRoomAvailability(
  hotel: Hotel,
  checkIn: IsoDate | undefined,
  checkOut: IsoDate | undefined,
): RoomAvailabilityState {
  const enabled = checkIn !== undefined && checkOut !== undefined && isValidStay(checkIn, checkOut)
  const key = `${hotel.id}|${checkIn}|${checkOut}`
  const { data, status } = useQuery(
    key,
    (signal) =>
      getAvailableRooms(hotel.id, checkIn!, checkOut!, { signal }).then((rooms) => rooms ?? []),
    { enabled },
  )
  const open = data ?? []
  const openIds = new Set(open.map((r) => r.room_id))
  return { open, closed: hotel.rooms.filter((r) => !openIds.has(r.room_id)), status }
}
