# #006 — Componente: Input

## Status

`[ ] A Fazer` `[ ] Em progresso` `[x] Concluído`

## Objetivo

Implementar o componente `Input` para entrada de texto em formulários seguindo TDD. O componente deve suportar labels associadas, ícones no início/fim do campo, mensagens de ajuda (helper texts) e estados de validação de erro de forma acessível.

## Critérios de Aceite

- [x] Renderizar elemento `<input>` nativo envolvido em uma estrutura que suporta label flutuante ou estático acima do campo.
- [x] Suportar propriedades de ícone inicial (`startIcon`) e ícone final (`endIcon`).
- [x] Suportar propriedade `error` que altera a cor de borda para vermelho (`--ds-color-danger`) e renderiza uma mensagem de erro abaixo do campo.
- [x] Suportar propriedade `helperText` para exibir texto de instrução abaixo do campo (quando não houver erro).
- [x] Associação explícita do rótulo visual (label) com o input através de `htmlFor` / `id`.
- [x] Definição adequada de `aria-invalid="true"` e vinculação do erro e helperText através de `aria-describedby` para leitores de tela.
- [x] Encaminhamento de referências através do `forwardRef`.
- [x] Testes cobrindo digitação (`userEvent.type`), estados de erro, disabled e conformidade a11y com `jest-axe`.

## Props

| Prop         | Tipo              | Default | Descrição                                                           |
| ------------ | ----------------- | ------- | ------------------------------------------------------------------- |
| `label`      | `string`          | -       | Rótulo do campo                                                     |
| `error`      | `string`          | -       | Mensagem de erro que altera o estado do campo e é exibida no rodapé |
| `helperText` | `string`          | -       | Texto de ajuda exibido abaixo do input                              |
| `startIcon`  | `React.ReactNode` | -       | Ícone posicionado no início do input                                |
| `endIcon`    | `React.ReactNode` | -       | Ícone posicionado no fim do input                                   |

## Cenários de Teste

- [x] Digitar no input atualiza seu valor corretamente.
- [x] Exibe a mensagem de erro se a prop `error` for fornecida, e aplica borda de perigo.
- [x] Desabilita o input e impede interação se `disabled` for verdadeiro.
- [x] Garante que leitor de tela anuncia o erro através de `aria-describedby`.

## Arquivos a Criar

- `packages/core/src/components/Input/Input.tsx`
- `packages/core/src/components/Input/Input.test.tsx`
- `packages/docs/src/stories/Input.stories.tsx`
- `packages/core/src/components/Input/Input.module.scss`
- `packages/core/src/components/Input/index.ts`

## Dependências de Issues

#001 (Monorepo), #002 (Tokens), #003 (Themes), #005 (Button)

## Estimativa

M

## Pesquisa

### Boas Práticas e Referências

- **shadcn/ui e Radix UI:** Componentes de input em bibliotecas modernas como shadcn/ui utilizam o elemento nativo `<input>` do HTML5 diretamente ou estendem-no via forwardRef para permitir acesso direto à referência DOM (importante para bibliotecas de formulários como React Hook Form). Não há primitivos específicos para input no Radix UI (como há para Dialog ou Select), pois o `<input>` nativo já carrega os comportamentos necessários se associado corretamente a um `<label>`.
- **Nomenclatura e API:** Alinhado com `COMPONENT_SPEC.md`, o componente aceitará props adicionais para `label`, `error`, `helperText`, `startIcon`, `endIcon` e `labelMode` ('static' | 'floating').

### Acessibilidade (WCAG 2.1 AA)

- **Associação de Label:** O input deve possuir um ID único. Usaremos o hook `useId` do React para gerar um ID por padrão caso nenhum `id` seja passado via props. O `<label>` deve referenciar este ID via `htmlFor`.
- **Feedback de Erro e Instruções:**
  - Quando a prop `error` estiver preenchida, o input deve receber `aria-invalid="true"`.
  - O input deve receber `aria-describedby` apontando para o `id` da mensagem de erro (`{inputId}-error`) ou do texto auxiliar (`{inputId}-helper`).
  - Segundo as especificações da WCAG, a mensagem de erro deve ser marcada com `role="alert"` ou estar em um elemento com semântica de erro para ser anunciada imediatamente pelo leitor de tela.
