import React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { clsx } from 'clsx'
import { withTheme } from '../../themes/withTheme'
import { useTheme } from '../../themes/useTheme'
import styles from './Modal.module.scss'

export interface ModalProps {
  /** Controle manual de abertura (modo controlado) */
  open?: boolean
  /** Estado padrão de abertura (modo não controlado) */
  defaultOpen?: boolean
  /** Callback invocado na alteração do estado de abertura */
  onOpenChange?: (open: boolean) => void
  /** Título textual do modal (obrigatório para fins de semântica e acessibilidade) */
  title?: string
  /** Descrição auxiliar do modal */
  description?: string
  /** Elemento clicável que dispara a abertura do modal */
  trigger?: React.ReactNode
  /** Tamanho da largura do modal */
  size?: 'sm' | 'md' | 'lg'
  /** Conteúdo interno da janela do modal */
  children: React.ReactNode
}

export interface ModalTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  asChild?: boolean
}

export interface ModalCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  asChild?: boolean
}

export interface ModalContentProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

// Subcomponents for Compound Pattern
const ModalTriggerComponent = React.forwardRef<
  HTMLButtonElement,
  ModalTriggerProps
>(({ children, asChild = true, ...props }, ref) => {
  return (
    <Dialog.Trigger ref={ref} asChild={asChild} {...props}>
      {children}
    </Dialog.Trigger>
  )
})
ModalTriggerComponent.displayName = 'Modal.Trigger'

const ModalCloseComponent = React.forwardRef<
  HTMLButtonElement,
  ModalCloseProps
>(({ children, asChild = true, ...props }, ref) => {
  return (
    <Dialog.Close ref={ref} asChild={asChild} {...props}>
      {children}
    </Dialog.Close>
  )
})
ModalCloseComponent.displayName = 'Modal.Close'

const ModalContentComponent = React.forwardRef<
  HTMLDivElement,
  ModalContentProps
>(({ title, description, size = 'md', children, className, ...props }, ref) => {
  const { theme } = useTheme()
  return (
    <Dialog.Portal>
      <Dialog.Overlay className={styles.overlay} data-theme={theme} />
      <Dialog.Content
        ref={ref}
        className={clsx(styles.content, styles[size], className)}
        data-theme={theme}
        aria-describedby={description ? undefined : undefined}
        {...props}
      >
        <div className={styles.header}>
          <Dialog.Title className={styles.title}>{title}</Dialog.Title>
          {description && (
            <Dialog.Description className={styles.description}>
              {description}
            </Dialog.Description>
          )}
          <Dialog.Close className={styles.closeButton} aria-label="Fechar">
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M2.5 2.5L9.5 9.5M9.5 2.5L2.5 9.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Dialog.Close>
        </div>
        <div className={styles.body}>{children}</div>
      </Dialog.Content>
    </Dialog.Portal>
  )
})
ModalContentComponent.displayName = 'Modal.Content'

// Main Component
const ModalComponent = React.forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      open,
      defaultOpen,
      onOpenChange,
      title,
      description,
      trigger,
      size = 'md',
      children,
    },
    ref
  ) => {
    const { theme } = useTheme()
    const isUnified = !!(title || trigger)

    if (isUnified) {
      return (
        <Dialog.Root
          open={open}
          defaultOpen={defaultOpen}
          onOpenChange={onOpenChange}
        >
          {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
          <Dialog.Portal>
            <Dialog.Overlay className={styles.overlay} data-theme={theme} />
            <Dialog.Content
              ref={ref}
              className={clsx(styles.content, styles[size])}
              data-theme={theme}
              aria-describedby={description ? undefined : undefined}
            >
              <div className={styles.header}>
                <Dialog.Title className={styles.title}>{title}</Dialog.Title>
                {description && (
                  <Dialog.Description className={styles.description}>
                    {description}
                  </Dialog.Description>
                )}
                <Dialog.Close
                  className={styles.closeButton}
                  aria-label="Fechar"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M2.5 2.5L9.5 9.5M9.5 2.5L2.5 9.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Dialog.Close>
              </div>
              <div className={styles.body}>{children}</div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      )
    }

    return (
      <Dialog.Root
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
      >
        {children}
      </Dialog.Root>
    )
  }
)
ModalComponent.displayName = 'Modal'

const ThemedModal = withTheme<HTMLDivElement, ModalProps>(ModalComponent)

export const Modal = Object.assign(ThemedModal, {
  Trigger: ModalTriggerComponent,
  Close: ModalCloseComponent,
  Content: ModalContentComponent,
})
