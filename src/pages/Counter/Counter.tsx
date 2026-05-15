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
        <button className={styles.incrementBtn}>
          <span className={styles.btnCount}>0</span>
          <span className={styles.btnLabel}>rows</span>
        </button>
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
