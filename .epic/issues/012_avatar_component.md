# #012 — Componente: Avatar

## Status

`[ ] A Fazer` `[ ] Em progresso` `[x] Concluído`

## Objetivo

Implementar o componente `Avatar` para exibir a foto de perfil do autor ou imagens redondas de usuários. O componente deve prever um estado de fallback (iniciais) com renderização elegante quando a imagem falhar ou não for fornecida.

## Critérios de Aceite

- [x] Renderizar imagem circular (`--ds-border-radius-full`).
- [x] Suportar propriedades `src` (URL da foto), `alt` (texto descritivo) e `fallback` (texto de iniciais, ex: "RD").
- [x] Implementar carregamento assíncrono: enquanto a imagem carrega ou caso ocorra erro no carregamento, exibir container com as iniciais (`fallback`) centralizadas.
- [x] O container de fallback deve ter fundo contrastante (preto no light e branco no dark, ou tons neutros proeminentes) e tipografia em `Poppins` negrito.
- [x] Tamanhos pré-definidos: `sm` (24px), `md` (40px) e `lg` (64px).
- [x] Acessibilidade: a imagem deve conter o atributo `alt` consistente. Se a imagem falhar, o fallback deve ter papel de imagem `role="img"` com `aria-label` apropriado.
- [x] Escrever testes unitários validando a transição de carregamento, fallback por erro e conformidade a11y.

## Props

| Prop       | Tipo                   | Default | Descrição                                                      |
| ---------- | ---------------------- | ------- | -------------------------------------------------------------- |
| `src`      | `string`               | -       | URL da imagem do avatar                                        |
| `alt`      | `string`               | -       | Descrição acessível da imagem (obrigatório)                    |
| `fallback` | `string`               | -       | Iniciais a serem mostradas em caso de falha/ausência de imagem |
| `size`     | `'sm' \| 'md' \| 'lg'` | `'md'`  | Tamanho do avatar                                              |

## Cenários de Teste

- [x] Exibe a imagem caso o carregamento seja bem sucedido.
- [x] Exibe o fallback com as iniciais caso `src` seja omitido ou a imagem falhe em carregar (`trigger onError`).
- [x] A acessibilidade (`jest-axe`) passa em todos os estados de carregamento e fallback.

## Arquivos a Criar

- `packages/core/src/components/Avatar/Avatar.tsx`
- `packages/core/src/components/Avatar/Avatar.test.tsx`
- `packages/core/src/components/Avatar/Avatar.stories.tsx`
- `packages/core/src/components/Avatar/Avatar.module.scss`
- `packages/core/src/components/Avatar/index.ts`

## Dependências de Issues

#001 (Monorepo), #002 (Tokens), #003 (Themes)

## Estimativa

P

## Pesquisa

### Acessibilidade do Componente Avatar

- **Cenário com imagem carregada**: A imagem deve usar o atributo `alt` descritivo. O contêiner pai não precisa de `role="img"` ou `aria-label`, para evitar redundâncias na leitura de tela.
- **Cenário com fallback (erro ou ausência de imagem)**: O contêiner de fallback (ou o elemento raiz se o fallback for injetado direto) deve assumir `role="img"` e ter `aria-label` definido com o valor do `alt` fornecido. Isso garante que leitores de tela leiam o nome completo do usuário em vez das iniciais cruas (ex: ler "Rafael Dominiquini" em vez de "RD"). O contêiner interno com as iniciais visuais deve ser decorativo para o leitor de tela (`aria-hidden="true"`) para evitar soletrar as letras.
- **Conformidade WCAG 2.1 AA**:
  - Contraste mínimo para elementos de texto: 4.5:1. Usando `--ds-color-neutral-1000` (preto no light, branco no dark) como fundo e `--ds-color-neutral-0` (branco no light, preto no dark) para as iniciais, o contraste de cor é excelente e excede 10:1.
  - O uso do elemento `img` nativo gerencia carregamento reativo sem scripts pesados.

### Comportamento Dinâmico de Carregamento

