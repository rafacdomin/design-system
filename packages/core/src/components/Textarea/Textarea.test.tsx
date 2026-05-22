import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { Textarea } from './Textarea'
import { ThemeProvider } from '../../themes/ThemeProvider'

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>)
}

describe('Textarea Component', () => {
  it('should render the textarea and its label correctly', () => {
    renderWithTheme(<Textarea label="Comments" placeholder="Enter comments" />)
    const label = screen.getByText('Comments')
    const textarea = screen.getByPlaceholderText('Enter comments')
    expect(label).toBeInTheDocument()
    expect(textarea).toBeInTheDocument()
    expect(textarea).toHaveAttribute('id')
    expect(label).toHaveAttribute('for', textarea.getAttribute('id'))
  })

  it('should update the value when typing', async () => {
    const user = userEvent.setup()
    renderWithTheme(<Textarea label="Feedback" />)
    const textarea = screen.getByRole('textbox', { name: /feedback/i })
    await user.type(textarea, 'Hello World')
    expect(textarea).toHaveValue('Hello World')
  })

  it('should support helperText', () => {
    renderWithTheme(
      <Textarea label="Bio" helperText="Tell us about yourself" />
    )
    const helper = screen.getByText('Tell us about yourself')
    expect(helper).toBeInTheDocument()
    const textarea = screen.getByRole('textbox', { name: /bio/i })
    expect(textarea).toHaveAttribute(
      'aria-describedby',
      helper.getAttribute('id')
    )
  })

  it('should support error state and set proper accessibility tags', () => {
    renderWithTheme(
      <Textarea label="Description" error="This field is required" />
    )
    const errorText = screen.getByText('This field is required')
    expect(errorText).toBeInTheDocument()
    const textarea = screen.getByRole('textbox', { name: /description/i })
    expect(textarea).toHaveAttribute('aria-invalid', 'true')
    expect(textarea).toHaveAttribute(
      'aria-describedby',
      errorText.getAttribute('id')
    )
  })

  it('should merge and forward ref correctly', () => {
    const ref = React.createRef<HTMLTextAreaElement>()
    renderWithTheme(<Textarea ref={ref} label="Comments" />)
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement)
  })

  it('should change height if autoResize is true and content wraps', () => {
    renderWithTheme(
      <Textarea label="Auto" autoResize defaultValue="Initial text" />
    )
    const textarea = screen.getByRole('textbox', {
      name: /auto/i,
    }) as HTMLTextAreaElement

    Object.defineProperty(textarea, 'scrollHeight', {
      configurable: true,
      value: 150,
    })

    fireEvent.input(textarea, { target: { value: 'New longer text' } })
    expect(textarea.style.height).toBe('150px')
  })

  it('should have no accessibility violations', async () => {
    const { container } = renderWithTheme(<Textarea label="Accessibility" />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
