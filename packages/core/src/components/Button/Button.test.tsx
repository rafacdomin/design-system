import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { Button } from './Button'
import { ThemeProvider } from '../../themes/ThemeProvider'

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>)
}

describe('Button Component', () => {
  it('should render the button with text content', () => {
    renderWithTheme(<Button>Click me</Button>)
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Click me')
  })

  it('should trigger onClick callback when clicked', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    renderWithTheme(<Button onClick={handleClick}>Click me</Button>)

    const button = screen.getByRole('button', { name: /click me/i })
    await user.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should not trigger onClick when disabled', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    renderWithTheme(
      <Button onClick={handleClick} disabled>
        Click me
      </Button>
    )

    const button = screen.getByRole('button', { name: /click me/i })
    await user.click(button)

    expect(handleClick).not.toHaveBeenCalled()
    expect(button).toBeDisabled()
  })

  it('should not trigger onClick and should display a spinner when loading', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    const { container } = renderWithTheme(
      <Button onClick={handleClick} loading>
        Click me
      </Button>
    )

    const button = screen.getByRole('button', { name: /click me/i })
    await user.click(button)

    expect(handleClick).not.toHaveBeenCalled()
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-disabled', 'true')

    // Spinner element should be rendered
    const spinner = container.querySelector('.spinner')
    expect(spinner).toBeInTheDocument()
  })

  it('should forward DOM ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>()
    renderWithTheme(<Button ref={ref}>Click me</Button>)

    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    expect(ref.current?.textContent).toBe('Click me')
  })

  it('should support polymorphism via asChild pattern', () => {
    renderWithTheme(
      <Button asChild>
        <a href="https://google.com">Google Link</a>
      </Button>
    )

    // Should not render as a button
    const button = screen.queryByRole('button')
    expect(button).not.toBeInTheDocument()

    // Should render as an anchor link
    const link = screen.getByRole('link', { name: /google link/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', 'https://google.com')
  })

  it('should pass accessibility standards without violations', async () => {
    const { container } = renderWithTheme(<Button>A11y Button</Button>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
