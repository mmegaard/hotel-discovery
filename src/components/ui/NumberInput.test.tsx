import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { NumberInput } from './NumberInput'

describe('NumberInput', () => {
  it('commits a clamped value on blur or Enter, never while typing', async () => {
    const user = userEvent.setup()
    const onCommit = vi.fn()
    render(<NumberInput id="n" label="Min" value={50} min={50} max={600} onCommit={onCommit} />)
    const input = screen.getByRole('spinbutton', { name: 'Min' })

    await user.clear(input)
    await user.type(input, '100')
    expect(onCommit).not.toHaveBeenCalled()
    await user.keyboard('{Enter}')
    expect(onCommit).toHaveBeenLastCalledWith(100)

    await user.clear(input)
    await user.type(input, '9999')
    await user.tab()
    expect(onCommit).toHaveBeenLastCalledWith(600)

    await user.clear(input)
    await user.tab()
    expect(onCommit).toHaveBeenCalledTimes(2)
    expect(input).toHaveValue(50)
  })
})
