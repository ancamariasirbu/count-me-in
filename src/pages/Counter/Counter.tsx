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

  function increment() {
    setCount(c => c + 1)
    setTimestamps(ts => [...ts, Date.now()])
  }

  function decrement() {
    setCount(c => Math.max(0, c - 1))
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
        <button className={`${styles.incrementBtn} ${isPressing ? styles.pressing : ''}`} onClick={increment}>
          <span className={styles.btnCount}>{count}</span>
          <span className={styles.btnLabel}>rows</span>
        </button>
        <div className={styles.adjustRow}>
          <button className={styles.adjustBtn} onClick={decrement}>−</button>
          <button className={styles.adjustBtn} onClick={increment}>+</button>
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.secondaryActions}>
          <button className={styles.secondaryBtn}>Pause</button>
          <button className={styles.secondaryBtn}>Reset</button>
        </div>
      </footer>
    </div>
  )
}

export default Counter
