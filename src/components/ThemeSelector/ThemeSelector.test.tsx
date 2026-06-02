import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeSelector } from './ThemeSelector'
import { THEME_STORAGE_KEY } from '../../constants/themes'

beforeEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
})

describe('rendering', () => {
  it('shows a trigger button labeled "switch color theme"', () => {
    render(<ThemeSelector />)
    expect(screen.getByRole('button', { name: 'switch color theme' })).toBeInTheDocument()
  })

  it('starts with the dropdown closed', () => {
    render(<ThemeSelector />)
    expect(screen.queryByRole('button', { name: 'Terracotta' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'switch color theme' })).toHaveAttribute('aria-expanded', 'false')
  })
})

describe('initialization from localStorage', () => {
  it('applies a stored theme to the <html> element on mount', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'midnight')
    render(<ThemeSelector />)
    expect(document.documentElement.getAttribute('data-theme')).toBe('midnight')
  })

  it('falls back to blush (no data-theme attribute) when localStorage is empty', () => {
    render(<ThemeSelector />)
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
  })

  it('falls back to blush when localStorage contains an unknown theme id', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'rainbow')
    render(<ThemeSelector />)
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
  })
})

describe('opening the dropdown', () => {
  it('opens when the trigger is clicked', async () => {
    const user = userEvent.setup()
    render(<ThemeSelector />)
    await user.click(screen.getByRole('button', { name: 'switch color theme' }))
    expect(screen.getByRole('button', { name: 'Terracotta' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'switch color theme' })).toHaveAttribute('aria-expanded', 'true')
  })

  it('does not show the currently active theme as an option', async () => {
    const user = userEvent.setup()
    localStorage.setItem(THEME_STORAGE_KEY, 'sage')
    render(<ThemeSelector />)
    await user.click(screen.getByRole('button', { name: 'switch color theme' }))
    expect(screen.queryByRole('button', { name: 'Sage Garden' })).not.toBeInTheDocument()
    // The other 5 themes are listed
    expect(screen.getByRole('button', { name: 'Blush' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cotton Candy' })).toBeInTheDocument()
  })
})

describe('selecting a theme', () => {
  it('applies the selected theme to <html>', async () => {
    const user = userEvent.setup()
    render(<ThemeSelector />)
    await user.click(screen.getByRole('button', { name: 'switch color theme' }))
    await user.click(screen.getByRole('button', { name: 'Indigo Dusk' }))
    expect(document.documentElement.getAttribute('data-theme')).toBe('indigo')
  })

  it('persists the selected theme to localStorage', async () => {
    const user = userEvent.setup()
    render(<ThemeSelector />)
    await user.click(screen.getByRole('button', { name: 'switch color theme' }))
    await user.click(screen.getByRole('button', { name: 'Cotton Candy' }))
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('cottonCandy')
  })

  it('removes the data-theme attribute when switching back to blush', async () => {
    const user = userEvent.setup()
    localStorage.setItem(THEME_STORAGE_KEY, 'midnight')
    render(<ThemeSelector />)
    expect(document.documentElement.getAttribute('data-theme')).toBe('midnight')
    await user.click(screen.getByRole('button', { name: 'switch color theme' }))
    await user.click(screen.getByRole('button', { name: 'Blush' }))
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
  })

  it('closes the dropdown after selection', async () => {
    const user = userEvent.setup()
    render(<ThemeSelector />)
    await user.click(screen.getByRole('button', { name: 'switch color theme' }))
    await user.click(screen.getByRole('button', { name: 'Terracotta' }))
    expect(screen.queryByRole('button', { name: 'Midnight' })).not.toBeInTheDocument()
  })
})

describe('closing the dropdown', () => {
  it('closes when clicking outside the wrapper', async () => {
    const user = userEvent.setup()
    render(<ThemeSelector />)
    await user.click(screen.getByRole('button', { name: 'switch color theme' }))
    expect(screen.getByRole('button', { name: 'Terracotta' })).toBeInTheDocument()
    await user.click(document.body)
    expect(screen.queryByRole('button', { name: 'Terracotta' })).not.toBeInTheDocument()
  })
})
