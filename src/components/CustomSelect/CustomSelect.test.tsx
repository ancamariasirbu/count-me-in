import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CustomSelect } from './CustomSelect'

const options = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
]

function setup(overrides: Partial<React.ComponentProps<typeof CustomSelect>> = {}) {
  const onChange = vi.fn()
  const utils = render(
    <CustomSelect value="" onChange={onChange} options={options} placeholder="pick one" {...overrides} />,
  )
  return { ...utils, onChange, user: userEvent.setup() }
}

describe('rendering', () => {
  it('shows placeholder when no value is selected', () => {
    setup()
    expect(screen.getByRole('button')).toHaveTextContent('pick one')
  })

  it('shows the selected option label when value matches', () => {
    setup({ value: 'banana' })
    expect(screen.getByRole('button')).toHaveTextContent('Banana')
  })

  it('starts with the panel closed', () => {
    setup()
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false')
  })
})

describe('opening the panel', () => {
  it('opens when the trigger is clicked', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button'))
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true')
  })

  it('opens when Space is pressed on the trigger', async () => {
    const { user } = setup()
    screen.getByRole('button').focus()
    await user.keyboard(' ')
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('opens when Enter is pressed on the trigger', async () => {
    const { user } = setup()
    screen.getByRole('button').focus()
    await user.keyboard('{Enter}')
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('opens when ArrowDown is pressed on the trigger', async () => {
    const { user } = setup()
    screen.getByRole('button').focus()
    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('renders one option per item with role="option"', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button'))
    expect(screen.getAllByRole('option')).toHaveLength(3)
  })

  it('marks the current value with aria-selected', async () => {
    const { user } = setup({ value: 'banana' })
    await user.click(screen.getByRole('button'))
    expect(screen.getByRole('option', { name: 'Banana' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('option', { name: 'Apple' })).toHaveAttribute('aria-selected', 'false')
  })
})

describe('selecting an option', () => {
  it('calls onChange with the option value when clicked', async () => {
    const { user, onChange } = setup()
    await user.click(screen.getByRole('button'))
    await user.click(screen.getByRole('option', { name: 'Cherry' }))
    expect(onChange).toHaveBeenCalledWith('cherry')
  })

  it('closes the panel after a click selection', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button'))
    await user.click(screen.getByRole('option', { name: 'Apple' }))
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('selects the currently highlighted option when Enter is pressed in the panel', async () => {
    const { user, onChange } = setup()
    await user.click(screen.getByRole('button'))
    // Active starts at index 0 (Apple) since no value was set
    await user.keyboard('{ArrowDown}{Enter}')
    expect(onChange).toHaveBeenCalledWith('banana')
  })
})

describe('closing the panel', () => {
  it('closes when Escape is pressed in the panel', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button'))
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('closes when clicking outside the wrapper', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button'))
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    await user.click(document.body)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('closes when Tab is pressed in the panel', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button'))
    await user.tab()
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })
})

describe('keyboard navigation in panel', () => {
  it('ArrowDown moves active highlight forward', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button'))
    // Active starts at index 0 (Apple) → ArrowDown → Banana
    await user.keyboard('{ArrowDown}{Enter}')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('ArrowUp moves active highlight backward', async () => {
    const { user, onChange } = setup({ value: 'cherry' })
    await user.click(screen.getByRole('button'))
    // Active starts at index 2 (Cherry) → ArrowUp → Banana → Enter
    await user.keyboard('{ArrowUp}{Enter}')
    expect(onChange).toHaveBeenCalledWith('banana')
  })

  it('Home jumps to the first option', async () => {
    const { user, onChange } = setup({ value: 'cherry' })
    await user.click(screen.getByRole('button'))
    await user.keyboard('{Home}{Enter}')
    expect(onChange).toHaveBeenCalledWith('apple')
  })

  it('End jumps to the last option', async () => {
    const { user, onChange } = setup()
    await user.click(screen.getByRole('button'))
    await user.keyboard('{End}{Enter}')
    expect(onChange).toHaveBeenCalledWith('cherry')
  })

  it('does not move past the last option with ArrowDown', async () => {
    const { user, onChange } = setup({ value: 'cherry' })
    await user.click(screen.getByRole('button'))
    // Active at 2 (Cherry) → ArrowDown should clamp at 2 → Enter selects Cherry
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}')
    expect(onChange).toHaveBeenCalledWith('cherry')
  })

  it('does not move before the first option with ArrowUp', async () => {
    const { user, onChange } = setup()
    await user.click(screen.getByRole('button'))
    // Active at 0 (Apple) → ArrowUp should clamp at 0 → Enter selects Apple
    await user.keyboard('{ArrowUp}{ArrowUp}{Enter}')
    expect(onChange).toHaveBeenCalledWith('apple')
  })
})

describe('aria attributes', () => {
  it('has aria-haspopup="listbox" on the trigger', () => {
    setup()
    expect(screen.getByRole('button')).toHaveAttribute('aria-haspopup', 'listbox')
  })

  it('uses ariaLabel when provided', () => {
    setup({ ariaLabel: 'Pick a fruit' })
    expect(screen.getByRole('button', { name: 'Pick a fruit' })).toBeInTheDocument()
  })
})
