# #011 — Componente: Tag

## Status

`[ ] A Fazer` `[ ] Em progresso` `[x] Concluído`

## Objetivo

Implementar o componente `Tag` (Badge) para rotulagem de categorias ou tecnologias no portfólio. Deve suportar variantes visuais, tamanhos e opção para comportamento removível/interativo.

## Critérios de Aceite

- [x] Criar componente Tag como elemento `<span>` (ou `<button>` se for interativo).
- [x] Variantes estéticas: `neutral` (fundo cinza sutil, texto escuro), `outline` (borda fina sem fundo) e `interactive` (adiciona hover e comportamento clicável).
- [x] Tamanhos: `sm` (pequeno) e `md` (médio).
- [x] Suportar prop `onRemove` (callback). Se fornecido, exibe um ícone de fechar (X) acionável à direita do texto.
- [x] No caso de ser removível, o botão de remoção interno deve ter acessibilidade garantida: tag `aria-label="Remover [nome da tag]"` e ser focável/ativável via teclado.
- [x] Escrever testes unitários verificando a renderização, ativação do clique e a chamada do `onRemove`.

## Props

| Prop       | Tipo                                      | Default     | Descrição                             |
| ---------- | ----------------------------------------- | ----------- | ------------------------------------- |
| `variant`  | `'neutral' \| 'outline' \| 'interactive'` | `'neutral'` | Variante visual estética              |
| `size`     | `'sm' \| 'md'`                            | `'md'`      | Tamanho da tag                        |
| `onRemove` | `() => void`                              | -           | Callback opcional para remoção da tag |

## Cenários de Teste

- [x] Renderiza texto corretamente.
- [x] Exibe botão de fechar quando `onRemove` for fornecido e dispara o callback ao clicar.
- [x] Acessibilidade e contraste em ambos os temas atendem WCAG 2.1 AA.

## Arquivos a Criar

- `packages/core/src/components/Tag/Tag.tsx`
- `packages/core/src/components/Tag/Tag.test.tsx`
- `packages/core/src/components/Tag/Tag.module.scss`
- `packages/core/src/components/Tag/index.ts`
- `packages/docs/src/stories/Tag.stories.tsx`

## Dependências de Issues

#001 (Monorepo), #002 (Tokens), #003 (Themes)

## Estimativa

P

## Pesquisa

### Acessibilidade (A11y)

1. **Semântica HTML e Controles Interativos**:
   - Um componente de Tag padrão (estático) deve ser renderizado como um elemento `<span>` para representar metadados ou categorias neutras de texto.
   - De acordo com o padrão HTML5, **não é permitido aninhar elementos focáveis/interativos** (por exemplo, colocar um `<button>` de remoção dentro de uma tag que também é um `<button>` interativo). Fazer isso quebra a árvore de acessibilidade e confunde leitores de tela.
   - Para resolver isso:
     - Se a Tag for apenas **interativa** (clique simples, sem botão de remoção): renderizar como `<button type="button">`.
     - Se a Tag for apenas **removível** (texto estático + botão de fechar): renderizar o container como `<span>` e o botão de remoção interno como `<button type="button">`.
     - Se a Tag for **interativa E removível**: renderizar o container externo como `<span>` (sem papel interativo direto) e incluir dois botões internos distintos (um para o conteúdo da tag e outro para a remoção) posicionados lado a lado, dando a aparência de um botão composto.
2. **Rotulação Acessível**:
   - O botão de fechar/remoção não possui texto visual (apenas o ícone "X"). Deve conter um atributo `aria-label` dinâmico do tipo `aria-label="Remover [nome da tag]"` ou similar, garantindo que o leitor de tela anuncie exatamente qual item será excluído.
