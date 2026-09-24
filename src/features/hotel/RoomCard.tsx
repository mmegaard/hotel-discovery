import { formatPrice, humanizeAmenity, plural } from '../../lib/format'
import type { Room } from '../../types/hotel'

export interface RoomCardProps {
  room: Room
  nights: number
}

export function RoomCard({ room, nights }: RoomCardProps) {
  return (
    <article className="flex flex-col gap-2 rounded-[10px] border border-line-strong p-4">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-base font-semibold">{room.type}</h3>
        <div className="shrink-0 text-right">
          <span className="text-lg font-semibold">{formatPrice(room.price_per_night)}</span>
          <span className="text-[13px] text-muted"> / night</span>
        </div>
      </div>
      <div className="text-[13px] text-ink-secondary">
        {plural(room.bed_count, `${room.bed_type} bed`)} · Sleeps {room.max_occupancy} ·{' '}
        {room.square_footage} sq ft
      </div>
      <div className="flex items-center justify-between gap-3 text-[13px]">
        <span className="text-muted">{room.room_amenities.map(humanizeAmenity).join(', ')}</span>
        <span className="shrink-0 font-medium">
          {formatPrice(room.price_per_night * nights)} total
        </span>
      </div>
    </article>
  )
}
