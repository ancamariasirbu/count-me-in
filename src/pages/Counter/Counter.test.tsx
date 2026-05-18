import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Counter from './Counter'

function renderCounter(state = { projectName: 'Test Project', sessionNumber: '1' }) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/counter', state }]}>
      <Counter />
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('initial state', () => {
  it('shows the Start button', () => {
    renderCounter()
    expect(screen.getByText('Start')).toBeInTheDocument()
  })

  it('shows the project name and session from onboarding', () => {
    renderCounter()
    expect(screen.getByText('Test Project')).toBeInTheDocument()
    expect(screen.getByText('Session 1')).toBeInTheDocument()
  })

  it('has Pause and Reset buttons disabled before starting', () => {
    renderCounter()
    expect(screen.getByText('Pause')).toBeDisabled()
    expect(screen.getByText('Reset')).toBeDisabled()
  })

  it('has − and + buttons disabled before starting', () => {
    renderCounter()
    expect(screen.getByText('−')).toBeDisabled()
    expect(screen.getByText('+')).toBeDisabled()
  })
})

describe('after clicking Start', () => {
  it('shows the row count and enables controls', () => {
    renderCounter()

    fireEvent.click(screen.getByText('Start'))

    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('rows')).toBeInTheDocument()
    expect(screen.getByText('Pause')).toBeEnabled()
    expect(screen.getByText('Reset')).toBeEnabled()
    expect(screen.getByText('−')).toBeEnabled()
    expect(screen.getByText('+')).toBeEnabled()
  })
})

describe('increment and decrement', () => {
  it('increments the count when the main button is clicked', () => {
    renderCounter()

    fireEvent.click(screen.getByText('Start'))
    fireEvent.click(screen.getByText('rows'))

    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('decrements the count when − is clicked', () => {
    renderCounter()

    fireEvent.click(screen.getByText('Start'))
    fireEvent.click(screen.getByText('rows'))
    fireEvent.click(screen.getByText('rows'))
    fireEvent.click(screen.getByText('−'))

    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('does not go below 0', () => {
    renderCounter()

    fireEvent.click(screen.getByText('Start'))
    fireEvent.click(screen.getByText('−'))

    expect(screen.getByText('0')).toBeInTheDocument()
  })
})

describe('pause and resume', () => {
  it('changes Pause to Resume when clicked', () => {
    renderCounter()

    fireEvent.click(screen.getByText('Start'))
    fireEvent.click(screen.getByText('Pause'))

    expect(screen.getByText('Resume')).toBeInTheDocument()
  })

  it('disables the main button when paused', () => {
    renderCounter()

    fireEvent.click(screen.getByText('Start'))
    fireEvent.click(screen.getByText('Pause'))

    expect(screen.getByText('rows').closest('button')).toBeDisabled()
  })

  it('changes Resume back to Pause when clicked again', () => {
    renderCounter()

    fireEvent.click(screen.getByText('Start'))
    fireEvent.click(screen.getByText('Pause'))
    fireEvent.click(screen.getByText('Resume'))

    expect(screen.getByText('Pause')).toBeInTheDocument()
  })
})

describe('reset', () => {
  it('shows a confirmation modal when Reset is clicked', () => {
    renderCounter()

    fireEvent.click(screen.getByText('Start'))
    fireEvent.click(screen.getByText('Reset'))

    expect(screen.getByText(/This will clear your row count/)).toBeInTheDocument()
  })

  it('closes the modal without resetting when Cancel is clicked', () => {
    renderCounter()

    fireEvent.click(screen.getByText('Start'))
    fireEvent.click(screen.getByText('rows'))
    fireEvent.click(screen.getByText('Reset'))
    fireEvent.click(screen.getByText('Cancel'))

    expect(screen.queryByText(/This will clear your row count/)).not.toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('resets everything back to Start when confirmed', () => {
    renderCounter()

    fireEvent.click(screen.getByText('Start'))
    fireEvent.click(screen.getByText('rows'))
    fireEvent.click(screen.getByText('Reset'))
    fireEvent.click(screen.getAllByText('Reset')[1])

    expect(screen.getByText('Start')).toBeInTheDocument()
  })
})

describe('stats display', () => {
  it('shows "just now" after the first increment', () => {
    renderCounter()

    fireEvent.click(screen.getByText('Start'))
    fireEvent.click(screen.getByText('rows'))

    expect(screen.getByText(/just now/)).toBeInTheDocument()
  })

  it('shows estimated average with ~ after 3 rows', () => {
    renderCounter()

    fireEvent.click(screen.getByText('Start'))
    fireEvent.click(screen.getByText('rows'))
    vi.advanceTimersByTime(5000)
    fireEvent.click(screen.getByText('rows'))
    vi.advanceTimersByTime(5000)
    fireEvent.click(screen.getByText('rows'))

    expect(screen.getByText(/~/)).toBeInTheDocument()
  })

  it('shows confident average without ~ after 5 rows', () => {
    renderCounter()

    fireEvent.click(screen.getByText('Start'))
    for (let i = 0; i < 5; i++) {
      vi.advanceTimersByTime(5000)
      fireEvent.click(screen.getByText('rows'))
    }

    expect(screen.queryByText(/~/)).not.toBeInTheDocument()
    expect(screen.getByText(/Average time\/row/)).toBeInTheDocument()
  })
})
