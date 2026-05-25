# #010 — Componente: Card

## Status

`[ ] A Fazer` `[ ] Em progresso` `[x] Concluído`

## Objetivo

Implementar o componente container `Card` seguindo TDD. Ele será utilizado para estruturar sessões e blocos de projetos no portfólio, oferecendo variantes visuais e suporte a interações (hover/elevação de alto contraste).

## Critérios de Aceite

- [ ] Criar o componente Card que atua como wrapper HTML `<div>` polimórfico (`asChild` opcional).
- [ ] Variantes estéticas: `flat` (fundo cinza neutro plano), `bordered` (borda fina sem fundo ou com fundo plano) e `elevated` (sombra sutil).
- [ ] Propriedade `interactive` (booleano): se verdadeiro, adiciona cursor pointer, efeito de hover suave que aumenta ligeiramente a elevação da sombra (`--ds-shadow-md`) e altera levemente as cores de borda/fundo.
- [ ] Garantir que o componente Card se adapte ao tema light/dark através dos tokens CSS.
- [ ] Encaminhamento de referências com `forwardRef`.
- [ ] Testes unitários de renderização e acessibilidade.

## Props

| Prop          | Tipo                                 | Default      | Descrição                                                               |
| ------------- | ------------------------------------ | ------------ | ----------------------------------------------------------------------- |
| `variant`     | `'flat' \| 'bordered' \| 'elevated'` | `'bordered'` | Variante visual estética                                                |
| `interactive` | `boolean`                            | `false`      | Se verdadeiro, adiciona cursor de clique e efeitos de hover de elevação |
| `asChild`     | `boolean`                            | `false`      | Delega a renderização ao elemento filho                                 |

## Cenários de Teste

- [ ] Renderiza com o conteúdo interno (children).
- [ ] Se for `interactive`, ao receber foco (via teclado), exibe um anel de foco bem definido.
- [ ] Livre de erros no axe test.

## Arquivos a Criar

- `packages/core/src/components/Card/Card.tsx`
- `packages/core/src/components/Card/Card.test.tsx`
- `packages/core/src/components/Card/Card.stories.tsx`
- `packages/core/src/components/Card/Card.module.scss`
- `packages/core/src/components/Card/index.ts`

## Dependências de Issues

#001 (Monorepo), #002 (Tokens), #003 (Themes)

## Estimativa

P

## Pesquisa

### Acessibilidade de Cards Interativos (W3C WAI-ARIA)

1. **Comportamento Semântico:** De acordo com o padrão ARIA para elementos de layout de interface de usuário (UI), um Card é primariamente um container estrutural. Se o Card for configurado como interativo, ele deve atuar semanticamente como um controle interativo (como um botão `role="button"` ou link se contiver link).
2. **Navegação por Teclado:**
   - Cards clicáveis sem semântica nativa (ex: renderizados como `div` com `onClick`) devem receber `tabindex="0"`.
   - Devem suportar ativação por meio das teclas `Enter` e `Space` (comportamento padrão de botões).
   - Quando renderizado via `asChild` usando um link (`<a>`), o elemento clonado nativo lida automaticamente com o foco e a ativação pelo teclado (`Enter`), o que evita a necessidade de gerenciar isso manualmente.
3. **Evitar Controles Interativos Aninhados (Nested Interactive Controls):**
   - Colocar múltiplos botões ou links dentro de um Card que também é totalmente interativo e recebe foco é um anti-padrão de acessibilidade. Isso confunde leitores de tela e dificulta a navegação por teclado.
   - Solução proposta: Se o card possuir links internos específicos, ele **não** deve ter `interactive={true}` no contêiner com `tabindex="0"`. A interatividade global para cliques do mouse deve ser feita via "redundant click pattern" em Javascript, sem adicionar foco ao container. Se o card for puramente um link único (bloco clicável), deve-se usar `asChild` com um único `a` de forma limpa.

### Polimorfismo com Radix UI `@radix-ui/react-slot`

- O `Slot` da Radix UI clona seu elemento filho direto e mescla suas propriedades e refs de maneira transparente.
- Garante que propriedades como `className` e estilos gerados pelo CVA ou CSS Modules sejam agregados aos estilos do próprio filho.
- Permite que refs sejam passados diretamente ao elemento final correspondente (como `HTMLAnchorElement` ou `HTMLButtonElement`), o que simplifica o uso em estruturas de SPA como Next.js (`Link`).

