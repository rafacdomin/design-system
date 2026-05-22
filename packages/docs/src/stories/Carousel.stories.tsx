import type { Meta, StoryObj } from '@storybook/react'
import { Carousel } from '@ds/carousel'
import { Card } from '@ds/core'

const meta: Meta<typeof Carousel> = {
  title: 'Components/Carousel',
  component: Carousel,
  tags: ['autodocs'],
  argTypes: {
    showArrows: {
      control: { type: 'boolean' },
      description: 'Exibe setas de navegação nas laterais',
    },
    showDots: {
      control: { type: 'boolean' },
      description: 'Exibe dots de paginação no rodapé',
    },
    autoplay: {
      control: { type: 'boolean' },
      description: 'Se verdadeiro, avança slides automaticamente',
    },
    autoplayInterval: {
      control: { type: 'number' },
      description: 'Intervalo de tempo do autoplay (em ms)',
    },
    loop: {
      control: { type: 'boolean' },
      description: 'Habilita loop infinito nos slides',
    },
    slidesPerView: {
      control: { type: 'object' },
      description:
        'Quantidade de slides exibidos simultaneamente. Pode ser um número ou objeto com chaves mobile, tablet e desktop.',
    },
  },
}

export default meta
type Story = StoryObj<typeof Carousel>

const createProjectSlides = (count = 6) => {
  const projects = [
    {
      title: 'Antigravity CLI',
      desc: 'Plataforma de automação e agentes de desenvolvimento para grandes codebases.',
      tags: ['React', 'TypeScript'],
    },
    {
      title: 'Design System Tokens',
      desc: 'Compilação multi-plataforma de design tokens em tempo real com múltiplos temas.',
      tags: ['Sass', 'Style Dictionary'],
    },
    {
      title: 'Vitest Dashboard',
      desc: 'Interface interativa para acompanhamento de execução de testes unitários e de regressão.',
      tags: ['Vitest', 'Websockets'],
    },
    {
      title: 'Embla Integration',
      desc: 'Módulo de carrossel de alta performance com suporte a arrastar e gestos mobile.',
      tags: ['Embla', 'CSS Modules'],
    },
    {
      title: 'Component Library',
      desc: 'Biblioteca de componentes React robusta, acessível e totalmente customizável.',
      tags: ['React 18', 'Storybook 8'],
    },
    {
      title: 'Playwright Visuals',
      desc: 'Pipeline de regressão visual integrado com Browserstack e CI/CD.',
      tags: ['Playwright', 'Browserstack'],
    },
  ]

  return projects.slice(0, count).map((proj, idx) => (
    <Card
      key={idx + 1}
      variant="bordered"
      style={{
        padding: '32px',
        minHeight: '200px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
      }}
    >
      <div>
        <span
          style={{
            fontSize: '12px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            color: 'var(--ds-color-neutral-600)',
            letterSpacing: '1px',
          }}
        >
          Projeto {idx + 1}
        </span>
        <h3
          style={{
            margin: '8px 0',
            fontSize: '20px',
            fontFamily: 'var(--ds-font-family-heading)',
            color: 'var(--ds-color-neutral-900)',
          }}
        >
          {proj.title}
        </h3>
        <p
          style={{
            margin: '0 0 16px 0',
            color: 'var(--ds-color-neutral-700)',
            fontFamily: 'var(--ds-font-family-sans)',
            fontSize: '14px',
            lineHeight: '1.4',
          }}
        >
          {proj.desc}
        </p>
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {proj.tags.map((tag) => (
          <span
            key={tag}
            style={{
              padding: '4px 8px',
              fontSize: '12px',
              background: 'var(--ds-color-neutral-200)',
              borderRadius: 'var(--ds-border-radius-full)',
              color: 'var(--ds-color-neutral-800)',
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </Card>
  ))
}

export const Playground: Story = {
  args: {
    showArrows: true,
    showDots: true,
    autoplay: false,
    autoplayInterval: 4000,
    loop: false,
    children: createProjectSlides(),
  },
}

export const SingleCard: Story = {
  tags: ['!dev'],
  parameters: {
    docs: {
      description: {
        story:
          'Exibe exatamente 1 card por vez em todas as resoluções de tela.',
      },
    },
  },
  args: {
    showArrows: true,
    showDots: true,
    slidesPerView: 1,
    children: createProjectSlides(),
  },
}

export const ResponsiveOverride: Story = {
  tags: ['!dev'],
  parameters: {
    docs: {
      description: {
        story:
          'Sobrescreve a exibição responsiva padrão: 1 card em mobile, 2 em tablet e 3 em desktop.',
      },
    },
  },
  args: {
    showArrows: true,
    showDots: true,
    slidesPerView: {
      mobile: 1,
      tablet: 2,
      desktop: 3,
    },
    children: createProjectSlides(),
  },
}

export const Autoplay: Story = {
  tags: ['!dev'],
  args: {
    showArrows: true,
    showDots: true,
    autoplay: true,
    autoplayInterval: 3000,
    loop: true,
    children: createProjectSlides(),
  },
}

export const WithoutControls: Story = {
  tags: ['!dev'],
  args: {
    showArrows: false,
    showDots: false,
    children: createProjectSlides(),
  },
}

export const CustomLayout: Story = {
  tags: ['!dev'],
  render: (args) => (
    <div
      style={{
        border: '2px dashed var(--ds-color-neutral-300)',
        padding: '24px',
        borderRadius: 'var(--ds-border-radius-lg)',
      }}
    >
      <h4
        style={{
          margin: '0 0 16px 0',
          fontFamily: 'var(--ds-font-family-sans)',
          color: 'var(--ds-color-neutral-800)',
        }}
      >
        Layout Customizado (Uso Interno Compound Component)
      </h4>
      <Carousel {...args} showArrows={false} showDots={false}>
        {createProjectSlides()}
      </Carousel>
      <div
        style={{
          marginTop: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span
          style={{ fontSize: '14px', color: 'var(--ds-color-neutral-600)' }}
        >
          Use as setas do teclado para navegar
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <p
            style={{
              margin: 0,
              fontSize: '12px',
              color: 'var(--ds-color-neutral-500)',
            }}
          >
            Foque no carrossel acima para testar a navegação.
          </p>
        </div>
      </div>
    </div>
  ),
  args: {
    loop: true,
  },
}
