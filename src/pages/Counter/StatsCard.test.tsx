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

  it('defaults an empty session number to "Session 01"', () => {
    render(<StatsCard {...base} sessionNumber="" />)
    expect(screen.getByText('Session 01 · Jun 3')).toBeInTheDocument()
  })

  it('falls back to "My Project" when the project name is empty', () => {
    render(<StatsCard {...base} projectName="" />)
    expect(screen.getByText('My Project')).toBeInTheDocument()
  })

  it('shows the "Count Me In" branding', () => {
    render(<StatsCard {...base} />)
    expect(screen.getByText('Count Me In')).toBeInTheDocument()
  })

  it('always shows every stat row, with "n/a" for unfilled values', () => {
    render(
      <StatsCard
        {...base}
        needleSize=""
        gaugeStitches=""
        gaugeRows=""
        averageTimePerRow={null}
      />,
    )
    // Rows are present...
    expect(screen.getByText('Avg / row')).toBeInTheDocument()
    expect(screen.getByText('Needle size')).toBeInTheDocument()
    expect(screen.getByText('Gauge')).toBeInTheDocument()
    // ...with n/a as their values.
    expect(screen.getAllByText('n/a')).toHaveLength(3)
    // Total time always has a real value.
    expect(screen.getByText('2h 14min')).toBeInTheDocument()
  })

  it('shows a partial gauge when only stitches are given', () => {
    render(<StatsCard {...base} gaugeRows="" />)
    expect(screen.getByText('20 sts')).toBeInTheDocument()
  })

  it('omits an "Other" project type from the sub-line', () => {
    render(<StatsCard {...base} garmentType="Other" />)
    expect(screen.queryByText(/Other/)).not.toBeInTheDocument()
    // Size still shows on its own.
    expect(screen.getByText('Size M')).toBeInTheDocument()
  })

  it('never renders the "Not sure" placeholder in the footer', () => {
    render(<StatsCard {...base} stitchPattern={['Not sure']} />)
    expect(screen.queryByText('Not sure')).not.toBeInTheDocument()
  })

  it('shows real patterns even if "Not sure" is mixed in', () => {
    render(<StatsCard {...base} stitchPattern={['Not sure', 'Cable']} />)
    expect(screen.queryByText('Not sure')).not.toBeInTheDocument()
    expect(screen.getByText('Cable')).toBeInTheDocument()
  })
})
