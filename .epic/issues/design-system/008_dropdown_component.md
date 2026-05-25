# #008 — Componente: Dropdown (Select)

## Status

`[ ] A Fazer` `[ ] Em progresso` `[x] Concluído`

## Objetivo

Implementar o componente `Dropdown` (Select) encapsulando os primitivos do `@radix-ui/react-select`. O componente deve suportar renderização estilizada monocromática, placeholders, suporte a estados de erro e acessibilidade nativa via teclado.

## Critérios de Aceite

- [x] Criar o componente de seleção customizado utilizando `@radix-ui/react-select` (Trigger, Value, Icon, Portal, Content, Viewport, Item, ItemText).
- [x] Aplicar estilo monocromático customizado (bordas angulares `--ds-border-radius-sm`, cores neutras para o menu overlay).
- [x] Suportar propriedades `label`, `error`, `helperText` e `disabled` integradas de forma consistente aos componentes `Input`/`Textarea`.
- [x] Suporte nativo a navegação por teclado (WAI-ARIA Select): setas para navegar, `Enter` / `Espaço` para abrir/selecionar, `Escape` para fechar.
- [x] Permitir a passagem de um array de opções tipadas (`DropdownOption`).
- [x] Criar testes cobrindo renderização, seleção de itens através de simulação de cliques/teclado e validações `jest-axe`.

## Props

| Prop           | Tipo                      | Default | Descrição                                                              |
| -------------- | ------------------------- | ------- | ---------------------------------------------------------------------- |
| `label`        | `string`                  | -       | Rótulo exibido acima do dropdown                                       |
| `placeholder`  | `string`                  | -       | Texto padrão quando nenhuma opção estiver selecionada                  |
| `options`      | `DropdownOption[]`        | -       | Lista de opções `{ label: string, value: string, disabled?: boolean }` |
| `value`        | `string`                  | -       | Valor selecionado (modo controlado)                                    |
| `defaultValue` | `string`                  | -       | Valor selecionado inicialmente (modo não controlado)                   |
| `onChange`     | `(value: string) => void` | -       | Callback acionado na alteração do valor                                |
| `error`        | `string`                  | -       | Mensagem de erro que altera a cor das bordas                           |
| `disabled`     | `boolean`                 | `false` | Se verdadeiro, impede interações                                       |

## Cenários de Teste

- [x] Exibe o placeholder inicialmente se não houver valor.
- [x] Clicar no gatilho abre o menu flutuante exibindo as opções.
- [x] Selecionar uma opção fecha o menu e altera o texto do gatilho para o valor selecionado.
- [x] Acessibilidade por teclado e axe compliance.

## Arquivos a Criar

- `packages/core/src/components/Dropdown/Dropdown.tsx`
- `packages/core/src/components/Dropdown/Dropdown.test.tsx`
- `packages/docs/src/stories/Dropdown.stories.tsx`
- `packages/core/src/components/Dropdown/Dropdown.module.scss`
- `packages/core/src/components/Dropdown/index.ts`

## Dependências Externas

- `@radix-ui/react-select`

## Dependências de Issues

#001 (Monorepo), #002 (Tokens), #003 (Themes)

## Estimativa

M

## Pesquisa

### Radix UI Select Component

O Radix UI Select (`@radix-ui/react-select`) fornece uma estrutura de componentes de primitivo para select acessível e customizável:

- **Select.Root**: O container principal do componente. Gerencia os estados internos de valor selecionado e visibilidade do menu.
- **Select.Trigger**: O botão que abre/fecha o menu. Deve receber o `ref` e ser associado à label.
- **Select.Value**: Renderiza o valor selecionado ou o placeholder.
- **Select.Icon**: Renderiza um elemento decorativo ao lado do valor (como uma seta ou chevron).
- **Select.Portal**: Renderiza o conteúdo do dropdown em um elemento no final do `document.body` (otimizando contra problemas de transbordo e empilhamento de z-index).
- **Select.Content**: O container que encapsula a lista de itens. Deve receber o tema (`data-theme`) para estilização consistente.
- **Select.Viewport**: O container interno do menu que lida com o conteúdo rolável.
- **Select.Item**: Elemento individual de opção. Recebe `value` e `disabled`.
- **Select.ItemText**: Renderiza o texto associado a cada opção.
- **Select.ItemIndicator**: Componente opcional exibido apenas quando o item está selecionado (usaremos para renderizar um ícone de checkmark).

