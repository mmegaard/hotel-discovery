export interface RangeSliderProps {
  min: number
  max: number
  step: number
  value: [number, number]
  labels: [string, string]
  onChange: (value: [number, number]) => void
}

// Two native range inputs stacked on one track: full keyboard and screen-reader
// support for free. Only the thumbs take pointer events so the upper input
// does not cover the lower one.
const thumb =
  '[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:mt-2.5 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-accent [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-sm ' +
  '[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-accent [&::-moz-range-thumb]:bg-white ' +
  '[&::-webkit-slider-runnable-track]:h-11 [&::-webkit-slider-runnable-track]:bg-transparent [&::-moz-range-track]:bg-transparent ' +
  'focus-visible:outline-none [&:focus-visible::-webkit-slider-thumb]:outline-3 [&:focus-visible::-webkit-slider-thumb]:outline-accent [&:focus-visible::-webkit-slider-thumb]:outline-offset-2 [&:focus-visible::-moz-range-thumb]:outline-3 [&:focus-visible::-moz-range-thumb]:outline-accent'

const input = `pointer-events-none absolute top-0 left-0 m-0 h-11 w-full appearance-none bg-transparent ${thumb}`

export function RangeSlider({
  min,
  max,
  step,
  value: [lo, hi],
  labels,
  onChange,
}: RangeSliderProps) {
  const pct = (v: number) => (v - min) / (max - min)
  return (
    <div className="relative h-11 w-80">
      <div className="absolute top-5 right-3 left-3 h-1 rounded-sm bg-line" />
      <div
        className="absolute top-5 h-1 rounded-sm bg-accent"
        style={{
          left: `calc(12px + (100% - 24px) * ${pct(lo)})`,
          width: `calc((100% - 24px) * ${pct(hi) - pct(lo)})`,
        }}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={lo}
        aria-label={labels[0]}
        onChange={(e) => onChange([Math.min(Number(e.target.value), hi - step), hi])}
        className={input}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={hi}
        aria-label={labels[1]}
        onChange={(e) => onChange([lo, Math.max(Number(e.target.value), lo + step)])}
        className={input}
      />
    </div>
  )
}
