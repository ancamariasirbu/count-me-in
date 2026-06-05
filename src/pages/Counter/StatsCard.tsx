import type { Ref } from 'react'
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
 * The "gauge swatch" session summary. Fully responsive: every size is a `cqw`
 * (percentage of the card's own width), so it renders identically and crisply
 * at any width — small in the modal, full-resolution for the PNG export.
 *
 * The outer element carries `container-type: inline-size` (the `cqw` basis) and
 * is what gets captured, so the card fills whatever width its parent provides.
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
  // Session number and date always appear; an empty session number defaults to 1.
  const sessionValue = sessionNumber || '1'
  const sessionLabel = `Session ${/^\d+$/.test(sessionValue) ? sessionValue.padStart(2, '0') : sessionValue}`
  const tag = [sessionLabel, dateLabel].filter(Boolean).join(' · ')
  // Project name always shows; an empty one falls back to a default.
  const projectLabel = projectName || 'My Project'
  // Sub-line keeps its line height even when empty, to preserve the layout.
  // "Other" is a non-specific placeholder type, so it's left off the card.
  const typeLabel = garmentType && garmentType !== 'Other' ? garmentType : ''
  const sub = [typeLabel, size && `Size ${size}`].filter(Boolean).join(' · ')
  const gaugeLabel = [
    gaugeStitches && `${gaugeStitches} sts`,
    gaugeRows && `${gaugeRows} rows`,
  ]
    .filter(Boolean)
    .join(' × ')

  // Every stat row is always shown; unfilled values read "n/a".
  const legend: Array<{ sym: string; key: string; value: string }> = [
    { sym: styles.symFill, key: 'Total time', value: formatTotalDuration(totalKnittingTime) },
    {
      sym: styles.symDot,
      key: 'Avg / row',
      value: averageTimePerRow !== null ? formatAvg(averageTimePerRow) : 'n/a',
    },
    { sym: styles.symBar, key: 'Needle size', value: needleSize || 'n/a' },
    { sym: styles.symGrid, key: 'Gauge', value: gaugeLabel || 'n/a' },
  ]

  // "Not sure" is the no-answer placeholder — never show it; only real patterns.
  const visiblePatterns = stitchPattern.filter(p => p !== 'Not sure')

  return (
    <div ref={ref} className={styles.container}>
      <div className={styles.card}>
        <div className={styles.net} />
        <div className={styles.wash} />
        <div className={styles.inner}>
          {tag && (
            <div>
              <span className={styles.label}>{tag}</span>
            </div>
          )}
          <div className={styles.project}>{projectLabel}</div>
          <div className={styles.sub}>{sub || ' '}</div>

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

          <div className={styles.footer}>
            {visiblePatterns.length > 0 && (
              <div className={styles.chips}>
                {visiblePatterns.map(s => (
                  <span className={styles.chip} key={s}>{s}</span>
                ))}
              </div>
            )}
            <div className={styles.brand}>Count Me In</div>
          </div>
        </div>
      </div>
    </div>
  )
}