### Padrão de Acessibilidade WAI-ARIA Select

O componente segue estritamente as regras de acessibilidade WCAG 2.1 AA:

- **Papéis Semânticos (Roles):**
  - O gatilho (`Trigger`) atua com `role="combobox"` e atributos `aria-expanded` (atualizado dinamicamente), `aria-controls` (vinculando ao menu), e `aria-haspopup="listbox"`.
  - O menu suspenso (`Content`) atua com `role="listbox"`.
  - Cada item (`Item`) atua com `role="option"` e `aria-selected` correspondente ao seu estado de seleção.
- **Associação de Label:**
  - O elemento `<label>` deve possuir o atributo `htmlFor` apontando para o `id` do `<Select.Trigger>`.
- **Feedback de Validação e Ajuda:**
  - O gatilho deve possuir `aria-invalid="true"` em caso de erro.
  - O gatilho deve referenciar as mensagens de ajuda ou de erro via `aria-describedby`.
- **Navegação por Teclado:**
  - `Space` / `Enter`: Abre o menu (se focado no trigger) ou seleciona o item destacado (se focado em uma opção).
  - `ArrowDown` / `ArrowUp`: Navega sequencialmente entre as opções disponíveis no menu aberto.
  - `Escape`: Fecha o menu e retorna o foco visual para o gatilho.
  - `Home` / `End`: Move o foco para a primeira/última opção.
  - Digitação Direta (Type-ahead): Permite digitar caracteres para focar na primeira opção que começa com essa sequência de letras.

---

## Implementação Planejada

### Estrutura de Arquivos Proposta

```
packages/core/src/components/Dropdown/
├── Dropdown.tsx
├── Dropdown.test.tsx
├── Dropdown.module.scss
└── index.ts
```

_(Nota: Embora o arquivo original sugira criar `Dropdown.stories.tsx` sob `packages/core/src/components/Dropdown/`, o Storybook do projeto busca histórias exclusivamente sob `packages/docs/src/stories/` conforme configurado em `packages/docs/.storybook/main.ts`. Seguiremos o padrão arquitetural em `packages/docs/src/stories/Dropdown.stories.tsx`)._

### Proposta de Código: `packages/core/src/components/Dropdown/Dropdown.tsx`

```typescript
import React from 'react'
import * as Select from '@radix-ui/react-select'
import { clsx } from 'clsx'
import { withTheme } from '../../themes/withTheme'
import { useTheme } from '../../themes/useTheme'
import styles from './Dropdown.module.scss'

export interface DropdownOption {
  label: string
  value: string
  disabled?: boolean
}

export interface DropdownProps {
  label?: string
  placeholder?: string
  options: DropdownOption[]
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  error?: string
  helperText?: string
  disabled?: boolean
  className?: string
  id?: string
}

const DropdownComponent = React.forwardRef<HTMLButtonElement, DropdownProps>(
  (
    {
      label,
      placeholder = 'Selecione uma opção...',
      options,
      value,
      defaultValue,
      onChange,
      error,
      helperText,
      disabled = false,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme()
    const selectId = id || React.useId()
    const errorId = `${selectId}-error`
    const helperId = `${selectId}-helper`

    const describedBy = clsx(
      error && errorId,
      helperText && !error && helperId
    ) || undefined

    return (
      <div className={clsx(styles.wrapper, className)}>
        {label && (
          <label htmlFor={selectId} className={styles.label}>
            {label}
          </label>
        )}

        <Select.Root
          value={value}
          defaultValue={defaultValue}
          onValueChange={onChange}
          disabled={disabled}
        >
          <Select.Trigger
            ref={ref}
            id={selectId}
            className={clsx(styles.trigger, error && styles.triggerError)}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={describedBy}
            {...props}
          >
            <Select.Value placeholder={placeholder} />
            <Select.Icon className={styles.icon}>
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M3 4.5L6 7.5L9 4.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Select.Icon>
          </Select.Trigger>

          <Select.Portal>
            <Select.Content
              className={styles.content}
              data-theme={theme}
              position="popper"
              sideOffset={4}
            >
              <Select.Viewport className={styles.viewport}>
                {options.map((option) => (
                  <Select.Item
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                    className={styles.item}
                  >
                    <Select.ItemText>{option.label}</Select.ItemText>
                    <Select.ItemIndicator className={styles.itemIndicator}>
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          d="M2.5 6L4.5 8L9.5 3"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>

        {error && (
          <span id={errorId} className={styles.errorText} role="alert">
            {error}
          </span>
        )}

        {helperText && !error && (
          <span id={helperId} className={styles.helperText}>
            {helperText}
          </span>
        )}
      </div>
    )
  }
)

DropdownComponent.displayName = 'Dropdown'

export const Dropdown = withTheme<HTMLButtonElement, DropdownProps>(DropdownComponent)
```

