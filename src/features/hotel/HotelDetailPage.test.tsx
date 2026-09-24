import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import { routes } from '../../routes'

function renderAt(path: string) {
  render(<RouterProvider router={createMemoryRouter(routes, { initialEntries: [path] })} />)
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
  })
})