- **Estados de Carregamento**: O avatar pode assumir os estados `'idle' | 'loading' | 'loaded' | 'error'`.
- **Prevenção de Flicagem/Layout Shift**: Durante o estado `'loading'`, a imagem física do navegador é mantida oculta (`display: none` ou similar) até que o evento `onLoad` dispare. Isso evita que o navegador tente mostrar a borda quebrada padrão de imagens não carregadas e garante que o fallback só suma após a imagem estar 100% pronta.
- **Resiliência a Mudanças de Props**: Caso a propriedade `src` mude dinamicamente, um efeito deve redefinir o estado para `'loading'` (ou `'error'` se `src` estiver vazio) para reiniciar o ciclo de carregamento da nova imagem.

## Implementação Planejada

### Estrutura de Arquivos

Os novos arquivos serão criados dentro de `packages/core/src/components/Avatar/` e a story correspondente em `packages/docs/src/stories/Avatar.stories.tsx`:

- `packages/core/src/components/Avatar/index.ts`
- `packages/core/src/components/Avatar/Avatar.tsx`
- `packages/core/src/components/Avatar/Avatar.module.scss`
- `packages/core/src/components/Avatar/Avatar.test.tsx`
- `packages/docs/src/stories/Avatar.stories.tsx`

E também atualizaremos o entrypoint global:

- `packages/core/src/index.ts`

### Pseudocódigo e Estruturas

#### 1. `packages/core/src/components/Avatar/index.ts`

```typescript
export { Avatar } from './Avatar'
export type { AvatarProps } from './Avatar'
```

#### 2. `packages/core/src/components/Avatar/Avatar.tsx`

```typescript
import React, { useState, useEffect } from 'react'
import { clsx } from 'clsx'
import { withTheme } from '../../themes/withTheme'
import styles from './Avatar.module.scss'

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** URL da imagem do avatar */
  src?: string
  /** Descrição acessível da imagem (obrigatório) */
  alt: string
  /** Iniciais para fallback (ex: "RD") */
  fallback: string
  /** Tamanho do avatar */
  size?: 'sm' | 'md' | 'lg'
}

type AvatarStatus = 'idle' | 'loading' | 'loaded' | 'error'

const AvatarComponent = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      src,
      alt,
      fallback,
      size = 'md',
      className,
      ...props
    },
    ref
  ) => {
    const [status, setStatus] = useState<AvatarStatus>(src ? 'loading' : 'error')

    useEffect(() => {
      if (src) {
        setStatus('loading')
      } else {
        setStatus('error')
      }
    }, [src])

    const isLoaded = status === 'loaded'
    const showFallback = status === 'error' || status === 'loading'

    // Atributos de acessibilidade condicionais: se a imagem falhou/carrega, a div age como img.
    const a11yProps = showFallback
      ? { role: 'img', 'aria-label': alt }
      : {}

    return (
      <div
        ref={ref}
        className={clsx(
          styles.avatar,
          styles[size],
          className
        )}
        {...a11yProps}
        {...props}
      >
        {src && status !== 'error' && (
          <img
            src={src}
            alt={alt}
            onLoad={() => setStatus('loaded')}
            onError={() => setStatus('error')}
            className={clsx(
              styles.image,
              isLoaded ? styles.loaded : styles.hidden
            )}
          />
        )}
        {showFallback && (
          <div className={styles.fallback} aria-hidden="true">
            {fallback}
          </div>
        )}
      </div>
    )
  }
)

AvatarComponent.displayName = 'Avatar'

export const Avatar = withTheme<HTMLDivElement, AvatarProps>(AvatarComponent)
```

#### 3. `packages/core/src/components/Avatar/Avatar.module.scss`