### Proposta de Código: `packages/core/src/components/Dropdown/Dropdown.test.tsx`

```typescript
import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { vi } from 'vitest'
import { Dropdown, DropdownOption } from './Dropdown'
import { ThemeProvider } from '../../themes/ThemeProvider'

const options: DropdownOption[] = [
  { label: 'Option 1', value: 'opt1' },
  { label: 'Option 2', value: 'opt2' },
  { label: 'Option 3', value: 'opt3', disabled: true },
]

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>)
}

describe('Dropdown Component', () => {
  it('should render the dropdown with placeholder', () => {
    renderWithTheme(<Dropdown options={options} placeholder="Select an option" />)
    const trigger = screen.getByRole('combobox')
    expect(trigger).toBeInTheDocument()
    expect(trigger).toHaveTextContent('Select an option')
  })

  it('should render the label if provided', () => {
    renderWithTheme(<Dropdown options={options} label="Choose option" />)
    const label = screen.getByText('Choose option')
    expect(label).toBeInTheDocument()
  })

  it('should display defaultValue initially', () => {
    renderWithTheme(<Dropdown options={options} defaultValue="opt2" />)
    const trigger = screen.getByRole('combobox')
    expect(trigger).toHaveTextContent('Option 2')
  })

  it('should open listbox and show options on trigger click', async () => {
    const user = userEvent.setup()
    renderWithTheme(<Dropdown options={options} placeholder="Select" />)

    const trigger = screen.getByRole('combobox')
    await user.click(trigger)

    const listbox = screen.getByRole('listbox')
    expect(listbox).toBeInTheDocument()

    const opt1 = screen.getByRole('option', { name: 'Option 1' })
    const opt2 = screen.getByRole('option', { name: 'Option 2' })
    expect(opt1).toBeInTheDocument()
    expect(opt2).toBeInTheDocument()
  })

  it('should select an option and close menu when option is clicked', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    renderWithTheme(<Dropdown options={options} onChange={handleChange} placeholder="Select" />)

    const trigger = screen.getByRole('combobox')
    await user.click(trigger)

    const opt2 = screen.getByRole('option', { name: 'Option 2' })
    await user.click(opt2)

    expect(handleChange).toHaveBeenCalledWith('opt2')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(trigger).toHaveTextContent('Option 2')
  })

  it('should not allow selecting a disabled option', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    renderWithTheme(<Dropdown options={options} onChange={handleChange} placeholder="Select" />)

    const trigger = screen.getByRole('combobox')
    await user.click(trigger)

    const disabledOpt = screen.getByRole('option', { name: 'Option 3' })
    expect(disabledOpt).toHaveAttribute('data-disabled')
    await user.click(disabledOpt)

    expect(handleChange).not.toHaveBeenCalled()
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('should support uncontrolled defaultValue state', async () => {
    const user = userEvent.setup()
    renderWithTheme(<Dropdown options={options} defaultValue="opt1" />)

    const trigger = screen.getByRole('combobox')
    expect(trigger).toHaveTextContent('Option 1')

    await user.click(trigger)
    const opt2 = screen.getByRole('option', { name: 'Option 2' })
    await user.click(opt2)

    expect(trigger).toHaveTextContent('Option 2')
  })

  it('should support controlled state via value', () => {
    const { rerender } = renderWithTheme(<Dropdown options={options} value="opt1" onChange={vi.fn()} />)
    const trigger = screen.getByRole('combobox')
    expect(trigger).toHaveTextContent('Option 1')

    rerender(
      <ThemeProvider>
        <Dropdown options={options} value="opt2" onChange={vi.fn()} />
      </ThemeProvider>
    )
    expect(trigger).toHaveTextContent('Option 2')
  })

  it('should not open and should be disabled when disabled prop is true', async () => {
    const user = userEvent.setup()
    renderWithTheme(<Dropdown options={options} disabled />)

    const trigger = screen.getByRole('combobox')
    expect(trigger).toBeDisabled()

    await user.click(trigger)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('should show error message and apply aria-invalid', () => {
    renderWithTheme(<Dropdown options={options} error="This is required" />)
    const trigger = screen.getByRole('combobox')
    expect(trigger).toHaveAttribute('aria-invalid', 'true')

    const errorText = screen.getByRole('alert')
    expect(errorText).toBeInTheDocument()
    expect(errorText).toHaveTextContent('This is required')
  })

  it('should display helper text when no error is present', () => {
    renderWithTheme(<Dropdown options={options} helperText="Choose wisely" />)
    const helperText = screen.getByText('Choose wisely')
    expect(helperText).toBeInTheDocument()

    const trigger = screen.getByRole('combobox')
    expect(trigger).toHaveAttribute('aria-describedby')
  })

  it('should forward ref to trigger element', () => {
    const ref = React.createRef<HTMLButtonElement>()
    renderWithTheme(<Dropdown options={options} ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    expect(ref.current?.tagName).toBe('BUTTON')
  })

  it('should navigate and select via keyboard (WAI-ARIA compliance)', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    renderWithTheme(<Dropdown options={options} onChange={handleChange} />)

    const trigger = screen.getByRole('combobox')
    trigger.focus()
    expect(trigger).toHaveFocus()

    // Abrir via barra de espaço
    await user.keyboard(' ')
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    // Navegar e selecionar
    await user.keyboard('{ArrowDown}')
    await user.keyboard('{Enter}')

    expect(handleChange).toHaveBeenCalledWith('opt2')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('should close on Escape keypress', async () => {
    const user = userEvent.setup()
    renderWithTheme(<Dropdown options={options} />)

    const trigger = screen.getByRole('combobox')
    await user.click(trigger)
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('should pass accessibility compliance checks', async () => {
    const { container } = renderWithTheme(<Dropdown options={options} label="Select dynamic" />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
```

