import { useHotels } from '../../hooks/useHotels'
import type { HotelFilters } from '../../types/hotel'
import { HotelList } from './HotelList'

const TOTAL_HOTELS = 40

export function SearchPage() {
  const filters: HotelFilters = {} // PR 4 reads these from the URL
  const { hotels, status } = useHotels(filters)

  return (
    <div className="flex grow flex-col gap-5 px-10 pt-7">
      <h1 className="text-[28px] font-semibold tracking-tight">Find a hotel</h1>

      <div className="flex items-baseline justify-between">
        <p aria-live="polite" className="text-[15px]">
          {status === 'loading' ? (
            'Loading hotels…'
          ) : (
            <>
              <strong>{hotels.length}</strong> of {TOTAL_HOTELS} hotels
            </>
          )}
        </p>
        <p className="text-[13px] text-muted">Prices are the lowest nightly rate in your range</p>
      </div>

      <HotelList hotels={hotels} filters={filters} loading={status === 'loading'} />
    </div>
  )
}
