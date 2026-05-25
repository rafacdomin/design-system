import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { vi } from 'vitest'
import { Modal } from './Modal'
import { ThemeProvider } from '../../themes/ThemeProvider'

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>)
}

describe('Modal Component', () => {
  it('should not render anything in DOM initially when closed', () => {
    renderWithTheme(
      <Modal
        title="Teste Modal"
        trigger={<button data-testid="trigger">Open</button>}
      >
        <div>Conteúdo do Modal</div>
      </Modal>
    )
    expect(screen.queryByText('Teste Modal')).not.toBeInTheDocument()
    expect(screen.queryByText('Conteúdo do Modal')).not.toBeInTheDocument()
  })

  it('should render content on trigger click', async () => {
    const user = userEvent.setup()
    renderWithTheme(
      <Modal
        title="Teste Modal"
        trigger={<button data-testid="trigger">Open</button>}
      >
        <div>Conteúdo do Modal</div>
      </Modal>
    )

    await user.click(screen.getByTestId('trigger'))

    expect(screen.getByText('Teste Modal')).toBeInTheDocument()
    expect(screen.getByText('Conteúdo do Modal')).toBeInTheDocument()
  })

  it('should close when clicking the close button', async () => {
    const user = userEvent.setup()
    renderWithTheme(
      <Modal
        title="Teste Modal"
        trigger={<button data-testid="trigger">Open</button>}
      >
        <div>Conteúdo do Modal</div>
      </Modal>
    )

    await user.click(screen.getByTestId('trigger'))
    expect(screen.getByText('Teste Modal')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /fechar/i }))
    expect(screen.queryByText('Teste Modal')).not.toBeInTheDocument()
  })

  it('should close when pressing Escape key', async () => {
    const user = userEvent.setup()
    renderWithTheme(
      <Modal
        title="Teste Modal"
        trigger={<button data-testid="trigger">Open</button>}
      >
        <div>Conteúdo do Modal</div>
      </Modal>
    )

    await user.click(screen.getByTestId('trigger'))
    expect(screen.getByText('Teste Modal')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByText('Teste Modal')).not.toBeInTheDocument()
  })

  it('should restore focus to the trigger after closing', async () => {
    const user = userEvent.setup()
    renderWithTheme(
      <Modal
        title="Teste Modal"
        trigger={<button data-testid="trigger">Open</button>}
      >
        <div>Conteúdo do Modal</div>
      </Modal>
    )

    const trigger = screen.getByTestId('trigger')
    await user.click(trigger)

    // Focus should enter the modal
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /fechar/i }))

    expect(trigger).toHaveFocus()
  })

  it('should support controlled mode via open prop', () => {
    const handleOpenChange = vi.fn()
    const { rerender } = renderWithTheme(
      <Modal
        open={false}
        onOpenChange={handleOpenChange}
        title="Modal Controlled"
      >
        <div>Conteúdo</div>
      </Modal>
    )
    expect(screen.queryByText('Modal Controlled')).not.toBeInTheDocument()

    rerender(
      <ThemeProvider>
        <Modal
          open={true}
          onOpenChange={handleOpenChange}
          title="Modal Controlled"
        >
          <div>Conteúdo</div>
        </Modal>
      </ThemeProvider>
    )
    expect(screen.getByText('Modal Controlled')).toBeInTheDocument()
  })

  it('should support compound component pattern', async () => {
    const user = userEvent.setup()
    renderWithTheme(
      <Modal>
        <Modal.Trigger asChild>
          <button data-testid="trigger-cp">Open CP</button>
        </Modal.Trigger>
        <Modal.Content
          title="Modal Compound"
          description="Descrição do Compound"
        >
          <div>Corpo do Compound</div>
        </Modal.Content>
      </Modal>
    )

    expect(screen.queryByText('Modal Compound')).not.toBeInTheDocument()
    await user.click(screen.getByTestId('trigger-cp'))
    expect(screen.getByText('Modal Compound')).toBeInTheDocument()
    expect(screen.getByText('Descrição do Compound')).toBeInTheDocument()
    expect(screen.getByText('Corpo do Compound')).toBeInTheDocument()
  })

  it('should pass accessibility compliance checks', async () => {
    const { container } = renderWithTheme(
      <Modal open={true} title="A11y Modal">
        <div>Acessibilidade é prioridade</div>
      </Modal>
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