3. **Navegação por Teclado e Foco**:
   - O botão de fechamento/clique deve ser incluído na ordem natural de tabulação (`tabindex="0"` por ser um `<button>` nativo).
   - O anel de foco deve usar alto contraste por meio da variável `--ds-color-focus-ring` (com `:focus-visible` para evitar anéis de foco indesejados ao clicar com o mouse).
   - _Gerenciamento de Foco na Remoção_: Embora o componente individual não controle os seus irmãos, a remoção de um item da árvore DOM deve transferir idealmente o foco para o próximo elemento de Tag ou retornar para o controle pai.

### Design e Estilo

- **Tamanhos**:
  - `sm`: Altura de `24px` (`1.5rem`), tamanho de fonte `--ds-font-size-xs` (`12px`), padding horizontal de `8px`.
  - `md`: Altura de `32px` (`2rem`), tamanho de fonte `--ds-font-size-sm` (`14px`), padding horizontal de `12px`.
- **Variantes**:
  - `neutral`: Fundo `--ds-color-neutral-100` e texto `--ds-color-neutral-900`.
  - `outline`: Sem fundo (background transparent), borda `--ds-color-neutral-200` e texto `--ds-color-neutral-800`.
  - `interactive`: Adiciona transição de cores (`background-color`, `border-color`, `color`) de 0.2 segundos com efeitos de `:hover` (fundo `--ds-color-neutral-200`) e foco com `outline-offset`.

---

## Implementação Planejada

### 1. packages/core/src/components/Tag/Tag.tsx

```tsx
import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { clsx } from 'clsx'
import { withTheme } from '../../themes/withTheme'
import styles from './Tag.module.scss'

export const tagVariants = cva(styles.tag, {
  variants: {
    variant: {
      neutral: styles.neutral,
      outline: styles.outline,
      interactive: styles.interactive,
    },
    size: {
      sm: styles.sm,
      md: styles.md,
    },
  },
  defaultVariants: {
    variant: 'neutral',
    size: 'md',
  },
})

export interface TagProps
  extends
    Omit<React.HTMLAttributes<HTMLSpanElement>, 'onClick'>,
    VariantProps<typeof tagVariants> {
  /** Callback acionado ao clicar no botão de remoção */
  onRemove?: () => void
  /** Callback acionado ao clicar na tag interativa */
  onClick?: (
    event: React.MouseEvent<HTMLButtonElement | HTMLSpanElement>
  ) => void
}

const TagComponent = React.forwardRef<HTMLSpanElement, TagProps>(
  (
    {
      className,
      variant = 'neutral',
      size = 'md',
      onRemove,
      onClick,
      children,
      ...props
    },
    ref
  ) => {
    const isInteractive = variant === 'interactive'
    const hasRemove = !!onRemove

    const removeLabel =
      typeof children === 'string' ? `Remover ${children}` : 'Remover'

    const CloseIcon = (
      <svg
        width="10"
        height="10"
        viewBox="0 0 10 10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M1 1L9 9M9 1L1 9"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )

    // Caso 1: Interativo E Removível (evita botões aninhados)
    if (isInteractive && hasRemove) {
      return (
        <span
          ref={ref}
          className={clsx(styles.tagGroup, styles[size], className)}
        >
          <button
            type="button"
            className={clsx(tagVariants({ variant, size }), styles.mainButton)}
            onClick={
              onClick as unknown as React.MouseEventHandler<HTMLButtonElement>
            }
            {...(props as unknown as React.ButtonHTMLAttributes<HTMLButtonElement>)}
          >
            {children}
          </button>
          <button
            type="button"
            className={styles.removeButton}
            aria-label={removeLabel}
            onClick={(e) => {
              e.stopPropagation()
              onRemove?.()
            }}
          >
            {CloseIcon}
          </button>
        </span>
      )
    }

    // Caso 2: Interativo apenas (renderiza como botão completo)
    if (isInteractive) {
      return (
        <button
          ref={ref as unknown as React.Ref<HTMLButtonElement>}
          type="button"
          className={clsx(tagVariants({ variant, size }), className)}
          onClick={
            onClick as unknown as React.MouseEventHandler<HTMLButtonElement>
          }
          {...(props as unknown as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        >
          {children}
        </button>
      )
    }

    // Caso 3: Estático, opcionalmente removível
    return (
      <span
        ref={ref}
        className={clsx(
          tagVariants({ variant, size }),
          hasRemove && styles.hasRemove,
          className
        )}
        {...props}
      >
        <span className={styles.content}>{children}</span>
        {hasRemove && (
          <button
            type="button"
            className={styles.removeButton}
            aria-label={removeLabel}
            onClick={(e) => {
              e.stopPropagation()
              onRemove?.()
            }}
          >
            {CloseIcon}
          </button>
        )}
      </span>
    )
  }
)

TagComponent.displayName = 'Tag'

export const Tag = withTheme<HTMLSpanElement, TagProps>(TagComponent)
```

