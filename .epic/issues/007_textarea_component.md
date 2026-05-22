# #007 — Componente: Textarea

## Status

`[ ] A Fazer` `[ ] Em progresso` `[x] Concluído`

## Objetivo

Implementar o componente `Textarea` para entrada de textos longos ou multilinhas, integrando opções de auto-redimensionamento baseado no volume do texto inserido.

## Critérios de Aceite

- [x] Renderizar elemento `<textarea>` HTML associado a uma label.
- [x] Suportar propriedades `error` (borda vermelha e texto no rodapé) e `helperText`.
- [x] Suportar propriedade opcional `autoResize`. Se verdadeiro, o textarea deve aumentar/diminuir sua altura dinamicamente para acomodar o conteúdo digitado (evitando barras de rolagem desnecessárias).
- [x] Associação a11y via `htmlFor`/`id` e propriedades `aria-invalid` / `aria-describedby`.
- [x] Encaminhamento de referências com `forwardRef`.
- [x] Escrever testes unitários e histórias cobrindo os estados do textarea.

## Props

| Prop         | Tipo      | Default | Descrição                                                         |
| ------------ | --------- | ------- | ----------------------------------------------------------------- |
| `label`      | `string`  | -       | Rótulo do campo                                                   |
| `error`      | `string`  | -       | Mensagem de erro que altera a cor da borda                        |
| `helperText` | `string`  | -       | Texto auxiliar de ajuda                                           |
| `autoResize` | `boolean` | `false` | Se verdadeiro, auto-ajusta a altura do campo com base no conteúdo |

## Cenários de Teste

- [x] Verifica digitação e atualização do valor.
- [x] Se `autoResize` for ativo, valida que o `scrollHeight` altera o `height` do elemento após inserções de quebras de linha (`\n`).
- [x] Valida comportamento a11y (axe compliance).

## Arquivos a Criar

- `packages/core/src/components/Textarea/Textarea.tsx`
- `packages/core/src/components/Textarea/Textarea.test.tsx`
- `packages/docs/src/stories/Textarea.stories.tsx`
- `packages/core/src/components/Textarea/Textarea.module.scss`
- `packages/core/src/components/Textarea/index.ts`

## Dependências de Issues

#001 (Monorepo), #002 (Tokens), #003 (Themes), #006 (Input)

## Estimativa

P

## Pesquisa

### 1. Referências de Acessibilidade (WCAG 2.1 AA)

- **Vínculo Semântico**: Relação direta e acessível entre `<label htmlFor={id}>` e `<textarea id={id}>`.
- **Feedback de Validação**: Uso do atributo `aria-invalid="true"` quando a propriedade `error` for fornecida.
- **Leitura Assistiva**: Uso do atributo `aria-describedby` para associar o elemento de entrada `<textarea>` aos contêineres de ajuda (`helperText`) e erro (`error`), garantindo que leitores de tela leiam essas informações ao focar no campo.
- **Gerenciamento de Foco**: Foco explícito e com alto contraste, utilizando o anel de foco padrão (`outline: 2px solid var(--ds-color-focus-ring)` e `outline-offset: 2px`).
- **Teclado**: Preservar o comportamento nativo de foco via `Tab` e `Shift + Tab`.

### 2. Comportamento de `autoResize` (Redimensionamento Dinâmico)

- **Manipulação Direta do DOM**: Para evitar que o React sofra renderizações duplas e latência de entrada (lag) a cada tecla digitada, a altura do campo deve ser manipulada diretamente através do acesso à referência DOM (`internalRef`).
- **Ajuste de Altura**: A cada modificação de conteúdo, o estilo `height` deve ser definido como `'auto'` temporariamente (para permitir a redução do tamanho do elemento se o texto for apagado) e, em seguida, atualizado para `scrollHeight + 'px'`.
- **Prevenção de Rolagem Visual**: Quando o `autoResize` estiver ativo, o CSS deve aplicar `resize: none` e `overflow-y: hidden` para ocultar barras de rolagem nativas e evitar oscilações visuais durante a digitação.
- **Suporte Controlado / Não Controlado**: Para suportar ambos os fluxos, a função de redimensionamento deve rodar:
  1. No hook `useLayoutEffect` monitorando a propriedade `value` (para atualizações controladas e o estado inicial no mount).
  2. No manipulador de eventos `onChange` nativo (para atualizações não controladas quando o usuário digita).
  3. No evento `resize` global da janela (`window.addEventListener('resize')`), para recalcular a altura caso o contêiner mude de largura responsivamente.

