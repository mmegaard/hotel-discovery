import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { NumberInput } from './NumberInput'

function setup(value = 50) {
  const onChange = vi.fn()
  render(
    <NumberInput
      id="n"
      label="Min"
      value={value}
      min={50}
      max={600}
      step={5}
      onChange={onChange}
    />,
  )
  return { onChange, input: screen.getByRole('textbox', { name: 'Min' }) }
}

describe('NumberInput', () => {
  it('applies while typing only once the value is valid, snapped to the step', async () => {
    const user = userEvent.setup()
    const { onChange, input } = setup()

    await user.clear(input)
    await user.type(input, '1')
    expect(onChange).not.toHaveBeenCalled() // below min: wait
    await user.type(input, '0')
    expect(onChange).not.toHaveBeenCalled() // 10, still below
    await user.type(input, '3')
    expect(onChange).toHaveBeenLastCalledWith(105) // 103 -> nearest $5
    expect(input).toHaveValue('103') // the box keeps what was typed while focused
  })

  it('discards an out-of-range or empty draft on blur or Enter', async () => {
    const user = userEvent.setup()
    const { onChange, input } = setup()

    await user.clear(input)
    await user.type(input, '9999')
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenLastCalledWith(100) // "99" was valid on the way; 999 and 9999 were not
    await user.keyboard('{Enter}')
    expect(onChange).toHaveBeenCalledTimes(1) // 9999 discarded, not clamped
    expect(input).toHaveValue('50')

    await user.clear(input)
    await user.type(input, '1e2')
    await user.tab()
    expect(onChange).toHaveBeenCalledTimes(1) // not a plain integer
    expect(input).toHaveValue('50')
  })
})
