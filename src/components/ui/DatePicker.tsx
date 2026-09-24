import { useMemo, useState, type HTMLAttributes } from 'react'
import { DayPicker } from 'react-day-picker'
import { addDays, fromLocalDate, toLocalDate, type IsoDate } from '../../lib/dates'
import { Button } from './Button'

export interface DateRangeValue {
  from?: IsoDate
  to?: IsoDate
}

export interface DatePickerProps {
  value: DateRangeValue
  /** Which end the user is filling in. "from" restarts the range; "to" completes it. */
  focus: 'from' | 'to'
  today: IsoDate
  onChange: (value: DateRangeValue, focus: 'from' | 'to') => void
  onDone: () => void
  onClear: () => void
}

// Tailwind on react-day-picker's slots; its stylesheet is not imported, so
// the design tokens apply everywhere. 44px day buttons, 3px focus ring.
const classNames = {
  root: 'flex flex-col gap-3',
  months: 'flex',
  month: 'flex w-full flex-col gap-3',
  month_caption: 'flex h-11 items-center justify-center',
  caption_label: 'flex flex-col items-center leading-tight',
  nav: 'absolute inset-x-0 top-0 flex h-11 items-center justify-between',
  button_previous:
    'flex h-11 w-11 items-center justify-center rounded-lg border border-line text-ink hover:bg-page disabled:opacity-40',
  button_next:
    'flex h-11 w-11 items-center justify-center rounded-lg border border-line text-ink hover:bg-page disabled:opacity-40',
  chevron: 'h-4.5 w-4.5 fill-current',
  month_grid: 'w-full border-collapse',
  weekdays: '',
  weekday: 'py-1 text-center text-xs font-medium text-muted',
  week: '',
  day: 'p-0.5 text-center',
  day_button:
    'mx-auto flex h-11 w-11 items-center justify-center rounded-lg text-sm font-medium hover:bg-accent-tint disabled:cursor-not-allowed disabled:text-line-strong disabled:line-through disabled:hover:bg-transparent',
  today: '[&>button]:ring-2 [&>button]:ring-ink [&>button]:ring-inset',
  // A lone check-in is only "selected" (range_start needs both ends), so the
  // solid fill lives here; middle days opt out via the marker class.
  selected:
    '[&:not(.range-mid)>button]:bg-accent [&:not(.range-mid)>button]:text-white [&:not(.range-mid)>button]:hover:bg-accent-strong',
  range_start: 'rounded-l-lg bg-accent-tint',
  range_middle: 'range-mid bg-accent-tint [&>button]:rounded-none',
  range_end: 'rounded-r-lg bg-accent-tint',
  outside: 'invisible',
  disabled: '',
  hidden: 'invisible',
  focused: '',
  footer: '',
}

/** Range calendar over react-day-picker: keyboard navigation and ARIA come
 *  from the library; the selection rule is ours so it follows the input the
 *  user is filling in. Past days are disabled and struck through. */
export function DatePicker({ value, focus, today, onChange, onDone, onClear }: DatePickerProps) {
  const [month, setMonth] = useState(() => toLocalDate(value.from ?? today))
  const todayDate = toLocalDate(today)
  const prompt = focus === 'to' ? 'Select your check-out date' : 'Select your check-in date'

  // Month name with the prompt beneath it, between the nav buttons.
  const components = useMemo(
    () => ({
      CaptionLabel: ({ children, ...rest }: HTMLAttributes<HTMLSpanElement>) => (
        <span {...rest}>
          <span className="text-base font-semibold">{children}</span>
          <span className="text-xs text-muted">{prompt}</span>
        </span>
      ),
    }),
    [prompt],
  )

  function pick(date: Date) {
    const day = fromLocalDate(date)
    if (focus === 'to' && value.from && day > value.from) {
      onChange({ from: value.from, to: day }, 'to')
    } else {
      // Start over from this day; keep a check-out that still makes sense.
      onChange({ from: day, to: value.to && value.to > day ? value.to : undefined }, 'to')
    }
  }

  return (
    <div
      role="dialog"
      aria-label={focus === 'to' ? 'Choose check-out date' : 'Choose check-in date'}
      className="relative flex flex-col gap-3 rounded-xl border border-line-strong bg-white p-4 shadow-[0_8px_24px_rgba(27,31,35,0.12)]"
    >
      <DayPicker
        mode="range"
        selected={{
          from: value.from ? toLocalDate(value.from) : undefined,
          to: value.to ? toLocalDate(value.to) : undefined,
        }}
        onSelect={(_range, triggerDate) => pick(triggerDate)}
        month={month}
        onMonthChange={setMonth}
        today={todayDate}
        disabled={{ before: todayDate }}
        startMonth={todayDate}
        endMonth={toLocalDate(addDays(today, 365))}
        classNames={classNames}
        components={components}
      />
      <div className="flex items-center justify-between gap-2 border-t border-line pt-2">
        <Button
          variant="ghost"
          onClick={() => setMonth(todayDate)}
          className="px-3 text-sm underline underline-offset-3"
        >
          Today
        </Button>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={onClear}
            className="border border-line px-3 text-sm text-ink hover:bg-page"
          >
            Clear
          </Button>
          <Button onClick={onDone} className="px-4 text-sm">
            Done
          </Button>
        </div>
      </div>
    </div>
  )
}