### Proposta de Código: `packages/docs/src/stories/Dropdown.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react'
import React, { useState } from 'react'
import { Dropdown, DropdownProps } from '@ds/core'

const options = [
  { label: 'React.js', value: 'react' },
  { label: 'TypeScript', value: 'ts' },
  { label: 'Sass / SCSS', value: 'sass' },
  { label: 'Next.js (Disabled)', value: 'next', disabled: true },
]

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
}

export default meta
type Story = StoryObj<typeof Dropdown>

export const Playground: Story = {
  args: {
    label: 'Tecnologia Principal',
    placeholder: 'Escolha uma stack...',
    options,
    disabled: false,
    error: '',
    helperText: 'Selecione a tecnologia de maior domínio para o portfólio.',
  },
}

export const Basic: Story = {
  tags: ['!dev'],
  args: {
    placeholder: 'Selecione...',
    options,
  },
}

export const WithLabel: Story = {
  tags: ['!dev'],
  args: {
    label: 'Stack',
    placeholder: 'Selecione...',
    options,
  },
}

export const WithHelperText: Story = {
  tags: ['!dev'],
  args: {
    label: 'Stack',
    placeholder: 'Selecione...',
    options,
    helperText: 'A stack será exibida em destaque no cabeçalho do perfil.',
  },
}

export const Disabled: Story = {
  tags: ['!dev'],
  args: {
    label: 'Stack',
    placeholder: 'Selecione...',
    options,
    disabled: true,
  },
}

export const WithError: Story = {
  tags: ['!dev'],
  args: {
    label: 'Stack',
    placeholder: 'Selecione...',
    options,
    error: 'É necessário selecionar pelo menos uma stack.',
  },
}

export const Controlled: Story = {
  tags: ['!dev'],
  render: (args: DropdownProps) => {
    const [val, setVal] = useState('react')
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Dropdown {...args} value={val} onChange={setVal} />
        <p style={{ fontSize: '14px', color: 'var(--ds-color-neutral-700)' }}>
          Valor selecionado no estado pai: <strong>{val}</strong>
        </p>
      </div>
    )
  },
  args: {
    label: 'Stack Controlada',
    options,
  },
}
```

### Proposta de Código: `packages/core/src/components/Dropdown/Dropdown.module.scss`

```scss
.wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-1);
  font-family: var(--ds-font-family-sans);
  width: 100%;
}

