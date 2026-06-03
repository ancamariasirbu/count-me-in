import { useRef, useState } from 'react'
import counterStyles from './Counter.module.css'
import styles from './FinishSession.module.css'
import { formatAvg, formatTotalDuration, formatSessionDateRange } from '../../utils/formatters'

export type FinishSessionProps = {
  projectName: string
  sessionNumber: string
  garmentType: string
  size: string
  needleSize: string
  gaugeStitches: string
  gaugeRows: string
  stitchPattern: string[]
  rowCount: number
  totalKnittingTime: number
  averageTimePerRow: number | null
  sessionStartTimestamp: number | null
  disabled: boolean
  isPaused: boolean
  onPauseToggle: () => void
  onReset: () => void
}

export function FinishSession({
  projectName,
  sessionNumber,
  garmentType,
  size,
  needleSize,
  gaugeStitches,
  gaugeRows,
  stitchPattern,
  rowCount,
  totalKnittingTime,
  averageTimePerRow,
  sessionStartTimestamp,
  disabled,
  isPaused,
  onPauseToggle,
  onReset,
}: FinishSessionProps) {
  const [showStats, setShowStats] = useState(false)
  const [showDownloadPrompt, setShowDownloadPrompt] = useState(false)
  const [finishTimestamp, setFinishTimestamp] = useState<number | null>(null)
  const wasPausedBeforeRef = useRef(false)

  function openStats() {
    wasPausedBeforeRef.current = isPaused
    if (!isPaused) onPauseToggle()
    setFinishTimestamp(Date.now())
    setShowStats(true)
  }

  function closeStats() {
    setShowStats(false)
    setFinishTimestamp(null)
    if (!wasPausedBeforeRef.current) onPauseToggle()
  }

  function openDownloadPrompt() {
    setShowDownloadPrompt(true)
  }

  function cancelDownloadPrompt() {
    setShowDownloadPrompt(false)
  }

  function finish(withDownload: boolean) {
    if (withDownload) {
      // TODO: trigger PNG download (added in next phase)
    }
    setShowDownloadPrompt(false)
    setShowStats(false)
    setFinishTimestamp(null)
    onReset()
  }

  const gaugeLabel = [
    gaugeStitches && `${gaugeStitches} sts`,
    gaugeRows && `${gaugeRows} rows`,
  ]
    .filter(Boolean)
    .join(' × ')

  const dateLabel =
    sessionStartTimestamp !== null && finishTimestamp !== null
      ? formatSessionDateRange(sessionStartTimestamp, finishTimestamp)
      : ''

  return (
    <>
      <button
        type="button"
        className={styles.finishBtn}
        onClick={openStats}
        disabled={disabled}
      >
        Finish session
      </button>

      {showStats && (
        <div className={counterStyles.overlay}>
          <div className={`${counterStyles.modal} ${styles.statsModal}`}>
            <p className={styles.statsTitle}>Session summary</p>
            <div className={styles.statsList}>
              {projectName && (
                <div className={styles.statRow}>
                  <span className={styles.statLabel}>Project</span>
                  <span className={styles.statValue}>{projectName}</span>
                </div>
              )}
              {sessionNumber && (
                <div className={styles.statRow}>
                  <span className={styles.statLabel}>Session</span>
                  <span className={styles.statValue}>{sessionNumber}</span>
                </div>
              )}
              {garmentType && (
                <div className={styles.statRow}>
                  <span className={styles.statLabel}>Project type</span>
                  <span className={styles.statValue}>{garmentType}</span>
                </div>
              )}
              {size && (
                <div className={styles.statRow}>
                  <span className={styles.statLabel}>Size</span>
                  <span className={styles.statValue}>{size}</span>
                </div>
              )}
              {needleSize && (
                <div className={styles.statRow}>
                  <span className={styles.statLabel}>Needle size</span>
                  <span className={styles.statValue}>{needleSize}</span>
                </div>
              )}
              {gaugeLabel && (
                <div className={styles.statRow}>
                  <span className={styles.statLabel}>Gauge</span>
                  <span className={styles.statValue}>{gaugeLabel}</span>
                </div>
              )}
              {stitchPattern.length > 0 && (
                <div className={styles.statRow}>
                  <span className={styles.statLabel}>Stitch pattern</span>
                  <span className={styles.statValue}>{stitchPattern.join(', ')}</span>
                </div>
              )}
              <div className={styles.statRow}>
                <span className={styles.statLabel}>Total rows</span>
                <span className={styles.statValue}>{rowCount}</span>
              </div>
              <div className={styles.statRow}>
                <span className={styles.statLabel}>Total time</span>
                <span className={styles.statValue}>{formatTotalDuration(totalKnittingTime)}</span>
              </div>
              {averageTimePerRow !== null && (
                <div className={styles.statRow}>
                  <span className={styles.statLabel}>Avg / row</span>
                  <span className={styles.statValue}>{formatAvg(averageTimePerRow)}</span>
                </div>
              )}
              {dateLabel && (
                <div className={styles.statRow}>
                  <span className={styles.statLabel}>Date</span>
                  <span className={styles.statValue}>{dateLabel}</span>
                </div>
              )}
            </div>
            <div className={counterStyles.modalActions}>
              <button className={counterStyles.secondaryBtn} onClick={closeStats}>
                Back
              </button>
              <button className={styles.primaryBtn} onClick={openDownloadPrompt}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {showDownloadPrompt && (
        <div className={counterStyles.overlay}>
          <div className={counterStyles.modal}>
            <p>Download stats as PNG before finishing?</p>
            <div className={counterStyles.modalActions}>
              <button className={counterStyles.secondaryBtn} onClick={cancelDownloadPrompt}>
                Cancel
              </button>
              <button className={counterStyles.secondaryBtn} onClick={() => finish(false)}>
                No
              </button>
              <button className={styles.primaryBtn} onClick={() => finish(true)}>
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