---

## Implementação Planejada

### Estrutura de Arquivos Proposta

- [packages/core/src/components/Textarea/index.ts](file:///home/rafacdomin/projetos/design-system/packages/core/src/components/Textarea/index.ts) - Ponto de exportação do componente.
- [packages/core/src/components/Textarea/Textarea.tsx](file:///home/rafacdomin/projetos/design-system/packages/core/src/components/Textarea/Textarea.tsx) - Lógica de renderização, refs e autoResize.
- [packages/core/src/components/Textarea/Textarea.module.scss](file:///home/rafacdomin/projetos/design-system/packages/core/src/components/Textarea/Textarea.module.scss) - Estilização modular baseada em CSS variables.
- [packages/core/src/components/Textarea/Textarea.test.tsx](file:///home/rafacdomin/projetos/design-system/packages/core/src/components/Textarea/Textarea.test.tsx) - Testes unitários de comportamento e acessibilidade.
- [packages/docs/src/stories/Textarea.stories.tsx](file:///home/rafacdomin/projetos/design-system/packages/docs/src/stories/Textarea.stories.tsx) - Histórias do Storybook 8.

### Pseudocódigo e Definições de Estrutura

#### 1. `Textarea.tsx`

```typescript
import React from 'react'
import { clsx } from 'clsx'
import { withTheme } from '../../themes/withTheme'
import styles from './Textarea.module.scss'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  autoResize?: boolean
}

const TextareaComponent = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      autoResize = false,
      className,
      id,
      value,
      onChange,
      disabled,
      ...props
    },
    ref
  ) => {
    const internalRef = React.useRef<HTMLTextAreaElement | null>(null)
    const generatedId = React.useId()
    const textareaId = id || generatedId
    const errorId = `${textareaId}-error`
    const helperId = `${textareaId}-helper`

    // Mescla o ref encaminhado (forwardRef) com o ref local do textarea
    const setRefs = React.useCallback(
      (node: HTMLTextAreaElement | null) => {
        internalRef.current = node
        if (typeof ref === 'function') {
          ref(node)
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node
        }
      },
      [ref]
    )

    // Ajusta a altura da caixa com base no scrollHeight
    const adjustHeight = React.useCallback(() => {
      if (!autoResize || !internalRef.current) return
      const textarea = internalRef.current
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
    }, [autoResize])

    // Ajusta na montagem ou caso a propriedade value controlada seja modificada
    React.useLayoutEffect(() => {
      adjustHeight()
    }, [value, adjustHeight])

    // Escuta redimensionamentos da janela para recalcular wraps responsivos
    React.useLayoutEffect(() => {
      if (!autoResize) return
      window.addEventListener('resize', adjustHeight)
      return () => {
        window.removeEventListener('resize', adjustHeight)
      }
    }, [autoResize, adjustHeight])

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (onChange) {
        onChange(e)
      }
      adjustHeight()
    }

    const hasError = !!error
    const ariaDescribedBy = clsx(
      hasError && errorId,
      !!helperText && helperId
    ) || undefined

    return (
      <div
        className={clsx(
          styles.container,
          disabled && styles.disabled,
          hasError && styles.error,
          className
        )}
      >
        {label && (
          <label htmlFor={textareaId} className={styles.label}>
            {label}
          </label>
        )}
        <textarea
          ref={setRefs}
          id={textareaId}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          aria-invalid={hasError ? 'true' : undefined}
          aria-describedby={ariaDescribedBy}
          className={clsx(styles.textarea, autoResize && styles.autoResize)}
          {...props}
        />
        {hasError && (
          <span id={errorId} className={styles.errorText} role="alert">
            {error}
          </span>
        )}
        {!hasError && helperText && (
          <span id={helperId} className={styles.helperText}>
            {helperText}
          </span>
        )}
      </div>
    )
  }
)

TextareaComponent.displayName = 'Textarea'

export const Textarea = withTheme<HTMLTextAreaElement, TextareaProps>(TextareaComponent)
```

#### 2. `Textarea.module.scss`

```scss
@use '../../tokens/globals.scss';

.container {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-2);
  font-family: var(--ds-font-family-sans);
  width: 100%;
}

.label {
  font-size: var(--ds-font-size-sm);
  font-weight: var(--ds-font-weight-medium);
  color: var(--ds-color-neutral-800);
}

.textarea {
  width: 100%;
  min-height: 5rem;
  padding: var(--ds-spacing-3);
  font-size: var(--ds-font-size-sm);
  line-height: var(--ds-line-height-normal);
  color: var(--ds-color-neutral-900);
  background-color: var(--ds-color-neutral-0);
  border: var(--ds-border-width-sm) solid var(--ds-color-neutral-200);
  border-radius: var(--ds-border-radius-md);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
  resize: vertical;
  box-sizing: border-box;

  &::placeholder {
    color: var(--ds-color-neutral-400);
  }

  &:hover:not(:disabled) {
    border-color: var(--ds-color-neutral-400);
  }

  &:focus-visible {
    outline: var(--ds-border-width-md) solid var(--ds-color-focus-ring);
    outline-offset: 2px;
  }

  &:disabled {
    background-color: var(--ds-color-neutral-100);
    color: var(--ds-color-neutral-400);
    border-color: var(--ds-color-neutral-200);
    cursor: not-allowed;
    resize: none;
  }
}

.autoResize {
  resize: none;
  overflow-y: hidden;
}

.error {
  .label {
    color: var(--ds-color-danger);
  }
  .textarea {
    border-color: var(--ds-color-danger);

    &:hover:not(:disabled) {
      border-color: var(--ds-color-danger);
    }
  }
}

.errorText {
  font-size: var(--ds-font-size-xs);
  color: var(--ds-color-danger);
}

.helperText {
  font-size: var(--ds-font-size-xs);
  color: var(--ds-color-neutral-500);
}
```

#### 3. `Textarea.test.tsx`

```typescript
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { Textarea } from './Textarea'
import { ThemeProvider } from '../../themes/ThemeProvider'

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>)
}

describe('Textarea Component', () => {
  it('should render the textarea and its label correctly', () => {
    renderWithTheme(<Textarea label="Comments" placeholder="Enter comments" />)
    const label = screen.getByText('Comments')
    const textarea = screen.getByPlaceholderText('Enter comments')
    expect(label).toBeInTheDocument()
    expect(textarea).toBeInTheDocument()
    expect(textarea).toHaveAttribute('id')
    expect(label).toHaveAttribute('for', textarea.getAttribute('id'))
  })

  it('should update the value when typing', async () => {
    const user = userEvent.setup()
    renderWithTheme(<Textarea label="Feedback" />)
    const textarea = screen.getByRole('textbox', { name: /feedback/i })
    await user.type(textarea, 'Hello World')
    expect(textarea).toHaveValue('Hello World')
  })

  it('should support helperText', () => {
    renderWithTheme(<Textarea label="Bio" helperText="Tell us about yourself" />)
    const helper = screen.getByText('Tell us about yourself')
    expect(helper).toBeInTheDocument()
    const textarea = screen.getByRole('textbox', { name: /bio/i })
    expect(textarea).toHaveAttribute('aria-describedby', helper.getAttribute('id'))
  })

  it('should support error state and set proper accessibility tags', () => {
    renderWithTheme(<Textarea label="Description" error="This field is required" />)
    const errorText = screen.getByText('This field is required')
    expect(errorText).toBeInTheDocument()
    const textarea = screen.getByRole('textbox', { name: /description/i })
    expect(textarea).toHaveAttribute('aria-invalid', 'true')
    expect(textarea).toHaveAttribute('aria-describedby', errorText.getAttribute('id'))
  })

  it('should merge and forward ref correctly', () => {
    const ref = React.createRef<HTMLTextAreaElement>()
    renderWithTheme(<Textarea ref={ref} label="Comments" />)
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement)
  })

  it('should change height if autoResize is true and content wraps', () => {
    renderWithTheme(<Textarea label="Auto" autoResize defaultValue="Initial text" />)
    const textarea = screen.getByRole('textbox', { name: /auto/i }) as HTMLTextAreaElement

    Object.defineProperty(textarea, 'scrollHeight', {
      configurable: true,
      value: 150,
    })

    fireEvent.input(textarea, { target: { value: 'New longer text' } })
    expect(textarea.style.height).toBe('150px')
  })

  it('should have no accessibility violations', async () => {
    const { container } = renderWithTheme(<Textarea label="Accessibility" />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
```

#### 4. `Textarea.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { Textarea, TextareaProps } from '@ds/core'

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
```

#### 5. `index.ts`

```typescript
export * from './Textarea'
```

---

## Decisões Técnicas

- **Styling Strategy**: Utilização de **SCSS Modules** mapeados exclusivamente para os design tokens via variáveis customizadas (`--ds-spacing-*`, `--ds-color-neutral-*`, `--ds-border-*`, `--ds-font-*`). Isso atende à stack obrigatória do projeto, isola os estilos locais e garante consistência visual, permitindo que a variação de temas (Light/Dark) funcione perfeitamente.
- **Component Wrapper & Theme Setup**: Utilização do HOC `withTheme` para injetar o atributo `data-theme` baseado no contexto ativo.
- **Refs Merging Callback**: Choice de usar uma função de callback ref `setRefs` em vez do hook `useImperativeHandle`. Esse método é mais idiomático no React para unificar a atribuição de uma referência externa e o acesso a um elemento local de forma direta e sem overhead de chamadas imperativas.
- **Técnica de Auto-Redimensionamento**: Atualização direta do valor inline `.style.height` usando referências no DOM (através da medição do `scrollHeight`). Fazer esse ajuste de forma nativa e síncrona com `useLayoutEffect` mitiga "flickering" (piscadas) que ocorreriam caso a altura fosse controlada por estados reativos do React, gerando uma experiência de digitação extremamente fluida e com zero input delay.
- **Localização de Stories**: Em consonância com a configuração do Storybook em [packages/docs/.storybook/main.ts](file:///home/rafacdomin/projetos/design-system/packages/docs/.storybook/main.ts), os stories de documentação do componente serão criados no pacote de documentação em `packages/docs/src/stories/Textarea.stories.tsx` ao invés de residirem no diretório core, mantendo a responsabilidade e isolamento dos pacotes corretos no monorepo.

---

## Checklist de Implementação

- [x] 1. Criar a pasta do componente `packages/core/src/components/Textarea/`.
- [x] 2. Escrever a especificação inicial de testes unitários em `packages/core/src/components/Textarea/Textarea.test.tsx` definindo o comportamento padrão sob a premissa de TDD.
- [x] 3. Declarar os tipos e propriedades de `TextareaProps` estendendo `React.TextareaHTMLAttributes<HTMLTextAreaElement>`.
- [x] 4. Declarar o esqueleto do componente `TextareaComponent` utilizando `React.forwardRef` e definindo o `displayName = 'Textarea'`.
- [x] 5. Implementar a associação semântica de IDs dinâmicos através de `React.useId` para a `label` e o `id` da textarea.
- [x] 6. Implementar a lógica de geração de IDs de erro e ajuda (`errorId`, `helperId`) para a leitura de tela assistiva.
- [x] 7. Adicionar o suporte condicional de exibição da `label`, `error` e `helperText`.
- [x] 8. Associar os atributos `aria-invalid="true"` caso haja erro e configurar `aria-describedby` adequadamente.
- [x] 9. Implementar o callback de mesclagem de refs (`setRefs`) e passá-lo ao elemento `<textarea>`.
- [x] 10. Criar os estilos estruturais base em `packages/core/src/components/Textarea/Textarea.module.scss`.
- [x] 11. Customizar a aparência padrão da textarea (hover, focus, disabled) utilizando exclusivamente variáveis de tokens `--ds-`.
- [x] 12. Adicionar as regras de estilos para o estado de erro (`.error`) que altera a cor das bordas e labels para `--ds-color-danger`.
- [x] 13. Implementar a lógica de auto-redimensionamento dinâmico através do método `adjustHeight`.
- [x] 14. Vincular o `adjustHeight` no evento nativo `onChange` do textarea.
- [x] 15. Vincular o `adjustHeight` no ciclo de vida síncrono `useLayoutEffect` dependendo de `value` (suporte controlado).
- [x] 16. Implementar o listener global de `resize` na janela para re-ajustar a altura quando a largura se alterar, garantindo a remoção do listener no unmount.
- [x] 17. Exportar o componente `Textarea` envolvido em `withTheme` no arquivo `packages/core/src/components/Textarea/index.ts`.
- [x] 18. Registrar e expor as exportações em `packages/core/src/index.ts`. _(Ignorado/completado por importação direta no Storybook, respeitando a restrição de não modificar packages/core/src/index.ts)_
- [x] 19. Criar as histórias correspondentes em `packages/docs/src/stories/Textarea.stories.tsx` utilizando tags `['autodocs']` e variações secundárias ocultas com `['!dev']`.
- [x] 20. Executar os testes unitários via Vitest para garantir que todas as validações (axe, digitação, redimensionamento) passem sem erros.
- [x] 21. Executar o comando `/review` para certificar o cumprimento das regras de design do projeto.
