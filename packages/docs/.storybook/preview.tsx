import type { Preview } from '@storybook/react'
import React from 'react'
import '@ds/core/src/tokens/index.scss'

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
        <div
          data-theme={theme}
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
      )
    },
  ],
}

export default preview
