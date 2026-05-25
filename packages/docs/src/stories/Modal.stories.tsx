import type { Meta, StoryObj } from '@storybook/react'
import { useState, ComponentProps } from 'react'
import { Modal, Button } from '@rafacdomin/ds-core'
import { useLocale } from '../context/LocaleContext'

const ModalStory = (args: ComponentProps<typeof Modal>) => {
  const { locale } = useLocale()
  return (
    <Modal {...args}>
      <p style={{ fontSize: '14px', lineHeight: 1.5, margin: 0 }}>
        {locale === 'en-US'
          ? 'This is the internal content of the accessible and responsive modal from the design system.'
          : 'Este é o conteúdo interno do modal acessível e responsivo do design system.'}
      </p>
    </Modal>
  )
}

const meta: Meta<typeof Modal> = {
  title: 'Components/Modal',
  component: Modal,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
  render: (args) => <ModalStory {...args} />,
}

export default meta
type Story = StoryObj<typeof Modal>

export const Playground: Story = {
  args: {
    title: 'Visualizar Detalhes',
    description: 'Confira as informações detalhadas deste item do portfólio.',
    size: 'md',
    trigger: <Button>Abrir Modal</Button>,
  },
}

export const Small: Story = {
  tags: ['!dev'],
  args: {
    title: 'Confirmação',
    description: 'Tem certeza que deseja prosseguir?',
    size: 'sm',
    trigger: <Button variant="danger">Excluir Item</Button>,
  },
}

export const Large: Story = {
  tags: ['!dev'],
  args: {
    title: 'Projeto Detalhado',
    description: 'Documentação completa com imagens e detalhes técnicos.',
    size: 'lg',
    trigger: <Button variant="secondary">Ver Mais</Button>,
  },
}

export const NoDescription: Story = {
  tags: ['!dev'],
  args: {
    title: 'Modal Sem Descrição',
    size: 'md',
    trigger: <Button variant="ghost">Abrir Simples</Button>,
  },
}

const ControlledModalDemo = (args: ComponentProps<typeof Modal>) => {
  const [isOpen, setIsOpen] = useState(false)
  const { locale } = useLocale()
  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>
        {locale === 'en-US'
          ? 'Open Controlled Modal'
          : 'Abrir Modal Controlado'}
      </Button>
      <Modal
        {...args}
        open={isOpen}
        onOpenChange={setIsOpen}
        title={locale === 'en-US' ? 'Controlled State' : 'Estado Controlado'}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '14px', margin: 0 }}>
            {locale === 'en-US'
              ? 'This modal has its `open` state entirely managed by the parent component.'
              : 'Este modal tem seu estado `open` gerenciado inteiramente pelo componente pai.'}
          </p>
          <Button
            onClick={() => setIsOpen(false)}
            style={{ alignSelf: 'flex-end' }}
          >
            {locale === 'en-US' ? 'Close Via Code' : 'Fechar Via Código'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}

export const Controlled: Story = {
  tags: ['!dev'],
  render: (args) => <ControlledModalDemo {...args} />,
}
