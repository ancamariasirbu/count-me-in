import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import styles from './Counter.module.css'
import { formatLastRow, formatAvg } from '../../utils/formatters'

interface OnboardingState {
  projectName: string
  sessionNumber: string
}

function Counter() {
  const { state } = useLocation()
  const { projectName, sessionNumber } = (state as OnboardingState) ?? {}

  const displayName = projectName || 'My Project'
  const displaySession = sessionNumber || '1'

  const [hasStarted, setHasStarted] = useState(false)
  const [count, setCount] = useState(0)
  const [isPressing, setIsPressing] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  // Active-time tracking: all timing excludes paused time
  const [activeTimestamps, setActiveTimestamps] = useState<number[]>([])
  const [totalActiveMsBefore, setTotalActiveMsBefore] = useState(0)
  const [activePeriodStart, setActivePeriodStart] = useState<number | null>(null)
  const [now, setNow] = useState(Date.now())

  const currentActiveMs =
    activePeriodStart !== null
      ? totalActiveMsBefore + (now - activePeriodStart)
      : totalActiveMsBefore

  const timeSinceLastMs =
    activeTimestamps.length > 0
      ? currentActiveMs - activeTimestamps[activeTimestamps.length - 1]
      : null

  const avgMs =
    activeTimestamps.length >= 2
      ? (activeTimestamps[activeTimestamps.length - 1] - activeTimestamps[0]) /
        (activeTimestamps.length - 1)
      : null

  const showLastRow = count >= 1 && timeSinceLastMs !== null
  const showAvg = count >= 3 && avgMs !== null
  const avgIsEstimated = count < 5

  function getCurrentActiveMs() {
    if (activePeriodStart === null) return totalActiveMsBefore
    return totalActiveMsBefore + (Date.now() - activePeriodStart)
  }

  function handleStart() {
    setHasStarted(true)
    setActivePeriodStart(Date.now())
  }

  function increment() {
    if (!hasStarted || isPaused) return
    const activeMs = getCurrentActiveMs()
    setCount(c => c + 1)
    setActiveTimestamps(ts => [...ts, activeMs])
  }

  function decrement() {
    if (isPaused) return
    setCount(c => Math.max(0, c - 1))
  }

  function handlePause() {
    if (!isPaused) {
      if (activePeriodStart !== null) {
        setTotalActiveMsBefore(ms => ms + (Date.now() - activePeriodStart!))
        setActivePeriodStart(null)
      }
      setIsPaused(true)
    } else {
      if (activeTimestamps.length > 0) {
        setActivePeriodStart(Date.now())
      }
      setIsPaused(false)
    }
  }

  function confirmReset() {
    setHasStarted(false)
    setCount(0)
    setActiveTimestamps([])
    setTotalActiveMsBefore(0)
    setActivePeriodStart(null)
    setIsPaused(false)
    setShowResetConfirm(false)
  }

  // Ticker: only runs when there is an active period
  useEffect(() => {
    if (isPaused || activePeriodStart === null) return
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [isPaused, activePeriodStart])

  // Ref so the keyboard handler always calls the latest increment
  const incrementRef = useRef(increment)
  useEffect(() => {
    incrementRef.current = increment
  })

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.code === 'Space') {
        e.preventDefault()
        incrementRef.current()
        setIsPressing(true)
      }
    }
    function handleKeyUp(e: KeyboardEvent) {
      if (e.code === 'Space') {
        setIsPressing(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.projectRow}>
          <span className={styles.dot}>·</span>
          <span className={styles.projectName}>{displayName}</span>
          <span className={styles.dot}>·</span>
        </div>
        <span className={styles.session}>Session {displaySession}</span>
      </header>

      <main className={styles.main}>
        <button
          className={`${styles.incrementBtn} ${isPressing ? styles.pressing : ''} ${isPaused ? styles.paused : ''}`}
          onClick={hasStarted ? increment : handleStart}
          disabled={isPaused}
        >
          {hasStarted ? (
            <>
              <span className={styles.btnCount}>{count}</span>
              <span className={styles.btnLabel}>rows</span>
            </>
          ) : (
            <span className={styles.btnStart}>Start</span>
          )}
        </button>
        <div className={styles.adjustRow}>
          <button className={`${styles.adjustBtn} ${!hasStarted || isPaused ? styles.paused : ''}`} onClick={decrement} disabled={!hasStarted || isPaused}>−</button>
          <button className={`${styles.adjustBtn} ${!hasStarted || isPaused ? styles.paused : ''}`} onClick={increment} disabled={!hasStarted || isPaused}>+</button>
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.secondaryActions}>
          <div className={styles.btnGroup}>
            <span className={styles.statLeft}>
              {showAvg ? <><strong>Average time/row:</strong> {avgIsEstimated ? '~ ' : ''}{formatAvg(avgMs!)}</> : ' '}
            </span>
            <button
              className={`${styles.secondaryBtn} ${isPaused ? styles.resumeBtn : ''}`}
              onClick={handlePause}
              disabled={!hasStarted}
            >
              {isPaused ? 'Resume' : 'Pause'}
            </button>
          </div>
          <div className={styles.btnGroup}>
            <span className={styles.statRight}>
              {showLastRow ? <><strong>Last row:</strong> {formatLastRow(timeSinceLastMs!)}</> : ' '}
            </span>
            <button
              className={styles.secondaryBtn}
              onClick={() => setShowResetConfirm(true)}
              disabled={!hasStarted}
            >
              Reset
            </button>
          </div>
        </div>
      </footer>

      {showResetConfirm && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <p>This will clear your row count and all timing data. Are you sure?</p>
            <div className={styles.modalActions}>
              <button className={styles.secondaryBtn} onClick={() => setShowResetConfirm(false)}>
                Cancel
              </button>
              <button className={styles.resetBtn} onClick={confirmReset}>
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Counter