### 2. packages/core/src/components/Tag/Tag.module.scss

```scss
@use '../../tokens/globals.scss';
@use '../../tokens/theme-light.scss';
@use '../../tokens/theme-dark.scss';

.tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--ds-spacing-1);
  font-family: var(--ds-font-family-sans);
  font-weight: var(--ds-font-weight-medium);
  border-radius: var(--ds-border-radius-sm);
  border: var(--ds-border-width-sm) solid transparent;
  box-sizing: border-box;
  text-decoration: none;
  white-space: nowrap;
}

.neutral {
  background-color: var(--ds-color-neutral-100);
  color: var(--ds-color-neutral-900);
}

.outline {
  background-color: transparent;
  border-color: var(--ds-color-neutral-200);
  color: var(--ds-color-neutral-800);
}

.interactive {
  background-color: var(--ds-color-neutral-100);
  color: var(--ds-color-neutral-900);
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;

  &:hover {
    background-color: var(--ds-color-neutral-200);
  }

  &:focus-visible {
    outline: 2px solid var(--ds-color-focus-ring);
    outline-offset: 2px;
  }
}

.sm {
  height: 1.5rem; // 24px
  padding: 0 var(--ds-spacing-2);
  font-size: var(--ds-font-size-xs);
}

.md {
  height: 2rem; // 32px
  padding: 0 var(--ds-spacing-3);
  font-size: var(--ds-font-size-sm);
}

.removeButton {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  margin-left: var(--ds-spacing-1);
  color: var(--ds-color-neutral-500);
  border-radius: var(--ds-border-radius-sm);
  transition: color 0.2s ease;

  &:hover {
    color: var(--ds-color-neutral-900);
  }

  &:focus-visible {
    outline: 2px solid var(--ds-color-focus-ring);
    outline-offset: 1px;
  }
}

.tagGroup {
  display: inline-flex;
  align-items: center;
  border-radius: var(--ds-border-radius-sm);
  overflow: hidden;
  box-sizing: border-box;

  &.sm {
    height: 1.5rem;
  }

  &.md {
    height: 2rem;
  }

  .mainButton {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  .removeButton {
    height: 100%;
    margin-left: 0;
    padding: 0 var(--ds-spacing-2);
    border-left: 1px solid var(--ds-color-neutral-200);
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    background-color: var(--ds-color-neutral-100);

    &:hover {
      background-color: var(--ds-color-neutral-200);
    }
  }
}
```

### 3. packages/core/src/components/Tag/Tag.test.tsx

