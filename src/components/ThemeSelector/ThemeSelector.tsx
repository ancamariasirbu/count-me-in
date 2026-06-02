import { useCallback, useEffect, useRef, useState } from 'react'
import { THEMES, THEME_STORAGE_KEY } from '../../constants/themes'
import type { ThemeId } from '../../constants/themes'
import styles from './ThemeSelector.module.css'

export type ThemeSelectorProps = {
  direction?: 'up' | 'down'
}

export function ThemeSelector({ direction = 'up' }: ThemeSelectorProps) {
  const [theme, setTheme] = useState<ThemeId>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId | null
    return THEMES.some(t => t.id === saved) ? saved! : 'blush'
  })
  const [isOpen, setIsOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'blush') {
      root.removeAttribute('data-theme')
    } else {
      root.setAttribute('data-theme', theme)
    }
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  useEffect(() => {
    if (!isOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const handleSelect = useCallback((id: ThemeId) => {
    setTheme(id)
    setIsOpen(false)
  }, [])

  return (
    <div className={styles.wrap} ref={wrapRef}>
      {isOpen && (
        <div className={`${styles.dropdown} ${direction === 'down' ? styles.dropdownDown : styles.dropdownUp}`}>
          {THEMES.filter(t => t.id !== theme).map(t => (
            <button
              key={t.id}
              type="button"
              className={styles.option}
              onClick={() => handleSelect(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setIsOpen(v => !v)}
        aria-label="switch color theme"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
          <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
          <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
          <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
        </svg>
        theme
      </button>
    </div>
  )
}
