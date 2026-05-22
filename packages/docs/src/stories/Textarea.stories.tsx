import type { Meta, StoryObj } from '@storybook/react'
import { Textarea } from '@ds/core'

const meta: Meta<typeof Textarea> = {
  title: 'Components/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    helperText: { control: 'text' },
    error: { control: 'text' },
    autoResize: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof Textarea>

export const Playground: Story = {
  args: {
    label: 'Textarea Label',
    placeholder: 'Type your text here...',
    helperText: 'This is a helper text.',
    autoResize: false,
    disabled: false,
  },
}

export const WithError: Story = {
  tags: ['!dev'],
  args: {
    label: 'Comments',
    placeholder: 'Type comments...',
    error: 'Comments cannot be empty.',
  },
}

export const AutoResize: Story = {
  tags: ['!dev'],
  args: {
    label: 'Auto Resizing Textarea',
    placeholder:
      'Type long paragraphs or insert newlines to see the height adjust automatically...',
    autoResize: true,
  },
}

export const Disabled: Story = {
  tags: ['!dev'],
  args: {
    label: 'Disabled Textarea',
    placeholder: 'Cannot type here...',
    disabled: true,
  },
}
