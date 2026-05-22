import React from 'react'
import { useTheme } from './useTheme'

export function withTheme<P extends object>(Component: React.ComponentType<P>) {
  const WithTheme = (props: P) => {
    const { theme } = useTheme()
    return <Component {...props} data-theme={theme} />
  }
  WithTheme.displayName = `withTheme(${Component.displayName || Component.name || 'Component'})`
  return WithTheme
}
