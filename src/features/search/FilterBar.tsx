import type { CityOption, StarOption } from '../../api/logic/filters'
import { Button } from '../../components/ui/Button'
import { Combobox } from '../../components/ui/Combobox'
import { plural } from '../../lib/format'
import type { HotelFilters } from '../../types/hotel'
import { PriceRange } from './PriceRange'
import { StarToggle } from './StarToggle'

export interface FilterBarProps {
  filters: HotelFilters
  cityOptions: CityOption[]
  starOptions: StarOption[]
  cityDraft: string
  onCityDraftChange: (text: string) => void
  onChange: (patch: Partial<HotelFilters>) => void
  onReset: () => void
}

export function FilterBar({
  filters,
  cityOptions,
  starOptions,
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
  const selectedStars = filters.stars ?? []

  function toggleStars(stars: number) {
    const next = selectedStars.includes(stars)
      ? selectedStars.filter((s) => s !== stars)
      : [...selectedStars, stars].sort((a, b) => b - a)
    onChange({ stars: next.length ? next : undefined })
  }

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
        <PriceRange minPrice={filters.minPrice} maxPrice={filters.maxPrice} onChange={onChange} />
        <Button variant="ghost" onClick={onReset} className="mt-6 ml-auto px-4 text-sm">
          Reset filters
        </Button>
      </div>

      <fieldset className="flex flex-wrap items-center gap-3">
        <legend className="float-left mr-2 w-22 text-[13px] font-medium">Star rating</legend>
        {starOptions.map((option) => (
          <StarToggle
            key={option.stars}
            stars={option.stars}
            fromPrice={option.fromPrice}
            pressed={selectedStars.includes(option.stars)}
            onToggle={toggleStars}
          />
        ))}
      </fieldset>
    </section>
  )
}
