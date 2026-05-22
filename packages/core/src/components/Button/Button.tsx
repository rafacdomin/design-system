import React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { clsx } from 'clsx'
import { withTheme } from '../../themes/withTheme'
import styles from './Button.module.scss'

export const buttonVariants = cva(styles.button, {
  variants: {
    variant: {
      primary: styles.primary,
      secondary: styles.secondary,
      ghost: styles.ghost,
      danger: styles.danger,
    },
    size: {
      sm: styles.sm,
      md: styles.md,
      lg: styles.lg,
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
})

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  asChild?: boolean
}

const ButtonComponent = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      loading = false,
      disabled,
      asChild = false,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button'
    const isDisabled = disabled || loading

    return (
      <Comp
        ref={ref}
        className={clsx(
          buttonVariants({ variant, size }),
          loading && [styles.loading, 'loading'],
          className
        )}
        disabled={isDisabled}
        aria-disabled={loading ? 'true' : undefined}
        {...props}
      >
        {loading ? (
          <>
            <span
              className={clsx(styles.spinner, 'spinner')}
              aria-hidden="true"
            />
            <span className={styles.content}>{children}</span>
          </>
        ) : (
          children
        )}
      </Comp>
    )
  }
)

ButtonComponent.displayName = 'Button'

export const Button = withTheme<HTMLButtonElement, ButtonProps>(ButtonComponent)
