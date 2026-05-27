import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
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

describe('anomaly alert', () => {
  function startAndCountRows(n: number, intervalMs = 5000) {
    fireEvent.click(screen.getByText('Start'))
    for (let i = 0; i < n; i++) {
      act(() => { vi.advanceTimersByTime(intervalMs) })
      fireEvent.click(screen.getByText('rows'))
    }
  }

  function triggerAnomaly() {
    startAndCountRows(5)
    act(() => { vi.advanceTimersByTime(11000) })
    fireEvent.click(screen.getByText('rows'))
  }

  it('does not trigger before 5 rows', () => {
    renderCounter()
    startAndCountRows(4)
    vi.advanceTimersByTime(11000)
    fireEvent.click(screen.getByText('rows'))
    expect(screen.queryByText('Have you missed a row?')).not.toBeInTheDocument()
  })

  it('triggers when timeSinceLastRow exceeds 2x the average', () => {
    renderCounter()
    triggerAnomaly()
    expect(screen.getByText('Have you missed a row?')).toBeInTheDocument()
  })

  it('confirm button is disabled until an option is selected', () => {
    renderCounter()
    triggerAnomaly()
    expect(screen.getByText('Confirm')).toBeDisabled()
    fireEvent.click(screen.getByText('No'))
    expect(screen.getByText('Confirm')).toBeEnabled()
  })

  it('"Yes" increments count by 2', () => {
    renderCounter()
    triggerAnomaly()
    fireEvent.click(screen.getByText('Yes'))
    fireEvent.click(screen.getByText('Confirm'))
    expect(screen.getByText('7')).toBeInTheDocument()
  })

  it('"No" increments count by 1', () => {
    renderCounter()
    triggerAnomaly()
    fireEvent.click(screen.getByText('No'))
    fireEvent.click(screen.getByText('Confirm'))
    expect(screen.getByText('6')).toBeInTheDocument()
  })

  it('"I took a break" increments count by 1', () => {
    renderCounter()
    triggerAnomaly()
    fireEvent.click(screen.getByRole('button', { name: /I took a break/ }))
    fireEvent.click(screen.getByText('Confirm'))
    expect(screen.getByText('6')).toBeInTheDocument()
  })

  it('closes the modal after confirming', () => {
    renderCounter()
    triggerAnomaly()
    fireEvent.click(screen.getByText('No'))
    fireEvent.click(screen.getByText('Confirm'))
    expect(screen.queryByText('Have you missed a row?')).not.toBeInTheDocument()
  })

  it('disables future alerts when "don\'t ask me again" is toggled before confirming', () => {
    renderCounter()
    triggerAnomaly()
    fireEvent.click(screen.getByText('No'))
    fireEvent.click(screen.getByRole('button', { name: "don't ask me again" }))
    fireEvent.click(screen.getByText('Confirm'))
    act(() => { vi.advanceTimersByTime(11000) })
    fireEvent.click(screen.getByText('rows'))
    expect(screen.queryByText('Have you missed a row?')).not.toBeInTheDocument()
  })
})

describe('settings panel', () => {
  it('settings button is always visible', () => {
    renderCounter()
    expect(screen.getByRole('button', { name: 'open settings' })).toBeInTheDocument()
  })

  it('opens the settings modal when the settings button is clicked', () => {
    renderCounter()
    fireEvent.click(screen.getByRole('button', { name: 'open settings' }))
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('pre-fills the modal with onboarding data', () => {
    renderCounter({ projectName: 'Moby Sweater', sessionNumber: '3' })
    fireEvent.click(screen.getByRole('button', { name: 'open settings' }))
    expect(screen.getByLabelText('Project name')).toHaveValue('Moby Sweater')
    expect(screen.getByLabelText('Session number')).toHaveValue(3)
  })

  it('closes the modal when Cancel is clicked', () => {
    renderCounter()
    fireEvent.click(screen.getByRole('button', { name: 'open settings' }))
    fireEvent.click(screen.getByText('Cancel'))
    expect(screen.queryByText('Settings')).not.toBeInTheDocument()
  })

  it('closes the modal when clicking outside', () => {
    renderCounter()
    fireEvent.click(screen.getByRole('button', { name: 'open settings' }))
    fireEvent.click(document.querySelector('[class*="overlay"]')!)
    expect(screen.queryByText('Settings')).not.toBeInTheDocument()
  })

  it('updates the header after saving a new project name', () => {
    renderCounter()
    fireEvent.click(screen.getByRole('button', { name: 'open settings' }))
    fireEvent.change(screen.getByLabelText('Project name'), { target: { value: 'New Sweater' } })
    fireEvent.click(screen.getByText('Save'))
    expect(screen.getByText('New Sweater')).toBeInTheDocument()
  })

  it('applies starting row as an offset to the displayed count', () => {
    renderCounter()
    fireEvent.click(screen.getByRole('button', { name: 'open settings' }))
    fireEvent.change(screen.getByLabelText('Start counting from row'), { target: { value: '10' } })
    fireEvent.click(screen.getByText('Save'))
    fireEvent.click(screen.getByText('Start'))
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('includes starting row in the count after incrementing', () => {
    renderCounter()
    fireEvent.click(screen.getByRole('button', { name: 'open settings' }))
    fireEvent.change(screen.getByLabelText('Start counting from row'), { target: { value: '10' } })
    fireEvent.click(screen.getByText('Save'))
    fireEvent.click(screen.getByText('Start'))
    fireEvent.click(screen.getByText('rows'))
    expect(screen.getByText('11')).toBeInTheDocument()
  })

  it('resets starting row to 0 on session reset', () => {
    renderCounter()
    fireEvent.click(screen.getByRole('button', { name: 'open settings' }))
    fireEvent.change(screen.getByLabelText('Start counting from row'), { target: { value: '10' } })
    fireEvent.click(screen.getByText('Save'))
    fireEvent.click(screen.getByText('Start'))
    fireEvent.click(screen.getByText('Reset'))
    fireEvent.click(screen.getAllByText('Reset')[1])
    expect(screen.getByText('Start')).toBeInTheDocument()
  })
})

describe('bell icon', () => {
  it('is visible before session starts', () => {
    renderCounter()
    expect(screen.getByRole('button', { name: 'toggle missed row alerts' })).toBeInTheDocument()
  })

  it('is visible after session starts', () => {
    renderCounter()
    fireEvent.click(screen.getByText('Start'))
    expect(screen.getByRole('button', { name: 'toggle missed row alerts' })).toBeInTheDocument()
  })

  it('toggles anomaly alerts when clicked', () => {
    renderCounter()
    fireEvent.click(screen.getByText('Start'))
    const bell = screen.getByRole('button', { name: 'toggle missed row alerts' })
    fireEvent.click(bell)
    fireEvent.click(bell)
    expect(bell).toBeInTheDocument()
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
    act(() => { vi.advanceTimersByTime(5000) })
    fireEvent.click(screen.getByText('rows'))
    act(() => { vi.advanceTimersByTime(5000) })
    fireEvent.click(screen.getByText('rows'))

    expect(screen.getByText(/~/)).toBeInTheDocument()
  })

  it('shows confident average without ~ after 5 rows', () => {
    renderCounter()

    fireEvent.click(screen.getByText('Start'))
    for (let i = 0; i < 5; i++) {
      act(() => { vi.advanceTimersByTime(5000) })
      fireEvent.click(screen.getByText('rows'))
    }

    expect(screen.queryByText(/~/)).not.toBeInTheDocument()
    expect(screen.getByText(/Average time\/row/)).toBeInTheDocument()
  })
})
