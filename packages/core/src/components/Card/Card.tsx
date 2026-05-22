import React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { clsx } from 'clsx'
import { withTheme } from '../../themes/withTheme'
import styles from './Card.module.scss'

export const cardVariants = cva(styles.card, {
  variants: {
    variant: {
      flat: styles.flat,
      bordered: styles.bordered,
      elevated: styles.elevated,
    },
    interactive: {
      true: styles.interactive,
      false: '',
    },
  },
  defaultVariants: {
    variant: 'bordered',
    interactive: false,
  },
})

export interface CardProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /** Variante visual de elevação */
  variant?: 'flat' | 'bordered' | 'elevated'
  /** Se verdadeiro, adiciona efeito de hover de elevação e cursor pointer */
  interactive?: boolean
  /** Se verdadeiro, delega a renderização para o elemento filho direto */
  asChild?: boolean
}

const CardComponent = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'bordered',
      interactive = false,
      asChild = false,
      onClick,
      onKeyDown,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'div'

    const isInteractive = !!interactive
    const extraProps: React.HTMLAttributes<HTMLDivElement> = {}

    // Accessibility for interactive, non-polymorphic cards
    if (isInteractive && !asChild) {
      extraProps.tabIndex = 0
      extraProps.role = props.role || 'button'
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (isInteractive && !asChild && onClick) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onClick(event as unknown as React.MouseEvent<HTMLDivElement>)
        }
      }
      if (onKeyDown) {
        onKeyDown(event)
      }
    }

    return (
      <Comp
        ref={ref}
        className={clsx(cardVariants({ variant, interactive }), className)}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        {...extraProps}
        {...props}
      >
        {children}
      </Comp>
    )
  }
)

CardComponent.displayName = 'Card'

export const Card = withTheme<HTMLDivElement, CardProps>(CardComponent)
