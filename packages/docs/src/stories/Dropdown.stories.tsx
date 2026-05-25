import type { Meta, StoryObj } from '@storybook/react'
import { useState, ComponentProps } from 'react'
import { Dropdown } from '@ds/core'
import { useLocale } from '../context/LocaleContext'

const meta: Meta<typeof Dropdown> = {
  title: 'Components/Dropdown',
  component: Dropdown,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    error: { control: 'text' },
    helperText: { control: 'text' },
  },
  render: (args) => (
    <Dropdown {...args}>
      <Dropdown.Item value="react">React.js</Dropdown.Item>
      <Dropdown.Item value="ts">TypeScript</Dropdown.Item>
      <Dropdown.Item value="sass">Sass / SCSS</Dropdown.Item>
      <Dropdown.Item value="next" disabled>
        Next.js (Disabled)
      </Dropdown.Item>
    </Dropdown>
  ),
}

export default meta
type Story = StoryObj<typeof Dropdown>

export const Playground: Story = {
  args: {
    label: 'Tecnologia Principal',
    placeholder: 'Escolha uma stack...',
    disabled: false,
    error: '',
    helperText: 'Selecione a tecnologia de maior domínio para o portfólio.',
  },
}

export const Basic: Story = {
  tags: ['!dev'],
  args: {
    placeholder: 'Selecione...',
  },
}

export const WithLabel: Story = {
  tags: ['!dev'],
  args: {
    label: 'Stack',
    placeholder: 'Selecione...',
  },
}

export const WithHelperText: Story = {
  tags: ['!dev'],
  args: {
    label: 'Stack',
    placeholder: 'Selecione...',
    helperText: 'A stack será exibida em destaque no cabeçalho do perfil.',
  },
}

export const Disabled: Story = {
  tags: ['!dev'],
  args: {
    label: 'Stack',
    placeholder: 'Selecione...',
    disabled: true,
  },
}

export const WithError: Story = {
  tags: ['!dev'],
  args: {
    label: 'Stack',
    placeholder: 'Selecione...',
    error: 'É necessário selecionar pelo menos uma stack.',
  },
}

const ControlledDropdown = (args: ComponentProps<typeof Dropdown>) => {
  const [val, setVal] = useState('react')
  const { locale } = useLocale()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <Dropdown {...args} value={val} onChange={setVal}>
        <Dropdown.Item value="react">React.js</Dropdown.Item>
        <Dropdown.Item value="ts">TypeScript</Dropdown.Item>
        <Dropdown.Item value="sass">Sass / SCSS</Dropdown.Item>
        <Dropdown.Item value="next" disabled>
          Next.js (Disabled)
        </Dropdown.Item>
      </Dropdown>
      <p style={{ fontSize: '14px', color: 'var(--ds-color-neutral-700)' }}>
        {locale === 'en-US'
          ? 'Selected value in parent state:'
          : 'Valor selecionado no estado pai:'}{' '}
        <strong>{val}</strong>
      </p>
    </div>
  )
}

export const Controlled: Story = {
  tags: ['!dev'],
  render: (args) => <ControlledDropdown {...args} />,
  args: {
    label: 'Stack Controlada',
  },
}
