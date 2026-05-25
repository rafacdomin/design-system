import type { Meta, StoryObj } from '@storybook/react'
import { Card, CardProps } from '@rafacdomin/ds-core'

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['flat', 'bordered', 'elevated'],
    },
    interactive: {
      control: { type: 'boolean' },
    },
    asChild: {
      control: { type: 'boolean' },
    },
  },
}

export default meta
type Story = StoryObj<typeof Card>

export const Playground: Story = {
  args: {
    variant: 'bordered',
    interactive: false,
    children: (
      <div style={{ padding: '24px' }}>
        <h3
          style={{
            margin: '0 0 8px 0',
            fontFamily: 'var(--ds-font-family-heading)',
            color: 'var(--ds-color-neutral-900)',
          }}
        >
          Playground Card
        </h3>
        <p
          style={{
            margin: 0,
            color: 'var(--ds-color-neutral-500)',
            fontFamily: 'var(--ds-font-family-sans)',
          }}
        >
          This is a customizable card. Adjust the controls below.
        </p>
      </div>
    ),
  },
}

export const Bordered: Story = {
  tags: ['!dev'],
  args: {
    variant: 'bordered',
    children: (
      <div style={{ padding: '24px' }}>
        <h3
          style={{
            margin: '0 0 8px 0',
            fontFamily: 'var(--ds-font-family-heading)',
            color: 'var(--ds-color-neutral-900)',
          }}
        >
          Bordered Card
        </h3>
        <p
          style={{
            margin: 0,
            color: 'var(--ds-color-neutral-500)',
            fontFamily: 'var(--ds-font-family-sans)',
          }}
        >
          This is a bordered card description.
        </p>
      </div>
    ),
  },
}

export const Flat: Story = {
  tags: ['!dev'],
  args: {
    variant: 'flat',
    children: (
      <div style={{ padding: '24px' }}>
        <h3
          style={{
            margin: '0 0 8px 0',
            fontFamily: 'var(--ds-font-family-heading)',
            color: 'var(--ds-color-neutral-900)',
          }}
        >
          Flat Card
        </h3>
        <p
          style={{
            margin: 0,
            color: 'var(--ds-color-neutral-500)',
            fontFamily: 'var(--ds-font-family-sans)',
          }}
        >
          This is a flat card description.
        </p>
      </div>
    ),
  },
}

export const Elevated: Story = {
  tags: ['!dev'],
  args: {
    variant: 'elevated',
    children: (
      <div style={{ padding: '24px' }}>
        <h3
          style={{
            margin: '0 0 8px 0',
            fontFamily: 'var(--ds-font-family-heading)',
            color: 'var(--ds-color-neutral-900)',
          }}
        >
          Elevated Card
        </h3>
        <p
          style={{
            margin: 0,
            color: 'var(--ds-color-neutral-500)',
            fontFamily: 'var(--ds-font-family-sans)',
          }}
        >
          This is an elevated card description.
        </p>
      </div>
    ),
  },
}

export const Interactive: Story = {
  tags: ['!dev'],
  args: {
    variant: 'bordered',
    interactive: true,
    children: (
      <div style={{ padding: '24px' }}>
        <h3
          style={{
            margin: '0 0 8px 0',
            fontFamily: 'var(--ds-font-family-heading)',
            color: 'var(--ds-color-neutral-900)',
          }}
        >
          Interactive Card
        </h3>
        <p
          style={{
            margin: 0,
            color: 'var(--ds-color-neutral-500)',
            fontFamily: 'var(--ds-font-family-sans)',
          }}
        >
          Hover or focus this card to see interaction.
        </p>
      </div>
    ),
  },
}

export const AsChild: Story = {
  tags: ['!dev'],
  render: (args: CardProps) => (
    <Card {...args} asChild>
      <a
        href="https://example.com"
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: 'none', display: 'block' }}
      >
        <div style={{ padding: '24px' }}>
          <h3
            style={{
              margin: '0 0 8px 0',
              fontFamily: 'var(--ds-font-family-heading)',
              color: 'var(--ds-color-neutral-900)',
            }}
          >
            Polymorphic Card (a)
          </h3>
          <p
            style={{
              margin: 0,
              color: 'var(--ds-color-neutral-500)',
              fontFamily: 'var(--ds-font-family-sans)',
            }}
          >
            Clicking this card will navigate to example.com.
          </p>
        </div>
      </a>
    </Card>
  ),
  args: {
    variant: 'elevated',
    interactive: true,
  },
}
