import type { Preview } from '@storybook/react'
import React from 'react'
import { ThemeProvider, useTheme, Theme } from '@ds/core'
import '@ds/core/src/tokens/index.scss'

const ThemeSync = ({
  theme,
  children,
}: {
  theme: Theme
  children: React.ReactNode
}) => {
  const { setTheme } = useTheme()
  React.useEffect(() => {
    setTheme(theme)
  }, [theme, setTheme])
  return <>{children}</>
}

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light', icon: 'circlehollow' },
          { value: 'dark', title: 'Dark', icon: 'circle' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme || 'light'
      return (
        <ThemeProvider defaultTheme={theme}>
          <ThemeSync theme={theme}>
            <div
              style={{
                padding: '2rem',
                minHeight: '100vh',
                background: 'var(--ds-color-neutral-0)',
                color: 'var(--ds-color-neutral-1000)',
                transition: 'background-color 0.2s ease, color 0.2s ease',
              }}
            >
              <Story />
            </div>
          </ThemeSync>
        </ThemeProvider>
      )
    },
  ],
}

export default preview
