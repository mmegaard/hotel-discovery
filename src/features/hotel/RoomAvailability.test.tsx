import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import seed from '../../data/hotels.json'
import type { Hotel } from '../../types/hotel'
import { RoomAvailability } from './RoomAvailability'

const hotels: Hotel[] = seed
const grand = hotels.find((h) => h.id === 'hotel-01')! // king Jul 10-12 $299, queen Jul 10-11 $199
const noDates = hotels.find((h) => h.id === 'hotel-04')!

// The summary is "<strong>N room types open</strong> for M nights · …", so match the paragraph.
const summary = () =>
  screen.findByText((_, el) => el?.tagName === 'P' && /room types? open/.test(el.textContent ?? ''))

async function typeDates(checkIn: string, checkOut: string) {
  const user = userEvent.setup()
  const cin = screen.getByRole('textbox', { name: 'Check-in' })
  const cout = screen.getByRole('textbox', { name: 'Check-out' })
  await user.clear(cin)
  await user.type(cin, checkIn)
  await user.clear(cout)
  await user.type(cout, checkOut)
  return user
}

describe('RoomAvailability', () => {
  it('starts with a one-night stay from today and answers at once', async () => {
    render(<RoomAvailability hotel={grand} />)
    expect(screen.getByRole('textbox', { name: 'Check-in' })).toHaveValue('07/09/2026')
    expect(screen.getByRole('textbox', { name: 'Check-out' })).toHaveValue('07/10/2026')
    expect(screen.getByText('Open nights at this hotel: Jul 10–12, 2026')).toBeInTheDocument()
    // July 9 is not an open night at this hotel, so the answer is the empty state with the hint.
    const empty = (
      await screen.findByRole('heading', { name: 'No rooms available for these dates' })
    ).closest('[role="status"]')!
    expect(empty).toHaveTextContent('Try Jul 10–12.')
  })

  it('shows the idle hint when the dates are cleared', async () => {
    render(<RoomAvailability hotel={grand} />)
    const user = userEvent.setup()
    await user.clear(screen.getByRole('textbox', { name: 'Check-in' }))
    await user.tab()
    expect(screen.getByText(/Choose your dates to see which rooms are open/)).toHaveTextContent(
      '2 room types',
    )
  })

  it('lists open rooms with totals for a two-night stay', async () => {
    render(<RoomAvailability hotel={grand} />)
    await typeDates('07/10/2026', '07/12/2026')

    expect(await summary()).toHaveTextContent(
      '2 room types open for 2 nights · Fri, Jul 10 to Sun, Jul 12',
    )
    const cards = screen.getAllByRole('article')
    expect(cards).toHaveLength(2)
    expect(within(cards[0]).getByRole('heading', { name: 'Deluxe King Room' })).toBeInTheDocument()
    expect(cards[0]).toHaveTextContent('$299 / night')
    expect(cards[0]).toHaveTextContent('1 King bed · Sleeps 2 · 450 sq ft')
    expect(cards[0]).toHaveTextContent('City view, Mini bar')
    expect(cards[0]).toHaveTextContent('$598 total')
    expect(screen.queryByText(/Not open for these dates/)).not.toBeInTheDocument()
  })

  it('names rooms that are not open when some are', async () => {
    render(<RoomAvailability hotel={grand} />)
    await typeDates('07/10/2026', '07/13/2026')
    expect(await summary()).toHaveTextContent('1 room type open for 3 nights')
    expect(screen.getAllByRole('article')).toHaveLength(1)
    expect(screen.getByText('Not open for these dates: Standard Queen')).toBeInTheDocument()
  })

  it('shows an alert when check-out is on or before check-in', async () => {
    render(<RoomAvailability hotel={grand} />)
    const user = await typeDates('07/12/2026', '07/12/2026')
    expect(screen.getByRole('alert')).toHaveTextContent('Check-out must be after check-in.')
    expect(screen.queryByRole('article')).not.toBeInTheDocument()

    // Fixing the check-out clears the alert and shows results.
    const out = screen.getByRole('textbox', { name: 'Check-out' })
    await user.clear(out)
    await user.type(out, '07/13/2026')
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument())
    expect(await screen.findAllByRole('article')).toHaveLength(1)
  })

  it('drops a check-out that a new check-in overtakes', async () => {
    render(<RoomAvailability hotel={grand} />)
    const user = await typeDates('07/10/2026', '07/11/2026')
    await screen.findAllByRole('article')
    const cin = screen.getByRole('textbox', { name: 'Check-in' })
    await user.clear(cin)
    await user.type(cin, '07/12/2026')
    expect(screen.getByRole('textbox', { name: 'Check-out' })).toHaveValue('')
    expect(screen.getByText(/Choose your dates/)).toBeInTheDocument()
  })

  it('opens the calendar on focus, fills both inputs from two clicks, and closes on Escape', async () => {
    const user = userEvent.setup()
    render(<RoomAvailability hotel={grand} />)
    const cin = screen.getByRole('textbox', { name: 'Check-in' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(cin)
    const dialog = await screen.findByRole('dialog', { name: 'Choose check-in date' })
    expect(cin).toHaveAttribute('aria-expanded', 'true')
    const day = (n: number) =>
      within(dialog).getByRole('button', { name: (name) => name.includes(`July ${n}`) })

    await user.click(day(10))
    expect(cin).toHaveValue('07/10/2026')
    expect(screen.getByRole('dialog', { name: 'Choose check-out date' })).toBeInTheDocument()
    await user.click(day(12))
    expect(screen.getByRole('textbox', { name: 'Check-out' })).toHaveValue('07/12/2026')
    expect(await screen.findAllByRole('article')).toHaveLength(2)

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows the no-rooms state with a hint, and the no-open-dates copy for a hotel with none', async () => {
    const { unmount } = render(<RoomAvailability hotel={grand} />)
    await typeDates('07/13/2026', '07/14/2026')
    const empty = (
      await screen.findByRole('heading', { name: 'No rooms available for these dates' })
    ).closest('[role="status"]')!
    expect(empty).toHaveTextContent('Try Jul 10–12.')
    unmount()

    render(<RoomAvailability hotel={noDates} />)
    expect(screen.getByText('This hotel has no open nights right now.')).toBeInTheDocument()
    await typeDates('07/10/2026', '07/11/2026')
    expect(
      (await screen.findByRole('heading', { name: 'No rooms available for these dates' })).closest(
        '[role="status"]',
      ),
    ).toHaveTextContent('This hotel has no open dates. Try another hotel.')
  })
})