---

## Implementação Planejada

### 1. `packages/core/src/components/Card/Card.tsx`

```tsx
import React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { clsx } from 'clsx'
import { withTheme } from '../../themes/withTheme'
import styles from './Card.module.scss'

export const cardVariants = cva(styles.card, {
  variants: {
    variant: {
      flat: styles.flat,
      bordered: styles.bordered,
      elevated: styles.elevated,
    },
    interactive: {
      true: styles.interactive,
      false: '',
    },
  },
  defaultVariants: {
    variant: 'bordered',
    interactive: false,
  },
})

export interface CardProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean
}

const CardComponent = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant,
      interactive,
      asChild = false,
      onClick,
      onKeyDown,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'div'

    const isInteractive = !!interactive
    const extraProps: React.HTMLAttributes<HTMLDivElement> = {}

    // Acessibilidade para cards não-polimórficos interativos
    if (isInteractive && !asChild) {
      extraProps.tabIndex = 0
      extraProps.role = props.role || 'button'
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (isInteractive && !asChild && onClick) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onClick(event as unknown as React.MouseEvent<HTMLDivElement>)
        }
      }
      if (onKeyDown) {
        onKeyDown(event)
      }
    }

    return (
      <Comp
        ref={ref}
        className={clsx(cardVariants({ variant, interactive }), className)}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        {...extraProps}
        {...props}
      >
        {children}
      </Comp>
    )
  }
)

CardComponent.displayName = 'Card'

export const Card = withTheme<HTMLDivElement, CardProps>(CardComponent)
```

### 2. `packages/core/src/components/Card/Card.test.tsx`

```tsx
import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { Card } from './Card'
import { ThemeProvider } from '../../themes/ThemeProvider'

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>)
}

describe('Card Component', () => {
  describe('Rendering', () => {
    it('should render children correctly', () => {
      renderWithTheme(<Card>Card Content</Card>)
      expect(screen.getByText('Card Content')).toBeInTheDocument()
    })

    it('should apply the correct classes for variants', () => {
      const { container } = renderWithTheme(
        <Card variant="flat">Flat Card</Card>
      )
      expect(container.firstChild).toHaveClass('flat')
    })
  })

  describe('Interactivity & Accessibility', () => {
    it('should render with role="button" and tabIndex={0} when interactive is true and not asChild', () => {
      renderWithTheme(<Card interactive>Interactive Card</Card>)
      const card = screen.getByRole('button', { name: /interactive card/i })
      expect(card).toBeInTheDocument()
      expect(card).toHaveAttribute('tabindex', '0')
    })

    it('should not render with role="button" or tabIndex when interactive is false', () => {
      renderWithTheme(<Card>Non-interactive Card</Card>)
      const card = screen.getByText('Non-interactive Card')
      expect(card).not.toHaveAttribute('role')
      expect(card).not.toHaveAttribute('tabindex')
    })

    it('should support polymorphism via asChild pattern', () => {
      renderWithTheme(
        <Card asChild interactive>
          <a href="https://example.com">Link Card</a>
        </Card>
      )
      const link = screen.getByRole('link', { name: /link card/i })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', 'https://example.com')
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('should trigger onClick when clicked', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()
      renderWithTheme(
        <Card interactive onClick={handleClick}>
          Clickable
        </Card>
      )
      const card = screen.getByRole('button')
      await user.click(card)
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should trigger onClick on keyboard Enter keydown when interactive', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()
      renderWithTheme(
        <Card interactive onClick={handleClick}>
          Press Enter
        </Card>
      )
      const card = screen.getByRole('button')
      card.focus()
      await user.keyboard('{Enter}')
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should trigger onClick on keyboard Space keydown when interactive', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()
      renderWithTheme(
        <Card interactive onClick={handleClick}>
          Press Space
        </Card>
      )
      const card = screen.getByRole('button')
      card.focus()
      await user.keyboard(' ')
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('Ref Forwarding', () => {
    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      renderWithTheme(<Card ref={ref}>Ref Card</Card>)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })

  describe('A11y Compliance', () => {
    it('should pass accessibility standards without violations', async () => {
      const { container } = renderWithTheme(<Card>A11y Card</Card>)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
```

### 3. `packages/core/src/components/Card/Card.module.scss`

