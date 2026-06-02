import { useCallback, useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import styles from './CustomSelect.module.css'

export type CustomSelectOption = { value: string; label: string }

export type CustomSelectProps = {
  id?: string
  name?: string
  value: string
  onChange: (value: string) => void
  options: CustomSelectOption[]
  placeholder?: string
  size?: 'default' | 'compact'
  ariaLabel?: string
}

export function CustomSelect({
  id,
  name,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  size = 'default',
  ariaLabel,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLUListElement>(null)

  const selectedOption = options.find(o => o.value === value)

  const close = useCallback(() => {
    setIsOpen(false)
    setActiveIndex(-1)
  }, [])

  const open = useCallback(() => {
    const currentIdx = options.findIndex(o => o.value === value)
    setActiveIndex(currentIdx >= 0 ? currentIdx : 0)
    setIsOpen(true)
  }, [options, value])

  const handleSelect = useCallback(
    (newValue: string) => {
      onChange(newValue)
      close()
      triggerRef.current?.focus()
    },
    [onChange, close],
  )

  useEffect(() => {
    if (!isOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, close])

  useEffect(() => {
    if (isOpen) panelRef.current?.focus()
  }, [isOpen])

  function handleTriggerKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowDown') {
      e.preventDefault()
      if (!isOpen) open()
    } else if (e.key === 'Escape' && isOpen) {
      e.preventDefault()
      close()
    }
  }

  function handlePanelKeyDown(e: KeyboardEvent<HTMLUListElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(i => Math.min(i + 1, options.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Home') {
      e.preventDefault()
      setActiveIndex(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      setActiveIndex(options.length - 1)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (activeIndex >= 0 && activeIndex < options.length) {
        handleSelect(options[activeIndex].value)
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      close()
      triggerRef.current?.focus()
    } else if (e.key === 'Tab') {
      close()
    }
  }

  const sizeClass = size === 'compact' ? styles.compact : ''

  return (
    <div ref={containerRef} className={styles.wrap}>
      <button
        ref={triggerRef}
        id={id}
        name={name}
        type="button"
        className={`${styles.trigger} ${sizeClass}`}
        onClick={() => (isOpen ? close() : open())}
        onKeyDown={handleTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
      >
        <span className={selectedOption ? styles.value : styles.placeholder}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`} aria-hidden="true">›</span>
      </button>
      {isOpen && (
        <ul
          ref={panelRef}
          className={`${styles.panel} ${sizeClass}`}
          role="listbox"
          tabIndex={-1}
          onKeyDown={handlePanelKeyDown}
          aria-activedescendant={activeIndex >= 0 ? `${id ?? 'cs'}-opt-${activeIndex}` : undefined}
        >
          {options.map((option, idx) => (
            <li
              key={option.value}
              id={`${id ?? 'cs'}-opt-${idx}`}
              role="option"
              aria-selected={option.value === value}
              className={`${styles.option} ${idx === activeIndex ? styles.active : ''} ${option.value === value ? styles.selected : ''}`}
              onMouseEnter={() => setActiveIndex(idx)}
              onMouseDown={e => e.preventDefault()}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
