import React from 'react'
import * as Select from '@radix-ui/react-select'
import { clsx } from 'clsx'
import { withTheme } from '../../themes/withTheme'
import { useTheme } from '../../themes/useTheme'
import styles from './Dropdown.module.scss'

export interface DropdownProps {
  /** Optional label displayed above the dropdown */
  label?: string
  /** Placeholder text shown when no option is selected */
  placeholder?: string
  /** Selected value for controlled component */
  value?: string
  /** Initial selected value for uncontrolled component */
  defaultValue?: string
  /** Callback triggered when value changes */
  onChange?: (value: string) => void
  /** Validation error message */
  error?: string
  /** Help/information message displayed below the dropdown */
  helperText?: string
  /** Disable interactions when true */
  disabled?: boolean
  /** Additional styling class */
  className?: string
  /** HTML identifier */
  id?: string
  /** Dropdown items (options) using Dropdown.Item */
  children: React.ReactNode
}

export interface DropdownItemProps {
  /** Value representing the option */
  value: string
  /** Whether the option is disabled */
  disabled?: boolean
  /** Content of the option */
  children: React.ReactNode
  /** Additional styling class */
  className?: string
}

const DropdownItemComponent = React.forwardRef<
  HTMLDivElement,
  DropdownItemProps
>(({ value, disabled, children, className, ...props }, ref) => {
  return (
    <Select.Item
      ref={ref}
      value={value}
      disabled={disabled}
      className={clsx(styles.item, className)}
      {...props}
    >
      <Select.ItemText>{children}</Select.ItemText>
      <Select.ItemIndicator className={styles.itemIndicator}>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M2.5 6L4.5 8L9.5 3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Select.ItemIndicator>
    </Select.Item>
  )
})

DropdownItemComponent.displayName = 'Dropdown.Item'

const DropdownItem = DropdownItemComponent

const DropdownComponent = React.forwardRef<HTMLButtonElement, DropdownProps>(
  (
    {
      label,
      placeholder = 'Selecione uma opção...',
      value,
      defaultValue,
      onChange,
      error,
      helperText,
      disabled = false,
      className,
      id,
      children,
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme()
    const generatedId = React.useId()
    const selectId = id || generatedId
    const errorId = `${selectId}-error`
    const helperId = `${selectId}-helper`

    const describedBy =
      clsx(error && errorId, helperText && !error && helperId) || undefined

    return (
      <div className={clsx(styles.wrapper, className)}>
        {label && (
          <label htmlFor={selectId} className={styles.label}>
            {label}
          </label>
        )}

        <Select.Root
          value={value}
          defaultValue={defaultValue}
          onValueChange={onChange}
          disabled={disabled}
        >
          <Select.Trigger
            ref={ref}
            id={selectId}
            className={clsx(styles.trigger, error && styles.triggerError)}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={describedBy}
            data-testid="dropdown-trigger"
            {...props}
          >
            <Select.Value placeholder={placeholder} />
            <Select.Icon className={styles.icon}>
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M3 4.5L6 7.5L9 4.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Select.Icon>
          </Select.Trigger>

          <Select.Portal>
            <Select.Content
              className={styles.content}
              data-theme={theme}
              position="popper"
              sideOffset={4}
            >
              <Select.Viewport className={styles.viewport}>
                {children}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>

        {error && (
          <span id={errorId} className={styles.errorText} role="alert">
            {error}
          </span>
        )}

        {helperText && !error && (
          <span id={helperId} className={styles.helperText}>
            {helperText}
          </span>
        )}
      </div>
    )
  }
)

DropdownComponent.displayName = 'Dropdown'

const ThemedDropdown = withTheme<HTMLButtonElement, DropdownProps>(
  DropdownComponent
)

export const Dropdown = Object.assign(ThemedDropdown, {
  Item: DropdownItem,
})
