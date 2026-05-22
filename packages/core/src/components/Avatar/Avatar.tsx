import React, { useState, useEffect } from 'react'
import { clsx } from 'clsx'
import { withTheme } from '../../themes/withTheme'
import styles from './Avatar.module.scss'

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** URL da imagem do avatar */
  src?: string
  /** Descrição acessível da imagem (opcional se 'name' for fornecido) */
  alt?: string
  /** Iniciais para fallback (opcional se 'name' for fornecido) */
  fallback?: string
  /** Nome completo para gerar iniciais e alt automaticamente */
  name?: string
  /** Tamanho do avatar */
  size?: 'sm' | 'md' | 'lg'
}

type AvatarStatus = 'loading' | 'error' | 'success'

const getInitials = (name?: string): string => {
  if (!name) return ''
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const AvatarComponent = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, alt, fallback, name, size = 'md', className, ...props }, ref) => {
    const [status, setStatus] = useState<AvatarStatus>(
      src ? 'loading' : 'error'
    )

    useEffect(() => {
      if (src) {
        setStatus('loading')
      } else {
        setStatus('error')
      }
    }, [src])

    const isLoaded = status === 'success'
    const showFallback = status === 'error' || status === 'loading'

    const computedAlt = alt ?? name ?? ''
    const computedFallback = fallback || getInitials(name)

    // Atributos de acessibilidade condicionais: se a imagem falhou ou está carregando, a div age como img.
    const a11yProps = showFallback
      ? { role: 'img', 'aria-label': computedAlt }
      : {}

    return (
      <div
        ref={ref}
        className={clsx(styles.avatar, styles[size], className)}
        {...a11yProps}
        {...props}
      >
        {src && status !== 'error' && (
          <img
            src={src}
            alt={computedAlt}
            onLoad={() => setStatus('success')}
            onError={() => setStatus('error')}
            className={clsx(
              styles.image,
              isLoaded ? styles.loaded : styles.hidden
            )}
          />
        )}
        {showFallback && (
          <div className={styles.fallback} aria-hidden="true">
            {computedFallback}
          </div>
        )}
      </div>
    )
  }
)

AvatarComponent.displayName = 'Avatar'

export const Avatar = withTheme<HTMLDivElement, AvatarProps>(AvatarComponent)
export default Avatar
