export interface ComboboxOption {
  id: string
  label: string
  /** Second line under the label. */
  description?: string
  /** Shown in the input once chosen; defaults to the label. */
  selectedText?: string
}

/** Prefix match on the label, the description, or the selected text. */
export function matchOptions(options: ComboboxOption[], query: string): ComboboxOption[] {
  const needle = query.trim().toLowerCase()
  if (!needle) return options
  return options.filter((o) =>
    [o.label, o.description ?? '', o.selectedText ?? ''].some((t) =>
      t.toLowerCase().startsWith(needle),
    ),
  )
}
