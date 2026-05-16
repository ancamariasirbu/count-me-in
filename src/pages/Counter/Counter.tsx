import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import styles from './Counter.module.css'

interface OnboardingState {
  projectName: string
  sessionNumber: string
}

function Counter() {
  const { state } = useLocation()
  const { projectName, sessionNumber } = (state as OnboardingState) ?? {}

  const displayName = projectName || 'My Project'
  const displaySession = sessionNumber || '1'

  const [count, setCount] = useState(0)
  const [timestamps, setTimestamps] = useState<number[]>([])
  const [isPressing, setIsPressing] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [pauseStart, setPauseStart] = useState<number | null>(null)
  const [totalPausedMs, setTotalPausedMs] = useState(0)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  function increment() {
    if (isPaused) return
    setCount(c => c + 1)
    setTimestamps(ts => [...ts, Date.now()])
  }

  function decrement() {
    if (isPaused) return
    setCount(c => Math.max(0, c - 1))
  }

  function handlePause() {
    if (!isPaused) {
      setIsPaused(true)
      setPauseStart(Date.now())
    } else {
      setIsPaused(false)
      if (pauseStart !== null) {
        setTotalPausedMs(ms => ms + (Date.now() - pauseStart))
      }
      setPauseStart(null)
    }
  }

  function confirmReset() {
    setCount(0)
    setTimestamps([])
    setTotalPausedMs(0)
    setPauseStart(null)
    setIsPaused(false)
    setShowResetConfirm(false)
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.code === 'Space') {
        e.preventDefault()
        increment()
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
  }, [isPaused])

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
          onClick={increment}
          disabled={isPaused}
        >
          <span className={styles.btnCount}>{count}</span>
          <span className={styles.btnLabel}>rows</span>
        </button>
        <div className={styles.adjustRow}>
          <button className={`${styles.adjustBtn} ${isPaused ? styles.paused : ''}`} onClick={decrement} disabled={isPaused}>−</button>
          <button className={`${styles.adjustBtn} ${isPaused ? styles.paused : ''}`} onClick={increment} disabled={isPaused}>+</button>
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.secondaryActions}>
          <button className={`${styles.secondaryBtn} ${isPaused ? styles.resumeBtn : ''}`} onClick={handlePause}>
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          <button className={styles.secondaryBtn} onClick={() => setShowResetConfirm(true)}>
            Reset
          </button>
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
