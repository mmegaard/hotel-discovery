import { useState, type KeyboardEvent } from 'react'

export interface NumberInputProps {
  id: string
  label: string
  value: number
  min: number
  max: number
  step?: number
  prefix?: string
  /** Called with a clamped integer on blur or Enter. Never called while typing,
   *  so a user can type "100" without "1" being clamped to the minimum. */
  onCommit: (value: number) => void
}

export function NumberInput({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  prefix,
  onCommit,
}: NumberInputProps) {
  // Draft while focused; null means "show the committed value".
  const [draft, setDraft] = useState<string | null>(null)

  function commit() {
    if (draft !== null) {
      const n = Number(draft)
      if (draft.trim() !== '' && Number.isFinite(n))
        onCommit(Math.min(max, Math.max(min, Math.round(n))))
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
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={onKeyDown}
        className="w-13 bg-transparent pl-0.5 text-[15px] text-ink"
      />
    </div>
  )
}
