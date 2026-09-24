import { lowestPriceInRange } from '../../api/logic/filters'
import type { Hotel, HotelFilters } from '../../types/hotel'
import { HotelCard } from './HotelCard'

export interface HotelListProps {
  hotels: Hotel[]
  /** Used only to pick which room price each card advertises. */
  filters: HotelFilters
}

export function HotelList({ hotels, filters }: HotelListProps) {
  return (
    <section aria-label="Results" className="flex flex-col gap-3 pb-10">
      {hotels.map((hotel) => (
        <HotelCard
          key={hotel.id}
          hotel={hotel}
          fromPrice={lowestPriceInRange(hotel, filters) ?? lowestPriceInRange(hotel, {})!}
        />
      ))}
    </section>
  )
}
