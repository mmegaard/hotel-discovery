import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import { routes } from '../../routes'

describe('SearchPage', () => {
  it('lists every hotel as a link to its detail page and announces the count', async () => {
    render(<RouterProvider router={createMemoryRouter(routes, { initialEntries: ['/hotels'] })} />)

    const results = screen.getByRole('region', { name: 'Results' })
    expect(results).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByText('Loading hotels…')).toBeInTheDocument()

    expect(await screen.findByText(/of 40 hotels/)).toHaveTextContent('40 of 40 hotels')
    const cards = screen.getAllByRole('link', { name: /The Grand Luminary|reviews/ })
    expect(cards).toHaveLength(40)
    expect(screen.getByRole('link', { name: /The Grand Luminary/ })).toHaveAttribute(
      'href',
      '/hotels/hotel-01',
    )
  })
})
