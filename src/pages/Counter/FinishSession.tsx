import { useRef, useState } from 'react'
import counterStyles from './Counter.module.css'
import styles from './FinishSession.module.css'
import { formatSessionDateRange } from '../../utils/formatters'
import { StatsCard } from './StatsCard'
import { downloadStatsCard, statsCardFilename } from '../../utils/downloadStatsCard'

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
  const cardRef = useRef<HTMLDivElement>(null)

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

  async function finish(withDownload: boolean) {
    if (withDownload && cardRef.current) {
      try {
        await downloadStatsCard(cardRef.current, statsCardFilename(projectName, sessionNumber))
      } catch (err) {
        console.error('Could not export the stats card', err)
      }
    }
    setShowDownloadPrompt(false)
    setShowStats(false)
    setFinishTimestamp(null)
    onReset()
  }

  // Date always shows while the modal is open; if there's no recorded start,
  // fall back to the finish timestamp so it reads as a single day.
  const dateLabel =
    finishTimestamp !== null
      ? formatSessionDateRange(sessionStartTimestamp ?? finishTimestamp, finishTimestamp)
      : ''

  const cardProps = {
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
    dateLabel,
  }

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
        <div className={styles.exportHost} aria-hidden="true">
          <StatsCard ref={cardRef} {...cardProps} />
        </div>
      )}

      {showStats && (
        <div
          className={counterStyles.overlay}
          onClick={e => {
            // Clicking the backdrop (outside the card) acts as Back.
            if (e.target === e.currentTarget) closeStats()
          }}
        >
          <div className={styles.previewModal}>
            <StatsCard {...cardProps} />
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
