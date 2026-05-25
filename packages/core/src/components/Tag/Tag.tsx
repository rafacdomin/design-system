import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { clsx } from 'clsx'
import { withTheme } from '../../themes/withTheme'
import styles from './Tag.module.scss'

export const tagVariants = cva(styles.tag, {
  variants: {
    variant: {
      neutral: styles.neutral,
      outline: styles.outline,
      interactive: styles.interactive,
    },
    size: {
      sm: styles.sm,
      md: styles.md,
    },
    color: {
      neutral: styles.neutralColor,
      primary: styles.primaryColor,
      secondary: styles.secondaryColor,
      danger: styles.dangerColor,
    },
  },
  defaultVariants: {
    variant: 'neutral',
    size: 'md',
    color: 'neutral',
  },
})

export interface TagProps
  extends
    Omit<React.HTMLAttributes<HTMLSpanElement>, 'onClick' | 'color'>,
    VariantProps<typeof tagVariants> {
  /** Callback acionado ao clicar no botão de remoção */
  onRemove?: () => void
  /** Callback acionado ao clicar na tag interativa */
  onClick?: (
    event: React.MouseEvent<HTMLButtonElement | HTMLSpanElement>
  ) => void
  /** Rótulo de acessibilidade para o botão de remoção */
  removeAriaLabel?: string
}

const TagComponent = React.forwardRef<HTMLSpanElement, TagProps>(
  (
    {
      className,
      variant = 'neutral',
      size = 'md',
      color = 'neutral',
      onRemove,
      onClick,
      children,
      removeAriaLabel,
      ...props
    },
    ref
  ) => {
    const isInteractive = variant === 'interactive'
    const hasRemove = !!onRemove

    const removeLabel =
      removeAriaLabel ||
      (typeof children === 'string' ? `Remover ${children}` : 'Remover')

    const CloseIcon = (
      <svg
        width="10"
        height="10"
        viewBox="0 0 10 10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M1 1L9 9M9 1L1 9"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )

    // Caso 1: Interativo E Removível (evita botões aninhados)
    if (isInteractive && hasRemove) {
      const colorClass = color ? styles[`${color}Color`] : undefined
      const sizeClass = size ? styles[size] : undefined
      return (
        <span
          ref={ref}
          className={clsx(styles.tagGroup, sizeClass, colorClass, className)}
          data-testid="tag-group"
        >
          <button
            type="button"
            className={clsx(
              tagVariants({ variant, size, color }),
              styles.mainButton
            )}
            onClick={
              onClick as unknown as React.MouseEventHandler<HTMLButtonElement>
            }
            data-testid="tag"
            {...(props as unknown as React.ButtonHTMLAttributes<HTMLButtonElement>)}
          >
            {children}
          </button>
          <button
            type="button"
            className={styles.removeButton}
            aria-label={removeLabel}
            data-testid="tag-remove"
            onClick={(e) => {
              e.stopPropagation()
              onRemove?.()
            }}
          >
            {CloseIcon}
          </button>
        </span>
      )
    }

    // Caso 2: Interativo apenas (renderiza como botão completo)
    if (isInteractive) {
      return (
        <button
          ref={ref as unknown as React.Ref<HTMLButtonElement>}
          type="button"
          className={clsx(tagVariants({ variant, size, color }), className)}
          onClick={
            onClick as unknown as React.MouseEventHandler<HTMLButtonElement>
          }
          data-testid="tag"
          {...(props as unknown as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        >
          {children}
        </button>
      )
    }

    // Caso 3: Estático, opcionalmente removível
    return (
      <span
        ref={ref}
        className={clsx(
          tagVariants({ variant, size, color }),
          hasRemove && styles.hasRemove,
          className
        )}
        data-testid="tag"
        {...props}
      >
        <span className={styles.content}>{children}</span>
        {hasRemove && (
          <button
            type="button"
            className={styles.removeButton}
            aria-label={removeLabel}
            data-testid="tag-remove"
            onClick={(e) => {
              e.stopPropagation()
              onRemove?.()
            }}
          >
            {CloseIcon}
          </button>
        )}
      </span>
    )
  }
)

TagComponent.displayName = 'Tag'

export const Tag = withTheme<HTMLSpanElement, TagProps>(TagComponent)