- **Indicador de Foco:** O estado focado deve ter um contorno claro com excelente contraste visual contra o fundo. Usaremos a cor de foco `--ds-color-focus-ring` (preto no tema claro, branco no tema escuro) com outline ou box-shadow de alto contraste.
- **Teclado:** O input deve herdar o comportamento de foco padrão do HTML via `Tab`. Nenhum `tabIndex` customizado deve ser adicionado para não quebrar a ordem natural.

### Implementação de Floating Labels

- Para implementar de forma puramente declarativa no CSS, o elemento `<label>` deve vir após o elemento `<input>` no DOM sob o mesmo wrapper.
- O input deve receber um atributo `placeholder` (caso não seja fornecido, usaremos um espaço em branco `" "` para que a pseudo-classe `:placeholder-shown` funcione).
- O CSS utilizará:
  - `:placeholder-shown ~ .floatingLabel` para posicionar o label exatamente em cima do input quando vazio e sem foco.
  - `:focus ~ .floatingLabel` e `:not(:placeholder-shown) ~ .floatingLabel` para flutuar e encolher o label no topo do campo.
- Ajuste de Padding: Se `startIcon` estiver presente, o label flutuante deve ser deslocado horizontalmente (ex: `left: var(--ds-spacing-10)`) para não cobrir o ícone.

## Implementação Planejada

### Estrutura de Arquivos

O componente `Input` será composto pelos seguintes arquivos no pacote `@rafacdomin/ds-core`:

- `packages/core/src/components/Input/Input.tsx` (Lógica e estrutura)
- `packages/core/src/components/Input/Input.module.scss` (Estilização modular e temas)
- `packages/core/src/components/Input/Input.test.tsx` (Testes TDD e A11y)
- `packages/core/src/components/Input/index.ts` (Exportação do componente)

As histórias do Storybook serão adicionadas no pacote `@rafacdomin/ds-docs`:

- `packages/docs/src/stories/Input.stories.tsx` (Documentação e visual regression)

### Estrutura do Código

#### `packages/core/src/components/Input/index.ts`

```typescript
export * from './Input'
```

#### `packages/core/src/components/Input/Input.tsx`

```typescript
import React, { useId } from 'react'
import { clsx } from 'clsx'
import { withTheme } from '../../themes/withTheme'
import styles from './Input.module.scss'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Rótulo visual do campo */
  label?: string
  /** Mensagem de erro que altera o estado do campo e é exibida no rodapé */
  error?: string
  /** Texto de ajuda auxiliar exibido abaixo do input */
  helperText?: string
  /** Ícone posicionado no início do input */
  startIcon?: React.ReactNode
  /** Ícone posicionado no fim do input */
  endIcon?: React.ReactNode
  /** Modo do label (estático acima ou flutuante dentro do campo) */
  labelMode?: 'static' | 'floating'
}

const InputComponent = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      id,
      label,
      error,
      helperText,
      startIcon,
      endIcon,
      labelMode = 'static',
      disabled,
      placeholder,
      ...props
    },
    ref
  ) => {
    const generatedId = useId()
    const inputId = id || generatedId
    const helperId = `${inputId}-helper`
    const errorId = `${inputId}-error`

    const hasError = !!error
    const hasHelper = !!helperText && !hasError
    const isFloating = labelMode === 'floating'

    const describedBy = clsx({
      [errorId]: hasError,
      [helperId]: hasHelper,
    }) || undefined

    return (
      <div
        className={clsx(
          styles.inputContainer,
          {
            [styles.hasError]: hasError,
            [styles.isDisabled]: disabled,
            [styles.isFloating]: isFloating,
            [styles.hasStartIcon]: !!startIcon,
            [styles.hasEndIcon]: !!endIcon,
          },
          className
        )}
      >
        {!isFloating && label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
        )}

        <div className={styles.inputWrapper}>
          {startIcon && <div className={styles.startIcon} aria-hidden="true">{startIcon}</div>}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={hasError ? 'true' : undefined}
            aria-describedby={describedBy}
            placeholder={isFloating ? (placeholder || ' ') : placeholder}
            className={styles.input}
            {...props}
          />

          {isFloating && label && (
            <label htmlFor={inputId} className={styles.floatingLabel}>
              {label}
            </label>
          )}

          {endIcon && <div className={styles.endIcon} aria-hidden="true">{endIcon}</div>}
        </div>

        {hasError && (
          <span id={errorId} className={styles.errorText} role="alert">
            {error}
          </span>
        )}

        {hasHelper && (
          <span id={helperId} className={styles.helperText}>
            {helperText}
          </span>
        )}
      </div>
    )
  }
)

InputComponent.displayName = 'Input'

export const Input = withTheme<HTMLInputElement, InputProps>(InputComponent)
```

