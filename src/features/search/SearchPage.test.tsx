import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import { routes } from '../../routes'

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(<RouterProvider router={router} />)
  return router
}

const count = () => screen.getByText(/of 40 hotels/)
const cards = () => within(screen.getByRole('region', { name: 'Results' })).getAllByRole('link')

describe('SearchPage', () => {
  it('lists every hotel as a link to its detail page and announces the count', async () => {
    renderAt('/hotels')
    const results = screen.getByRole('region', { name: 'Results' })
    expect(results).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByText('Loading hotels…')).toBeInTheDocument()

    await waitFor(() => expect(count()).toHaveTextContent(/^40 of 40 hotels$/))
    expect(cards()).toHaveLength(40)
    expect(screen.getByRole('link', { name: /The Grand Luminary/ })).toHaveAttribute(
      'href',
      '/hotels/hotel-01',
    )
    expect(results).toHaveAttribute('aria-busy', 'false')
  })

  it('picking a city narrows the list and writes the URL', async () => {
    const user = userEvent.setup()
    const router = renderAt('/hotels')
    await waitFor(() => expect(count()).toHaveTextContent(/^40 of 40 hotels$/))

    const city = screen.getByRole('combobox', { name: 'Where to?' })
    await user.type(city, 'se')
    await user.click(await screen.findByRole('option', { name: /Seattle/ }))

    await waitFor(() => expect(count()).toHaveTextContent(/^4 of 40 hotels$/))
    expect(cards()).toHaveLength(4)
    expect(router.state.location.search).toBe('?city=Seattle')
    expect(city).toHaveValue('Seattle, USA')
  })

  it('a price range narrows the list and writes the URL', async () => {
    const user = userEvent.setup()
    const router = renderAt('/hotels')
    await waitFor(() => expect(count()).toHaveTextContent(/^40 of 40 hotels$/))

    const max = screen.getByRole('spinbutton', { name: 'Max' })
    await user.clear(max)
    await user.type(max, '100{Enter}')
    expect(router.state.location.search).toBe('?maxPrice=100')

    await waitFor(() => expect(count()).not.toHaveTextContent(/^40 of 40 hotels$/))
    expect(cards().length).toBeGreaterThan(0)
    expect(cards().length).toBeLessThan(40)
    expect(screen.getByText('$75')).toBeInTheDocument()
  })

  it('restores filters from the URL and shows the empty state with a working reset', async () => {
    const user = userEvent.setup()
    const router = renderAt('/hotels?city=Nowhere')

    const empty = await screen.findByRole('status')
    expect(empty).toHaveTextContent('No hotels match these filters')
    expect(count()).toHaveTextContent(/^0 of 40 hotels$/)

    await user.click(within(empty).getByRole('button', { name: 'Reset filters' }))
    await waitFor(() => expect(count()).toHaveTextContent(/^40 of 40 hotels$/))
    expect(router.state.location.search).toBe('')
  })
})
