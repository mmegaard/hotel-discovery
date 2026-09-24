import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import seed from '../../data/hotels.json'
import type { Hotel } from '../../types/hotel'
import { HotelCard } from './HotelCard'

const grand: Hotel = seed.find((h) => h.id === 'hotel-01')! // 6 amenities

describe('HotelCard', () => {
  it('shows place, stars, rating, three amenities plus a count, and the from price', () => {
    render(
      <MemoryRouter>
        <HotelCard hotel={grand} fromPrice={199} />
      </MemoryRouter>,
    )
    expect(screen.getByText('Chicago, USA')).toBeInTheDocument()
    expect(screen.getByLabelText('5-star')).toBeInTheDocument()
    expect(screen.getByLabelText('Rated 4.8 out of 5')).toHaveTextContent('4.8')
    expect(screen.getByText('1,240 reviews')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(4)
    expect(screen.getByText('Fitness center')).toBeInTheDocument()
    expect(screen.getByText('+3 more')).toBeInTheDocument()
    expect(screen.getByText('$199')).toBeInTheDocument()
  })

  it('says so instead of a price when the hotel lists no rooms', () => {
    render(
      <MemoryRouter>
        <HotelCard hotel={{ ...grand, rooms: [] }} fromPrice={undefined} />
      </MemoryRouter>,
    )
    expect(screen.getByText('No rooms listed')).toBeInTheDocument()
    expect(screen.queryByText(/per night/)).not.toBeInTheDocument()
  })
})
