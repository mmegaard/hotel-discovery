import { useState, type KeyboardEvent } from 'react'

export interface NumberInputProps {
  id: string
  label: string
  value: number
  min: number
  max: number
  step?: number
  prefix?: string
  /** Called with a value inside [min, max], rounded to the step. Fires on every
   *  keystroke or spin that yields a valid value, and on blur or Enter with the
   *  clamped value otherwise, so "100" can be typed without "1" being clamped. */
  onChange: (value: number) => void
}

export function NumberInput({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  prefix,
  onChange,
}: NumberInputProps) {
  // Draft while focused; null means "show the committed value".
  const [draft, setDraft] = useState<string | null>(null)

  const parse = (text: string) => (text.trim() === '' ? NaN : Number(text))
  const snap = (n: number) => Math.min(max, Math.max(min, Math.round(n / step) * step))

  function onInput(text: string) {
    setDraft(text)
    const n = parse(text)
    if (n >= min && n <= max) onChange(snap(n))
  }

  function commit() {
    if (draft !== null) {
      const n = parse(draft)
      if (Number.isFinite(n)) onChange(snap(n))
    }
    setDraft(null)
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') commit()
    if (e.key === 'Escape') setDraft(null)
  }

  return (
    <div className="flex h-11 items-center rounded-lg border border-line-strong bg-white px-2.5">
      <label htmlFor={id} className="mr-1.5 text-xs text-muted">
        {label}
      </label>
      {prefix && <span className="text-muted">{prefix}</span>}
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        step={step}
        value={draft ?? value}
        onChange={(e) => onInput(e.target.value)}
        onBlur={commit}
        onKeyDown={onKeyDown}
        className="w-13 bg-transparent pl-0.5 text-[15px] text-ink"
      />
    </div>
  )
}
