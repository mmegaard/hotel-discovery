import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DateInput } from './DateInput'

describe('DateInput', () => {
  it('applies a complete real date on or after min as it is typed; otherwise reverts on blur', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <DateInput id="d" label="Check-in" value="2026-07-10" min="2026-07-09" onChange={onChange} />,
    )
    const input = screen.getByRole('textbox', { name: 'Check-in' })
    expect(input).toHaveValue('07/10/2026')

    await user.clear(input)
    await user.type(input, '07/1')
    expect(onChange).not.toHaveBeenCalled()
    await user.type(input, '2/2026')
    expect(onChange).toHaveBeenLastCalledWith('2026-07-12')

    await user.clear(input)
    await user.type(input, '07/01/2026') // before min
    await user.tab()
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(input).toHaveValue('07/10/2026') // falls back to the applied value

    await user.clear(input)
    await user.tab()
    expect(onChange).toHaveBeenLastCalledWith(undefined)
  })
})
