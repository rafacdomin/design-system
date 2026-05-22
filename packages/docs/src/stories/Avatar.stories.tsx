import type { Meta, StoryObj } from '@storybook/react'
import { Avatar } from '@ds/core'

const meta: Meta<typeof Avatar> = {
  title: 'Components/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    src: {
      control: { type: 'text' },
    },
    alt: {
      control: { type: 'text' },
    },
    name: {
      control: { type: 'text' },
    },
    fallback: {
      control: { type: 'text' },
    },
  },
}

export default meta
type Story = StoryObj<typeof Avatar>

export const Playground: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
    name: 'Sofia Rodrigues',
    size: 'md',
  },
}

export const Small: Story = {
  tags: ['!dev'],
  args: {
    src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
    name: 'Sofia Rodrigues',
    size: 'sm',
  },
}

export const Medium: Story = {
  tags: ['!dev'],
  args: {
    src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
    name: 'Sofia Rodrigues',
    size: 'md',
  },
}

export const Large: Story = {
  tags: ['!dev'],
  args: {
    src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
    name: 'Sofia Rodrigues',
    size: 'lg',
  },
}

export const WithNameFallback: Story = {
  tags: ['!dev'],
  args: {
    name: 'John Doe',
    size: 'md',
  },
}

export const FallbackOnly: Story = {
  tags: ['!dev'],
  args: {
    alt: 'Sofia Rodrigues',
    fallback: 'SR',
    size: 'md',
  },
}

export const BrokenImage: Story = {
  tags: ['!dev'],
  args: {
    src: 'https://invalid-url-that-fails.com/image.png',
    name: 'Sofia Rodrigues',
    size: 'md',
  },
}
