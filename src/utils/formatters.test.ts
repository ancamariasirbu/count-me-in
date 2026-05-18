import { describe, it, expect } from 'vitest'
import { formatLastRow, formatAvg } from './formatters'

describe('formatLastRow', () => {
  it('returns "just now" for anything under 60 seconds', () => {
    expect(formatLastRow(0)).toBe('just now')
    expect(formatLastRow(30000)).toBe('just now')
    expect(formatLastRow(59999)).toBe('just now')
  })

  it('returns minutes for 1–59 minutes', () => {
    expect(formatLastRow(60000)).toBe('1 min ago')
    expect(formatLastRow(150000)).toBe('2 min ago')
    expect(formatLastRow(3599000)).toBe('59 min ago')
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

  it('returns minutes with one decimal for 60+ seconds', () => {
    expect(formatAvg(60000)).toBe('1.0 min')
    expect(formatAvg(90000)).toBe('1.5 min')
    expect(formatAvg(150000)).toBe('2.5 min')
  })
})
