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
  const [rowCount, setRowCount] = useState(0)
  const [isPressing, setIsPressing] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showAnomalyAlert, setShowAnomalyAlert] = useState(false)
  const [anomalyAlertDisabled, setAnomalyAlertDisabled] = useState(false)
  const [selectedAnomalyOption, setSelectedAnomalyOption] = useState<'yes' | 'no' | 'break' | null>(null)

  // Active-time tracking: all timing excludes paused time
  const [rowTimestampsMs, setRowTimestampsMs] = useState<number[]>([])
  const [storedTotalKnittingTime, setStoredTotalKnittingTime] = useState(0)
  const [clockTimestamp, setClockTimestamp] = useState<number | null>(null)
  const [now, setNow] = useState(Date.now())

  const totalKnittingTime =
    clockTimestamp !== null
      ? storedTotalKnittingTime + (now - clockTimestamp)
      : storedTotalKnittingTime

  const timeSinceLastRow =
    rowTimestampsMs.length > 0
      ? totalKnittingTime - rowTimestampsMs[rowTimestampsMs.length - 1]
      : null

  const averageTimePerRow =
    rowTimestampsMs.length >= 2
      ? (rowTimestampsMs[rowTimestampsMs.length - 1] - rowTimestampsMs[0]) /
        (rowTimestampsMs.length - 1)
      : null

  const showLastRow = rowCount >= 1 && timeSinceLastRow !== null
  const showAvg = rowCount >= 3 && averageTimePerRow !== null
  const avgIsEstimated = rowCount < 5

  function handleStart() {
    setHasStarted(true)
    setClockTimestamp(Date.now())
  }

  function increment() {
    if (!hasStarted || isPaused) return
    if (
      !anomalyAlertDisabled &&
      rowCount >= 5 &&
      averageTimePerRow !== null &&
      timeSinceLastRow !== null &&
      timeSinceLastRow > 2 * averageTimePerRow
    ) {
      setShowAnomalyAlert(true)
      return
    }
    setRowCount(c => c + 1)
    setRowTimestampsMs(ts => [...ts, totalKnittingTime])
  }

  function handleAnomalyYes() {
    const lastRowTimestamp = rowTimestampsMs[rowTimestampsMs.length - 1]
    const gap = totalKnittingTime - lastRowTimestamp
    const missedRowTimestamp = lastRowTimestamp + gap / 2
    setRowTimestampsMs(ts => [...ts, missedRowTimestamp, totalKnittingTime])
    setRowCount(c => c + 2)
    setShowAnomalyAlert(false)
    setSelectedAnomalyOption(null)
  }

  function handleAnomalyNo() {
    setRowCount(c => c + 1)
    setRowTimestampsMs(ts => [...ts, totalKnittingTime])
    setShowAnomalyAlert(false)
    setSelectedAnomalyOption(null)
  }

  function handleAnomalyBreak() {
    const lastRowTimestamp = rowTimestampsMs[rowTimestampsMs.length - 1]
    setRowCount(c => c + 1)
    setStoredTotalKnittingTime(lastRowTimestamp)
    setClockTimestamp(Date.now())
    setShowAnomalyAlert(false)
    setSelectedAnomalyOption(null)
  }

  function handleAnomalyConfirm() {
    if (selectedAnomalyOption === 'yes') handleAnomalyYes()
    else if (selectedAnomalyOption === 'no') handleAnomalyNo()
    else if (selectedAnomalyOption === 'break') handleAnomalyBreak()
  }

  function decrement() {
    if (isPaused) return
    setRowCount(c => Math.max(0, c - 1))
  }

  function handlePause() {
    if (!isPaused) {
      if (clockTimestamp !== null) {
        setStoredTotalKnittingTime(ms => ms + (Date.now() - clockTimestamp))
        setClockTimestamp(null)
      }
      setIsPaused(true)
    } else {
      if (rowTimestampsMs.length > 0) {
        setClockTimestamp(Date.now())
      }
      setIsPaused(false)
    }
  }

  function confirmReset() {
    setHasStarted(false)
    setRowCount(0)
    setRowTimestampsMs([])
    setStoredTotalKnittingTime(0)
    setClockTimestamp(null)
    setIsPaused(false)
    setShowResetConfirm(false)
    setShowAnomalyAlert(false)
    setSelectedAnomalyOption(null)
  }

  // Ticker: only runs when there is an active period
  useEffect(() => {
    if (isPaused || clockTimestamp === null) return
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [isPaused, clockTimestamp])

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
              <span className={styles.btnCount}>{rowCount}</span>
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
              {showAvg ? <><strong>Average time/row:</strong> {avgIsEstimated ? '~ ' : ''}{formatAvg(averageTimePerRow!)}</> : ' '}
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
              {showLastRow ? <><strong>Last row:</strong> {formatLastRow(timeSinceLastRow!)}</> : ' '}
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

      {hasStarted && (
        <button
          className={`${styles.alertsMutedBtn} ${anomalyAlertDisabled ? styles.alertsMutedOff : styles.alertsMutedOn}`}
          onClick={() => setAnomalyAlertDisabled(v => !v)}
        >
          {anomalyAlertDisabled ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              <path d="M18.63 13A17.89 17.89 0 0 1 18 8"/>
              <path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14"/>
              <path d="M18 8a6 6 0 0 0-9.33-5"/>
              <line x1="2" y1="2" x2="22" y2="22"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          )}
          <span className={styles.alertsMutedTooltip}>
            {anomalyAlertDisabled
              ? <>missed row alerts are off <strong>·</strong> click to re-enable</>
              : <>missed row alerts are on <strong>·</strong> click to disable</>}
          </span>
        </button>
      )}

      {showAnomalyAlert && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <p className={styles.anomalyHeader}>Have you missed a row?</p>
            <div className={styles.anomalyActions}>
              <button
                className={`${styles.anomalyBtn} ${selectedAnomalyOption === 'yes' ? styles.anomalyBtnSelected : ''}`}
                onClick={() => setSelectedAnomalyOption('yes')}
              >
                Yes
              </button>
              <button
                className={`${styles.anomalyBtn} ${selectedAnomalyOption === 'no' ? styles.anomalyBtnSelected : ''}`}
                onClick={() => setSelectedAnomalyOption('no')}
              >
                No
              </button>
              <button
                className={`${styles.anomalyBtn} ${selectedAnomalyOption === 'break' ? styles.anomalyBtnSelected : ''}`}
                onClick={() => setSelectedAnomalyOption('break')}
              >
                <span>I took a break</span>
                <span className={styles.anomalyBtnSubtext}>(do not include in the average time per row)</span>
              </button>
            </div>
            <div className={`${styles.pillToggleRow} ${selectedAnomalyOption === null ? styles.pillToggleRowDisabled : ''}`}>
              <span className={styles.pillToggleLabel}>don't ask me again</span>
              <button
                className={`${styles.pillToggle} ${anomalyAlertDisabled ? styles.pillToggleOn : ''}`}
                onClick={() => setAnomalyAlertDisabled(v => !v)}
                disabled={selectedAnomalyOption === null}
              />
            </div>
            <button
              className={styles.anomalyConfirmBtn}
              onClick={handleAnomalyConfirm}
              disabled={selectedAnomalyOption === null}
            >
              Confirm
            </button>
          </div>
        </div>
      )}

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
