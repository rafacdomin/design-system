# #009 — Componente: Modal (Dialog)

## Status

`[ ] A Fazer` `[ ] Em progresso` `[x] Concluído`

## Objetivo

Implementar o componente `Modal` encapsulando os primitivos do `@radix-ui/react-dialog`. O modal deve fornecer um contêiner flutuante com fundo escurecido (overlay), foco retido (focus trapping) e fechamento por atalhos de teclado (Escape) de forma totalmente acessível.

## Critérios de Aceite

- [x] Implementar estrutura do modal utilizando `@radix-ui/react-dialog` (Root, Trigger, Portal, Overlay, Content, Title, Description, Close).
- [x] Aplicar estilo monocromático: overlay escuro translúcido, caixa de diálogo com fundo plano (`--ds-color-neutral-0`), bordas com raio `--ds-border-radius-lg`.
- [x] Fornecer botão visual claro no canto superior direito do modal para fechamento (ícone "X" com `aria-label="Fechar"`).
- [x] Suportar tamanhos pré-definidos: `sm` (estreito), `md` (padrão) e `lg` (largo).
- [x] Garantir o focus trap automático (o foco não pode sair do modal via `Tab` enquanto aberto) e fechar o modal ao pressionar `Escape` ou clicar fora do conteúdo.
- [x] Garantir o retorno do foco do teclado para o elemento gatilho após o fechamento.
- [x] Escrever testes RTL verificando a exibição/ocultação ao interagir com o gatilho/fechar, além de testes a11y via `jest-axe`.

## Props

| Prop           | Tipo                      | Default | Descrição                                                                       |
| -------------- | ------------------------- | ------- | ------------------------------------------------------------------------------- |
| `open`         | `boolean`                 | -       | Controle manual de abertura (modo controlado)                                   |
| `onOpenChange` | `(open: boolean) => void` | -       | Callback invocado na alteração do estado de abertura                            |
| `title`        | `string`                  | -       | Título textual do modal (obrigatório para fins de semântica e leitores de tela) |
| `description`  | `string`                  | -       | Descrição auxiliar do modal                                                     |
| `trigger`      | `React.ReactNode`         | -       | Elemento clicável que dispara a abertura do modal                               |
| `size`         | `'sm' \| 'md' \| 'lg'`    | `'md'`  | Largura do modal                                                                |
| `children`     | `React.ReactNode`         | -       | Conteúdo interno da janela do modal                                             |

## Cenários de Teste

- [x] O modal não deve estar visível no DOM inicialmente (se `defaultOpen` for false).
- [x] Interagir com o gatilho renderiza o modal e seu conteúdo no DOM.
- [x] Pressionar `Escape` ou clicar no botão fechar remove o modal do DOM.
- [x] Foco é retido dentro do modal ao navegar por `Tab`.
- [x] Livre de erros de acessibilidade (`jest-axe`).

## Arquivos a Criar

- `packages/core/src/components/Modal/Modal.tsx`
- `packages/core/src/components/Modal/Modal.test.tsx`
- `packages/docs/src/stories/Modal.stories.tsx` _(Nota: Embora o arquivo original sugira criar sob core, o Storybook do projeto busca histórias sob docs, mantendo a convenção dos outros componentes)_
- `packages/core/src/components/Modal/Modal.module.scss`
- `packages/core/src/components/Modal/index.ts`

## Dependências Externas

- `@radix-ui/react-dialog`

## Dependências de Issues

#001 (Monorepo), #002 (Tokens), #003 (Themes)

## Estimativa

M

## Pesquisa

### Radix UI Dialog Component

O Radix UI Dialog (`@radix-ui/react-dialog`) fornece uma base robusta e acessível para a criação de janelas modais sobrepostas:

- **Dialog.Root**: Gerencia o estado de abertura (aberto/fechado) do modal, seja ele controlado (`open`, `onOpenChange`) ou não controlado (`defaultOpen`).
- **Dialog.Trigger**: O botão de gatilho que abre o modal. Usado geralmente com `asChild` para repassar propriedades ao componente filho sem acrescentar nós HTML extras.
- **Dialog.Portal**: Renderiza o modal (Overlay e Content) em um portal fora da árvore principal do React (anexado ao `body`). Isso evita problemas de overflow de contêineres pais (`overflow: hidden` ou z-index).
- **Dialog.Overlay**: A camada de fundo escurecida (backdrop). Importante para focar a atenção do usuário no modal e bloquear cliques na página.
- **Dialog.Content**: O contêiner da caixa de diálogo flutuante. Lida com o focus trap e fechamento automático.
- **Dialog.Title**: Componente de título exigido por motivos de acessibilidade (leitor de tela).
- **Dialog.Description**: Descrição acessível recomendada para fornecer contexto adicional.
- **Dialog.Close**: O botão/área de clique usada para fechar o modal.

### Padrão de Acessibilidade WAI-ARIA Dialog

O Modal deve atingir a conformidade com as diretrizes **WCAG 2.1 AA**:

1. **Focus Trap:** Quando o modal é aberto, o foco deve ser capturado e retido dentro do `Dialog.Content`. O usuário não pode focar em elementos externos usando `Tab`.
2. **Retorno de Foco:** Ao fechar o modal, o foco do teclado deve retornar exatamente para o gatilho (`Dialog.Trigger`).
3. **Fechamento Fácil:** O modal deve fechar ao pressionar a tecla `Escape` ou clicar no `Dialog.Overlay` (fora do conteúdo).
4. **Semântica:** O contêiner de conteúdo recebe automaticamente `role="dialog"` e `aria-modal="true"`.
5. **Labels Acessíveis:** O conteúdo deve ser associado ao título (`Dialog.Title`) por meio de `aria-labelledby` e à descrição por `aria-describedby` (o Radix cuida disso internamente se esses subcomponentes forem renderizados).
6. **Botão de Fechar:** O botão visual de fechar (representado por um ícone "X") precisa de um atributo `aria-label="Fechar"`.

---

## Implementação Planejada

### Proposta de Código: `packages/core/src/components/Modal/Modal.tsx`