.label {
  font-size: var(--ds-font-size-sm);
  font-weight: var(--ds-font-weight-medium);
  color: var(--ds-color-neutral-800);
}

.trigger {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--ds-spacing-4);
  height: var(--ds-spacing-10);
  font-size: var(--ds-font-size-sm);
  font-family: var(--ds-font-family-sans);
  color: var(--ds-color-neutral-900);
  background-color: var(--ds-color-neutral-0);
  border: var(--ds-border-width-sm) solid var(--ds-color-neutral-200);
  border-radius: var(--ds-border-radius-sm);
  cursor: pointer;
  outline: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
  width: 100%;
  text-align: left;

  &[data-placeholder] {
    color: var(--ds-color-neutral-400);
  }

  &:hover:not([data-disabled]) {
    border-color: var(--ds-color-neutral-400);
  }

  &:focus-visible {
    outline: var(--ds-border-width-md) solid var(--ds-color-focus-ring);
    outline-offset: 2px;
  }

  &[data-state='open'] {
    border-color: var(--ds-color-neutral-900);
  }

  &[data-disabled] {
    background-color: var(--ds-color-neutral-100);
    color: var(--ds-color-neutral-400);
    border-color: var(--ds-color-neutral-200);
    cursor: not-allowed;
    opacity: 0.6;
    pointer-events: none;
  }
}

.triggerError {
  border-color: var(--ds-color-danger);

  &:hover:not([data-disabled]) {
    border-color: var(--ds-color-danger);
  }

  &:focus-visible {
    outline-color: var(--ds-color-danger);
  }
}

.icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ds-color-neutral-500);
  transition: transform 0.2s ease;

  [data-state='open'] & {
    transform: rotate(180deg);
  }
}

.content {
  background-color: var(--ds-color-neutral-0);
  border: var(--ds-border-width-sm) solid var(--ds-color-neutral-200);
  border-radius: var(--ds-border-radius-sm);
  box-shadow: var(--ds-shadow-md);
  overflow: hidden;
  z-index: 1000;
  min-width: var(--radix-select-trigger-width);
  max-height: var(--radix-select-content-available-height);
}

.viewport {
  padding: var(--ds-spacing-1);
}

.item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--ds-spacing-2) var(--ds-spacing-4);
  font-size: var(--ds-font-size-sm);
  color: var(--ds-color-neutral-700);
  border-radius: var(--ds-border-radius-sm);
  cursor: pointer;
  outline: none;
  position: relative;
  user-select: none;

  &[data-highlighted] {
    background-color: var(--ds-color-neutral-1000);
    color: var(--ds-color-neutral-0);
  }

  &[data-state='checked'] {
    font-weight: var(--ds-font-weight-semibold);
    color: var(--ds-color-neutral-900);

    &[data-highlighted] {
      color: var(--ds-color-neutral-0);
    }
  }

  &[data-disabled] {
    color: var(--ds-color-neutral-300);
    cursor: not-allowed;
    pointer-events: none;
  }
}

.itemIndicator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.errorText {
  font-size: var(--ds-font-size-xs);
  color: var(--ds-color-danger);
  margin-top: var(--ds-spacing-1);
}

