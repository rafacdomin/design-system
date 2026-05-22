import React, { useId } from 'react'
import { clsx } from 'clsx'
import { withTheme } from '../../themes/withTheme'
import styles from './Input.module.scss'

export interface InputIconProps {
  /** Conteúdo do ícone */
  children: React.ReactNode
  /** Classe CSS adicional */
  className?: string
}

const InputStartIconComponent: React.FC<InputIconProps> = ({
  children,
  className,
}) => {
  return (
    <div className={clsx(styles.startIcon, className)} aria-hidden="true">
      {children}
    </div>
  )
}
InputStartIconComponent.displayName = 'Input.StartIcon'

const InputEndIconComponent: React.FC<InputIconProps> = ({
  children,
  className,
}) => {
  return (
    <div className={clsx(styles.endIcon, className)} aria-hidden="true">
      {children}
    </div>
  )
}
InputEndIconComponent.displayName = 'Input.EndIcon'

export const InputStartIcon = InputStartIconComponent
export const InputEndIcon = InputEndIconComponent

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Rótulo visual do campo */
  label?: string
  /** Mensagem de erro que altera o estado do campo e é exibida no rodapé */
  error?: string
  /** Texto de ajuda auxiliar exibido abaixo do input */
  helperText?: string
  /** Modo do label (estático acima ou flutuante dentro do campo) */
  labelMode?: 'static' | 'floating'
  /** Ícones adicionais do input (Input.StartIcon ou Input.EndIcon) */
  children?: React.ReactNode
}

const InputComponent = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      id,
      label,
      error,
      helperText,
      labelMode = 'static',
      disabled,
      placeholder,
      onFocus,
      onBlur,
      children,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const generatedId = useId()
    const inputId = id || generatedId
    const helperId = `${inputId}-helper`
    const errorId = `${inputId}-error`

    const hasError = !!error
    const hasHelper = !!helperText && !hasError
    const isFloating = labelMode === 'floating'

    const describedBy =
      clsx({
        [errorId]: hasError,
        [helperId]: hasHelper,
      }) || undefined

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      if (onFocus) {
        onFocus(e)
      }
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      if (onBlur) {
        onBlur(e)
      }
    }

    let hasStartIcon = false
    let hasEndIcon = false
    let startIconElement: React.ReactNode = null
    let endIconElement: React.ReactNode = null

    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child)) {
        if (child.type === InputStartIcon) {
          hasStartIcon = true
          startIconElement = child
        } else if (child.type === InputEndIcon) {
          hasEndIcon = true
          endIconElement = child
        }
      }
    })

    return (
      <div
        className={clsx(
          styles.inputContainer,
          {
            [styles.hasError]: hasError,
            [styles.isDisabled]: disabled,
            [styles.isFloating]: isFloating,
            [styles.hasStartIcon]: hasStartIcon,
            [styles.hasEndIcon]: hasEndIcon,
          },
          className
        )}
      >
        {!isFloating && label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
        )}

        <div className={styles.inputWrapper}>
          {startIconElement}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={hasError ? 'true' : undefined}
            aria-describedby={describedBy}
            placeholder={
              isFloating ? (isFocused ? placeholder : ' ') : placeholder
            }
            className={styles.input}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />

          {isFloating && label && (
            <label htmlFor={inputId} className={styles.floatingLabel}>
              {label}
            </label>
          )}

          {endIconElement}
        </div>

        {hasError && (
          <span id={errorId} className={styles.errorText} role="alert">
            {error}
          </span>
        )}

        {hasHelper && (
          <span id={helperId} className={styles.helperText}>
            {helperText}
          </span>
        )}
      </div>
    )
  }
)

InputComponent.displayName = 'Input'

const ThemedInput = withTheme<HTMLInputElement, InputProps>(InputComponent)

export const Input = Object.assign(ThemedInput, {
  StartIcon: InputStartIcon,
  EndIcon: InputEndIcon,
})
