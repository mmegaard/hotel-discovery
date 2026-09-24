import { useState, type FocusEvent } from 'react'
import { formatUsDate, parseUsDate, type IsoDate } from '../../lib/dates'

export interface DateInputProps {
  id: string
  label: string
  value: IsoDate | undefined
  /** Earliest accepted date; anything before is left as an unapplied draft. */
  min?: IsoDate
  onChange: (value: IsoDate | undefined) => void
  describedBy?: string
  onFocus?: (e: FocusEvent<HTMLInputElement>) => void
  /** Set by the date picker (PR 9) when a dialog is attached. */
  expanded?: boolean
}

/** Typed MM/DD/YYYY. A complete, real date on or after `min` applies as soon
 *  as it is typed; anything else stays in the box until blur, then the box
 *  falls back to the applied value. Clearing the box clears the value. */
export function DateInput({
  id,
  label,
  value,
  min,
  onChange,
  describedBy,
  onFocus,
  expanded,
}: DateInputProps) {
  const [draft, setDraft] = useState<string | null>(null)

  const accept = (text: string): IsoDate | undefined => {
    const iso = parseUsDate(text)
    return iso && (!min || iso >= min) ? iso : undefined
  }

  function onInput(text: string) {
    setDraft(text)
    const iso = accept(text)
    if (iso) onChange(iso)
  }

  function commit() {
    if (draft !== null && draft.trim() === '') onChange(undefined)
    setDraft(null)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-medium">
        {label}
      </label>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        placeholder="MM/DD/YYYY"
        autoComplete="off"
        value={draft ?? (value ? formatUsDate(value) : '')}
        onChange={(e) => onInput(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit()
        }}
        onFocus={onFocus}
        aria-describedby={describedBy}
        aria-haspopup="dialog"
        aria-expanded={expanded}
        className="h-11 rounded-lg border border-line-strong bg-white px-3 text-[15px] text-ink placeholder:text-muted focus:border-2 focus:border-accent"
      />
    </div>
  )
}
