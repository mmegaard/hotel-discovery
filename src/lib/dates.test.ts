import { describe, expect, it } from 'vitest'
import {
  addDays,
  formatLong,
  formatUsDate,
  fromLocalDate,
  isIsoDate,
  nightsBetween,
  nightsOf,
  parseUsDate,
  spans,
  toLocalDate,
  today,
} from './dates'

describe('dates', () => {
  it('today() is the demo clock, 2026-07-09', () => {
    expect(today()).toBe('2026-07-09')
  })

  it('addDays crosses month and year boundaries', () => {
    expect(addDays('2026-07-31', 1)).toBe('2026-08-01')
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28')
  })

  it('nightsBetween counts whole nights; nightsOf excludes the check-out date', () => {
    expect(nightsBetween('2026-07-10', '2026-07-12')).toBe(2)
    expect(nightsBetween('2026-07-12', '2026-07-10')).toBe(-2)
    expect(nightsOf('2026-07-10', '2026-07-12')).toEqual(['2026-07-10', '2026-07-11'])
    expect(nightsOf('2026-07-10', '2026-07-10')).toEqual([])
    expect(nightsOf('2026-07-12', '2026-07-10')).toEqual([])
  })

  it('parses MM/DD/YYYY only when it is a real date', () => {
    expect(parseUsDate('07/10/2026')).toBe('2026-07-10')
    expect(parseUsDate(' 7/1/2026 ')).toBe('2026-07-01')
    expect(parseUsDate('02/30/2026')).toBeNull()
    expect(parseUsDate('13/01/2026')).toBeNull()
    expect(parseUsDate('2026-07-10')).toBeNull()
    expect(parseUsDate('')).toBeNull()
  })

  it('formats for inputs and for reading', () => {
    expect(formatUsDate('2026-07-10')).toBe('07/10/2026')
    expect(formatLong('2026-07-10')).toBe('Fri, Jul 10')
    expect(isIsoDate('2026-02-29')).toBe(false)
    expect(isIsoDate('2024-02-29')).toBe(true)
  })

  it('round-trips through local Date objects without shifting a day', () => {
    const date = toLocalDate('2026-07-10')
    expect([date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()]).toEqual([
      2026, 6, 10, 0,
    ])
    expect(fromLocalDate(date)).toBe('2026-07-10')
    expect(fromLocalDate(toLocalDate('2026-01-01'))).toBe('2026-01-01')
  })

  it('spans groups consecutive days', () => {
    expect(spans(['2026-07-13', '2026-07-10', '2026-07-11', '2026-07-11'])).toEqual([
      'Jul 10–11',
      'Jul 13',
    ])
    expect(spans(['2026-07-31', '2026-08-01'])).toEqual(['Jul 31–Aug 1'])
    expect(spans([])).toEqual([])
  })
})