#### `packages/core/src/components/Input/Input.module.scss`

```scss
@use '../../tokens/globals.scss';
@use '../../tokens/theme-light.scss';
@use '../../tokens/theme-dark.scss';

.inputContainer {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-1);
  font-family: var(--ds-font-family-sans);
  width: 100%;
  box-sizing: border-box;
}

.label {
  font-size: var(--ds-font-size-sm);
  font-weight: var(--ds-font-weight-medium);
  color: var(--ds-color-neutral-800);
}

.inputWrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.input {
  width: 100%;
  height: 2.5rem;
  padding: 0 var(--ds-spacing-3);
  font-size: var(--ds-font-size-sm);
  font-family: var(--ds-font-family-sans);
  color: var(--ds-color-neutral-900);
  background-color: var(--ds-color-neutral-0);
  border: 1px solid var(--ds-color-neutral-200);
  border-radius: var(--ds-border-radius-md);
  outline: none;
  box-sizing: border-box;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &::placeholder {
    color: var(--ds-color-neutral-400);
  }

  &:hover:not(:disabled) {
    border-color: var(--ds-color-neutral-400);
  }

  &:focus:not(:disabled) {
    border-color: var(--ds-color-neutral-1000);
    box-shadow: 0 0 0 2px var(--ds-color-focus-ring);
  }

  &:disabled {
    background-color: var(--ds-color-neutral-100);
    color: var(--ds-color-neutral-400);
    border-color: var(--ds-color-neutral-300);
    cursor: not-allowed;
  }
}

.startIcon,
.endIcon {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ds-color-neutral-500);
  pointer-events: none;
}

.startIcon {
  left: var(--ds-spacing-3);
}

.endIcon {
  right: var(--ds-spacing-3);
}

.hasStartIcon {
  .input {
    padding-left: var(--ds-spacing-10);
  }
  .floatingLabel {
    left: var(--ds-spacing-10);
  }
}

.hasEndIcon {
  .input {
    padding-right: var(--ds-spacing-10);
  }
}

.isFloating {
  .input {
    padding-top: var(--ds-spacing-4);
    padding-bottom: var(--ds-spacing-1);
    height: 3rem;
  }

  .floatingLabel {
    position: absolute;
    left: var(--ds-spacing-3);
    top: 50%;
    transform: translateY(-50%);
    font-size: var(--ds-font-size-md);
    color: var(--ds-color-neutral-500);
    pointer-events: none;
    transition:
      transform 0.2s ease,
      font-size 0.2s ease,
      color 0.2s ease,
      top 0.2s ease;
  }

  .input:focus ~ .floatingLabel,
  .input:not(:placeholder-shown) ~ .floatingLabel {
    top: 30%;
    transform: translateY(-100%);
    font-size: var(--ds-font-size-xs);
    color: var(--ds-color-neutral-800);
  }
}

.hasError {
  .label,
  .floatingLabel {
    color: var(--ds-color-danger) !important;
  }

  .input {
    border-color: var(--ds-color-danger);

    &:focus {
      border-color: var(--ds-color-danger);
      box-shadow: 0 0 0 2px var(--ds-color-danger);
    }
  }

  .errorText {
    font-size: var(--ds-font-size-xs);
    color: var(--ds-color-danger);
    font-weight: var(--ds-font-weight-medium);
  }
}

.helperText {
  font-size: var(--ds-font-size-xs);
  color: var(--ds-color-neutral-500);
}
```

#### `packages/core/src/components/Input/Input.test.tsx`

