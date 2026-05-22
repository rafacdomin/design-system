import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Avatar } from './Avatar'
import { ThemeProvider } from '../../themes/ThemeProvider'
import styles from './Avatar.module.scss'

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>)
}

describe('Avatar Component', () => {
  it('should render the fallback when src is not provided', () => {
    renderWithTheme(<Avatar alt="User Name" fallback="UN" />)

    // Fallback initials should be in document
    expect(screen.getByText('UN')).toBeInTheDocument()

    // Container should act as image for screen readers
    const container = screen.getByRole('img', { name: /user name/i })
    expect(container).toBeInTheDocument()
  })

  it('should render image when src loads successfully', () => {
    renderWithTheme(<Avatar src="avatar.png" alt="User Name" fallback="UN" />)

    const img = screen.getByAltText('User Name')
    expect(img).toBeInTheDocument()
    expect(img).toHaveClass(styles.hidden) // initially hidden

    // Trigger successful load
    fireEvent.load(img)

    expect(img).toHaveClass(styles.loaded)
    expect(screen.queryByText('UN')).not.toBeInTheDocument()
  })

  it('should render fallback when image fails to load', () => {
    renderWithTheme(<Avatar src="broken.png" alt="User Name" fallback="UN" />)

    const img = screen.getByAltText('User Name')

    // Trigger load error
    fireEvent.error(img)

    expect(screen.getByText('UN')).toBeInTheDocument()
    const container = screen.getByRole('img', { name: /user name/i })
    expect(container).toBeInTheDocument()
  })

  it('should compute initials from name dynamically', () => {
    // Single name
    const { rerender } = renderWithTheme(<Avatar name="Jane" />)
    expect(screen.getByText('J')).toBeInTheDocument()

    // Compound name (2 words)
    rerender(
      <ThemeProvider>
        <Avatar name="John Doe" />
      </ThemeProvider>
    )
    expect(screen.getByText('JD')).toBeInTheDocument()

    // Multiple names (3+ words, should pick first and last initials)
    rerender(
      <ThemeProvider>
        <Avatar name="John Fitzgerald Kennedy" />
      </ThemeProvider>
    )
    expect(screen.getByText('JK')).toBeInTheDocument()

    // Handle extra spacing
    rerender(
      <ThemeProvider>
        <Avatar name="   John   Doe   " />
      </ThemeProvider>
    )
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('should default alt and aria-label to name when alt is omitted', () => {
    renderWithTheme(<Avatar name="John Doe" />)

    // aria-label on wrapper container should default to name
    const wrapper = screen.getByRole('img', { name: /john doe/i })
    expect(wrapper).toBeInTheDocument()

    // image alt should default to name
    renderWithTheme(<Avatar src="avatar.png" name="John Doe" />)
    const img = screen.getByAltText('John Doe')
    expect(img).toBeInTheDocument()
  })

  it('should use explicit fallback to override computed initials', () => {
    renderWithTheme(<Avatar name="John Doe" fallback="JDoe" />)
    expect(screen.getByText('JDoe')).toBeInTheDocument()
  })

  it('should use explicit alt to override name for image description', () => {
    renderWithTheme(<Avatar name="John Doe" alt="Profile Picture" />)
    const wrapper = screen.getByRole('img', { name: /profile picture/i })
    expect(wrapper).toBeInTheDocument()
  })

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>()
    renderWithTheme(<Avatar ref={ref} alt="User" fallback="U" />)

    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('should pass accessibility tests in all states', async () => {
    // State 1: Fallback state
    const { container: containerFallback } = renderWithTheme(
      <Avatar alt="User" fallback="U" />
    )
    let results = await axe(containerFallback)
    expect(results).toHaveNoViolations()

    // State 2: Loaded state
    const { container: containerLoaded } = renderWithTheme(
      <Avatar src="avatar.png" alt="User" fallback="U" />
    )
    const img = screen.getByAltText('User')
    fireEvent.load(img)
    results = await axe(containerLoaded)
    expect(results).toHaveNoViolations()
  })
})
