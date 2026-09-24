import { Link } from 'react-router'
import { RatingBadge } from '../../components/ui/RatingBadge'
import { StarGlyphs } from '../../components/ui/StarGlyphs'
import { formatPrice, humanizeAmenity } from '../../lib/format'
import type { Hotel } from '../../types/hotel'

const SHOWN_AMENITIES = 3

export interface HotelCardProps {
  hotel: Hotel
  /** Lowest nightly price to advertise; the list decides which room qualifies.
   *  Undefined when the hotel lists no rooms. */
  fromPrice: number | undefined
}

export function HotelCard({ hotel, fromPrice }: HotelCardProps) {
  const shown = hotel.amenities.slice(0, SHOWN_AMENITIES)
  const more = hotel.amenities.length - shown.length

  return (
    <Link
      to={`/hotels/${hotel.id}`}
      state={{ fromSearch: true }}
      className="flex shrink-0 gap-5 rounded-xl border border-line bg-white p-4 text-inherit no-underline hover:border-line-strong"
    >
      <div
        aria-hidden="true"
        className="flex h-28 w-42 shrink-0 items-center justify-center rounded-lg bg-panel"
      >
        <svg
          width="168"
          height="112"
          viewBox="0 0 168 112"
          fill="none"
          stroke="currentColor"
          className="text-line"
          strokeWidth="1"
        >
          <path d="M0 0L168 112M168 0L0 112" />
        </svg>
      </div>

      <div className="flex min-w-0 grow flex-col gap-1.5">
        <h2 className="text-lg font-semibold text-accent">{hotel.name}</h2>
        <div className="flex items-center gap-3 text-sm text-ink-secondary">
          <span>
            {hotel.address.city}, {hotel.address.country}
          </span>
          <span aria-hidden="true" className="text-line-strong">
            ·
          </span>
          <StarGlyphs stars={hotel.star_rating} />
        </div>
        <div className="flex items-center gap-2 text-sm">
          <RatingBadge rating={hotel.overall_rating} />
          <span className="text-muted">{hotel.review_count.toLocaleString('en-US')} reviews</span>
        </div>
        <ul className="mt-auto flex flex-wrap gap-2 text-[13px] text-ink-secondary">
          {shown.map((amenity) => (
            <li key={amenity} className="rounded-full border border-line px-2 py-0.5">
              {humanizeAmenity(amenity)}
            </li>
          ))}
          {more > 0 && <li className="px-1 py-0.5 text-muted">+{more} more</li>}
        </ul>
      </div>

      <div className="flex w-40 shrink-0 flex-col items-end justify-end text-right">
        {fromPrice === undefined ? (
          <div className="text-sm text-muted">No rooms listed</div>
        ) : (
          <>
            <div className="text-xs text-muted">from</div>
            <div className="text-[22px] font-semibold">{formatPrice(fromPrice)}</div>
            <div className="text-xs text-muted">per night</div>
          </>
        )}
      </div>
    </Link>
  )
}
