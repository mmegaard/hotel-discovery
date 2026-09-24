import type { CityOption } from '../../api/logic/filters'
import { Button } from '../../components/ui/Button'
import { Combobox } from '../../components/ui/Combobox'
import { plural } from '../../lib/format'
import type { HotelFilters } from '../../types/hotel'

export interface FilterBarProps {
  filters: HotelFilters
  cityOptions: CityOption[]
  cityDraft: string
  onCityDraftChange: (text: string) => void
  onChange: (patch: Partial<HotelFilters>) => void
  onReset: () => void
}

export function FilterBar({
  filters,
  cityOptions,
  cityDraft,
  onCityDraftChange,
  onChange,
  onReset,
}: FilterBarProps) {
  const options = cityOptions.map((c) => ({
    id: c.city,
    label: c.city,
    description: `${c.country} · ${plural(c.count, 'hotel')}`,
    selectedText: `${c.city}, ${c.country}`,
  }))

  return (
    <section
      aria-label="Filters"
      className="flex shrink-0 flex-col gap-5 rounded-xl border border-line bg-white px-6 py-5"
    >
      <div className="flex items-start gap-8">
        <Combobox
          id="city"
          label="Where to?"
          placeholder="Search by city"
          options={options}
          selectedId={filters.city}
          draft={cityDraft}
          onDraftChange={onCityDraftChange}
          onSelect={(city) => onChange({ city })}
          emptyMessage={(q) => `No cities match "${q}"`}
        />
        <Button variant="ghost" onClick={onReset} className="mt-6 ml-auto px-4 text-sm">
          Reset filters
        </Button>
      </div>
    </section>
  )
}
