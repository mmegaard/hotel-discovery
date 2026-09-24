import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { cityOptions, starOptions } from '../../api/logic/filters'
import { useCatalogue } from '../../hooks/useCatalogue'
import { useHotelFilters } from '../../hooks/useHotelFilters'
import { useHotels } from '../../hooks/useHotels'
import { FilterBar } from './FilterBar'
import { HotelList } from './HotelList'

const TOTAL_HOTELS = 40

export function SearchPage() {
  const { filters, updateFilters, reset: resetFilters } = useHotelFilters()
  const catalogue = useCatalogue()
  const { hotels, status } = useHotels(filters)
  // Text typed into the city box before an option is chosen. Lives here, not
  // in FilterBar, so both Reset buttons clear it together with the URL.
  const [cityDraft, setCityDraft] = useState('')

  function reset() {
    setCityDraft('')
    resetFilters()
  }

  const empty = status === 'success' && hotels.length === 0

  return (
    <div className="flex grow flex-col gap-5 px-10 pt-7">
      <h1 className="text-[28px] font-semibold tracking-tight">Find a hotel</h1>

      <FilterBar
        filters={filters}
        cityOptions={cityOptions(catalogue)}
        starOptions={starOptions(catalogue, filters)}
        cityDraft={cityDraft}
        onCityDraftChange={setCityDraft}
        onChange={updateFilters}
        onReset={reset}
      />

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

      {empty ? (
        <EmptyState
          title="No hotels match these filters"
          description="Try a wider price range or fewer star ratings."
          action={<Button onClick={reset}>Reset filters</Button>}
          icon={
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              aria-hidden="true"
              className="text-muted"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-4-4M8 11h6" />
            </svg>
          }
        />
      ) : (
        <HotelList hotels={hotels} filters={filters} status={status} />
      )}
    </div>
  )
}
