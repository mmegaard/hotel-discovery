import { NumberInput } from '../../components/ui/NumberInput'
import { RangeSlider } from '../../components/ui/RangeSlider'
import { PRICE_MAX, PRICE_MIN, PRICE_STEP } from '../../lib/filterParams'
import type { HotelFilters } from '../../types/hotel'

export interface PriceRangeProps {
  minPrice?: number
  maxPrice?: number
  onChange: (patch: Pick<HotelFilters, 'minPrice' | 'maxPrice'>) => void
}

/** Min/max inputs and a two-handle slider over the same pair of values. Emits
 *  undefined at the bounds so an untouched range leaves the URL clean. */
export function PriceRange({
  minPrice = PRICE_MIN,
  maxPrice = PRICE_MAX,
  onChange,
}: PriceRangeProps) {
  function emit(lo: number, hi: number) {
    onChange({
      minPrice: lo === PRICE_MIN ? undefined : lo,
      maxPrice: hi === PRICE_MAX ? undefined : hi,
    })
  }

  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-1.5 text-[13px] font-medium">Price per night</legend>
      <div className="flex items-center gap-3">
        <NumberInput
          id="price-min"
          label="Min"
          prefix="$"
          value={minPrice}
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={PRICE_STEP}
          onChange={(v) => emit(Math.min(v, maxPrice), maxPrice)}
        />
        <RangeSlider
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={PRICE_STEP}
          value={[minPrice, maxPrice]}
          labels={['Minimum price per night', 'Maximum price per night']}
          onChange={([lo, hi]) => emit(lo, hi)}
        />
        <NumberInput
          id="price-max"
          label="Max"
          prefix="$"
          value={maxPrice}
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={PRICE_STEP}
          onChange={(v) => emit(minPrice, Math.max(v, minPrice))}
        />
      </div>
    </fieldset>
  )
}
