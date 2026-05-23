import React from 'react'
import { useTheme } from '@ds/core'

interface DocsThemeWrapperProps {
  children: React.ReactNode
}

export const DocsThemeWrapper: React.FC<DocsThemeWrapperProps> = ({
  children,
}) => {
  const { theme } = useTheme()

  return (
    <div
      data-theme={theme}
      style={{
        background: 'var(--ds-color-neutral-0)',
        color: 'var(--ds-color-neutral-1000)',
        padding: '24px',
        borderRadius: '8px',
        border: '1px solid var(--ds-color-neutral-200)',
        minHeight: '100%',
        fontFamily: 'var(--ds-font-family-sans)',
        transition: 'background-color 0.2s ease, color 0.2s ease',
      }}
    >
      {children}
    </div>
  )
}
