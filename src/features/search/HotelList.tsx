import { lowestPriceInRange } from '../../api/logic/filters'
import type { Hotel, HotelFilters } from '../../types/hotel'
import { HotelCard } from './HotelCard'
import { HotelCardSkeleton } from './HotelCardSkeleton'

export interface HotelListProps {
  hotels: Hotel[]
  /** Used only to pick which room price each card advertises. */
  filters: HotelFilters
  /** While true, renders `placeholderCount` skeleton cards instead of hotels. */
  loading?: boolean
  placeholderCount?: number
}

export function HotelList({
  hotels,
  filters,
  loading = false,
  placeholderCount = 6,
}: HotelListProps) {
  return (
    <section aria-label="Results" aria-busy={loading} className="flex flex-col gap-3 pb-10">
      {loading
        ? Array.from({ length: placeholderCount }, (_, i) => <HotelCardSkeleton key={i} />)
        : hotels.map((hotel) => (
            <HotelCard
              key={hotel.id}
              hotel={hotel}
              fromPrice={lowestPriceInRange(hotel, filters) ?? lowestPriceInRange(hotel, {})!}
            />
          ))}
    </section>
  )
}