```scss
.card {
  display: block;
  font-family: var(--ds-font-family-sans);
  border-radius: var(--ds-border-radius-lg);
  border: var(--ds-border-width-sm) solid transparent;
  box-sizing: border-box;
  color: var(--ds-color-neutral-900);
  background-color: transparent;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease;

  &:focus-visible {
    outline: 2px solid var(--ds-color-focus-ring);
    outline-offset: 2px;
  }
}

.flat {
  background-color: var(--ds-color-neutral-50);
}

.bordered {
  background-color: var(--ds-color-neutral-0);
  border-color: var(--ds-color-neutral-200);
}

.elevated {
  background-color: var(--ds-color-neutral-0);
  box-shadow: var(--ds-shadow-sm);
}

.interactive {
  cursor: pointer;
  user-select: none;

  &:hover {
    transform: translateY(-2px);
  }

  &.flat:hover {
    background-color: var(--ds-color-neutral-100);
  }

  &.bordered:hover {
    border-color: var(--ds-color-neutral-300);
  }

  &.elevated:hover {
    box-shadow: var(--ds-shadow-md);
  }
}
```

### 4. `packages/core/src/components/Card/index.ts`

```typescript
export { Card, cardVariants } from './Card'
export type { CardProps } from './Card'
```

### 5. `packages/docs/src/stories/Card.stories.tsx`

```tsx
import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Card } from '@rafacdomin/ds-core' // Ou import relativo dependendo da build

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  argTypes: {
    variant: {
      control: 'select',
      options: ['flat', 'bordered', 'elevated'],
    },
    interactive: {
      control: 'boolean',
    },
    asChild: {
      control: 'boolean',
    },
  },
}

export default meta
type Story = StoryObj<typeof Card>

export const Bordered: Story = {
  args: {
    variant: 'bordered',
    children: (
      <div style={{ padding: '24px' }}>
        <h3
          style={{
            margin: '0 0 8px 0',
            fontFamily: 'var(--ds-font-family-heading)',
          }}
        >
          Projeto de Portfólio
        </h3>
        <p style={{ margin: 0, color: 'var(--ds-color-neutral-500)' }}>
          Descrição detalhada deste projeto.
        </p>
      </div>
    ),
  },
}

export const Flat: Story = {
  args: {
    variant: 'flat',
    children: (
      <div style={{ padding: '24px' }}>
        <h3
          style={{
            margin: '0 0 8px 0',
            fontFamily: 'var(--ds-font-family-heading)',
          }}
        >
          Seção Informativa
        </h3>
        <p style={{ margin: 0, color: 'var(--ds-color-neutral-500)' }}>
          Este card usa a variante flat.
        </p>
      </div>
    ),
  },
}

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    children: (
      <div style={{ padding: '24px' }}>
        <h3
          style={{
            margin: '0 0 8px 0',
            fontFamily: 'var(--ds-font-family-heading)',
          }}
        >
          Destaque Especial
        </h3>
        <p style={{ margin: 0, color: 'var(--ds-color-neutral-500)' }}>
          Visual com sombras sutis e elegantes.
        </p>
      </div>
    ),
  },
}

export const Interactive: Story = {
  args: {
    variant: 'elevated',
    interactive: true,
    children: (
      <div style={{ padding: '24px' }}>
        <h3
          style={{
            margin: '0 0 8px 0',
            fontFamily: 'var(--ds-font-family-heading)',
          }}
        >
          Card Interativo
        </h3>
        <p style={{ margin: 0, color: 'var(--ds-color-neutral-500)' }}>
          Passe o mouse ou use Tab para focar e ver as transições.
        </p>
      </div>
    ),
  },
}
```

---

## Decisões Técnicas

1. **Abordagem de Polimorfismo:**
   - Optou-se por utilizar o primitivo `@radix-ui/react-slot` (`Slot`) para suportar a propriedade `asChild`.
   - Isso evita bugs comuns ao recriar dinamicamente tags personalizadas em JSX (como declarar `<Tag>`) e gerencia de forma limpa a passagem de refs e mesclagem de manipuladores de eventos (`onClick`, `onKeyDown`) e classes CSS.
