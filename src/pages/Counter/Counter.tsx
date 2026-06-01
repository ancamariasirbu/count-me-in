import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'
import styles from './Counter.module.css'
import { formatLastRow, formatAvg, formatGapDuration } from '../../utils/formatters'

const stitchPatterns = [
  'Stockinette',
  'Ribbing',
  'Garter stitch',
  'Lace',
  'Cables',
  'Texture',
  'Not sure',
]

interface OnboardingState {
  projectName: string
  sessionNumber: string
  garmentType: string
  size: string
  stitchPattern: string[]
  anomalyAlertsEnabled: boolean
}

interface SettingsForm {
  projectName: string
  sessionNumber: string
  garmentType: string
  size: string
  stitchPattern: string[]
  anomalyAlertsEnabled: boolean
  startingRow: string
}

interface PersistedSession {
  sessionDetails: {
    projectName: string
    sessionNumber: string
    garmentType: string
    size: string
    stitchPattern: string[]
  }
  hasStarted: boolean
  rowCount: number
  startingRow: number
  rowTimestampsMs: number[]
  knittingTime: number
  anomalyAlertDisabled: boolean
  consecutiveSlowRows: number
}

const STORAGE_KEY = 'count-me-in:session'

// If a tick arrives this much later than expected, we ask whether the gap
// should count as knitting time. Brief OS-level dismissals (mobile control
// center, screen luminosity, quick app switches) sit comfortably under this,
// so they don't prompt — anything longer does.
const GAP_PROMPT_THRESHOLD_MS = 10_000

function loadSession(): PersistedSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as PersistedSession) : null
  } catch {
    return null
  }
}

function saveSession(session: PersistedSession) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  } catch {
    // Ignore: private mode, quota, or storage disabled.
  }
}

