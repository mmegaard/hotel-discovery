import { RatingBadge } from '../../components/ui/RatingBadge'
import { StarGlyphs } from '../../components/ui/StarGlyphs'
import { formatAddress } from '../../lib/format'
import type { Hotel } from '../../types/hotel'

export interface HotelHeaderProps {
  hotel: Hotel
}

export function HotelHeader({ hotel }: HotelHeaderProps) {
  const { policies, contact } = hotel
  return (
    <section aria-labelledby="hotel-name" className="flex flex-col gap-3.5">
      <div aria-hidden="true" className="h-65 overflow-hidden rounded-xl bg-panel">
        <svg
          width="100%"
          height="260"
          viewBox="0 0 760 260"
          preserveAspectRatio="none"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="text-line"
        >
          <path d="M0 0L760 260M760 0L0 260" />
        </svg>
      </div>

      <div className="flex items-start justify-between gap-6">
        <div className="flex flex-col gap-1.5">
          <h1 id="hotel-name" className="text-[32px] font-semibold tracking-tight">
            {hotel.name}
          </h1>
          <div className="flex items-center gap-3 text-[15px] text-ink-secondary">
            <StarGlyphs stars={hotel.star_rating} />
            <span aria-hidden="true" className="text-line-strong">
              ·
            </span>
            <span>{formatAddress(hotel.address)}</span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2.5">
          <RatingBadge rating={hotel.overall_rating} size="lg" />
          <span className="text-sm leading-tight text-muted">
            out of 5
            <br />
            {hotel.review_count.toLocaleString('en-US')} reviews
          </span>
        </div>
      </div>

      <p className="max-w-[68ch] text-base leading-relaxed">{hotel.description}</p>

      <dl className="grid grid-cols-3 gap-4 rounded-xl border border-line bg-white p-4 text-sm">
        <div>
          <dt className="text-muted">Check-in / out</dt>
          <dd className="mt-1">
            {policies.check_in_time} / {policies.check_out_time}
          </dd>
        </div>
        <div>
          <dt className="text-muted">Cancellation</dt>
          <dd className="mt-1">{policies.cancellation}</dd>
        </div>
        <div>
          <dt className="text-muted">Contact</dt>
          <dd className="mt-1">
            {contact.phone}
            <br />
            <a href={`mailto:${contact.email}`} className="text-accent hover:text-accent-strong">
              {contact.email}
            </a>
          </dd>
        </div>
      </dl>
    </section>
  )
}