.helperText {
  font-size: var(--ds-font-size-xs);
  color: var(--ds-color-neutral-500);
  margin-top: var(--ds-spacing-1);
}
```

### Proposta de Código: `packages/core/src/components/Dropdown/index.ts`

```typescript
export { Dropdown } from './Dropdown'
export type { DropdownProps, DropdownOption } from './Dropdown'
```

---

## Decisões Técnicas

1. **Uso do Primitivo Radix UI Select (`@radix-ui/react-select`)**:
   - Evita a reinvenção da roda para comportamentos complexos de acessibilidade (como focus-trap do menu flutuante, type-ahead, suporte a leitores de tela e navegação bidirecional por teclado).
   - O primitivo é leve e garante comportamento nativo consistente em diferentes navegadores sem comprometer a performance.
2. **Estilização com SCSS Modules e Data-Attributes**:
   - Estilização controlada via CSS Modules previne vazamentos globais de escopo.
   - O uso de seletores de atributo baseados no Radix UI (ex: `&[data-state='open']`, `&[data-placeholder]`, `&[data-highlighted]`) permite sincronização imediata dos estados visuais com o estado interno do componente, sem a necessidade de manter classes duplicadas controladas em JavaScript.
3. **Propagação de Tema ao Portal (`data-theme`)**:
   - Como o `Portal` do Radix UI monta os elementos flutuantes fora da raiz da aplicação para resolver problemas de z-index/overflow, as variáveis de tema aplicadas localmente pelo wrapper seriam perdidas.
   - A decisão técnica é extrair o tema ativo através do hook `useTheme()` da pasta `themes/` e repassá-lo explicitamente como atributo `data-theme={theme}` para o elemento `<Select.Content>`, garantindo que o menu flutuante herde as variáveis de tema corretas do tema ativo.
4. **Controle Integrado de Estados**:
   - Compatibilidade de layout com `Input` e `Textarea` pela utilização das props `label`, `error`, `helperText` e `disabled` estruturadas em CSS flexbox vertical de forma idêntica, proporcionando consistência visual completa no preenchimento de formulários.
   - Gerenciamento automático de estado controlado vs não controlado feito internamente pelo Radix UI a partir de `value`/`defaultValue`, minimizando sincronizações manuais que causam bugs de renderização.

---

## Checklist de Implementação

- [x] 1. Adicionar a dependência `@radix-ui/react-select` ao arquivo `packages/core/package.json`.
- [x] 2. Instalar as dependências executando o gerenciador de pacotes na raiz (`pnpm install`).
- [x] 3. Criar a pasta do componente em `packages/core/src/components/Dropdown/`.
- [x] 4. Criar o arquivo de estilos em `packages/core/src/components/Dropdown/Dropdown.module.scss`.
- [x] 5. Criar o arquivo de teste `packages/core/src/components/Dropdown/Dropdown.test.tsx` com a estrutura e cenários do plano de testes (TDD).
- [x] 6. Confirmar que a suíte de testes falha adequadamente executando o comando de teste (`pnpm --filter @ds/core test`).
- [x] 7. Implementar o componente `Dropdown.tsx` definindo a interface `DropdownOption` e `DropdownProps` utilizando `withTheme`.
- [x] 8. Estruturar a renderização HTML no `Dropdown.tsx` com suporte a `label`, `helperText` e `error`.
- [x] 9. Configurar os atributos de acessibilidade ARIA (`aria-describedby` para erros e textos auxiliares, e vinculação de labels por `htmlFor`/`id`).
- [x] 10. Implementar o encaminhamento de refs (`forwardRef`) no trigger do select para permitir manipulação nativa externa.
- [x] 11. Estilizar o wrapper do componente com espaçamentos baseados nos tokens em `Dropdown.module.scss`.
- [x] 12. Estilizar o trigger do Select aplicando estados de hover, foco visível, erro (`triggerError`) e disabled usando tokens de cores, bordas e shadows.
- [x] 13. Estilizar o conteúdo flutuante do dropdown (`Select.Content` e `Select.Viewport`) aplicando fundo e sombras adequadas à elevação.
- [x] 14. Estilizar os itens internos aplicando a regra monocromática de seleção (`[data-highlighted]`) usando as cores `--ds-color-neutral-1000` e `--ds-color-neutral-0`.
- [x] 15. Criar o arquivo `packages/core/src/components/Dropdown/index.ts` exportando o componente e seus tipos.
- [x] 16. Exportar o componente `Dropdown` a partir do ponto de entrada principal do core em `packages/core/src/index.ts`. (Ignorado conforme instrução explícita do usuário)
- [x] 17. Rodar a suíte de testes novamente e garantir que todos os 15 cenários planejados passem com sucesso.
- [x] 18. Verificar se há violações de acessibilidade adicionais rodando testes unitários do axe.
- [x] 19. Criar a história de Storybook em `packages/docs/src/stories/Dropdown.stories.tsx` seguindo o agrupamento de documentação (`autodocs` e `!dev`).
- [x] 20. Rodar o Storybook localmente (`pnpm --filter @ds/docs storybook`) para validar visualmente o comportamento e contraste do componente nos temas Light e Dark.
- [x] 21. Executar a revisão final de lint e formatação utilizando as regras do `AGENTS.md` e comando `/review`.
