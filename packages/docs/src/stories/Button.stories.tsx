import type { Meta, StoryObj } from '@storybook/react'
import { Button, ButtonProps } from '@ds/core'

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'ghost', 'danger'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    loading: {
      control: { type: 'boolean' },
    },
    disabled: {
      control: { type: 'boolean' },
    },
    asChild: {
      control: { type: 'boolean' },
    },
  },
}

export default meta
type Story = StoryObj<typeof Button>

export const Playground: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    children: 'Button',
    disabled: false,
    loading: false,
  },
}

export const Primary: Story = {
  tags: ['!dev'],
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
}

export const Secondary: Story = {
  tags: ['!dev'],
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
}

export const Ghost: Story = {
  tags: ['!dev'],
  args: {
    variant: 'ghost',
    children: 'Ghost Button',
  },
}

export const Danger: Story = {
  tags: ['!dev'],
  args: {
    variant: 'danger',
    children: 'Danger Button',
  },
}

export const Small: Story = {
  tags: ['!dev'],
  args: {
    size: 'sm',
    children: 'Small Button',
  },
}

export const Medium: Story = {
  tags: ['!dev'],
  args: {
    size: 'md',
    children: 'Medium Button',
  },
}

export const Large: Story = {
  tags: ['!dev'],
  args: {
    size: 'lg',
    children: 'Large Button',
  },
}

export const Disabled: Story = {
  tags: ['!dev'],
  args: {
    disabled: true,
    children: 'Disabled Button',
  },
}

export const Loading: Story = {
  tags: ['!dev'],
  args: {
    loading: true,
    children: 'Loading Button',
  },
}

export const AsChild: Story = {
  tags: ['!dev'],
  render: (args: ButtonProps) => (
    <Button {...args} asChild>
      <a href="https://google.com" target="_blank" rel="noopener noreferrer">
        Link as Button
      </a>
    </Button>
  ),
  args: {
    variant: 'primary',
  },
}
