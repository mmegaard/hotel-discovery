import { lazy, Suspense, useRef, useState, type KeyboardEvent } from 'react'
import { isValidStay, openNights } from '../../api/logic/availability'
import { DateInput } from '../../components/ui/DateInput'
import { EmptyState } from '../../components/ui/EmptyState'
import { useRoomAvailability } from '../../hooks/useRoomAvailability'
import { addDays, formatLong, nightsBetween, spans, today, type IsoDate } from '../../lib/dates'
import { plural } from '../../lib/format'
import type { Hotel } from '../../types/hotel'
import { RoomCard } from './RoomCard'

// The calendar (react-day-picker + date-fns) loads on first focus, so the
// search page and the initial detail render never pay for it.
const DatePicker = lazy(() =>
  import('../../components/ui/DatePicker').then((m) => ({ default: m.DatePicker })),
)

export interface RoomAvailabilityProps {
  hotel: Hotel
}

/** Check-in / check-out inputs and the rooms open for every night between
 *  them. Dates are local state: they belong to this panel, not the URL. */
export function RoomAvailability({ hotel }: RoomAvailabilityProps) {
  // Prefilled to a one-night stay from today, so the panel answers at once;
  // the user changes either end from there.
  const [checkIn, setCheckIn] = useState<IsoDate | undefined>(() => today())
  const [checkOut, setCheckOut] = useState<IsoDate | undefined>(() => addDays(today(), 1))
  // Which input the calendar is attached to; null when closed.
  const [picker, setPicker] = useState<'from' | 'to' | null>(null)
  const datesRef = useRef<HTMLDivElement>(null)
  const { open, closed, status } = useRoomAvailability(hotel, checkIn, checkOut)

  const nights = openNights(hotel)
  const year = nights[0]?.slice(0, 4)
  const windowHint = nights.length
    ? `Open nights at this hotel: ${spans(nights).join(', ')}, ${year}`
    : 'This hotel has no open nights right now.'

  const ready = checkIn !== undefined && checkOut !== undefined
  const invalid = ready && !isValidStay(checkIn, checkOut)
  const nightCount = ready && !invalid ? nightsBetween(checkIn, checkOut) : 0

  function onCheckIn(date: IsoDate | undefined) {
    setCheckIn(date)
    // A check-out on or before the new check-in can never be right; drop it.
    if (date && checkOut && checkOut <= date) setCheckOut(undefined)
  }

  function onPickerKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape') setPicker(null)
  }

  return (
    <section
      aria-labelledby="availability"
      className="flex flex-col gap-4 rounded-xl border border-line bg-white p-6"
    >
      <h2 id="availability" className="text-xl font-semibold">
        Check room availability
      </h2>

      <div
        ref={datesRef}
        className="flex flex-col gap-4"
        onKeyDown={onPickerKeyDown}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) setPicker(null)
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <DateInput
            id="check-in"
            label="Check-in"
            value={checkIn}
            min={today()}
            onChange={onCheckIn}
            onFocus={() => setPicker('from')}
            expanded={picker === 'from'}
            describedBy="open-window"
          />
          <DateInput
            id="check-out"
            label="Check-out"
            value={checkOut}
            min={addDays(today(), 1)}
            onChange={setCheckOut}
            onFocus={() => setPicker('to')}
            expanded={picker === 'to'}
            describedBy="open-window"
          />
        </div>
        <p id="open-window" className="-mt-2 text-[13px] text-muted">
          {windowHint}
        </p>

        {picker && (
          <Suspense
            fallback={
              <div
                aria-hidden="true"
                className="h-[434px] animate-pulse rounded-xl border border-line-strong bg-white"
              />
            }
          >
            <DatePicker
              value={{ from: checkIn, to: checkOut }}
              focus={picker}
              today={today()}
              onChange={({ from, to }, next) => {
                setCheckIn(from)
                setCheckOut(to)
                setPicker(next)
              }}
              onClear={() => {
                setCheckIn(undefined)
                setCheckOut(undefined)
                setPicker('from')
              }}
              onDone={() => setPicker(null)}
            />
          </Suspense>
        )}
      </div>

      <div aria-live="polite" className="flex flex-col gap-3">
        {!ready && (
          <p className="rounded-lg bg-page p-4 text-sm text-ink-secondary">
            Choose your dates to see which rooms are open. This hotel offers{' '}
            {plural(hotel.rooms.length, 'room type')}.
          </p>
        )}

        {invalid && (
          <p
            role="alert"
            className="flex items-center gap-2 rounded-lg border border-ink px-4 py-3 text-sm"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
              className="shrink-0"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v6M12 17h.01" />
            </svg>
            Check-out must be after check-in.
          </p>
        )}

        {ready && !invalid && status === 'error' && (
          <p role="status" className="text-sm text-muted">
            Couldn’t check availability. Check your connection and try again.
          </p>
        )}

        {ready && !invalid && status === 'loading' && (
          <>
            <p className="text-sm text-ink-secondary">Checking availability…</p>
            {hotel.rooms.map((room) => (
              <div
                key={room.room_id}
                aria-hidden="true"
                className="h-[118px] animate-pulse rounded-[10px] bg-panel"
              />
            ))}
          </>
        )}

        {ready && !invalid && (status === 'success' || status === 'refreshing') && (
          <div
            className={`flex flex-col gap-3 ${status === 'refreshing' ? 'opacity-60' : ''}`}
            aria-busy={status === 'refreshing'}
          >
            {open.length > 0 ? (
              <>
                <p className="text-sm text-ink-secondary">
                  <strong>{plural(open.length, 'room type')} open</strong> for{' '}
                  {plural(nightCount, 'night')} · {formatLong(checkIn)} to {formatLong(checkOut)}
                </p>
                {open.map((room) => (
                  <RoomCard key={room.room_id} room={room} nights={nightCount} />
                ))}
                {closed.length > 0 && (
                  <p className="text-[13px] text-muted">
                    Not open for these dates: {closed.map((r) => r.type).join(', ')}
                  </p>
                )}
              </>
            ) : (
              <EmptyState
                compact
                headingLevel={3}
                title="No rooms available for these dates"
                description={
                  nights.length
                    ? `Try ${spans(nights).join(', ')}.`
                    : 'This hotel has no open dates. Try another hotel.'
                }
                icon={
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    aria-hidden="true"
                    className="text-muted"
                  >
                    <rect x="4" y="5" width="16" height="15" rx="2" />
                    <path d="M4 10h16M9 3v4M15 3v4M10 14l4 4M14 14l-4 4" />
                  </svg>
                }
              />
            )}
          </div>
        )}
      </div>
    </section>
  )
}
