// All dates are ISO strings (YYYY-MM-DD) with no time zone: they name a
// calendar day, and the seed's available_dates use the same form. Arithmetic
// goes through Date.UTC so local time zones never shift a day.

export type IsoDate = string

/** The demo clock. Every available date in the seed is 2026-07-10..14, so the
 *  demo pretends it is the day before. Set VITE_TODAY=now to use the wall clock
 *  (or VITE_TODAY=YYYY-MM-DD to pin another day). */
export const DEMO_TODAY: IsoDate = '2026-07-09'

export function today(): IsoDate {
  const override = import.meta.env.VITE_TODAY as string | undefined
  if (override === 'now') return toIsoDate(new Date())
  return override && isIsoDate(override) ? override : DEMO_TODAY
}

const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/

export function isIsoDate(value: string): value is IsoDate {
  const m = ISO_RE.exec(value)
  if (!m) return false
  const [, y, mo, d] = m.map(Number)
  return toIsoDate(new Date(Date.UTC(y, mo - 1, d))) === value
}

export function toIsoDate(date: Date): IsoDate {
  return date.toISOString().slice(0, 10)
}

function toUtc(iso: IsoDate): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

/** Local-midnight Date for a calendar day, for libraries that think in Date
 *  objects (the calendar). The inverse is `fromLocalDate`. */
export function toLocalDate(iso: IsoDate): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function fromLocalDate(date: Date): IsoDate {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function addDays(iso: IsoDate, days: number): IsoDate {
  const date = toUtc(iso)
  date.setUTCDate(date.getUTCDate() + days)
  return toIsoDate(date)
}

/** Whole days from checkIn to checkOut; negative or zero means an invalid stay. */
export function nightsBetween(checkIn: IsoDate, checkOut: IsoDate): number {
  return Math.round((toUtc(checkOut).getTime() - toUtc(checkIn).getTime()) / 86_400_000)
}

/** Nights a guest sleeps: [checkIn, checkOut). Empty when the range is invalid. */
export function nightsOf(checkIn: IsoDate, checkOut: IsoDate): IsoDate[] {
  const count = nightsBetween(checkIn, checkOut)
  return count > 0 ? Array.from({ length: count }, (_, i) => addDays(checkIn, i)) : []
}

/** "07/10/2026" -> "2026-07-10"; null when not a real date in MM/DD/YYYY form. */
export function parseUsDate(text: string): IsoDate | null {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(text.trim())
  if (!m) return null
  const [, mo, d, y] = m
  const iso = `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`
  return isIsoDate(iso) ? iso : null
}

/** "2026-07-10" -> "07/10/2026" */
export function formatUsDate(iso: IsoDate): string {
  const [y, m, d] = iso.split('-')
  return `${m}/${d}/${y}`
}

const longFormat = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
})

/** "2026-07-10" -> "Fri, Jul 10" */
export function formatLong(iso: IsoDate): string {
  return longFormat.format(toUtc(iso))
}

const monthDayFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
})

/** Groups sorted, unique dates into runs of consecutive days and prints each
 *  run: ["2026-07-10","2026-07-11","2026-07-13"] -> ["Jul 10–11", "Jul 13"]. */
export function spans(dates: IsoDate[]): string[] {
  const sorted = [...new Set(dates)].sort()
  const runs: IsoDate[][] = []
  for (const date of sorted) {
    const run = runs[runs.length - 1]
    if (run && addDays(run[run.length - 1], 1) === date) run.push(date)
    else runs.push([date])
  }
  return runs.map((run) => {
    const first = monthDayFormat.format(toUtc(run[0]))
    if (run.length === 1) return first
    const last = toUtc(run[run.length - 1])
    const sameMonth = run[0].slice(0, 7) === run[run.length - 1].slice(0, 7)
    return `${first}–${sameMonth ? last.getUTCDate() : monthDayFormat.format(last)}`
  })
}
