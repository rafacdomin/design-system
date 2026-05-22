import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { ThemeProvider } from './ThemeProvider'
import { useTheme } from './useTheme'
import { withTheme } from './withTheme'

// Auxiliary component for testing useTheme
const ThemeConsumer = () => {
  const { theme, setTheme } = useTheme()
  return (
    <div>
      <span data-testid="theme-val">{theme}</span>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>
    </div>
  )
}

// Auxiliary component for testing withTheme HOC
interface DummyProps {
  'data-theme'?: string
  className?: string
}
const DummyComponent: React.FC<DummyProps> = (props) => (
  <div
    data-testid="dummy"
    data-theme={props['data-theme']}
    className={props.className}
  >
    Dummy Content
  </div>
)
const DummyWithTheme = withTheme(DummyComponent)

describe('Theme System', () => {
  describe('ThemeProvider & useTheme', () => {
    it('should render children and apply default theme "light"', () => {
      const { container } = render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      )

      // The wrapper div should have data-theme="light"
      const wrapperDiv = container.firstChild as HTMLElement
      expect(wrapperDiv).toHaveAttribute('data-theme', 'light')

      // The text indicating the active theme should be "light"
      expect(screen.getByTestId('theme-val')).toHaveTextContent('light')
    })

    it('should allow custom default theme "dark"', () => {
      const { container } = render(
        <ThemeProvider defaultTheme="dark">
          <ThemeConsumer />
        </ThemeProvider>
      )

      const wrapperDiv = container.firstChild as HTMLElement
      expect(wrapperDiv).toHaveAttribute('data-theme', 'dark')
      expect(screen.getByTestId('theme-val')).toHaveTextContent('dark')
    })

    it('should update the theme in context and change DOM attribute when setTheme is invoked', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      )

      const wrapperDiv = container.firstChild as HTMLElement
      const toggleButton = screen.getByRole('button', { name: /toggle theme/i })

      // Starts in light theme
      expect(wrapperDiv).toHaveAttribute('data-theme', 'light')

      // Toggle to dark theme
      await user.click(toggleButton)

      expect(wrapperDiv).toHaveAttribute('data-theme', 'dark')
      expect(screen.getByTestId('theme-val')).toHaveTextContent('dark')

      // Toggle back to light theme
      await user.click(toggleButton)

      expect(wrapperDiv).toHaveAttribute('data-theme', 'light')
      expect(screen.getByTestId('theme-val')).toHaveTextContent('light')
    })

    it('should throw an error when useTheme is consumed outside of ThemeProvider', () => {
      // Suppress React error logger in the console for this expected throwing test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => render(<ThemeConsumer />)).toThrow(
        'useTheme must be used within a ThemeProvider'
      )

      consoleSpy.mockRestore()
    })
  })

  describe('withTheme HOC', () => {
    it('should inject data-theme attribute into wrapped components', () => {
      render(
        <ThemeProvider defaultTheme="dark">
          <DummyWithTheme />
        </ThemeProvider>
      )

      const dummy = screen.getByTestId('dummy')
      expect(dummy).toHaveAttribute('data-theme', 'dark')
    })

    it('should forward other props to the wrapped component', () => {
      render(
        <ThemeProvider>
          <DummyWithTheme className="my-custom-class" />
        </ThemeProvider>
      )

      const dummy = screen.getByTestId('dummy')
      expect(dummy).toHaveClass('my-custom-class')
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
