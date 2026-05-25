import type { Meta, StoryObj } from '@storybook/react'
import { Tag } from '@ds/core'

const meta: Meta<typeof Tag> = {
  title: 'Components/Tag',
  component: Tag,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['neutral', 'outline', 'interactive'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md'],
    },
    color: {
      control: { type: 'select' },
      options: ['neutral', 'primary', 'secondary', 'danger'],
    },
  },
}

export default meta
type Story = StoryObj<typeof Tag>

export const Playground: Story = {
  args: {
    variant: 'neutral',
    size: 'md',
    color: 'neutral',
    children: 'Playground Tag',
  },
}

export const NeutralColor: Story = {
  tags: ['!dev'],
  args: {
    color: 'neutral',
    children: 'Neutral Color Tag',
  },
}

export const PrimaryColor: Story = {
  tags: ['!dev'],
  args: {
    color: 'primary',
    children: 'Primary Color Tag',
  },
}

export const SecondaryColor: Story = {
  tags: ['!dev'],
  args: {
    color: 'secondary',
    children: 'Secondary Color Tag',
  },
}

export const DangerColor: Story = {
  tags: ['!dev'],
  args: {
    color: 'danger',
    children: 'Danger Color Tag',
  },
}

export const Neutral: Story = {
  tags: ['!dev'],
  args: {
    variant: 'neutral',
    children: 'Neutral Tag',
  },
}

export const Outline: Story = {
  tags: ['!dev'],
  args: {
    variant: 'outline',
    children: 'Outline Tag',
  },
}

export const Interactive: Story = {
  tags: ['!dev'],
  args: {
    variant: 'interactive',
    children: 'Interactive Tag',
  },
}

export const Small: Story = {
  tags: ['!dev'],
  args: {
    size: 'sm',
    children: 'Small Tag',
  },
}

export const Medium: Story = {
  tags: ['!dev'],
  args: {
    size: 'md',
    children: 'Medium Tag',
  },
}

export const Removable: Story = {
  tags: ['!dev'],
  args: {
    children: 'Removable Tag',
    removeAriaLabel: 'Remover Tag',
    onRemove: () => alert('Remover clicado!'),
  },
}

export const InteractiveRemovable: Story = {
  tags: ['!dev'],
  args: {
    variant: 'interactive',
    color: 'primary',
    children: 'Interactive & Removable',
    removeAriaLabel: 'Remover Tag',
    onClick: () => alert('Tag clicada!'),
    onRemove: () => alert('Remover clicado!'),
  },
}
