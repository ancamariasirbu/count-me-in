import { describe, it, expect } from 'vitest'
import { formatLastRow, formatAvg, formatGapDuration } from './formatters'

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
