import { formatPrice, plural } from '../../lib/format'

export interface StarToggleProps {
  stars: number
  /** Lowest in-range price among hotels with this rating under the other
   *  filters; undefined means none match. The toggle stays enabled either way. */
  fromPrice: number | undefined
  pressed: boolean
  onToggle: (stars: number) => void
}

export function StarToggle({ stars, fromPrice, pressed, onToggle }: StarToggleProps) {
  const name = plural(stars, 'star')
  const from = fromPrice === undefined ? 'no matches' : `from ${formatPrice(fromPrice)}`
  return (
    <button
      type="button"
      aria-pressed={pressed}
      aria-label={`${name}, ${from}`}
      onClick={() => onToggle(stars)}
      className={`flex h-14 w-[150px] shrink-0 flex-col justify-center gap-0.5 rounded-[10px] border-2 px-3.5 text-left leading-tight ${
        pressed
          ? 'border-accent bg-accent text-white'
          : 'border-line bg-white text-ink hover:border-line-strong'
      }`}
    >
      <span aria-hidden="true" className="text-sm tracking-[2px]">
        {'★'.repeat(stars)}
      </span>
      <span aria-hidden="true" className="text-xs">
        <span className="font-semibold">{name}</span> · {from}
      </span>
    </button>
  )
}
