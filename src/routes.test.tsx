import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import { routes } from './routes'

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(<RouterProvider router={router} />)
  return router
}

describe('routes', () => {
  it('redirects / to /hotels and shows the search page inside the layout', async () => {
    const router = renderAt('/')
    expect(await screen.findByRole('heading', { name: 'Find a hotel' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/hotels')
    expect(screen.getByRole('banner')).toHaveTextContent('StayFinder')
  })

  it('renders the hotel detail page for /hotels/:id', async () => {
    renderAt('/hotels/hotel-01')
    expect(await screen.findByRole('heading', { name: 'Hotel hotel-01' })).toBeInTheDocument()
  })

  it('shows the 404 page with a link back to search for unknown paths', async () => {
    renderAt('/anything-else')
    expect(await screen.findByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Search hotels' })).toHaveAttribute('href', '/hotels')
  })
})
