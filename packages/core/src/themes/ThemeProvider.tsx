import React, { useState } from 'react'
import { ThemeContext, Theme } from './ThemeContext'

export interface ThemeProviderProps {
  defaultTheme?: Theme
  children: React.ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  defaultTheme = 'light',
  children,
}) => {
  const [theme, setTheme] = useState<Theme>(defaultTheme)

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div data-theme={theme}>{children}</div>
    </ThemeContext.Provider>
  )
}