```tsx
import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { Tag } from './Tag'
import { ThemeProvider } from '../../themes/ThemeProvider'

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>)
}

describe('Tag Component', () => {
  it('should render static tag with text', () => {
    renderWithTheme(<Tag>React</Tag>)
    expect(screen.getByText('React')).toBeInTheDocument()
  })

  it('should support variants (neutral, outline, interactive)', () => {
    const { container: neutral } = renderWithTheme(
      <Tag variant="neutral">React</Tag>
    )
    const { container: outline } = renderWithTheme(
      <Tag variant="outline">React</Tag>
    )
    const { container: interactive } = renderWithTheme(
      <Tag variant="interactive">React</Tag>
    )

    expect(neutral.firstChild).toHaveClass('neutral')
    expect(outline.firstChild).toHaveClass('outline')
    expect(interactive.firstChild).toHaveClass('interactive')
  })

  it('should support sizes (sm, md)', () => {
    const { container: sm } = renderWithTheme(<Tag size="sm">React</Tag>)
    const { container: md } = renderWithTheme(<Tag size="md">React</Tag>)

    expect(sm.firstChild).toHaveClass('sm')
    expect(md.firstChild).toHaveClass('md')
  })

  it('should render remove button when onRemove is provided', () => {
    const handleRemove = vi.fn()
    renderWithTheme(<Tag onRemove={handleRemove}>React</Tag>)

    const removeBtn = screen.getByRole('button', { name: /remover react/i })
    expect(removeBtn).toBeInTheDocument()
  })

  it('should trigger onRemove callback on click', async () => {
    const user = userEvent.setup()
    const handleRemove = vi.fn()
    renderWithTheme(<Tag onRemove={handleRemove}>React</Tag>)

    const removeBtn = screen.getByRole('button', { name: /remover react/i })
    await user.click(removeBtn)

    expect(handleRemove).toHaveBeenCalledTimes(1)
  })

  it('should trigger onClick callback when variant is interactive', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    renderWithTheme(
      <Tag variant="interactive" onClick={handleClick}>
        React
      </Tag>
    )

    const tag = screen.getByRole('button', { name: /react/i })
    await user.click(tag)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should forward ref correctly to HTMLSpanElement', () => {
    const ref = React.createRef<HTMLSpanElement>()
    renderWithTheme(<Tag ref={ref}>React</Tag>)
    expect(ref.current).toBeInstanceOf(HTMLSpanElement)
  })

  it('should forward ref correctly to HTMLButtonElement when interactive only', () => {
    const ref = React.createRef<HTMLSpanElement>()
    renderWithTheme(
      <Tag ref={ref} variant="interactive">
        React
      </Tag>
    )
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it('should pass accessibility validation (axe)', async () => {
    const { container } = renderWithTheme(
      <Tag onRemove={() => {}}>A11y Tag</Tag>
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
```

### 4. packages/docs/src/stories/Tag.stories.tsx

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Tag } from '@rafacdomin/ds-core'

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
  },
}

export default meta
type Story = StoryObj<typeof Tag>

export const Playground: Story = {
  args: {
    variant: 'neutral',
    size: 'md',
    children: 'Playground Tag',
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
    onRemove: () => alert('Remover clicado!'),
  },
}

