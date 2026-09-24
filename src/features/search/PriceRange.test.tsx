import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PriceRange } from './PriceRange'

describe('PriceRange', () => {
  it('keeps min and max ordered and emits undefined at the bounds', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<PriceRange minPrice={100} maxPrice={300} onChange={onChange} />)

    const min = screen.getByRole('spinbutton', { name: 'Min' })
    await user.clear(min)
    await user.type(min, '400{Enter}')
    expect(onChange).toHaveBeenLastCalledWith({ minPrice: 300, maxPrice: 300 })

    const max = screen.getByRole('spinbutton', { name: 'Max' })
    await user.clear(max)
    await user.type(max, '600{Enter}')
    expect(onChange).toHaveBeenLastCalledWith({ minPrice: 100, maxPrice: undefined })
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
