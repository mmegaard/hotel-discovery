import { lowestPriceInRange } from '../../api/logic/filters'
import type { Hotel, HotelFilters } from '../../types/hotel'
import { HotelCard } from './HotelCard'
import { HotelCardSkeleton } from './HotelCardSkeleton'
import type { QueryStatus } from '../../hooks/useQuery'

export interface HotelListProps {
  hotels: Hotel[]
  /** Used only to pick which room price each card advertises. */
  filters: HotelFilters
  /** loading: skeleton cards. refreshing: the current cards, dimmed, so the
   *  list never collapses while a filter change is answered. */
  status?: QueryStatus
  placeholderCount?: number
}

export function HotelList({
  hotels,
  filters,
  status = 'success',
  placeholderCount = 6,
}: HotelListProps) {
  return (
    <section
      aria-label="Results"
      aria-busy={status !== 'success'}
      className={`flex flex-col gap-3 pb-10 transition-opacity ${status === 'refreshing' ? 'opacity-60' : ''}`}
    >
      {status === 'loading'
        ? Array.from({ length: placeholderCount }, (_, i) => <HotelCardSkeleton key={i} />)
        : hotels.map((hotel) => (
            <HotelCard
              key={hotel.id}
              hotel={hotel}
              fromPrice={lowestPriceInRange(hotel, filters) ?? lowestPriceInRange(hotel, {})}
            />
          ))}
    </section>
  )
}
