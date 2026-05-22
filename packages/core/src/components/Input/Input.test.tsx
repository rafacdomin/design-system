import React from 'react'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { Input } from './Input'
import { ThemeProvider } from '../../themes/ThemeProvider'

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>)
}

describe('Input Component', () => {
  it('should render the input element correctly', () => {
    renderWithTheme(<Input placeholder="Enter text" />)
    const input = screen.getByPlaceholderText('Enter text')
    expect(input).toBeInTheDocument()
    expect(input.tagName).toBe('INPUT')
  })

  it('should update value correctly when typing', async () => {
    const user = userEvent.setup()
    renderWithTheme(<Input placeholder="Enter text" />)
    const input = screen.getByPlaceholderText('Enter text')

    await user.type(input, 'Hello World')
    expect(input).toHaveValue('Hello World')
  })

  it('should associate label with input using htmlFor/id', () => {
    renderWithTheme(<Input label="Username" id="user-input" />)
    const label = screen.getByText('Username')
    const input = screen.getByLabelText('Username')

    expect(label).toHaveAttribute('for', 'user-input')
    expect(input).toHaveAttribute('id', 'user-input')
  })

  it('should display helper text and link it using aria-describedby', () => {
    renderWithTheme(
      <Input label="Password" helperText="Must be 8 characters" id="pw" />
    )
    const helper = screen.getByText('Must be 8 characters')
    const input = screen.getByLabelText('Password')

    expect(helper).toBeInTheDocument()
    expect(input).toHaveAttribute('aria-describedby', 'pw-helper')
  })

  it('should display error message instead of helper text and apply aria-invalid', () => {
    renderWithTheme(
      <Input
        label="Email"
        helperText="Enter a valid email"
        error="Email is required"
        id="email"
      />
    )
    const error = screen.getByText('Email is required')
    const helper = screen.queryByText('Enter a valid email')
    const input = screen.getByLabelText('Email')

    expect(error).toBeInTheDocument()
    expect(helper).not.toBeInTheDocument()
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute('aria-describedby', 'email-error')
  })

  it('should prevent interaction and apply disabled attribute when disabled', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    renderWithTheme(
      <Input placeholder="Type here" disabled onChange={handleChange} />
    )

    const input = screen.getByPlaceholderText('Type here')
    expect(input).toBeDisabled()

    await user.type(input, 'Hello')
    expect(input).not.toHaveValue('Hello')
    expect(handleChange).not.toHaveBeenCalled()
  })

  it('should render start and end icons correctly', () => {
    renderWithTheme(
      <Input placeholder="Search">
        <Input.StartIcon>
          <span data-testid="search-icon">🔍</span>
        </Input.StartIcon>
        <Input.EndIcon>
          <span data-testid="clear-icon">❌</span>
        </Input.EndIcon>
      </Input>
    )
    expect(screen.getByTestId('search-icon')).toBeInTheDocument()
    expect(screen.getByTestId('clear-icon')).toBeInTheDocument()
  })

  it('should forward ref to the native input element', () => {
    const ref = React.createRef<HTMLInputElement>()
    renderWithTheme(<Input ref={ref} placeholder="Ref test" />)

    expect(ref.current).toBeInstanceOf(HTMLInputElement)
    act(() => {
      ref.current?.focus()
    })
    expect(document.activeElement).toBe(ref.current)
  })

  it('should not display placeholder when blurred in floating mode but display when focused', async () => {
    const user = userEvent.setup()
    renderWithTheme(
      <Input
        label="Test Label"
        placeholder="My Placeholder"
        labelMode="floating"
      />
    )

    // The actual placeholder text should not be visible to queries (it is rendered as ' ')
    expect(
      screen.queryByPlaceholderText('My Placeholder')
    ).not.toBeInTheDocument()

    const input = screen.getByRole('textbox')
    await user.click(input)

    // The placeholder text should be visible now that it is focused
    expect(screen.getByPlaceholderText('My Placeholder')).toBeInTheDocument()

    // Blur it
    act(() => {
      input.blur()
    })
    expect(
      screen.queryByPlaceholderText('My Placeholder')
    ).not.toBeInTheDocument()
  })

  it('should pass accessibility validation (axe)', async () => {
    const { container } = renderWithTheme(
      <Input label="Full Name" placeholder="John Doe" />
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
