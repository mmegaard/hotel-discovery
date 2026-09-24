import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DatePicker, type DateRangeValue } from './DatePicker'

const day = (n: number) =>
  within(screen.getByRole('grid')).getByRole('button', {
    name: (name) => name.includes(`July ${n}`),
  })

describe('DatePicker', () => {
  it('disables days before today, rings today, and picks a range in two clicks', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <DatePicker
        value={{}}
        focus="from"
        today="2026-07-09"
        onChange={onChange}
        onDone={vi.fn()}
        onClear={vi.fn()}
      />,
    )
    expect(screen.getByRole('dialog', { name: 'Choose check-in date' })).toBeInTheDocument()
    expect(day(8)).toBeDisabled()
    expect(day(9)).toBeEnabled()
    expect(day(9).parentElement?.className).toContain('ring')

    await user.click(day(10))
    expect(onChange).toHaveBeenLastCalledWith({ from: '2026-07-10', to: undefined }, 'to')
  })

  it('paints a lone check-in solid, and only the ends of a range', () => {
    const { rerender } = render(
      <DatePicker
        value={{ from: '2026-07-10' }}
        focus="to"
        today="2026-07-09"
        onChange={vi.fn()}
        onDone={vi.fn()}
        onClear={vi.fn()}
      />,
    )
    const cell = (n: number) => day(n).parentElement!.className
    const isMiddle = (n: number) => cell(n).split(' ').includes('range-mid')
    expect(cell(10)).toContain('>button]:bg-accent ')
    expect(isMiddle(10)).toBe(false)

    rerender(
      <DatePicker
        value={{ from: '2026-07-10', to: '2026-07-12' }}
        focus="to"
        today="2026-07-09"
        onChange={vi.fn()}
        onDone={vi.fn()}
        onClear={vi.fn()}
      />,
    )
    expect(cell(10)).toContain('rounded-l-lg')
    expect(isMiddle(11)).toBe(true)
    expect(isMiddle(12)).toBe(false)
    expect(cell(12)).toContain('rounded-r-lg')
  })

  it('completes the range when focused on check-out, or restarts it when the day is not after check-in', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const value: DateRangeValue = { from: '2026-07-10' }
    render(
      <DatePicker
        value={value}
        focus="to"
        today="2026-07-09"
        onChange={onChange}
        onDone={vi.fn()}
        onClear={vi.fn()}
      />,
    )
    expect(screen.getByText('Select your check-out date')).toBeInTheDocument()

    await user.click(day(12))
    expect(onChange).toHaveBeenLastCalledWith({ from: '2026-07-10', to: '2026-07-12' }, 'to')

    await user.click(day(9))
    expect(onChange).toHaveBeenLastCalledWith({ from: '2026-07-09', to: undefined }, 'to')
  })

  it('footer buttons call back', async () => {
    const user = userEvent.setup()
    const onDone = vi.fn()
    const onClear = vi.fn()
    render(
      <DatePicker
        value={{}}
        focus="from"
        today="2026-07-09"
        onChange={vi.fn()}
        onDone={onDone}
        onClear={onClear}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Clear' }))
    expect(onClear).toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Done' }))
    expect(onDone).toHaveBeenCalled()
  })
})
