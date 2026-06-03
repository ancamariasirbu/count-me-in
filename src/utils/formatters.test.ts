import { describe, it, expect } from 'vitest'
import { formatLastRow, formatAvg, formatGapDuration, formatTotalDuration, formatSessionDateRange } from './formatters'

describe('formatLastRow', () => {
  it('returns "now" for under 30 seconds', () => {
    expect(formatLastRow(0)).toBe('now')
    expect(formatLastRow(29999)).toBe('now')
  })

  it('returns "30s ago" for 30–59 seconds', () => {
    expect(formatLastRow(30000)).toBe('30s ago')
    expect(formatLastRow(59999)).toBe('30s ago')
  })

  it('returns minutes for 1–59 minutes', () => {
    expect(formatLastRow(60000)).toBe('1m ago')
    expect(formatLastRow(150000)).toBe('2m ago')
    expect(formatLastRow(3599000)).toBe('59m ago')
  })

  it('returns hours for 60+ minutes', () => {
    expect(formatLastRow(3600000)).toBe('1h ago')
    expect(formatLastRow(7200000)).toBe('2h ago')
  })
})

describe('formatAvg', () => {
  it('returns seconds for under 60 seconds', () => {
    expect(formatAvg(0)).toBe('0s')
    expect(formatAvg(45000)).toBe('45s')
    expect(formatAvg(59000)).toBe('59s')
  })

  it('returns minutes and seconds for 60+ seconds', () => {
    expect(formatAvg(60000)).toBe('1m 0s')
    expect(formatAvg(90000)).toBe('1m 30s')
    expect(formatAvg(150000)).toBe('2m 30s')
  })
})

describe('formatGapDuration', () => {
  it('returns seconds for under a minute', () => {
    expect(formatGapDuration(1_000)).toBe('1 second')
    expect(formatGapDuration(15_000)).toBe('15 seconds')
    expect(formatGapDuration(59_000)).toBe('59 seconds')
  })

  it('returns minutes for under an hour', () => {
    expect(formatGapDuration(60_000)).toBe('1 minute')
    expect(formatGapDuration(120_000)).toBe('2 minutes')
    expect(formatGapDuration(45 * 60_000)).toBe('45 minutes')
  })

  it('rounds to the nearest minute', () => {
    expect(formatGapDuration(90_000)).toBe('2 minutes')
    expect(formatGapDuration(89_000)).toBe('1 minute')
  })

  it('returns just hours when minutes is zero', () => {
    expect(formatGapDuration(60 * 60_000)).toBe('1 hour')
    expect(formatGapDuration(2 * 60 * 60_000)).toBe('2 hours')
  })

  it('returns hours and minutes for 1+ hour with remainder', () => {
    expect(formatGapDuration(90 * 60_000)).toBe('1 hour 30 minutes')
    expect(formatGapDuration(125 * 60_000)).toBe('2 hours 5 minutes')
    expect(formatGapDuration(61 * 60_000)).toBe('1 hour 1 minute')
  })
})

describe('formatTotalDuration', () => {
  it('returns seconds for under a minute', () => {
    expect(formatTotalDuration(0)).toBe('0s')
    expect(formatTotalDuration(30_000)).toBe('30s')
    expect(formatTotalDuration(59_000)).toBe('59s')
  })

  it('returns minutes for an exact-minute value', () => {
    expect(formatTotalDuration(60_000)).toBe('1min')
    expect(formatTotalDuration(120_000)).toBe('2min')
  })

  it('returns minutes and seconds when there is a remainder', () => {
    expect(formatTotalDuration(90_000)).toBe('1min 30s')
    expect(formatTotalDuration(125_000)).toBe('2min 5s')
  })

  it('returns just hours for an exact-hour value', () => {
    expect(formatTotalDuration(60 * 60_000)).toBe('1h')
    expect(formatTotalDuration(2 * 60 * 60_000)).toBe('2h')
  })

  it('returns hours and minutes when there is a remainder', () => {
    expect(formatTotalDuration(90 * 60_000)).toBe('1h 30min')
    expect(formatTotalDuration(125 * 60_000)).toBe('2h 5min')
  })
})

describe('formatSessionDateRange', () => {
  it('returns a single date when start and end are the same day', () => {
    const start = new Date(2026, 5, 3, 10, 0, 0).getTime()  // Jun 3 10am
    const end = new Date(2026, 5, 3, 18, 30, 0).getTime()   // Jun 3 6:30pm
    expect(formatSessionDateRange(start, end)).toBe('Jun 3')
  })

  it('returns a range when start and end are different days', () => {
    const start = new Date(2026, 5, 3, 22, 0, 0).getTime()  // Jun 3 10pm
    const end = new Date(2026, 5, 5, 11, 0, 0).getTime()    // Jun 5 11am
    expect(formatSessionDateRange(start, end)).toBe('Jun 3 - Jun 5')
  })

  it('returns a range when months differ', () => {
    const start = new Date(2026, 4, 30).getTime()  // May 30
    const end = new Date(2026, 5, 2).getTime()     // Jun 2
    expect(formatSessionDateRange(start, end)).toBe('May 30 - Jun 2')
  })
})
