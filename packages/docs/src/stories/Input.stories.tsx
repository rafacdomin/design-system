import type { Meta, StoryObj } from '@storybook/react'
import { Input } from '@ds/core'

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    error: { control: 'text' },
    helperText: { control: 'text' },
    labelMode: {
      control: { type: 'select' },
      options: ['static', 'floating'],
    },
    disabled: { control: 'boolean' },
    placeholder: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof Input>

export const Playground: Story = {
  args: {
    label: 'Username',
    placeholder: 'Enter your username',
    labelMode: 'static',
    disabled: false,
  },
}

export const FloatingLabel: Story = {
  tags: ['!dev'],
  args: {
    label: 'Email Address',
    placeholder: 'Enter your email',
    labelMode: 'floating',
  },
}

export const WithHelperText: Story = {
  tags: ['!dev'],
  args: {
    label: 'Password',
    placeholder: 'Enter your password',
    helperText: 'Must be at least 8 characters long.',
  },
}

export const WithError: Story = {
  tags: ['!dev'],
  args: {
    label: 'Email Address',
    placeholder: 'Enter your email',
    error: 'Please enter a valid email address.',
    defaultValue: 'invalid-email',
  },
}

export const DisabledState: Story = {
  tags: ['!dev'],
  args: {
    label: 'Username',
    placeholder: 'Enter your username',
    disabled: true,
  },
}

export const WithIcons: Story = {
  tags: ['!dev'],
  render: (args) => (
    <Input {...args}>
      <Input.StartIcon>
        <span>🔍</span>
      </Input.StartIcon>
      <Input.EndIcon>
        <span>⌘K</span>
      </Input.EndIcon>
    </Input>
  ),
  args: {
    label: 'Search',
    placeholder: 'Search projects...',
  },
}
