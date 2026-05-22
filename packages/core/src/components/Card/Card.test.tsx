import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { Card } from './Card'
import { ThemeProvider } from '../../themes/ThemeProvider'

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>)
}

describe('Card Component', () => {
  describe('Rendering', () => {
    it('should render children correctly', () => {
      renderWithTheme(<Card>Card Content</Card>)
      expect(screen.getByText('Card Content')).toBeInTheDocument()
    })

    it('should apply the correct classes for variants', () => {
      const getCardElement = (container: HTMLElement) => {
        return container.firstChild?.firstChild as HTMLElement
      }

      const hasClassContaining = (
        element: HTMLElement | null,
        substring: string
      ) => {
        if (!element) return false
        return Array.from(element.classList).some((cls) =>
          cls.includes(substring)
        )
      }

      const { container: containerFlat } = renderWithTheme(
        <Card variant="flat">Flat Card</Card>
      )
      const cardFlat = getCardElement(containerFlat)
      expect(hasClassContaining(cardFlat, 'card')).toBe(true)
      expect(hasClassContaining(cardFlat, 'flat')).toBe(true)

      const { container: containerBordered } = renderWithTheme(
        <Card variant="bordered">Bordered Card</Card>
      )
      const cardBordered = getCardElement(containerBordered)
      expect(hasClassContaining(cardBordered, 'card')).toBe(true)
      expect(hasClassContaining(cardBordered, 'bordered')).toBe(true)

      const { container: containerElevated } = renderWithTheme(
        <Card variant="elevated">Elevated Card</Card>
      )
      const cardElevated = getCardElement(containerElevated)
      expect(hasClassContaining(cardElevated, 'card')).toBe(true)
      expect(hasClassContaining(cardElevated, 'elevated')).toBe(true)
    })
  })

  describe('Interactivity & Accessibility', () => {
    it('should render with role="button" and tabIndex={0} when interactive is true and not asChild', () => {
      renderWithTheme(<Card interactive>Interactive Card</Card>)
      const card = screen.getByRole('button', { name: /interactive card/i })
      expect(card).toBeInTheDocument()
      expect(card).toHaveAttribute('tabindex', '0')
    })

    it('should not render with role="button" or tabIndex when interactive is false', () => {
      renderWithTheme(<Card>Non-interactive Card</Card>)
      const card = screen.getByText('Non-interactive Card')
      expect(card).not.toHaveAttribute('role')
      expect(card).not.toHaveAttribute('tabindex')
    })

    it('should support polymorphism via asChild pattern', () => {
      renderWithTheme(
        <Card asChild interactive>
          <a href="https://example.com">Link Card</a>
        </Card>
      )
      const link = screen.getByRole('link', { name: /link card/i })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', 'https://example.com')
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
      expect(link).not.toHaveAttribute('role', 'button')
      expect(link).not.toHaveAttribute('tabindex')
    })

    it('should trigger onClick when clicked', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()
      renderWithTheme(
        <Card interactive onClick={handleClick}>
          Clickable
        </Card>
      )
      const card = screen.getByRole('button')
      await user.click(card)
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should trigger onClick on keyboard Enter keydown when interactive', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()
      renderWithTheme(
        <Card interactive onClick={handleClick}>
          Press Enter
        </Card>
      )
      const card = screen.getByRole('button')
      card.focus()
      await user.keyboard('{Enter}')
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should trigger onClick on keyboard Space keydown when interactive', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()
      renderWithTheme(
        <Card interactive onClick={handleClick}>
          Press Space
        </Card>
      )
      const card = screen.getByRole('button')
      card.focus()
      await user.keyboard(' ')
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('Ref Forwarding', () => {
    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      renderWithTheme(<Card ref={ref}>Ref Card</Card>)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })

  describe('A11y Compliance', () => {
    it('should pass accessibility standards without violations', async () => {
      const { container } = renderWithTheme(<Card>A11y Card</Card>)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
