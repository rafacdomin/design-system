import React from 'react'
import { clsx } from 'clsx'
import { withTheme } from '../../themes/withTheme'
import styles from './Textarea.module.scss'

/**
 * Interface defining properties for the Textarea component.
 */
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Rótulo do campo */
  label?: string
  /** Mensagem de erro que altera a cor da borda */
  error?: string
  /** Texto auxiliar de ajuda */
  helperText?: string
  /** Se verdadeiro, auto-ajusta a altura do campo com base no conteúdo */
  autoResize?: boolean
}

const TextareaComponent = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      autoResize = false,
      className,
      id,
      value,
      onChange,
      disabled,
      ...props
    },
    ref
  ) => {
    const internalRef = React.useRef<HTMLTextAreaElement | null>(null)
    const generatedId = React.useId()
    const textareaId = id || generatedId
    const errorId = `${textareaId}-error`
    const helperId = `${textareaId}-helper`

    // Unifica a referência externa com a referência interna do DOM
    const setRefs = React.useCallback(
      (node: HTMLTextAreaElement | null) => {
        internalRef.current = node
        if (typeof ref === 'function') {
          ref(node)
        } else if (ref) {
          ;(ref as React.MutableRefObject<HTMLTextAreaElement | null>).current =
            node
        }
      },
      [ref]
    )

    // Lógica para ajustar a altura com base no scrollHeight
    const adjustHeight = React.useCallback(() => {
      if (!autoResize || !internalRef.current) return
      const textarea = internalRef.current
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
    }, [autoResize])

    // Ajusta a altura no mount, e sempre que o value (controlado) for alterado
    React.useLayoutEffect(() => {
      adjustHeight()
    }, [value, adjustHeight])

    // Escuta redimensionamentos da janela de forma responsiva
    React.useLayoutEffect(() => {
      if (!autoResize) return
      window.addEventListener('resize', adjustHeight)
      return () => {
        window.removeEventListener('resize', adjustHeight)
      }
    }, [autoResize, adjustHeight])

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (onChange) {
        onChange(e)
      }
      adjustHeight()
    }

    const hasError = !!error
    const ariaDescribedBy =
      clsx(hasError && errorId, !!helperText && helperId) || undefined

    return (
      <div
        className={clsx(
          styles.container,
          disabled && styles.disabled,
          hasError && styles.error,
          className
        )}
      >
        {label && (
          <label htmlFor={textareaId} className={styles.label}>
            {label}
          </label>
        )}
        <textarea
          ref={setRefs}
          id={textareaId}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          aria-invalid={hasError ? 'true' : undefined}
          aria-describedby={ariaDescribedBy}
          className={clsx(styles.textarea, autoResize && styles.autoResize)}
          {...props}
        />
        {hasError && (
          <span id={errorId} className={styles.errorText} role="alert">
            {error}
          </span>
        )}
        {!hasError && helperText && (
          <span id={helperId} className={styles.helperText}>
            {helperText}
          </span>
        )}
      </div>
    )
  }
)

TextareaComponent.displayName = 'Textarea'

export const Textarea = withTheme<HTMLTextAreaElement, TextareaProps>(
  TextareaComponent
)
