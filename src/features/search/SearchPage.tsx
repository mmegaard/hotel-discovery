import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useFilterOptions } from '../../hooks/useFilterOptions'
import { useHotelFilters } from '../../hooks/useHotelFilters'
import { useHotels } from '../../hooks/useHotels'
import { FilterBar } from './FilterBar'
import { HotelList } from './HotelList'

export function SearchPage() {
  const { filters, updateFilters, reset: resetFilters } = useHotelFilters()
  const options = useFilterOptions(filters)
  const { hotels, total, status } = useHotels(filters)
  // Text typed into the city box before an option is chosen. Lives here, not
  // in FilterBar, so both Reset buttons clear it together with the URL.
  const [cityDraft, setCityDraft] = useState('')

  function reset() {
    setCityDraft('')
    resetFilters()
  }

  useDocumentTitle(filters.city ? `Hotels in ${filters.city}` : 'Find a hotel')

  const empty = status === 'success' && hotels.length === 0

  return (
    <div className="flex grow flex-col gap-5 px-10 pt-7">
      <h1 className="text-[28px] font-semibold tracking-tight">Find a hotel</h1>

      <FilterBar
        filters={filters}
        cityOptions={options.cities}
        starOptions={options.stars}
        cityDraft={cityDraft}
        onCityDraftChange={setCityDraft}
        onChange={updateFilters}
        onReset={reset}
      />

      <p aria-live="polite" className="text-[15px]">
        {status === 'loading' ? (
          'Loading hotels…'
        ) : status === 'error' ? (
          'Couldn’t load hotels. Check your connection and try again.'
        ) : (
          <>
            <strong>{total}</strong> of {options.totalHotels} hotels
          </>
        )}
      </p>

      {status === 'error' ? null : empty ? (
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