function Counter() {
  const { state } = useLocation()
  const navigationType = useNavigationType()
  const { projectName, sessionNumber, garmentType, size, stitchPattern, anomalyAlertsEnabled } = (state as OnboardingState) ?? {}

  // A PUSH/REPLACE carrying state means the user just came through onboarding
  // ("Let's knit", "Skip", or "Continue") — start fresh. A POP (reload,
  // back/forward, or direct open) restores the saved session instead.
  const [restored] = useState<PersistedSession | null>(() =>
    state && navigationType !== 'POP' ? null : loadSession()
  )

  const [sessionDetails, setSessionDetails] = useState(
    restored?.sessionDetails ?? {
      projectName: projectName || '',
      sessionNumber: sessionNumber || '',
      garmentType: garmentType || '',
      size: size || '',
      stitchPattern: stitchPattern || ['Not sure'],
    }
  )

  const displayName = sessionDetails.projectName || 'My Project'
  const displaySession = String(parseInt(sessionDetails.sessionNumber) || 1).padStart(2, '0')

  const [hasStarted, setHasStarted] = useState(restored?.hasStarted ?? false)
  const [rowCount, setRowCount] = useState(restored?.rowCount ?? 0)
  const [isPressing, setIsPressing] = useState(false)
  // A restored session always wakes paused — we never count time the app wasn't running.
  const [isPaused, setIsPaused] = useState(restored?.hasStarted ?? false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showAnomalyAlert, setShowAnomalyAlert] = useState(false)
  const [anomalyAlertDisabled, setAnomalyAlertDisabled] = useState(
    restored ? restored.anomalyAlertDisabled : !(anomalyAlertsEnabled ?? true)
  )
  const [consecutiveSlowRows, setConsecutiveSlowRows] = useState(restored?.consecutiveSlowRows ?? 0)
  const [selectedAnomalyOption, setSelectedAnomalyOption] = useState<'yes' | 'no' | 'break' | 'reset' | null>(null)
  const [startingRow, setStartingRow] = useState(restored?.startingRow ?? 0)
  const [showResetAvgConfirm, setShowResetAvgConfirm] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [focusRingsEnabled, setFocusRingsEnabled] = useState(false)
  const [pauseFlash, setPauseFlash] = useState(false)
  const [settingsForm, setSettingsForm] = useState<SettingsForm>({
    projectName: restored?.sessionDetails.projectName ?? projectName ?? '',
    sessionNumber: restored?.sessionDetails.sessionNumber ?? sessionNumber ?? '',
    garmentType: restored?.sessionDetails.garmentType ?? garmentType ?? '',
    size: restored?.sessionDetails.size ?? size ?? '',
    stitchPattern: restored?.sessionDetails.stitchPattern ?? stitchPattern ?? ['Not sure'],
    anomalyAlertsEnabled: restored ? !restored.anomalyAlertDisabled : (anomalyAlertsEnabled ?? true),
    startingRow: String(restored?.startingRow ?? 0),
  })

  // Active-time tracking: all timing excludes paused time
  const [rowTimestampsMs, setRowTimestampsMs] = useState<number[]>(restored?.rowTimestampsMs ?? [])
  const [storedTotalKnittingTime, setStoredTotalKnittingTime] = useState(restored?.knittingTime ?? 0)
  const [clockTimestamp, setClockTimestamp] = useState<number | null>(null)
  const [now, setNow] = useState(Date.now())
  const [gapPrompt, setGapPrompt] = useState<{ gapMs: number; preGapKnittingTime: number } | null>(null)

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
  const showAvg = rowTimestampsMs.length >= 3 && averageTimePerRow !== null
  const avgIsEstimated = rowTimestampsMs.length < 5

  function handleStart() {
    setHasStarted(true)
    setClockTimestamp(Date.now())
  }

  function resetAverage() {
    setRowTimestampsMs(ts => ts.length > 0 ? [ts[ts.length - 1]] : [])
  }

  function increment() {
    if (!hasStarted || isPaused) return
    const ANOMALY_AVG_FLOOR_MS = 2_000
    if (
      !anomalyAlertDisabled &&
      rowCount >= 5 &&
      averageTimePerRow !== null &&
      timeSinceLastRow !== null &&
      timeSinceLastRow > 2 * Math.max(averageTimePerRow, ANOMALY_AVG_FLOOR_MS)
    ) {
      setConsecutiveSlowRows(c => c + 1)
      setShowAnomalyAlert(true)
      return
    }
    setConsecutiveSlowRows(0)
    setRowCount(c => c + 1)
    setRowTimestampsMs(ts => [...ts, totalKnittingTime])
  }

  function handleAnomalyYes() {
    const lastRowTimestamp = rowTimestampsMs[rowTimestampsMs.length - 1]
    const gap = totalKnittingTime - lastRowTimestamp
    const missedRowTimestamp = lastRowTimestamp + gap / 2
    setRowTimestampsMs(ts => [...ts, missedRowTimestamp, totalKnittingTime])
    setRowCount(c => c + 2)
    setConsecutiveSlowRows(0)
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
    setConsecutiveSlowRows(0)
    setShowAnomalyAlert(false)
    setSelectedAnomalyOption(null)
  }

  function handleAnomalyReset() {
    setRowCount(c => c + 1)
    setRowTimestampsMs([])
    setConsecutiveSlowRows(0)
    setShowAnomalyAlert(false)
    setSelectedAnomalyOption(null)
  }

  function handleAnomalyConfirm() {
    if (selectedAnomalyOption === 'yes') handleAnomalyYes()
    else if (selectedAnomalyOption === 'no') handleAnomalyNo()
    else if (selectedAnomalyOption === 'break') handleAnomalyBreak()
    else if (selectedAnomalyOption === 'reset') handleAnomalyReset()
  }

  function decrement() {
    if (isPaused || rowCount === 0) return
    setRowCount(c => c - 1)
    setRowTimestampsMs(ts => ts.slice(0, -1))
  }

  function handlePause() {
    if (!isPaused) {
      if (clockTimestamp !== null) {
        setStoredTotalKnittingTime(ms => ms + (Date.now() - clockTimestamp))
        setClockTimestamp(null)
      }
      setIsPaused(true)
    } else {
      setClockTimestamp(Date.now())
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
    setConsecutiveSlowRows(0)
    setStartingRow(0)
    setGapPrompt(null)
  }

  function handleGapCount() {
    setGapPrompt(null)
  }

  function handleGapDiscard() {
    if (gapPrompt && clockTimestamp !== null) {
      setStoredTotalKnittingTime(gapPrompt.preGapKnittingTime)
      setClockTimestamp(Date.now())
    }
    setGapPrompt(null)
  }

  function openSettings() {
    setSettingsForm({
      projectName: sessionDetails.projectName,
      sessionNumber: sessionDetails.sessionNumber,
      garmentType: sessionDetails.garmentType,
      size: sessionDetails.size,
      stitchPattern: [...sessionDetails.stitchPattern],
      anomalyAlertsEnabled: !anomalyAlertDisabled,
      startingRow: String(startingRow),
    })
    setShowSettings(true)
  }

  function saveSettings() {
    setSessionDetails({
      projectName: settingsForm.projectName,
      sessionNumber: settingsForm.sessionNumber,
      garmentType: settingsForm.garmentType,
      size: settingsForm.size,
      stitchPattern: settingsForm.stitchPattern,
    })
    setStartingRow(Math.max(0, parseInt(settingsForm.startingRow) || 0))
    setAnomalyAlertDisabled(!settingsForm.anomalyAlertsEnabled)
    setShowSettings(false)
  }

  // Detection has two paths so we get accurate gap durations regardless of
  // why the JS was inactive:
  //   1. visibilitychange — fires immediately when the tab is hidden/shown,
  //      so any tab-away period is measured exactly (no dependence on
  //      Chrome's timer throttling).
  //   2. setInterval gap — catches sleep that happens while the tab is in
  //      the foreground (visibility doesn't change for lid-close-on-focus).
  //      Subsequent gaps accumulate, because macOS may fire the timer in
  //      short bursts during sleep — without accumulation a long single
  //      sleep would underreport.
  const lastTickRef = useRef(Date.now())
  const hiddenAtRef = useRef<number | null>(null)
  useEffect(() => {
    if (isPaused || clockTimestamp === null) return
    lastTickRef.current = Date.now()
    hiddenAtRef.current = document.visibilityState === 'hidden' ? Date.now() : null

    function onVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        hiddenAtRef.current = Date.now()
        return
      }
      if (hiddenAtRef.current === null) return
      const gap = Date.now() - hiddenAtRef.current
      const hiddenAt = hiddenAtRef.current
      hiddenAtRef.current = null
      // Skip the setInterval path's gap on the next tick — the visibility
      // gap already covers it, otherwise the same time would prompt twice.
      lastTickRef.current = Date.now()
      if (gap > GAP_PROMPT_THRESHOLD_MS) {
        setGapPrompt(prev =>
          prev === null
            ? {
                gapMs: gap,
                preGapKnittingTime: storedTotalKnittingTime + (hiddenAt - clockTimestamp),
              }
            : prev
        )
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    const interval = setInterval(() => {
      const t = Date.now()
      const gap = t - lastTickRef.current
      if (gap > GAP_PROMPT_THRESHOLD_MS) {
        setGapPrompt(prev =>
          prev === null
            ? {
                gapMs: gap,
                preGapKnittingTime: storedTotalKnittingTime + (lastTickRef.current - clockTimestamp),
              }
            : { ...prev, gapMs: prev.gapMs + gap }
        )
      }
      lastTickRef.current = t
      setNow(t)
    }, 1000)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [isPaused, clockTimestamp, storedTotalKnittingTime])

  // Persist the durable session slice so a reload or sleep resumes where you
  // left off. totalKnittingTime is folded in, so the snapshot is always a
  // valid paused state (restored sessions wake paused).
  useEffect(() => {
    saveSession({
      sessionDetails,
      hasStarted,
      rowCount,
      startingRow,
      rowTimestampsMs,
      knittingTime: totalKnittingTime,
      anomalyAlertDisabled,
      consecutiveSlowRows,
    })
  }, [sessionDetails, hasStarted, rowCount, startingRow, rowTimestampsMs, totalKnittingTime, anomalyAlertDisabled, consecutiveSlowRows])

  // Opt-in keyboard focus outlines (off by default to avoid rings during spacebar use)
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('show-focus-rings', focusRingsEnabled)
    return () => root.classList.remove('show-focus-rings')
  }, [focusRingsEnabled])

  // Refs so the keyboard handler always calls the latest versions of these functions
  const incrementRef = useRef(increment)
  const handlePauseRef = useRef(handlePause)
  const lastSpacePressRef = useRef<number>(0)
  const pendingIncrementRef = useRef<boolean>(false)
  const keyupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pauseFlashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    incrementRef.current = increment
    handlePauseRef.current = handlePause
  })

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      if (e.code === 'Space' && !e.repeat && tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
        e.preventDefault()
        const now = Date.now()
        if (now - lastSpacePressRef.current < 300) {
          // Double-tap: cancel any pending increment and pause/resume instead
          if (keyupTimerRef.current !== null) {
            clearTimeout(keyupTimerRef.current)
            keyupTimerRef.current = null
          }
          pendingIncrementRef.current = false
          setIsPressing(false)
          handlePauseRef.current()
          // Mirror the click :active animation on the pause/resume button
          setPauseFlash(true)
          if (pauseFlashTimerRef.current) clearTimeout(pauseFlashTimerRef.current)
          pauseFlashTimerRef.current = setTimeout(() => setPauseFlash(false), 130)
          lastSpacePressRef.current = 0
        } else {
          // First tap: mark increment as pending, fire it on keyUp
          lastSpacePressRef.current = now
          pendingIncrementRef.current = true
          setIsPressing(true)
        }
      }
    }
    function handleKeyUp(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      if (e.code === 'Space' && tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
        e.preventDefault()
        setIsPressing(false)
        if (pendingIncrementRef.current) {
          // Short delay so a second keydown arriving quickly can still cancel this increment
          keyupTimerRef.current = setTimeout(() => {
            if (pendingIncrementRef.current) {
              pendingIncrementRef.current = false
              incrementRef.current()
            }
            keyupTimerRef.current = null
          }, 100)
        }
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
    <div className={styles.pageBackground}>
    <div className={styles.page}>
      <header className={styles.header}>
        <span className={styles.projectName}>{displayName}</span>
        <span className={styles.session}>Session {displaySession}</span>
      </header>

      <main className={styles.main}>
        <div className={styles.circleWrap}>
          <div className={styles.orbitRing} />
          <button
            className={`${styles.incrementBtn} ${isPressing ? styles.pressing : ''} ${isPaused ? styles.paused : ''}`}
            onClick={hasStarted ? increment : handleStart}
            disabled={isPaused}
          >
            {hasStarted ? (
              <div className={styles.btnCountWrap}>
                <span className={styles.btnCount}>{startingRow + rowCount}</span>
                <span className={styles.btnLabel}>rows</span>
              </div>
            ) : (
              <span className={styles.btnStart}>Start</span>
            )}
            <span className={styles.incrementTooltip}>or press space</span>
          </button>
          <div className={styles.adjustRow}>
            <button className={`${styles.adjustBtn} ${!hasStarted || isPaused ? styles.paused : ''}`} onClick={decrement} disabled={!hasStarted || isPaused}>−</button>
            <button className={`${styles.adjustBtn} ${!hasStarted || isPaused ? styles.paused : ''}`} onClick={increment} disabled={!hasStarted || isPaused}>+</button>
          </div>
        </div>
        <div className={styles.statsRow}>
          <div className={`${styles.statPill} ${styles.statPillAvg}`}>
            <span className={styles.statLabel}>avg / row</span>
            <span className={styles.statValue}>{showAvg ? <>{avgIsEstimated ? '~ ' : ''}{formatAvg(averageTimePerRow!)}</> : 'n/a'}</span>
            <button className={styles.resetAvgBtn} onClick={() => setShowResetAvgConfirm(true)} disabled={!showAvg}>reset</button>
          </div>
          <div className={styles.statPill}>
            <span className={styles.statLabel}>last row</span>
            <span className={styles.statValue}>{showLastRow ? formatLastRow(timeSinceLastRow!) : 'n/a'}</span>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.actionRow}>
          <button
            className={`${styles.secondaryBtn} ${styles.pauseBtn} ${isPaused ? styles.resumeBtn : ''} ${pauseFlash ? styles.pausePressed : ''}`}
            onClick={handlePause}
            disabled={!hasStarted}
          >
            {isPaused ? 'Resume' : 'Pause'}
            <span className={styles.pauseTooltip}>or double-tap space</span>
          </button>
          <button
            className={`${styles.secondaryBtn} ${styles.resetGlobalBtn}`}
            onClick={() => setShowResetConfirm(true)}
            disabled={!hasStarted}
          >
            Reset
            <span className={styles.pauseTooltip}>resets count &amp; timing</span>
          </button>
        </div>
        <div className={styles.bottomBar}>
          <button
            className={styles.iconBtn}
            onClick={() => setAnomalyAlertDisabled(v => !v)}
            aria-label="toggle missed row alerts"
          >
            {anomalyAlertDisabled ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                <path d="M18.63 13A17.89 17.89 0 0 1 18 8"/>
                <path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14"/>
                <path d="M18 8a6 6 0 0 0-9.33-5"/>
                <line x1="2" y1="2" x2="22" y2="22"/>
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            )}
            alerts
          </button>
          <button
            className={styles.iconBtn}
            onClick={openSettings}
            aria-label="open settings"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            settings
          </button>
          <button
            className={styles.iconBtn}
            onClick={() => setFocusRingsEnabled(v => !v)}
            aria-label="toggle keyboard focus outlines"
            aria-pressed={focusRingsEnabled}
          >
            {focusRingsEnabled ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7V5a2 2 0 0 1 2-2h2"/>
                <path d="M17 3h2a2 2 0 0 1 2 2v2"/>
                <path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
                <path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7V5a2 2 0 0 1 2-2h2"/>
                <path d="M17 3h2a2 2 0 0 1 2 2v2"/>
                <path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
                <path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
                <circle cx="12" cy="12" r="3"/>
                <line x1="2" y1="2" x2="22" y2="22"/>
              </svg>
            )}
            focus
            <span className={`${styles.pauseTooltip} ${styles.focusTooltip}`}>
              {focusRingsEnabled ? 'Focus outlines on' : 'Toggle on for keyboard navigation'}
            </span>
          </button>
        </div>
      </footer>

      {showAnomalyAlert && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <p className={styles.anomalyHeader}>
              {consecutiveSlowRows >= 2
                ? 'Did your rows become longer? If so, try resetting your average.'
                : 'Have you missed a row?'}
            </p>
            <div className={styles.anomalyActions}>
              {consecutiveSlowRows >= 2 ? (
                <>
                  <button
                    className={`${styles.anomalyBtn} ${selectedAnomalyOption === 'reset' ? styles.anomalyBtnSelected : ''}`}
                    onClick={() => setSelectedAnomalyOption('reset')}
                  >
                    Yes, reset my average
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
                  <button
                    className={`${styles.anomalyBtn} ${selectedAnomalyOption === 'yes' ? styles.anomalyBtnSelected : ''}`}
                    onClick={() => setSelectedAnomalyOption('yes')}
                  >
                    No, I just missed a row
                  </button>
                </>
              ) : (
                <>
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
                  <button
                    className={`${styles.anomalyBtn} ${selectedAnomalyOption === 'reset' ? styles.anomalyBtnSelected : ''}`}
                    onClick={() => setSelectedAnomalyOption('reset')}
                  >
                    <span>Reset average</span>
                    <span className={styles.anomalyBtnSubtext}>(start tracking from scratch)</span>
                  </button>
                </>
              )}
            </div>
            <div className={`${styles.pillToggleRow} ${selectedAnomalyOption === null ? styles.pillToggleRowDisabled : ''}`}>
              <span className={styles.pillToggleLabel}>don't ask me again</span>
              <button
                className={`${styles.pillToggle} ${anomalyAlertDisabled ? styles.pillToggleOn : ''}`}
                onClick={() => setAnomalyAlertDisabled(v => !v)}
                disabled={selectedAnomalyOption === null}
                aria-label="don't ask me again"
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
            <p>This will reset everything. Are you sure?</p>
            <div className={styles.modalActions}>
              <button className={`${styles.secondaryBtn}`} onClick={() => setShowResetConfirm(false)}>
                Cancel
              </button>
              <button className={styles.resetBtn} onClick={confirmReset}>
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {showResetAvgConfirm && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <p>This will reset your average time/row. Are you sure?</p>
            <div className={styles.modalActions}>
              <button className={`${styles.secondaryBtn}`} onClick={() => setShowResetAvgConfirm(false)}>
                Cancel
              </button>
              <button className={styles.resetBtn} onClick={() => { resetAverage(); setShowResetAvgConfirm(false) }}>
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {gapPrompt && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <p>It's been ~{formatGapDuration(gapPrompt.gapMs)} since you were active. Should this count as knitting?</p>
            <div className={styles.modalActions}>
              <button className={styles.resetBtn} onClick={handleGapDiscard}>
                Discard
              </button>
              <button className={styles.secondaryBtn} onClick={handleGapCount}>
                Count it
              </button>
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <div className={styles.overlay} onClick={() => setShowSettings(false)}>
          <div className={`${styles.modal} ${styles.settingsModal}`} onClick={e => e.stopPropagation()}>
            <h2 className={styles.settingsTitle}>Settings</h2>

            <div className={styles.settingsSection}>
              <span className={styles.settingsSectionTitle}>Session details</span>

              <div className={styles.settingsField}>
                <label htmlFor="settings-projectName">Project name</label>
                <input
                  id="settings-projectName"
                  type="text"
                  placeholder="Moby Sweater"
                  value={settingsForm.projectName}
                  onChange={e => setSettingsForm(f => ({ ...f, projectName: e.target.value }))}
                />
              </div>

              <div className={styles.settingsField}>
                <label htmlFor="settings-sessionNumber">Session number</label>
                <input
                  id="settings-sessionNumber"
                  type="number"
                  placeholder="3"
                  min="1"
                  value={settingsForm.sessionNumber}
                  onChange={e => setSettingsForm(f => ({ ...f, sessionNumber: e.target.value }))}
                />
              </div>

              <div className={styles.settingsField}>
                <label htmlFor="settings-garmentType">Garment type</label>
                <select
                  id="settings-garmentType"
                  value={settingsForm.garmentType}
                  onChange={e => setSettingsForm(f => ({ ...f, garmentType: e.target.value }))}
                >
                  <option value="">Select a garment</option>
                  <option value="Sweater / cardigan">Sweater / cardigan</option>
                  <option value="Top">Top</option>
                  <option value="Skirt">Skirt</option>
                  <option value="Dress">Dress</option>
                  <option value="Slipover">Slipover</option>
                  <option value="Vest">Vest</option>
                  <option value="Camisole">Camisole</option>
                  <option value="Blouse">Blouse</option>
                  <option value="Jacket">Jacket</option>
                  <option value="Hat">Hat</option>
                  <option value="Scarf">Scarf</option>
                  <option value="Mittens">Mittens</option>
                  <option value="Socks">Socks</option>
                  <option value="Slippers">Slippers</option>
                  <option value="Shawl">Shawl</option>
                  <option value="Blanket">Blanket</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className={styles.settingsField}>
                <label htmlFor="settings-size">Size</label>
                <input
                  id="settings-size"
                  type="text"
                  placeholder="M"
                  value={settingsForm.size}
                  onChange={e => setSettingsForm(f => ({ ...f, size: e.target.value }))}
                />
              </div>

              <div className={styles.settingsToggleRow}>
                <span>Missed row alerts</span>
                <button
                  type="button"
                  className={`${styles.pillToggle} ${settingsForm.anomalyAlertsEnabled ? styles.pillToggleOn : ''}`}
                  onClick={() => setSettingsForm(f => ({ ...f, anomalyAlertsEnabled: !f.anomalyAlertsEnabled }))}
                  aria-label="toggle missed row alerts"
                />
              </div>

              <div className={styles.settingsField}>
                <label>Stitch pattern</label>
                <div className={styles.settingsCheckboxGroup}>
                  {stitchPatterns.map(pattern => (
                    <label key={pattern} className={styles.settingsCheckboxLabel}>
                      <input
                        type="checkbox"
                        value={pattern}
                        checked={settingsForm.stitchPattern.includes(pattern)}
                        onChange={e => {
                          if (e.target.checked) {
                            setSettingsForm(f => ({ ...f, stitchPattern: [...f.stitchPattern, pattern] }))
                          } else {
                            setSettingsForm(f => ({ ...f, stitchPattern: f.stitchPattern.filter(p => p !== pattern) }))
                          }
                        }}
                      />
                      {pattern}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.settingsSection}>
              <span className={styles.settingsSectionTitle}>Starting row</span>
              <div className={styles.settingsField}>
                <label htmlFor="settings-startingRow">Start counting from row</label>
                <input
                  id="settings-startingRow"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={settingsForm.startingRow}
                  onChange={e => setSettingsForm(f => ({ ...f, startingRow: e.target.value }))}
                />
                <span className={styles.settingsHint}>rows already knitted in previous sessions</span>
              </div>
            </div>

            <div className={styles.settingsActions}>
              <button className={`${styles.secondaryBtn}`} onClick={() => setShowSettings(false)}>
                Cancel
              </button>
              <button className={styles.saveBtn} onClick={saveSettings}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  )
}

export default Counter
