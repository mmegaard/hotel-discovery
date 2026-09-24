import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import { routes } from '../../routes'

function renderAt(...entries: Array<string | { pathname: string; state?: unknown }>) {
  const router = createMemoryRouter(routes, { initialEntries: entries })
  render(<RouterProvider router={router} />)
  return router
}

describe('HotelDetailPage', () => {
  it('renders the hotel header, policies, contact and amenities', async () => {
    renderAt('/hotels/hotel-01')
    expect(
      await screen.findByRole('heading', { level: 1, name: 'The Grand Luminary' }),
    ).toBeInTheDocument()
    expect(screen.getByText('789 Skyline Blvd, Chicago, IL 60611, USA')).toBeInTheDocument()
    expect(screen.getByLabelText('5-star')).toBeInTheDocument()
    expect(screen.getByLabelText('Rated 4.8 out of 5')).toHaveTextContent('4.8')
    expect(screen.getByText(/1,240 reviews/)).toBeInTheDocument()
    expect(screen.getByText('15:00 / 11:00')).toBeInTheDocument()
    expect(screen.getByText('Free cancellation up to 24 hours before check-in')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'stay@grandluminary.com' })).toHaveAttribute(
      'href',
      'mailto:stay@grandluminary.com',
    )
    const amenities = screen.getByRole('region', { name: 'Amenities' })
    expect(amenities).toHaveTextContent('Fitness center')
    expect(amenities.querySelectorAll('li')).toHaveLength(6)
    expect(screen.getByRole('link', { name: 'Back to results' })).toHaveAttribute(
      'href',
      '/hotels?city=Chicago',
    )
    expect(document.title).toBe('The Grand Luminary · StayFinder')
  })

  it('goes back through history when the user came from the search page', async () => {
    const user = userEvent.setup()
    const router = renderAt('/hotels?city=Chicago', {
      pathname: '/hotels/hotel-01',
      state: { fromSearch: true },
    })
    await screen.findByRole('heading', { level: 1, name: 'The Grand Luminary' })
    await user.click(screen.getByRole('link', { name: 'Back to results' }))
    expect(router.state.location.pathname + router.state.location.search).toBe(
      '/hotels?city=Chicago',
    )
  })

  it('shows the not-found state for an unknown id', async () => {
    renderAt('/hotels/hotel-99')
    const status = await screen.findByRole('status')
    expect(status).toHaveTextContent('Hotel not found')
    expect(screen.getByRole('link', { name: 'Browse all hotels' })).toHaveAttribute(
      'href',
      '/hotels',
    )
    expect(screen.getByRole('link', { name: 'Back to results' })).toHaveAttribute('href', '/hotels')
    expect(document.title).toBe('Hotel not found · StayFinder')
  })
})
