import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { matchOptions, type ComboboxOption } from '../../lib/matchOptions'
import { Combobox } from './Combobox'

const options: ComboboxOption[] = [
  { id: 'Chicago', label: 'Chicago', description: 'USA · 4 hotels', selectedText: 'Chicago, USA' },
  { id: 'Seattle', label: 'Seattle', description: 'USA · 4 hotels', selectedText: 'Seattle, USA' },
  {
    id: 'Sydney',
    label: 'Sydney',
    description: 'Australia · 4 hotels',
    selectedText: 'Sydney, Australia',
  },
]

function Harness({ onSelect }: { onSelect: (id: string | undefined) => void }) {
  const [draft, setDraft] = useState('')
  const [selectedId, setSelectedId] = useState<string>()
  return (
    <Combobox
      id="city"
      label="Where to?"
      options={options}
      draft={draft}
      onDraftChange={setDraft}
      selectedId={selectedId}
      onSelect={(id) => {
        setSelectedId(id)
        onSelect(id)
      }}
    />
  )
}

describe('matchOptions', () => {
  it('prefix-matches label, description, or selected text, case-insensitively', () => {
    expect(matchOptions(options, 's').map((o) => o.id)).toEqual(['Seattle', 'Sydney'])
    expect(matchOptions(options, 'aus').map((o) => o.id)).toEqual(['Sydney'])
    expect(matchOptions(options, 'chicago, u').map((o) => o.id)).toEqual(['Chicago'])
    expect(matchOptions(options, 'attle')).toEqual([])
    expect(matchOptions(options, '  ')).toHaveLength(3)
  })
})

describe('Combobox', () => {
  it('opens on focus, filters as you type, and selects with the keyboard', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<Harness onSelect={onSelect} />)
    const input = screen.getByRole('combobox', { name: 'Where to?' })

    await user.click(input)
    expect(screen.getAllByRole('option')).toHaveLength(3)
    await user.type(input, 'se')
    expect(screen.getAllByRole('option')).toHaveLength(1)
    await user.keyboard('{ArrowDown}{Enter}')
    expect(onSelect).toHaveBeenLastCalledWith('Seattle')
    expect(input).toHaveValue('Seattle, USA')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('drops the selection when typing again, and clears with the X button', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<Harness onSelect={onSelect} />)
    const input = screen.getByRole('combobox', { name: 'Where to?' })

    await user.click(input)
    await user.click(screen.getByRole('option', { name: /Sydney/ }))
    expect(input).toHaveValue('Sydney, Australia')

    await user.type(input, 'x')
    expect(onSelect).toHaveBeenLastCalledWith(undefined)
    expect(input).toHaveValue('Sydney, Australiax')
    expect(screen.getByText('No matches for "Sydney, Australiax"')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Clear where to?' }))
    expect(input).toHaveValue('')
    expect(input).toHaveFocus()
  })
})
