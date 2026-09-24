import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PriceRange } from './PriceRange'

describe('PriceRange', () => {
  it('applies as you type and emits undefined at the bounds', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<PriceRange minPrice={100} maxPrice={300} onChange={onChange} />)

    const min = screen.getByRole('textbox', { name: 'Min' })
    await user.clear(min)
    await user.type(min, '200')
    expect(onChange).toHaveBeenLastCalledWith({ minPrice: 200, maxPrice: 300 }) // no Enter needed

    const max = screen.getByRole('textbox', { name: 'Max' })
    await user.clear(max)
    await user.type(max, '600')
    expect(onChange).toHaveBeenLastCalledWith({ minPrice: 100, maxPrice: undefined })
  })

  it('ignores a min above the max or a max below the min; the box reverts on blur', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<PriceRange minPrice={100} maxPrice={300} onChange={onChange} />)

    const min = screen.getByRole('textbox', { name: 'Min' })
    await user.clear(min)
    await user.type(min, '400{Enter}')
    await user.tab()
    expect(onChange).not.toHaveBeenCalled()
    expect(min).toHaveValue('100')

    const max = screen.getByRole('textbox', { name: 'Max' })
    await user.clear(max)
    await user.type(max, '60')
    await user.tab()
    expect(onChange).not.toHaveBeenCalled()
    expect(max).toHaveValue('300')
  })

  it('slider handles cannot cross', () => {
    const onChange = vi.fn()
    render(<PriceRange minPrice={100} maxPrice={300} onChange={onChange} />)
    // userEvent has no range-drag; fire the native change the browser would.
    fireEvent.change(screen.getByRole('slider', { name: 'Minimum price per night' }), {
      target: { value: '500' },
    })
    expect(onChange).toHaveBeenLastCalledWith({ minPrice: 295, maxPrice: 300 })
    fireEvent.change(screen.getByRole('slider', { name: 'Maximum price per night' }), {
      target: { value: '50' },
    })
    expect(onChange).toHaveBeenLastCalledWith({ minPrice: 100, maxPrice: 105 })
  })
})