2. **Acessibilidade de Teclado e Estados Interativos:**
   - Se `interactive` for `true` e `asChild` for `false`, o componente injeta `tabIndex={0}` e `role="button"` automaticamente.
   - Manipulamos o evento `onKeyDown` para aceitar `Space` (barra de espaço) e `Enter`, executando a função `onClick`.
   - Se `asChild` for `true`, o elemento filho (ex: `<a>`) já traz seu próprio foco do teclado e semântica padrão, eliminando a necessidade de atributos adicionais que causariam redundância ou erros de validação no Axe.
3. **Estratégia de Estilização (SCSS Modules):**
   - Utilização estrita dos tokens de design através das propriedades customizadas CSS do projeto (`--ds-border-radius-lg`, `--ds-color-neutral-50`, `--ds-color-neutral-0`, etc.).
   - Hover dinâmico integrado por meio da classe `.interactive` que altera transformações (`translateY(-2px)`) e o background/border correspondente de cada variante.
4. **Localização de Storybook Stories:**
   - De acordo com o padrão do monorepo definido em `references/ARCHITECTURE.md` (e observado no codebase), os arquivos de Stories do Storybook devem residir no pacote `@rafacdomin/ds-docs` (`packages/docs/src/stories/Card.stories.tsx`), e não em `packages/core`.

---

## Checklist de Implementação

### Configurações Iniciais e TDD

- [x] 1. Configurar o ambiente para a implementação do componente `Card`.
- [x] 2. Criar o arquivo de testes unitários `packages/core/src/components/Card/Card.test.tsx` com a estrutura inicial de suítes de teste.
- [x] 3. Escrever o teste para renderização correta das `children` e do container base.
- [x] 4. Escrever testes unitários para a validação das classes CSS associadas às variantes `flat`, `bordered` e `elevated`.
- [x] 5. Escrever teste para validação de injetar `role="button"` e `tabIndex={0}` quando `interactive` é `true` e `asChild` é `false`.
- [x] 6. Escrever teste para verificar que `role="button"` e `tabIndex` NÃO são injetados quando `interactive` é `false`.
- [x] 7. Escrever testes unitários validando a ativação pelo teclado (acionar `onClick` ao pressionar as teclas `Enter` e `Space`).
- [x] 8. Escrever teste para o padrão de polimorfismo `asChild` (garantindo que se funde corretamente com uma tag de âncora `<a>` e herda atributos).
- [x] 9. Escrever teste para o correto encaminhamento de `ref` usando `React.forwardRef`.
- [x] 10. Escrever testes de acessibilidade com `jest-axe` validando que a renderização não gera violações no padrão WCAG.
- [x] 11. Executar os testes criados via Vitest e confirmar que todos falham (TDD Red Stage).

### Implementação do Componente

- [x] 12. Criar o arquivo de estilos `packages/core/src/components/Card/Card.module.scss`.
- [x] 13. Definir estilos base usando apenas tokens do sistema (borda, cantos arredondados, fontes, transições).
- [x] 14. Implementar estilos variantes do SCSS (`flat`, `bordered`, `elevated`).
- [x] 15. Adicionar a classe `.interactive` com cursor pointer, hover suave (translateY e elevação) e transição de propriedades.
- [x] 16. Criar o arquivo `packages/core/src/components/Card/Card.tsx`.
- [x] 17. Implementar o componente `Card` utilizando `React.forwardRef` e integrando com o HOC `withTheme`.
- [x] 18. Implementar as validações e injeções de atributos de acessibilidade (`tabIndex`, `role="button"`) e ativação por teclado.
- [x] 19. Criar o arquivo de exportação local `packages/core/src/components/Card/index.ts`.
- [ ] 20. Exportar o componente `Card` no index principal do pacote `packages/core/src/index.ts` (Deixado pendente intencionalmente por instrução do usuário).

### Validação, Storybook e Revisão

- [x] 21. Executar o comando de testes com Vitest e garantir que todos passem com sucesso (TDD Green Stage).
- [x] 22. Criar o arquivo de documentação `packages/docs/src/stories/Card.stories.tsx` para exibição no Storybook.
- [x] 23. Criar histórias de visualização cobrindo todas as variantes (`bordered`, `flat`, `elevated`), modo interativo e teste polimórfico (`asChild` com tag `<a>`).
- [x] 24. Rodar o lint e formatador local (`pnpm lint` e `pnpm format`) para garantir conformidade estrita com as regras do monorepo.
- [x] 25. Rodar o Storybook localmente e testar visualmente nos temas light e dark.
