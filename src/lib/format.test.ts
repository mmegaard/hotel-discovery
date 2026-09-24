import { describe, expect, it } from 'vitest'
import { formatPrice, humanizeAmenity, plural } from './format'

describe('format', () => {
  it('formats whole-dollar USD prices', () => {
    expect(formatPrice(299)).toBe('$299')
    expect(formatPrice(1250)).toBe('$1,250')
  })

  it('humanizes snake_case amenity keys without breaking brand casing', () => {
    expect(humanizeAmenity('fitness_center')).toBe('Fitness center')
    expect(humanizeAmenity('free Wi-Fi')).toBe('Free Wi-Fi')
    expect(humanizeAmenity('pool')).toBe('Pool')
  })

  it('pluralizes', () => {
    expect(plural(1, 'night')).toBe('1 night')
    expect(plural(3, 'night')).toBe('3 nights')
    expect(plural(0, 'room type')).toBe('0 room types')
  })
})