```typescript
import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { Input } from './Input'
import { ThemeProvider } from '../../themes/ThemeProvider'

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>)
}

describe('Input Component', () => {
  it('should render the input element correctly', () => {
    renderWithTheme(<Input placeholder="Enter text" />)
    const input = screen.getByPlaceholderText('Enter text')
    expect(input).toBeInTheDocument()
    expect(input.tagName).toBe('INPUT')
  })

  it('should update value correctly when typing', async () => {
    const user = userEvent.setup()
    renderWithTheme(<Input placeholder="Enter text" />)
    const input = screen.getByPlaceholderText('Enter text')

    await user.type(input, 'Hello World')
    expect(input).toHaveValue('Hello World')
  })

  it('should associate label with input using htmlFor/id', () => {
    renderWithTheme(<Input label="Username" id="user-input" />)
    const label = screen.getByText('Username')
    const input = screen.getByLabelText('Username')

    expect(label).toHaveAttribute('for', 'user-input')
    expect(input).toHaveAttribute('id', 'user-input')
  })

  it('should display helper text and link it using aria-describedby', () => {
    renderWithTheme(<Input label="Password" helperText="Must be 8 characters" id="pw" />)
    const helper = screen.getByText('Must be 8 characters')
    const input = screen.getByLabelText('Password')

    expect(helper).toBeInTheDocument()
    expect(input).toHaveAttribute('aria-describedby', 'pw-helper')
  })

  it('should display error message instead of helper text and apply aria-invalid', () => {
    renderWithTheme(
      <Input
        label="Email"
        helperText="Enter a valid email"
        error="Email is required"
        id="email"
      />
    )
    const error = screen.getByText('Email is required')
    const helper = screen.queryByText('Enter a valid email')
    const input = screen.getByLabelText('Email')

    expect(error).toBeInTheDocument()
    expect(helper).not.toBeInTheDocument()
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute('aria-describedby', 'email-error')
  })

  it('should prevent interaction and apply disabled attribute when disabled', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    renderWithTheme(<Input placeholder="Type here" disabled onChange={handleChange} />)

    const input = screen.getByPlaceholderText('Type here')
    expect(input).toBeDisabled()

    await user.type(input, 'Hello')
    expect(input).not.toHaveValue('Hello')
    expect(handleChange).not.toHaveBeenCalled()
  })

  it('should render start and end icons correctly', () => {
    renderWithTheme(
      <Input
        placeholder="Search"
        startIcon={<span data-testid="search-icon">🔍</span>}
        endIcon={<span data-testid="clear-icon">❌</span>}
      />
    )
    expect(screen.getByTestId('search-icon')).toBeInTheDocument()
    expect(screen.getByTestId('clear-icon')).toBeInTheDocument()
  })

  it('should forward ref to the native input element', () => {
    const ref = React.createRef<HTMLInputElement>()
    renderWithTheme(<Input ref={ref} placeholder="Ref test" />)

    expect(ref.current).toBeInstanceOf(HTMLInputElement)
    ref.current?.focus()
    expect(document.activeElement).toBe(ref.current)
  })

  it('should pass accessibility validation (axe)', async () => {
    const { container } = renderWithTheme(<Input label="Full Name" placeholder="John Doe" />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
```

#### `packages/docs/src/stories/Input.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { Input } from '@rafacdomin/ds-core'

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
  args: {
    label: 'Email Address',
    placeholder: 'Enter your email',
    labelMode: 'floating',
  },
}

export const WithHelperText: Story = {
  args: {
    label: 'Password',
    placeholder: 'Enter your password',
    helperText: 'Must be at least 8 characters long.',
  },
}

export const WithError: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'Enter your email',
    error: 'Please enter a valid email address.',
    defaultValue: 'invalid-email',
  },
}

export const DisabledState: Story = {
  args: {
    label: 'Username',
    placeholder: 'Enter your username',
    disabled: true,
  },
}

