import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Onboarding from './Onboarding'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

function renderOnboarding() {
  return render(
    <MemoryRouter>
      <Onboarding />
    </MemoryRouter>
  )
}

beforeEach(() => {
  mockNavigate.mockClear()
})

describe('initial render', () => {
  it('shows the app title', () => {
    renderOnboarding()
    expect(screen.getByText('Count Me In')).toBeInTheDocument()
  })

  it('shows all form fields', () => {
    renderOnboarding()
    expect(screen.getByLabelText('Project name')).toBeInTheDocument()
    expect(screen.getByLabelText('Session no.')).toBeInTheDocument()
    expect(screen.getByLabelText('Project type')).toBeInTheDocument()
    expect(screen.getByLabelText('Size')).toBeInTheDocument()
  })

  it('shows the Skip and submit buttons', () => {
    renderOnboarding()
    expect(screen.getByText('Skip')).toBeInTheDocument()
    expect(screen.getByText("Let's knit")).toBeInTheDocument()
  })
})

describe('skip flow', () => {
  it('navigates to /counter with default values when Skip is clicked', () => {
    renderOnboarding()

    fireEvent.click(screen.getByText('Skip'))

    expect(mockNavigate).toHaveBeenCalledWith('/counter', {
      state: {
        projectName: '',
        sessionNumber: '',
        garmentType: '',
        size: '',
        stitchPattern: ['Not sure'],
        anomalyAlertsEnabled: true,
      },
    })
  })
})

describe('empty form submission', () => {
  it('shows a confirmation modal when the form is submitted empty', () => {
    renderOnboarding()

    fireEvent.click(screen.getByText("Let's knit"))

    expect(screen.getByText(/You haven't filled in any details/)).toBeInTheDocument()
  })

  it('closes the modal when Back is clicked', () => {
    renderOnboarding()

    fireEvent.click(screen.getByText("Let's knit"))
    fireEvent.click(screen.getByText('Back'))

    expect(screen.queryByText(/You haven't filled in any details/)).not.toBeInTheDocument()
  })

  it('navigates to /counter with default values when Continue is clicked', () => {
    renderOnboarding()

    fireEvent.click(screen.getByText("Let's knit"))
    fireEvent.click(screen.getByText('Continue'))

    expect(mockNavigate).toHaveBeenCalledWith('/counter', {
      state: {
        projectName: '',
        sessionNumber: '',
        garmentType: '',
        size: '',
        stitchPattern: ['Not sure'],
        anomalyAlertsEnabled: true,
      },
    })
  })
})

describe('filled form submission', () => {
  it('navigates to /counter with the filled form data', () => {
    renderOnboarding()

    fireEvent.change(screen.getByLabelText('Project name'), {
      target: { value: 'Moby Sweater' },
    })
    fireEvent.change(screen.getByLabelText('Session no.'), {
      target: { value: '3' },
    })
    fireEvent.click(screen.getByText("Let's knit"))

    expect(mockNavigate).toHaveBeenCalledWith('/counter', {
      state: expect.objectContaining({
        projectName: 'Moby Sweater',
        sessionNumber: '3',
      }),
    })
  })
})