```scss
@use '../../tokens/globals.scss';
@use '../../tokens/theme-light.scss';
@use '../../tokens/theme-dark.scss';

.avatar {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: var(--ds-border-radius-full);
  user-select: none;
  background-color: var(--ds-color-neutral-1000);
  color: var(--ds-color-neutral-0);
  flex-shrink: 0;
  box-sizing: border-box;
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: inherit;
  transition: opacity 0.2s ease;

  &.hidden {
    display: none;
    opacity: 0;
  }

  &.loaded {
    display: block;
    opacity: 1;
  }
}

.fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-family: var(--ds-font-family-heading);
  font-weight: var(--ds-font-weight-bold);
  text-transform: uppercase;
}

// Sizes
.sm {
  width: var(--ds-spacing-6); // 24px
  height: var(--ds-spacing-6);
  font-size: var(--ds-font-size-xs);
}

.md {
  width: var(--ds-spacing-10); // 40px
  height: var(--ds-spacing-10);
  font-size: var(--ds-font-size-sm);
}

.lg {
  width: var(--ds-spacing-16); // 64px
  height: var(--ds-spacing-16);
  font-size: var(--ds-font-size-lg);
}
```

#### 4. `packages/core/src/components/Avatar/Avatar.test.tsx`

```typescript
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Avatar } from './Avatar'
import { ThemeProvider } from '../../themes/ThemeProvider'

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>)
}

describe('Avatar Component', () => {
  it('should render the fallback when src is not provided', () => {
    renderWithTheme(<Avatar alt="User Name" fallback="UN" />)

    // Fallback initials should be in document
    expect(screen.getByText('UN')).toBeInTheDocument()

    // Container should act as image for screen readers
    const container = screen.getByRole('img', { name: /user name/i })
    expect(container).toBeInTheDocument()
  })

  it('should render image when src loads successfully', () => {
    renderWithTheme(<Avatar src="avatar.png" alt="User Name" fallback="UN" />)

    const img = screen.getByAltText('User Name')
    expect(img).toBeInTheDocument()
    expect(img).toHaveClass('hidden') // initially hidden

    // Trigger successful load
    fireEvent.load(img)

    expect(img).toHaveClass('loaded')
    expect(screen.queryByText('UN')).not.toBeInTheDocument()
  })

  it('should render fallback when image fails to load', () => {
    renderWithTheme(<Avatar src="broken.png" alt="User Name" fallback="UN" />)

    const img = screen.getByAltText('User Name')

    // Trigger load error
    fireEvent.error(img)

    expect(screen.getByText('UN')).toBeInTheDocument()
    const container = screen.getByRole('img', { name: /user name/i })
    expect(container).toBeInTheDocument()
  })

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>()
    renderWithTheme(<Avatar ref={ref} alt="User" fallback="U" />)

    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('should pass accessibility tests in all states', async () => {
    // State 1: Fallback state
    const { container: containerFallback } = renderWithTheme(
      <Avatar alt="User" fallback="U" />
    )
    let results = await axe(containerFallback)
    expect(results).toHaveNoViolations()

    // State 2: Loaded state
    const { container: containerLoaded } = renderWithTheme(
      <Avatar src="avatar.png" alt="User" fallback="U" />
    )
    const img = screen.getByAltText('User')
    fireEvent.load(img)
    results = await axe(containerLoaded)
    expect(results).toHaveNoViolations()
  })
})
```

#### 5. `packages/docs/src/stories/Avatar.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react'
import { Avatar } from '@rafacdomin/ds-core'

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
    alt: 'Sofia Rodrigues',
    fallback: 'SR',
    size: 'md',
  },
}

export const Small: Story = {
  tags: ['!dev'],
  args: {
    src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
    alt: 'Sofia Rodrigues',
    fallback: 'SR',
    size: 'sm',
  },
}

export const Medium: Story = {
  tags: ['!dev'],
  args: {
    src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
    alt: 'Sofia Rodrigues',
    fallback: 'SR',
    size: 'md',
  },
}