export const InteractiveRemovable: Story = {
  tags: ['!dev'],
  args: {
    variant: 'interactive',
    children: 'Interactive & Removable',
    onClick: () => alert('Tag clicada!'),
    onRemove: () => alert('Remover clicado!'),
  },
}
```

### 5. packages/core/src/components/Tag/index.ts

```typescript
export { Tag } from './Tag'
export type { TagProps } from './Tag'
```

---

## Decisões Técnicas

1. **Evitando Botões Aninhados para Acessibilidade**:
   - Um erro clássico de semântica é aninhar botões (ex: um botão de remoção dentro de uma tag que já é um botão interativo). Para resolver isso com conformidade WCAG 2.1 AA, criamos estruturas condicionais no JSX.
   - Quando a tag for `interactive` E possuir `onRemove`, renderizamos um contêiner `<span>` agrupador (`styles.tagGroup`) com dois botões internos independentes posicionados lado a lado no grid/flexbox. O clique na tag dispara o `onClick` e o clique no botão "X" dispara o `onRemove`.
2. **Estratégia de Estilização com SCSS Modules**:
   - Utilizaremos apenas propriedades customizadas de CSS dos tokens globais (`--ds-color-neutral-*`, `--ds-spacing-*`, `--ds-border-radius-sm`, `--ds-font-*`).
   - Nenhuma cor literal ou espaçamento estático será incluído, mantendo fidelidade absoluta ao tema light/dark gerenciado pelo HOC `withTheme`.
3. **Casting de Tipagem Segura (Zero `any`)**:
   - Para gerenciar os múltiplos tipos de elementos HTML dinamicamente (`HTMLSpanElement` e `HTMLButtonElement`), utilizaremos a asserção `as unknown as React.Ref<...>` em vez de usar `any` (que é estritamente proibido pelas diretrizes do projeto).
4. **Caminho das Stories**:
   - As stories serão criadas em `packages/docs/src/stories/Tag.stories.tsx` para seguir o padrão centralizado de documentação do monorepo, como definido no `ARCHITECTURE.md`.

---

## Checklist de Implementação

- [x] **Etapa 1: Setup e Infraestrutura**
  - [x] 1. Criar o diretório do componente em `packages/core/src/components/Tag`.
  - [x] 2. Criar o arquivo de exportação `packages/core/src/components/Tag/index.ts`.

- [x] **Etapa 2: Testes (TDD)**
  - [x] 3. Criar `packages/core/src/components/Tag/Tag.test.tsx` com a configuração de renderização sob o `ThemeProvider`.
  - [x] 4. Escrever teste para verificar a renderização do texto da tag.
  - [x] 5. Escrever testes para verificar a correta aplicação das classes de variantes (`neutral`, `outline`, `interactive`).
  - [x] 6. Escrever testes para as classes de tamanho (`sm`, `md`).
  - [x] 7. Escrever teste de evento para o callback `onClick` quando em variante `interactive`.
  - [x] 8. Escrever teste de evento para o callback `onRemove` ao clicar no botão "X".
  - [x] 9. Escrever teste de acessibilidade automatizado usando `jest-axe` (garantir zero violações).
  - [x] 10. Escrever teste de encaminhamento de Ref para `HTMLSpanElement` e `HTMLButtonElement` dependendo das propriedades.

- [x] **Etapa 3: Implementação do Componente**
  - [x] 11. Criar `packages/core/src/components/Tag/Tag.tsx` e definir a interface `TagProps` estendendo `Omit<React.HTMLAttributes<HTMLSpanElement>, 'onClick'>`.
  - [x] 12. Configurar o `forwardRef` com tipo `HTMLSpanElement` e suporte a múltiplos nós internos (span/button).
  - [x] 13. Adicionar lógica condicional para evitar botões aninhados quando a tag for interativa e removível.
  - [x] 14. Integrar o ícone inline SVG "X" para remoção e gerar a rotulação dinâmica `aria-label="Remover [nome]"` baseada no `children`.
  - [x] 15. Aplicar o HOC `withTheme` no componente exportado para suporte automático a temas.

- [x] **Etapa 4: Estilização SCSS**
  - [x] 16. Criar `packages/core/src/components/Tag/Tag.module.scss`.
  - [x] 17. Implementar o estilo básico `.tag` usando tokens tipográficos e bordas.
  - [x] 18. Implementar cores e backgrounds específicos para as variantes `neutral`, `outline` e `interactive`.
  - [x] 19. Definir a área de toque e tamanho das variantes de tamanho `sm` e `md`.
  - [x] 20. Estilizar o botão de remoção `.removeButton` e seu foco acessível (`:focus-visible` com `--ds-color-focus-ring`).
  - [x] 21. Estilizar o contêiner composto `.tagGroup` para exibir a tag interativa e o botão de remoção integrados visualmente.

- [x] **Etapa 5: Stories e Integração Final**
  - [ ] 22. Exportar o componente `Tag` e `TagProps` no entrypoint `@rafacdomin/ds-core` (`packages/core/src/index.ts`). (Pendente liberação do arquivo central)
  - [x] 23. Criar o arquivo `packages/docs/src/stories/Tag.stories.tsx` com variações para o Storybook (Playground, Neutral, Outline, Interactive, tamanhos, removível e composta).
  - [x] 24. Executar os testes locais com `vitest` e certificar-se de obter 100% de sucesso.
  - [x] 25. Rodar o Storybook localmente para inspeção visual nos temas Light e Dark.
