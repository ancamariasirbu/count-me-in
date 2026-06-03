import { describe, it, expect } from 'vitest'
import { statsCardFilename } from './downloadStatsCard'

describe('statsCardFilename', () => {
  it('slugifies the project name and appends the session', () => {
    expect(statsCardFilename('Cabled Cardigan', '3')).toBe('cabled-cardigan-session-3.png')
  })

  it('collapses punctuation and trims stray dashes', () => {
    expect(statsCardFilename('  My!! Scarf  ', '2')).toBe('my-scarf-session-2.png')
  })

  it('falls back to a default when the name is empty', () => {
    expect(statsCardFilename('', '')).toBe('knitting-session.png')
  })

  it('omits the session segment when there is no session number', () => {
    expect(statsCardFilename('Beanie', '')).toBe('beanie.png')
  })
})
