import type { Preview } from '@storybook/react'
import React from 'react'
import { ThemeProvider, useTheme, Theme } from '@ds/core'
import { DocsContainer } from '@storybook/blocks'
import { addons } from '@storybook/preview-api'
import { GLOBALS_UPDATED } from '@storybook/core-events'
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

interface StorybookGlobals {
  theme?: string
  [key: string]: unknown
}

interface StorybookContextStore {
  globals?: {
    globals?: StorybookGlobals
  }
  userGlobals?: {
    globals?: StorybookGlobals
  }
}

interface StorybookContext {
  globals?: StorybookGlobals
  store?: StorybookContextStore
}

const DocsThemeContainer = ({
  children,
  context,
}: {
  children: React.ReactNode
  context: React.ComponentProps<typeof DocsContainer>['context']
}) => {
  const [theme, setTheme] = React.useState<Theme>(() => {
    const sbContext = context as unknown as StorybookContext
    const contextGlobals =
      sbContext?.globals ||
      sbContext?.store?.globals?.globals ||
      sbContext?.store?.userGlobals?.globals
    const initialTheme = contextGlobals?.theme
    return initialTheme === 'dark' ? 'dark' : 'light'
  })

  React.useEffect(() => {
    const channel = addons.getChannel()
    const handleGlobalsUpdated = (
      event: { globals?: StorybookGlobals } & Record<string, unknown>
    ) => {
      const globals = event?.globals || event
      const newTheme = globals?.theme
      if (newTheme === 'light' || newTheme === 'dark') {
        setTheme(newTheme)
      }
    }

    channel.on(GLOBALS_UPDATED, handleGlobalsUpdated)
    return () => {
      channel.off(GLOBALS_UPDATED, handleGlobalsUpdated)
    }
  }, [])

  return (
    <ThemeProvider defaultTheme={theme}>
      <ThemeSync theme={theme}>
        <DocsContainer context={context}>{children}</DocsContainer>
      </ThemeSync>
    </ThemeProvider>
  )
}

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: [
          'Getting Started',
          ['Introduction'],
          'Tokens',
          ['Colors', 'Typography', 'Spacing', 'Borders', 'Shadows'],
          'Components',
          ['*'],
        ],
      },
    },
    docs: {
      container: DocsThemeContainer,
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
      const isDocs = context.viewMode === 'docs'
      return (
        <ThemeProvider defaultTheme={theme}>
          <ThemeSync theme={theme}>
            <div
              style={{
                padding: isDocs ? '1rem' : '2rem',
                minHeight: isDocs ? 'auto' : '100vh',
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
