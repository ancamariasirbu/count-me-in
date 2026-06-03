import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatsCard, type StatsCardProps } from './StatsCard'

const base: StatsCardProps = {
  projectName: 'Cabled Cardigan',
  sessionNumber: '3',
  garmentType: 'Sweater',
  size: 'M',
  needleSize: '4 mm',
  gaugeStitches: '20',
  gaugeRows: '28',
  stitchPattern: ['Stockinette', 'Cable'],
  rowCount: 87,
  totalKnittingTime: 2 * 3_600_000 + 14 * 60_000,
  averageTimePerRow: 92_000,
  dateLabel: 'Jun 3',
}

describe('StatsCard content', () => {
  it('renders the core session fields', () => {
    render(<StatsCard {...base} />)
    expect(screen.getByText('Cabled Cardigan')).toBeInTheDocument()
    expect(screen.getByText('Session 03 · Jun 3')).toBeInTheDocument()
    expect(screen.getByText('Sweater · Size M')).toBeInTheDocument()
    expect(screen.getByText('87')).toBeInTheDocument()
    expect(screen.getByText('Total time')).toBeInTheDocument()
    expect(screen.getByText('2h 14min')).toBeInTheDocument()
    expect(screen.getByText('1m 32s')).toBeInTheDocument()
    expect(screen.getByText('4 mm')).toBeInTheDocument()
    expect(screen.getByText('20 sts × 28 rows')).toBeInTheDocument()
    expect(screen.getByText('Stockinette')).toBeInTheDocument()
    expect(screen.getByText('Cable')).toBeInTheDocument()
  })

  it('zero-pads single-digit session numbers', () => {
    render(<StatsCard {...base} sessionNumber="7" dateLabel="" />)
    expect(screen.getByText('Session 07')).toBeInTheDocument()
  })

  it('omits empty optional fields without leaving gaps', () => {
    render(
      <StatsCard
        {...base}
        needleSize=""
        gaugeStitches=""
        gaugeRows=""
        averageTimePerRow={null}
        stitchPattern={[]}
      />,
    )
    expect(screen.queryByText('Needle size')).not.toBeInTheDocument()
    expect(screen.queryByText('Gauge')).not.toBeInTheDocument()
    expect(screen.queryByText('Avg / row')).not.toBeInTheDocument()
    expect(screen.queryByText('Stockinette')).not.toBeInTheDocument()
    // Total time is always shown.
    expect(screen.getByText('Total time')).toBeInTheDocument()
  })

  it('shows a partial gauge when only stitches are given', () => {
    render(<StatsCard {...base} gaugeRows="" />)
    expect(screen.getByText('20 sts')).toBeInTheDocument()
  })
})