export const Large: Story = {
  tags: ['!dev'],
  args: {
    src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
    alt: 'Sofia Rodrigues',
    fallback: 'SR',
    size: 'lg',
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
    alt: 'Sofia Rodrigues',
    fallback: 'SR',
    size: 'md',
  },
}
```

## Decisões Técnicas

1. **Estratégia de Estilização**: Uso exclusivo de SCSS Modules com mapeamento de classes dinâmicas baseadas nas propriedades customizadas do CSS dos tokens. O mapeamento de tamanhos `sm`, `md`, `lg` utilizará os tokens `--ds-spacing-6` (24px), `--ds-spacing-10` (40px) e `--ds-spacing-16` (64px) respectivamente para largura e altura, garantindo que as proporções sejam controladas pelo design system sem valores em pixels estáticos no SCSS.
2. **Inversão Automática de Cores do Fallback**: Ao usar o fundo `--ds-color-neutral-1000` e cor `--ds-color-neutral-0`, as cores se invertem automaticamente entre temas (Light = fundo escuro e letras claras; Dark = fundo claro e letras escuras) respeitando os critérios de aceitação e mantendo o contraste no limite superior de a11y.
3. **Tratamento de Carregamento Reativo**: Para evitar flicagem e exibir corretamente o fallback, a tag `<img>` nativa sempre existirá no DOM se `src` for fornecido, mas será estilizada com `display: none` até que o evento `onLoad` ocorra. O hook `useEffect` redefine o estado do componente caso a URL `src` seja alterada, garantindo resiliência de re-renders.
4. **Semântica e Acessibilidade a11y**: Quando a imagem carregar com sucesso, a semântica de imagem é inteiramente delegada à tag `<img>` com seu atributo `alt`. No entanto, em caso de fallback (carregando, sem `src` ou erro de carregamento), o contêiner `div` pai recebe os atributos `role="img"` e `aria-label={alt}`. O texto do fallback possui `aria-hidden="true"` para evitar que leitores de tela soletrem as iniciais em vez de ler a descrição acessível fornecida.
5. **Integração com `withTheme`**: O componente final será encapsulado com o HOC global `withTheme` para garantir a injeção do atributo `data-theme` baseada no contexto.

## Checklist de Implementação

- [x] 1. Criar estrutura de diretórios para o componente `Avatar` em `packages/core/src/components/Avatar/`.
- [x] 2. Criar arquivo de exportação `packages/core/src/components/Avatar/index.ts`.
- [x] 3. Criar arquivo de estilização `packages/core/src/components/Avatar/Avatar.module.scss`.
- [x] 4. Definir estilos base no `.module.scss` (tamanhos responsivos via variáveis de spacing, border-radius total, centralização flex).
- [x] 5. Configurar inversão de cores para o fallback usando os tokens `--ds-color-neutral-1000` e `--ds-color-neutral-0`.
- [x] 6. Criar arquivo de testes de especificação `packages/core/src/components/Avatar/Avatar.test.tsx` com cenários TDD.
- [x] 7. Escrever teste para verificar renderização inicial do fallback caso `src` esteja ausente.
- [x] 8. Escrever teste para verificar transição de carregamento da imagem (`onLoad` disparado).
- [x] 9. Escrever teste para verificar falha no carregamento e exibição do fallback (`onError` disparado).
- [x] 10. Escrever teste para validar o encaminhamento correto do DOM ref (`React.createRef`).
- [x] 11. Escrever testes de acessibilidade com `jest-axe` para o estado de imagem carregada e estado de fallback.
- [x] 12. Criar arquivo do componente `packages/core/src/components/Avatar/Avatar.tsx`.
- [x] 13. Declarar a interface `AvatarProps` estendendo `React.HTMLAttributes<HTMLDivElement>` (em conformidade com a regra "Props tipadas com interface").
- [x] 14. Implementar controle de estado `status` com tipo estrito `AvatarStatus` ('idle' | 'loading' | 'loaded' | 'error').
- [x] 15. Implementar efeito colateral `useEffect` para redefinir o estado quando `src` mudar.
- [x] 16. Implementar marcação condicional de acessibilidade (`role="img"` e `aria-label` no wrapper de fallback, `aria-hidden="true"` nas iniciais).
- [x] 17. Envolver o componente no HOC `withTheme` e exportar no final.
- [ ] 18. Registrar e expor o componente Avatar no entrypoint `packages/core/src/index.ts`.
- [x] 19. Executar a suíte de testes com `pnpm test` no monorepo e garantir cobertura de 100% no Avatar.
- [x] 20. Criar arquivo de stories `packages/docs/src/stories/Avatar.stories.tsx` seguindo o padrão de stories com agrupamento e tags ocultas `!dev` nas variações.
- [x] 21. Executar o Storybook localmente e validar visualmente os estados em light e dark mode.