```typescript
import React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { clsx } from 'clsx'
import { withTheme } from '../../themes/withTheme'
import { useTheme } from '../../themes/useTheme'
import styles from './Modal.module.scss'

export interface ModalProps {
  /** Controle manual de abertura (modo controlado) */
  open?: boolean
  /** Estado padrão de abertura (modo não controlado) */
  defaultOpen?: boolean
  /** Callback invocado na alteração do estado de abertura */
  onOpenChange?: (open: boolean) => void
  /** Título textual do modal (obrigatório para fins de semântica e acessibilidade) */
  title?: string
  /** Descrição auxiliar do modal */
  description?: string
  /** Elemento clicável que dispara a abertura do modal */
  trigger?: React.ReactNode
  /** Tamanho da largura do modal */
  size?: 'sm' | 'md' | 'lg'
  /** Conteúdo interno da janela do modal */
  children: React.ReactNode
}

export interface ModalTriggerProps {
  children: React.ReactNode
  asChild?: boolean
}

export interface ModalCloseProps {
  children: React.ReactNode
  asChild?: boolean
}

export interface ModalContentProps {
  title: string
  description?: string
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  className?: string
}

// Subcomponentes para Padrão Compound
const ModalTriggerComponent: React.FC<ModalTriggerProps> = ({ children, asChild = true, ...props }) => {
  return (
    <Dialog.Trigger asChild={asChild} {...props}>
      {children}
    </Dialog.Trigger>
  )
}
ModalTriggerComponent.displayName = 'Modal.Trigger'

const ModalCloseComponent: React.FC<ModalCloseProps> = ({ children, asChild = true, ...props }) => {
  return (
    <Dialog.Close asChild={asChild} {...props}>
      {children}
    </Dialog.Close>
  )
}
ModalCloseComponent.displayName = 'Modal.Close'

const ModalContentComponent = React.forwardRef<HTMLDivElement, ModalContentProps>(
  ({ title, description, size = 'md', children, className, ...props }, ref) => {
    const { theme } = useTheme()
    return (
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} data-theme={theme} />
        <Dialog.Content
          ref={ref}
          className={clsx(styles.content, styles[size], className)}
          data-theme={theme}
          {...props}
        >
          <div className={styles.header}>
            <Dialog.Title className={styles.title}>{title}</Dialog.Title>
            {description && (
              <Dialog.Description className={styles.description}>
                {description}
              </Dialog.Description>
            )}
            <Dialog.Close className={styles.closeButton} aria-label="Fechar">
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M2.5 2.5L9.5 9.5M9.5 2.5L2.5 9.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Dialog.Close>
          </div>
          <div className={styles.body}>{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    )
  }
)
ModalContentComponent.displayName = 'Modal.Content'

// Componente Principal
const ModalComponent: React.FC<ModalProps> = ({
  open,
  defaultOpen,
  onOpenChange,
  title,
  description,
  trigger,
  size = 'md',
  children,
}) => {
  const { theme } = useTheme()
  const isUnified = !!(title || trigger)

  if (isUnified) {
    return (
      <Dialog.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
        {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
        <Dialog.Portal>
          <Dialog.Overlay className={styles.overlay} data-theme={theme} />
          <Dialog.Content className={clsx(styles.content, styles[size])} data-theme={theme}>
            <div className={styles.header}>
              <Dialog.Title className={styles.title}>{title}</Dialog.Title>
              {description && (
                <Dialog.Description className={styles.description}>
                  {description}
                </Dialog.Description>
              )}
              <Dialog.Close className={styles.closeButton} aria-label="Fechar">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M2.5 2.5L9.5 9.5M9.5 2.5L2.5 9.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Dialog.Close>
            </div>
            <div className={styles.body}>{children}</div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    )
  }

  return (
    <Dialog.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {children}
    </Dialog.Root>
  )
}
ModalComponent.displayName = 'Modal'

const ThemedModal = withTheme<HTMLDivElement, ModalProps>(ModalComponent as unknown as React.ComponentType<ModalProps>)

export const Modal = Object.assign(ThemedModal, {
  Trigger: ModalTriggerComponent,
  Content: ModalContentComponent,
  Close: ModalCloseComponent,
})
```

### Proposta de Código: `packages/core/src/components/Modal/index.ts`

```typescript
export { Modal } from './Modal'
export type {
  ModalProps,
  ModalContentProps,
  ModalTriggerProps,
  ModalCloseProps,
} from './Modal'
```

### Proposta de Código: `packages/core/src/components/Modal/Modal.module.scss`

