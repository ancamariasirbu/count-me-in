import { useLayoutEffect, useRef, useState, type Ref } from 'react'
import styles from './StatsCard.module.css'
import { formatAvg, formatTotalDuration } from '../../utils/formatters'

export type StatsCardProps = {
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
  dateLabel: string
  ref?: Ref<HTMLDivElement>
}

/**
 * The downloadable "gauge swatch" session summary, rendered to PNG via
 * html-to-image. Pure presentation: it reads the active theme through the
 * app's global CSS variables and drops any fields that are empty.
 */
export function StatsCard({
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
  ref,
}: StatsCardProps) {
  const sessionLabel = sessionNumber
    ? `Session ${/^\d+$/.test(sessionNumber) ? sessionNumber.padStart(2, '0') : sessionNumber}`
    : ''
  const tag = [sessionLabel, dateLabel].filter(Boolean).join(' · ')
  const sub = [garmentType, size && `Size ${size}`].filter(Boolean).join(' · ')
  const gaugeLabel = [
    gaugeStitches && `${gaugeStitches} sts`,
    gaugeRows && `${gaugeRows} rows`,
  ]
    .filter(Boolean)
    .join(' × ')

  const legend: Array<{ sym: string; key: string; value: string }> = [
    { sym: styles.symFill, key: 'Total time', value: formatTotalDuration(totalKnittingTime) },
    {
      sym: styles.symDot,
      key: 'Avg / row',
      value: averageTimePerRow !== null ? formatAvg(averageTimePerRow) : '',
    },
    { sym: styles.symBar, key: 'Needle size', value: needleSize },
    { sym: styles.symGrid, key: 'Gauge', value: gaugeLabel },
  ].filter(row => row.value)

  return (
    <div ref={ref} className={styles.card}>
      <div className={styles.net} />
      <div className={styles.wash} />
      <div className={styles.inner}>
        {tag && (
          <div>
            <span className={styles.label}>{tag}</span>
          </div>
        )}
        {projectName && <div className={styles.project}>{projectName}</div>}
        {sub && <div className={styles.sub}>{sub}</div>}

        <div className={styles.swatch}>
          <div className={styles.count}>{rowCount}</div>
          <div className={styles.clbl}>Rows knitted</div>
        </div>

        <div className={styles.legend}>
          {legend.map(row => (
            <div className={styles.leg} key={row.key}>
              <span className={`${styles.sym} ${row.sym}`} />
              <span className={styles.legK}>{row.key}</span>
              <span className={styles.legV}>{row.value}</span>
            </div>
          ))}
        </div>

        {stitchPattern.length > 0 && (
          <div className={styles.chips}>
            {stitchPattern.map(s => (
              <span className={styles.chip} key={s}>{s}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const CARD_W = 540
const CARD_H = 675

/**
 * On-screen preview of the StatsCard: renders the exact same card scaled down
 * to fit its container, so the modal preview is guaranteed identical to the
 * downloaded PNG. Display only — the export captures a separate unscaled card.
 */
export function StatsCardPreview(props: StatsCardProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const measure = () => {
      const width = viewportRef.current?.clientWidth
      if (width) setScale(Math.min(width / CARD_W, 1))
    }
    measure()
    if (typeof ResizeObserver === 'undefined' || !viewportRef.current) return
    const observer = new ResizeObserver(measure)
    observer.observe(viewportRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={viewportRef} className={styles.previewViewport} style={{ height: CARD_H * scale }}>
      <div className={styles.previewScale} style={{ transform: `scale(${scale})` }}>
        <StatsCard {...props} />
      </div>
    </div>
  )
}
