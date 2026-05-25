import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { vi } from 'vitest'
import { Dropdown } from './Dropdown'
import { ThemeProvider } from '../../themes/ThemeProvider'

const defaultItems = (
  <>
    <Dropdown.Item value="opt1">Option 1</Dropdown.Item>
    <Dropdown.Item value="opt2">Option 2</Dropdown.Item>
    <Dropdown.Item value="opt3" disabled>
      Option 3
    </Dropdown.Item>
  </>
)

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>)
}

describe('Dropdown Component', () => {
  it('should render the dropdown with placeholder', () => {
    renderWithTheme(
      <Dropdown placeholder="Select an option">{defaultItems}</Dropdown>
    )
    const trigger = screen.getByRole('combobox')
    expect(trigger).toBeInTheDocument()
    expect(trigger).toHaveTextContent('Select an option')
  })

  it('should render the label if provided', () => {
    renderWithTheme(<Dropdown label="Choose option">{defaultItems}</Dropdown>)
    const label = screen.getByText('Choose option')
    expect(label).toBeInTheDocument()
  })

  it('should display defaultValue initially', () => {
    renderWithTheme(<Dropdown defaultValue="opt2">{defaultItems}</Dropdown>)
    const trigger = screen.getByRole('combobox')
    expect(trigger).toHaveTextContent('Option 2')
  })

  it('should open listbox and show options on trigger click', async () => {
    const user = userEvent.setup()
    renderWithTheme(<Dropdown placeholder="Select">{defaultItems}</Dropdown>)

    const trigger = screen.getByRole('combobox')
    await user.click(trigger)

    const listbox = screen.getByRole('listbox')
    expect(listbox).toBeInTheDocument()

    const opt1 = screen.getByRole('option', { name: 'Option 1' })
    const opt2 = screen.getByRole('option', { name: 'Option 2' })
    expect(opt1).toBeInTheDocument()
    expect(opt2).toBeInTheDocument()
  })

  it('should select an option and close menu when option is clicked', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    renderWithTheme(
      <Dropdown onChange={handleChange} placeholder="Select">
        {defaultItems}
      </Dropdown>
    )

    const trigger = screen.getByRole('combobox')
    await user.click(trigger)

    const opt2 = screen.getByRole('option', { name: 'Option 2' })
    await user.click(opt2)

    expect(handleChange).toHaveBeenCalledWith('opt2')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(trigger).toHaveTextContent('Option 2')
  })

  it('should not allow selecting a disabled option', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    renderWithTheme(
      <Dropdown onChange={handleChange} placeholder="Select">
        {defaultItems}
      </Dropdown>
    )

    const trigger = screen.getByRole('combobox')
    await user.click(trigger)

    const disabledOpt = screen.getByRole('option', { name: 'Option 3' })
    expect(disabledOpt).toHaveAttribute('data-disabled')
    await user.click(disabledOpt)

    expect(handleChange).not.toHaveBeenCalled()
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('should support uncontrolled defaultValue state', async () => {
    const user = userEvent.setup()
    renderWithTheme(<Dropdown defaultValue="opt1">{defaultItems}</Dropdown>)

    const trigger = screen.getByRole('combobox')
    expect(trigger).toHaveTextContent('Option 1')

    await user.click(trigger)
    const opt2 = screen.getByRole('option', { name: 'Option 2' })
    await user.click(opt2)

    expect(trigger).toHaveTextContent('Option 2')
  })

  it('should support controlled state via value', () => {
    const { rerender } = renderWithTheme(
      <Dropdown value="opt1" onChange={vi.fn()}>
        {defaultItems}
      </Dropdown>
    )
    const trigger = screen.getByRole('combobox')
    expect(trigger).toHaveTextContent('Option 1')

    rerender(
      <ThemeProvider>
        <Dropdown value="opt2" onChange={vi.fn()}>
          {defaultItems}
        </Dropdown>
      </ThemeProvider>
    )
    expect(trigger).toHaveTextContent('Option 2')
  })

  it('should not open and should be disabled when disabled prop is true', async () => {
    const user = userEvent.setup()
    renderWithTheme(<Dropdown disabled>{defaultItems}</Dropdown>)

    const trigger = screen.getByRole('combobox')
    expect(trigger).toBeDisabled()

    await user.click(trigger)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('should show error message and apply aria-invalid', () => {
    renderWithTheme(
      <Dropdown error="This is required">{defaultItems}</Dropdown>
    )
    const trigger = screen.getByRole('combobox')
    expect(trigger).toHaveAttribute('aria-invalid', 'true')

    const errorText = screen.getByRole('alert')
    expect(errorText).toBeInTheDocument()
    expect(errorText).toHaveTextContent('This is required')
  })

  it('should display helper text when no error is present', () => {
    renderWithTheme(
      <Dropdown helperText="Choose wisely">{defaultItems}</Dropdown>
    )
    const helperText = screen.getByText('Choose wisely')
    expect(helperText).toBeInTheDocument()

    const trigger = screen.getByRole('combobox')
    expect(trigger).toHaveAttribute('aria-describedby')
  })

  it('should forward ref to trigger element', () => {
    const ref = React.createRef<HTMLButtonElement>()
    renderWithTheme(<Dropdown ref={ref}>{defaultItems}</Dropdown>)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    expect(ref.current?.tagName).toBe('BUTTON')
  })

  it('should navigate and select via keyboard (WAI-ARIA compliance)', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    renderWithTheme(<Dropdown onChange={handleChange}>{defaultItems}</Dropdown>)

    const trigger = screen.getByRole('combobox')
    trigger.focus()
    expect(trigger).toHaveFocus()

    // Open via space bar
    await user.keyboard(' ')
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    // Navigate and select
    await user.keyboard('{ArrowDown}')
    await user.keyboard('{Enter}')

    expect(handleChange).toHaveBeenCalledWith('opt2')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('should close on Escape keypress', async () => {
    const user = userEvent.setup()
    renderWithTheme(<Dropdown>{defaultItems}</Dropdown>)

    const trigger = screen.getByRole('combobox')
    await user.click(trigger)
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('should pass accessibility compliance checks', async () => {
    const { container } = renderWithTheme(
      <Dropdown label="Select dynamic">{defaultItems}</Dropdown>
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
