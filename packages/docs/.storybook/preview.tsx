import type { Preview } from '@storybook/react'
import React from 'react'
import { ThemeProvider, useTheme, Theme } from '@ds/core'
import { DocsContainer } from '@storybook/blocks'
import { addons } from '@storybook/preview-api'
import { GLOBALS_UPDATED } from '@storybook/core-events'
import { LocaleProvider, Locale, translations } from '../src'
import '@ds/core/dist/index.css'
import '@ds/carousel/dist/index.css'

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

  const [locale, setLocale] = React.useState<Locale>(() => {
    const sbContext = context as unknown as StorybookContext
    const contextGlobals =
      sbContext?.globals ||
      sbContext?.store?.globals?.globals ||
      sbContext?.store?.userGlobals?.globals
    const initialLocale = contextGlobals?.locale
    return initialLocale === 'en-US' ? 'en-US' : 'pt-BR'
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
      const newLocale = globals?.locale
      if (newLocale === 'pt-BR' || newLocale === 'en-US') {
        setLocale(newLocale)
      }
    }

    channel.on(GLOBALS_UPDATED, handleGlobalsUpdated)
    return () => {
      channel.off(GLOBALS_UPDATED, handleGlobalsUpdated)
    }
  }, [])

  return (
    <LocaleProvider locale={locale}>
      <ThemeProvider defaultTheme={theme}>
        <ThemeSync theme={theme}>
          <DocsContainer context={context}>{children}</DocsContainer>
        </ThemeSync>
      </ThemeProvider>
    </LocaleProvider>
  )
}

function translateValue(value: unknown, locale: 'pt-BR' | 'en-US'): unknown {
  if (locale === 'pt-BR') {
    return value
  }

  if (typeof value === 'string') {
    return translations[value] || value
  }

  if (React.isValidElement(value)) {
    const element = value as React.ReactElement<Record<string, unknown>>
    const newProps: Record<string, unknown> = {}
    for (const key of Object.keys(element.props)) {
      if (key !== 'children') {
        newProps[key] = translateValue(element.props[key], locale)
      }
    }
    const children = translateValue(element.props.children, locale)
    return React.cloneElement(element, newProps, children as React.ReactNode)
  }

  if (Array.isArray(value)) {
    return value.map((item) => translateValue(item, locale))
  }

  if (value !== null && typeof value === 'object') {
    const translatedObj: Record<string, unknown> = {}
    for (const key of Object.keys(value)) {
      translatedObj[key] = translateValue(
        (value as Record<string, unknown>)[key],
        locale
      )
    }
    return translatedObj
  }

  return value
}

function translateArgs(
  args: Record<string, unknown> | undefined,
  locale: 'pt-BR' | 'en-US'
): Record<string, unknown> | undefined {
  if (!args || locale === 'pt-BR') {
    return args
  }
  return translateValue(args, locale) as Record<string, unknown>
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
    locale: {
      description: 'Internationalization locale',
      defaultValue: 'pt-BR',
      toolbar: {
        title: 'Locale',
        icon: 'globe',
        items: [
          { value: 'pt-BR', title: 'Português', right: 'PT' },
          { value: 'en-US', title: 'English', right: 'EN' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const locale = (context.globals.locale || 'pt-BR') as 'pt-BR' | 'en-US'
      context.args = translateArgs(context.args, locale) || {}

      const theme = context.globals.theme || 'light'
      const isDocs = context.viewMode === 'docs'
      return (
        <LocaleProvider locale={locale}>
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
        </LocaleProvider>
      )
    },
  ],
}

export default preview
