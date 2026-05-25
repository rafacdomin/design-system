import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { Tag } from './Tag'
import { ThemeProvider } from '../../themes/ThemeProvider'
import styles from './Tag.module.scss'

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>)
}

describe('Tag Component', () => {
  it('should render static tag with text', () => {
    renderWithTheme(<Tag>React</Tag>)
    expect(screen.getByText('React')).toBeInTheDocument()
  })

  it('should support variants (neutral, outline, interactive)', () => {
    const { container: neutral } = renderWithTheme(
      <Tag variant="neutral">React</Tag>
    )
    const { container: outline } = renderWithTheme(
      <Tag variant="outline">React</Tag>
    )
    const { container: interactive } = renderWithTheme(
      <Tag variant="interactive">React</Tag>
    )

    const neutralEl = neutral.querySelector('[data-testid="tag"]')
    const outlineEl = outline.querySelector('[data-testid="tag"]')
    const interactiveEl = interactive.querySelector('[data-testid="tag"]')

    expect(neutralEl).toHaveClass(styles.neutral)
    expect(outlineEl).toHaveClass(styles.outline)
    expect(interactiveEl).toHaveClass(styles.interactive)
  })

  it('should support sizes (sm, md)', () => {
    const { container: sm } = renderWithTheme(<Tag size="sm">React</Tag>)
    const { container: md } = renderWithTheme(<Tag size="md">React</Tag>)

    const smEl = sm.querySelector('[data-testid="tag"]')
    const mdEl = md.querySelector('[data-testid="tag"]')

    expect(smEl).toHaveClass(styles.sm)
    expect(mdEl).toHaveClass(styles.md)
  })

  it('should support color variants (neutral, primary, secondary, danger)', () => {
    const { container: neutral } = renderWithTheme(
      <Tag color="neutral">React</Tag>
    )
    const { container: primary } = renderWithTheme(
      <Tag color="primary">React</Tag>
    )
    const { container: secondary } = renderWithTheme(
      <Tag color="secondary">React</Tag>
    )
    const { container: danger } = renderWithTheme(
      <Tag color="danger">React</Tag>
    )

    const neutralEl = neutral.querySelector('[data-testid="tag"]')
    const primaryEl = primary.querySelector('[data-testid="tag"]')
    const secondaryEl = secondary.querySelector('[data-testid="tag"]')
    const dangerEl = danger.querySelector('[data-testid="tag"]')

    expect(neutralEl).toHaveClass(styles.neutralColor)
    expect(primaryEl).toHaveClass(styles.primaryColor)
    expect(secondaryEl).toHaveClass(styles.secondaryColor)
    expect(dangerEl).toHaveClass(styles.dangerColor)
  })

  it('should propagate color classes to tag group and buttons when interactive and removable', () => {
    const { container } = renderWithTheme(
      <Tag variant="interactive" color="primary" onRemove={() => {}}>
        React
      </Tag>
    )

    const group = container.querySelector('[data-testid="tag-group"]')
    const mainBtn = container.querySelector('[data-testid="tag"]')

    expect(group).toHaveClass(styles.primaryColor)
    expect(mainBtn).toHaveClass(styles.primaryColor)
  })

  it('should render remove button when onRemove is provided', () => {
    const handleRemove = vi.fn()
    renderWithTheme(<Tag onRemove={handleRemove}>React</Tag>)

    const removeBtn = screen.getByRole('button', { name: /remover react/i })
    expect(removeBtn).toBeInTheDocument()
  })

  it('should support custom removeAriaLabel', () => {
    const handleRemove = vi.fn()
    renderWithTheme(
      <Tag onRemove={handleRemove} removeAriaLabel="Remove Tag">
        React
      </Tag>
    )

    const removeBtn = screen.getByRole('button', { name: /remove tag/i })
    expect(removeBtn).toBeInTheDocument()
  })

  it('should trigger onRemove callback on click', async () => {
    const user = userEvent.setup()
    const handleRemove = vi.fn()
    renderWithTheme(<Tag onRemove={handleRemove}>React</Tag>)

    const removeBtn = screen.getByRole('button', { name: /remover react/i })
    await user.click(removeBtn)

    expect(handleRemove).toHaveBeenCalledTimes(1)
  })

  it('should trigger onClick callback when variant is interactive', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    renderWithTheme(
      <Tag variant="interactive" onClick={handleClick}>
        React
      </Tag>
    )

    const tag = screen.getByRole('button', { name: /react/i })
    await user.click(tag)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should handle keyboard navigation for interactive and removable tag', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    const handleRemove = vi.fn()

    renderWithTheme(
      <Tag variant="interactive" onClick={handleClick} onRemove={handleRemove}>
        React
      </Tag>
    )

    // Interactive & Removable tag renders two buttons inside a span wrapper.
    const mainBtn = screen.getByRole('button', { name: 'React' })
    const removeBtn = screen.getByRole('button', { name: /remover react/i })

    // Tab to the main button
    await user.tab()
    expect(mainBtn).toHaveFocus()

    // Press Enter to click the main button
    await user.keyboard('{Enter}')
    expect(handleClick).toHaveBeenCalledTimes(1)

    // Press Space to click the main button
    await user.keyboard(' ')
    expect(handleClick).toHaveBeenCalledTimes(2)

    // Tab to the remove button
    await user.tab()
    expect(removeBtn).toHaveFocus()

    // Press Enter to click the remove button
    await user.keyboard('{Enter}')
    expect(handleRemove).toHaveBeenCalledTimes(1)
  })

  it('should forward ref correctly to HTMLSpanElement', () => {
    const ref = React.createRef<HTMLSpanElement>()
    renderWithTheme(<Tag ref={ref}>React</Tag>)
    expect(ref.current).toBeInstanceOf(HTMLSpanElement)
  })

  it('should forward ref correctly to HTMLButtonElement when interactive only', () => {
    const ref = React.createRef<HTMLButtonElement>()
    renderWithTheme(
      <Tag
        ref={ref as unknown as React.RefObject<HTMLSpanElement>}
        variant="interactive"
      >
        React
      </Tag>
    )
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it('should pass accessibility validation (axe)', async () => {
    const { container } = renderWithTheme(
      <Tag onRemove={() => {}}>A11y Tag</Tag>
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