```scss
@use '../../tokens/globals.scss';

.overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.55); // Monocromático translúcido
  z-index: 1000;

  // Suporte a redução de movimentos
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
}

.content {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1001;
  display: flex;
  flex-direction: column;
  background-color: var(--ds-color-neutral-0);
  border: var(--ds-border-width-sm) solid var(--ds-color-neutral-200);
  border-radius: var(--ds-border-radius-lg);
  box-shadow: var(--ds-shadow-lg);
  padding: var(--ds-spacing-6);
  outline: none;
  font-family: var(--ds-font-family-sans);

  // Tamanhos responsivos
  width: calc(100vw - var(--ds-spacing-8));
  box-sizing: border-box;

  &.sm {
    max-width: 400px;
  }

  &.md {
    max-width: 560px;
  }

  &.lg {
    max-width: 800px;
  }
}

.header {
  position: relative;
  margin-bottom: var(--ds-spacing-4);
  padding-right: var(--ds-spacing-8); // Evita sobreposição do botão fechar
}

.title {
  font-family: var(--ds-font-family-heading);
  font-size: var(--ds-font-size-xl);
  font-weight: var(--ds-font-weight-semibold);
  color: var(--ds-color-neutral-900);
  margin: 0;
}

.description {
  font-size: var(--ds-font-size-sm);
  color: var(--ds-color-neutral-500);
  margin-top: var(--ds-spacing-2);
  margin-bottom: 0;
}

.closeButton {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--ds-color-neutral-500);
  cursor: pointer;
  padding: var(--ds-spacing-1);
  border-radius: var(--ds-border-radius-sm);
  outline: none;
  transition: color 0.2s ease;

  &:hover {
    color: var(--ds-color-neutral-900);
  }

  &:focus-visible {
    outline: var(--ds-border-width-md) solid var(--ds-color-focus-ring);
    outline-offset: 2px;
  }
}

.body {
  font-size: var(--ds-font-size-md);
  color: var(--ds-color-neutral-700);
  overflow-y: auto;
  max-height: 60vh;
}
```

### Proposta de Código: `packages/core/src/components/Modal/Modal.test.tsx`

```typescript
import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { vi } from 'vitest'
import { Modal } from './Modal'
import { ThemeProvider } from '../../themes/ThemeProvider'

// ...
```

### Proposta de Código: `packages/docs/src/stories/Modal.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react'
import React, { useState } from 'react'
import { Modal } from '../../../core/src/components/Modal'
import { Button } from '../../../core/src/components/Button'

