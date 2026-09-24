import { useId, useRef, useState, type KeyboardEvent } from 'react'
import { matchOptions, type ComboboxOption } from '../../lib/matchOptions'

export type { ComboboxOption }

export interface ComboboxProps {
  id: string
  label: string
  placeholder?: string
  options: ComboboxOption[]
  /** The chosen option, or undefined when nothing is chosen. */
  selectedId?: string
  /** Text typed while nothing is chosen. Owned by the parent so it can be
   *  reset together with the selection. */
  draft: string
  onDraftChange: (text: string) => void
  onSelect: (id: string | undefined) => void
  emptyMessage?: (query: string) => string
}

/** Single-select typeahead following the ARIA combobox pattern. Typing after a
 *  selection drops it; the list overlays the page rather than pushing it. */
export function Combobox({
  id,
  label,
  placeholder,
  options,
  selectedId,
  draft,
  onDraftChange,
  onSelect,
  emptyMessage = (q) => `No matches for "${q}"`,
}: ComboboxProps) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listId = useId()

  const selected = options.find((o) => o.id === selectedId)
  const value = selected ? (selected.selectedText ?? selected.label) : draft
  const matches = selected ? options : matchOptions(options, draft)
  const activeIndex = Math.min(active, Math.max(0, matches.length - 1))

  function pick(option: ComboboxOption) {
    onDraftChange('')
    onSelect(option.id)
    setOpen(false)
  }

  function clear() {
    onDraftChange('')
    onSelect(undefined)
    setOpen(false)
    inputRef.current?.focus()
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (!open) setOpen(true)
      const step = e.key === 'ArrowDown' ? 1 : -1
      setActive((activeIndex + step + matches.length) % Math.max(1, matches.length))
    } else if (e.key === 'Enter' && open && matches[activeIndex]) {
      e.preventDefault()
      pick(matches[activeIndex])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div
      className="relative flex w-100 flex-col gap-1.5"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false)
      }}
    >
      <label htmlFor={id} className="text-[13px] font-medium">
        {label}
      </label>
      <div className="relative flex items-center">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="pointer-events-none absolute left-3 text-muted"
        >
          <path d="M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10z" />
          <circle cx="12" cy="11" r="2" />
        </svg>
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          autoComplete="off"
          placeholder={placeholder}
          value={value}
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            open && matches[activeIndex] ? `${listId}-${matches[activeIndex].id}` : undefined
          }
          onChange={(e) => {
            onDraftChange(e.target.value)
            if (selected) onSelect(undefined)
            setActive(0)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="h-11 w-full rounded-lg border border-line-strong bg-white px-10 text-[15px] text-ink placeholder:text-muted"
        />
        {value !== '' && (
          <button
            type="button"
            aria-label={`Clear ${label.toLowerCase()}`}
            onClick={clear}
            className="absolute right-0.5 flex h-10 w-10 items-center justify-center rounded-lg text-muted hover:text-ink"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        )}
      </div>
      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={label}
          className="absolute top-full right-0 left-0 z-10 mt-1 max-h-80 overflow-y-auto rounded-lg border border-line-strong bg-white p-1.5 shadow-[0_8px_24px_rgba(27,31,35,0.12)]"
        >
          {matches.map((option, i) => (
            <li
              key={option.id}
              id={`${listId}-${option.id}`}
              role="option"
              aria-selected={option.id === selectedId}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick(option)}
              onMouseEnter={() => setActive(i)}
              className={`flex min-h-11 cursor-pointer items-center gap-2.5 rounded-md px-2.5 ${
                i === activeIndex ? 'bg-accent-tint' : ''
              }`}
            >
              <span className="flex flex-col leading-tight">
                <span className="text-[15px] font-medium">{option.label}</span>
                {option.description && (
                  <span className="text-xs text-muted">{option.description}</span>
                )}
              </span>
            </li>
          ))}
          {matches.length === 0 && (
            <li className="px-2.5 py-3 text-sm text-muted">{emptyMessage(draft)}</li>
          )}
        </ul>
      )}
    </div>
  )
}
