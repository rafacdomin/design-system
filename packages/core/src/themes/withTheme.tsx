import React from 'react'
import { useTheme } from './useTheme'

export function withTheme<T = unknown, P extends object = object>(
  Component: React.ComponentType<P & { ref?: React.Ref<T> }>
) {
  const WithTheme = React.forwardRef<T, P>((props, ref) => {
    const { theme } = useTheme()
    return <Component {...props} ref={ref} data-theme={theme} />
  })
  WithTheme.displayName = `withTheme(${Component.displayName || Component.name || 'Component'})`
  return WithTheme
}