// ...
```

---

## Decisões Técnicas

1. **Uso do Primitivo `@radix-ui/react-dialog`**: Em conformidade com `references/ARCHITECTURE.md`, adotamos os primitivos da Radix para evitar erros comuns de acessibilidade em modais personalizados. O Radix gerencia nativamente o _Focus Trap_, escuta de teclas (`Escape`), restabelecimento do foco do teclado no elemento de disparo, e as marcações de semântica ARIA adequadas, poupando centenas de linhas de código frágil de gerenciamento de DOM.
2. **Propagação de Tema em Portais (`data-theme={theme}`)**: Por padrão, o `Dialog.Portal` anexa seus elementos diretamente ao final do `document.body` para contornar problemas de empilhamento visual. No entanto, isso quebra o escopo de variáveis de tema injetadas na div root do app. Para garantir que os estilos monocromáticos e cores neutras funcionem corretamente no modal, injetamos explicitamente `data-theme={theme}` tanto em `Dialog.Overlay` quanto em `Dialog.Content`, replicando o padrão adotado com sucesso no `Dropdown`.
3. **Estilização com SCSS Modules e Variáveis de Tokens**: Toda a estilização do modal utiliza estritamente as variáveis CSS globais definidas no design system (ex: `--ds-color-neutral-0` para fundos, `--ds-border-radius-lg` para cantos, `--ds-spacing-X` para margens/paddings). Para manter a integridade visual, o overlay translúcido escuro é projetado para atuar consistentemente nos modos claro e escuro.
4. **API Híbrida (Unified + Compound Component Pattern)**:
   - Para casos de uso triviais, o modal oferece uma interface baseada em propriedades (`trigger`, `title`, `description`), automatizando a montagem rápida.
   - Para composições complexas, o modal expõe subcomponentes associados via `Object.assign` (`Modal.Trigger`, `Modal.Content`, `Modal.Close`) seguindo a regra 9 do `AGENTS.md`. Todos os subcomponentes recebem um `displayName` consistente (ex: `'Modal.Content'`).
5. **Acessibilidade de Altura e Overflow do Corpo**: Definimos `max-height: 60vh` e `overflow-y: auto` na classe `.body` para que modais com textos ou formulários longos se adaptem de forma responsiva ao viewport de dispositivos móveis sem quebrar o layout da janela modal.

---

## Checklist de Implementação

### Configurações de Dependência e Pastas

- [x] 1. Verificar a presença de `@radix-ui/react-dialog` nas dependências do projeto e adicionar em `packages/core/package.json` caso ausente.
- [x] 2. Criar o diretório `packages/core/src/components/Modal/`.

### Criação de Testes e Implementação TDD

- [x] 3. Criar o arquivo `packages/core/src/components/Modal/Modal.test.tsx` com os mocks necessários (`ResizeObserver`, `PointerEvent`).
- [x] 4. Escrever cenários de teste unitários verificando se o Modal permanece oculto inicialmente e se abre corretamente ao interagir com o trigger.
- [x] 5. Adicionar testes que verificam fechamento do modal por clique no botão de fechar, clique fora (overlay) e tecla Escape.
- [x] 6. Adicionar teste que verifica se o foco retorna para o elemento disparador após o fechamento.
- [x] 7. Adicionar teste para validar o comportamento de modal controlado e de componentes em padrão Compound.
- [x] 8. Adicionar teste de acessibilidade `jest-axe` garantindo conformidade com a WCAG 2.1 AA.

### Desenvolvimento de Código e Tipagem

- [x] 9. Criar o arquivo `packages/core/src/components/Modal/Modal.tsx`.
- [x] 10. Definir as interfaces de propriedades `ModalProps`, `ModalTriggerProps`, `ModalCloseProps` e `ModalContentProps` com rigor de tipos (zero `any`).
- [x] 11. Implementar os subcomponentes `ModalTrigger`, `ModalClose` e `ModalContent` usando forwardRef e displayName correspondentes.
- [x] 12. Consumir o hook `useTheme()` dentro do modal e associar o atributo `data-theme` nos elementos `Dialog.Overlay` e `Dialog.Content` para propagação dos estilos corretos no Portal.
- [x] 13. Implementar a lógica condicional no componente raiz para aceitar tanto a sintaxe unificada por props quanto a sintaxe composta (Compound).
- [x] 14. Aplicar o HOC `withTheme` no componente principal e exportar o objeto final composto via `Object.assign`.
- [x] 15. Criar o arquivo `packages/core/src/components/Modal/index.ts` contendo exportação do componente principal e de seus tipos associados.

### Estilização Estrita com Variáveis e Tokens

- [x] 16. Criar o arquivo `packages/core/src/components/Modal/Modal.module.scss`.
- [x] 17. Estilizar o overlay com fundo escurecido translúcido em tela inteira com z-index isolado.
- [x] 18. Centralizar a janela modal flutuante usando posicionamento fixo e eixos a 50%, adicionando fundo neutro `--ds-color-neutral-0`, raio de borda `--ds-border-radius-lg` e sombra `--ds-shadow-lg`.
- [x] 19. Implementar variantes de tamanho baseadas em classes modulares (`.sm` para 400px, `.md` para 560px, `.lg` para 800px) limitadas pela largura responsiva do viewport (`calc(100vw - var(--ds-spacing-8))`).
- [x] 20. Estilizar o cabeçalho (título, descrição opcional) e o botão close com transição suave, outline acessível de contraste de foco e área de respiro adequada.

### Stories e Documentação

- [x] 21. Criar o arquivo de documentação Storybook 8 em `packages/docs/src/stories/Modal.stories.tsx`.
- [x] 22. Adicionar as variações obrigatórias (`Playground`, `Small`, `Large`, `NoDescription`, `Controlled`) marcando as secundárias com a tag `['!dev']`.

### Validação de Qualidade e Revisão Final

- [x] 23. Executar o comando de testes `pnpm test` ou equivalente para verificar aprovação e garantir cobertura superior a 90%.
- [x] 24. Executar os linters e formatadores (`pnpm lint` e `pnpm format`) garantindo conformidade total de código com as regras de ESLint e Prettier do projeto.