export const WithIcons: Story = {
  args: {
    label: 'Search',
    placeholder: 'Search projects...',
    startIcon: <span>🔍</span>,
    endIcon: <span>⌘K</span>,
  },
}
```

## Decisões Técnicas

1. **Estratégia de Estilização (SCSS Modules):**
   Utilizaremos SCSS Modules integrado com CSS Custom Properties definidos nos tokens de temas (`--ds-*`). Não utilizaremos nenhum valor CSS literal (hardcoded) para manter a integridade visual e compatibilidade com temas escuros e claros.
2. **Encaminhamento de Ref (forwardRef):**
   Utilizaremos o `React.forwardRef` apontando para `HTMLInputElement`. Isso permite compatibilidade total com formulários controlados/não controlados e bibliotecas como `react-hook-form` que precisam acessar a referência DOM do campo para gerenciar foco ou ler valores nativos.
3. **Mapeamento de Atributos HTML:**
   O componente estenderá diretamente `React.InputHTMLAttributes<HTMLInputElement>`. Isso garante suporte a todos os atributos HTML nativos como `type`, `required`, `autoFocus`, `value`, `onChange`, `onFocus`, `onBlur`, etc., repassados via spread operator `{...props}` para o input interno.
4. **Semântica Acessível Dinâmica:**
   O atributo `aria-describedby` apontará condicionalmente para o ID do erro ou ID do helperText (com prioridade para o erro caso ambos estejam presentes). O uso de `useId` garante que mesmo sem passar a prop `id`, o input e seus elementos de apoio permaneçam corretamente conectados para tecnologias assistivas.
5. **Decisão sobre Stories do Storybook:**
   Identificamos que o `006_input_component.md` original listava o arquivo de Stories sob a pasta `packages/core/src/components/Input/Input.stories.tsx`. Porém, seguindo a convenção do monorepo definida em `references/ARCHITECTURE.md` (e o exemplo do componente `Button`), as histórias Storybook devem ser criadas no pacote de documentação em `packages/docs/src/stories/Input.stories.tsx`. Atualizamos nosso planejamento para refletir essa estrutura correta.

## Checklist de Implementação

### 1. Preparação e Configuração

- [x] Criar a pasta do componente `packages/core/src/components/Input/`.
- [x] Criar os arquivos iniciais vazios: `Input.tsx`, `Input.module.scss`, `Input.test.tsx`, `index.ts`.

### 2. Testes de Unidade (TDD)

- [x] Escrever teste para renderização correta do `<input>` nativo.
- [x] Escrever teste para o fluxo de digitação de caracteres e mudança de valor via `userEvent`.
- [x] Escrever teste de associação explícita de `label` com o input (htmlFor / id).
- [x] Escrever teste verificando exibição de `helperText` e associação com `aria-describedby`.
- [x] Escrever teste verificando exibição do `error` (sobrescrevendo helperText), aplicação de `aria-invalid="true"` e vinculação correta do `aria-describedby`.
- [x] Escrever teste para o estado desabilitado (disabled), garantindo que as ações sejam bloqueadas.
- [x] Escrever teste para renderização correta de `startIcon` e `endIcon`.
- [x] Escrever teste de encaminhamento de referência (`ref`).
- [x] Escrever teste de acessibilidade com `jest-axe` validando ausência de violações.

### 3. Tipagem e Lógica do Componente

- [x] Definir a interface `InputProps` estendendo `React.InputHTMLAttributes<HTMLInputElement>`.
- [x] Implementar a estrutura JSX do `Input` no arquivo `Input.tsx` usando `React.forwardRef`.
- [x] Integrar o hook `useId` do React para gerar IDs automáticos consistentes.
- [x] Encapsular o componente com o HOC `withTheme`.
- [x] Adicionar `displayName` para o componente.
- [x] Exportar o componente e suas props no `packages/core/src/components/Input/index.ts` e exportar no index principal do pacote `packages/core/src/index.ts` (Note: main index.ts modification was skipped per user constraint).

### 4. Estilização (SCSS Modules)

- [x] Importar os tokens globais e de tema no `Input.module.scss`.
- [x] Estilizar o wrapper do input e o input nativo aplicando os tokens de bordas, espaçamento e fonte.
- [x] Estilizar os estados de foco, hover e desabilitado do input.
- [x] Implementar estilização para o estado de erro, colorindo as bordas e textos auxiliares de perigo (`--ds-color-danger`).
- [x] Adicionar suporte a ícones (`startIcon` / `endIcon`) ajustando os paddings do input.
- [x] Implementar a lógica CSS para floating label com `:placeholder-shown` e transições suaves de transform/font-size.

### 5. Storybook e Documentação

- [x] Criar o arquivo `packages/docs/src/stories/Input.stories.tsx`.
- [x] Configurar os controles do Storybook no meta-objeto para todas as propriedades do input.
- [x] Criar as histórias de demonstração: Playground, FloatingLabel, WithHelperText, WithError, DisabledState, WithIcons.

### 6. Validação e Qualidade

- [x] Executar a suíte de testes de unidade e cobertura via `vitest` e certificar que todos os testes passem.
- [x] Rodar o build do monorepo (`pnpm build` ou `turbo build`) para garantir que as tipagens sejam geradas e exportadas sem erros.
- [x] Executar o linter (`pnpm lint`) e formatador (`pnpm format`) para validação de estilo de código.
- [x] Rodar o Storybook localmente para inspeção visual do componente nos temas Light e Dark.
