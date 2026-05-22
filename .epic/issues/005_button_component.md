# #005 — Componente: Button

## Status

`[ ] A Fazer` `[ ] Em progresso` `[x] Concluído`

## Objetivo

Implementar o componente principal `Button` seguindo a metodologia TDD. O componente deve suportar variantes, tamanhos, estados (incluindo `loading` e `disabled`) e polimorfismo via pattern `asChild`.

## Critérios de Aceite

- [x] Variantes de estilo: `primary` (fundo preto, texto branco / invertido no dark), `secondary` (borda fina com texto de destaque), `ghost` (sem fundo, apenas texto interativo) e `danger` (fundo vermelho).
- [x] Tamanhos: `sm` (pequeno), `md` (médio/padrão) e `lg` (grande).
- [x] Estados visuais e interativos completos: `default`, `hover`, `focus` (focus ring visível), `active`, `disabled` e `loading`.
- [x] Integração do estado `loading`: quando ativo, exibe um indicador de progresso (spinner) sutil ao lado/no lugar do texto e desabilita interações (`pointer-events: none`).
- [x] Suporte a polimorfismo (`asChild`) utilizando a biblioteca `@radix-ui/react-slot`.
- [x] Tipagem de props com `interface` TypeScript e exports limpos via `index.ts`.
- [x] Implementar `forwardRef` para garantir o encaminhamento de referências.
- [x] Cobertura de testes unitários ≥ 90% cobrindo renderização, cliques, estados e acessibilidade (com `jest-axe`).
- [x] Navegação por teclado: botão deve ser clicável/ativado via `Enter` e `Espaço`.

## Props

| Prop      | Tipo                                              | Default     | Descrição                                                            |
| --------- | ------------------------------------------------- | ----------- | -------------------------------------------------------------------- |
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'danger'` | `'primary'` | Variante visual estética                                             |
| `size`    | `'sm' \| 'md' \| 'lg'`                            | `'md'`      | Tamanho vertical e horizontal do botão                               |
| `loading` | `boolean`                                         | `false`     | Se verdadeiro, exibe o spinner e desabilita interações               |
| `asChild` | `boolean`                                         | `false`     | Se verdadeiro, transfere props e comportamento para o elemento filho |

## Cenários de Teste

### Happy Path

- [ ] Renderiza o botão primário com o texto fornecido.
- [ ] Clicar no botão dispara o evento `onClick`.
- [ ] Sem violações de acessibilidade (`jest-axe`).

### Edge Cases & Estados

- [ ] Quando `disabled` é verdadeiro, cliques não disparam `onClick`.
- [ ] Quando `loading` é verdadeiro, cliques não disparam `onClick` e exibe o spinner de carregamento.
- [ ] Foco visual e anel de foco visíveis no clique do teclado.

## Arquivos a Criar

- `packages/core/src/components/Button/Button.tsx` (Componente)
- `packages/core/src/components/Button/Button.test.tsx` (Testes unitários)
- `packages/core/src/components/Button/Button.stories.tsx` (Stories do Storybook)
- `packages/core/src/components/Button/Button.module.scss` (Estilos)
- `packages/core/src/components/Button/index.ts` (Export)

## Dependências Externas

- `@radix-ui/react-slot`, `clsx`, `class-variance-authority`

## Dependências de Issues

#001 (Monorepo), #002 (Tokens), #003 (Themes), #004 (Storybook)

## Estimativa

M

## Pesquisa

### Referências e Melhores Práticas

- **Radix UI Slot:** O uso do primitivo `@radix-ui/react-slot` permite o padrão `asChild` para polimorfismo, que repassa as props e referências do botão para o filho, evitando problemas de desempenho no compilador TypeScript que ocorrem com o padrão `as` prop clássico.
- **cva (class-variance-authority):** Mapeia de forma type-safe as variações de props do componente para as classes dos estilos, o que funciona perfeitamente com CSS Modules ao passar os seletores importados de `styles` para os valores de variantes.
- **WAI-ARIA Button Pattern:** O botão precisa ser focado via teclado (tecla `Tab`), acionado pelas teclas `Enter` e `Espaço`, e deve receber `aria-disabled="true"` e `tabIndex={-1}` no estado `loading` para sinalizar aos leitores de tela que não está disponível para interações.

---

## Implementação Planejada

### Estrutura de Arquivos

```
packages/core/src/components/Button/
├── Button.tsx
├── Button.test.tsx
├── Button.stories.tsx
├── Button.module.scss
├── index.ts
```

### Detalhes das Configurações

**Button.tsx**:

```typescript
import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { withTheme } from '../../themes/withTheme';
import styles from './Button.module.scss';

export const buttonVariants = cva(styles.button, {
  variants: {
    variant: {
      primary: styles.primary,
      secondary: styles.secondary,
      ghost: styles.ghost,
      danger: styles.danger,
    },
    size: {
      sm: styles.sm,
      md: styles.md,
      lg: styles.lg,
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  asChild?: boolean;
}

const ButtonComponent = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      loading = false,
      disabled,
      asChild = false,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    const isDisabled = disabled || loading;

    return (
      <Comp
        ref={ref}
        className={clsx(
          buttonVariants({ variant, size }),
          loading && styles.loading,
          className
        )}
        disabled={isDisabled}
        aria-disabled={loading ? 'true' : undefined}
        {...props}
      >
        {loading ? (
          <>
            <span className={styles.spinner} aria-hidden="true" />
            <span className={styles.content}>{children}</span>
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);

ButtonComponent.displayName = 'Button';

export const Button = withTheme<HTMLButtonElement, ButtonProps>(ButtonComponent);
```

**Button.module.scss**:

```scss
@use '../../tokens/globals.scss';
@use '../../tokens/theme-light.scss';
@use '../../tokens/theme-dark.scss';

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--ds-spacing-2);
  font-family: var(--ds-font-family-sans);
  font-weight: var(--ds-font-weight-medium);
  border-radius: var(--ds-border-radius-md);
  border: 1px solid transparent;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    opacity 0.2s ease;
  user-select: none;

  &:focus-visible {
    outline: 2px solid var(--ds-color-focus-ring);
    outline-offset: 2px;
  }

  &:disabled,
  &.loading {
    opacity: 0.6;
    pointer-events: none;
    cursor: not-allowed;
  }
}

// Variants
.primary {
  background-color: var(--ds-color-neutral-1000);
  color: var(--ds-color-neutral-0);

  &:hover:not(:disabled):not(.loading) {
    background-color: var(--ds-color-neutral-800);
  }

  &:active:not(:disabled):not(.loading) {
    background-color: var(--ds-color-neutral-700);
  }
}

.secondary {
  background-color: transparent;
  border-color: var(--ds-color-neutral-300);
  color: var(--ds-color-neutral-1000);

  &:hover:not(:disabled):not(.loading) {
    background-color: var(--ds-color-neutral-50);
  }

  &:active:not(:disabled):not(.loading) {
    background-color: var(--ds-color-neutral-100);
  }
}

.ghost {
  background-color: transparent;
  color: var(--ds-color-neutral-1000);

  &:hover:not(:disabled):not(.loading) {
    background-color: var(--ds-color-neutral-50);
  }

  &:active:not(:disabled):not(.loading) {
    background-color: var(--ds-color-neutral-100);
  }
}

.danger {
  background-color: var(--ds-color-danger);
  color: var(--ds-color-neutral-0);

  &:hover:not(:disabled):not(.loading) {
    opacity: 0.9;
  }
}

// Sizes
.sm {
  height: 2rem; // 32px
  padding: 0 var(--ds-spacing-3);
  font-size: var(--ds-font-size-xs);
}

.md {
  height: 2.5rem; // 40px
  padding: 0 var(--ds-spacing-4);
  font-size: var(--ds-font-size-sm);
}

.lg {
  height: 3rem; // 48px
  padding: 0 var(--ds-spacing-6);
  font-size: var(--ds-font-size-md);
}

// Spinner
.spinner {
  display: inline-block;
  width: 1em;
  height: 1em;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: var(--ds-border-radius-full);
  animation: spin 0.75s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```

---

## Decisões Técnicas

1. **Associação do CVA com CSS Modules:** Em vez de usar strings hardcoded com Tailwind, o CVA mapeia propriedades lógicas diretamente para classes exclusivas do SCSS Module, mantendo total encapsulamento de estilos e sem quebras de escopo.
2. **Uso de `@radix-ui/react-slot` para Polimorfismo:** Evitamos problemas complexos de tipagem estrita de TypeScript ao usar a abordagem `asChild`, o que delega com segurança toda a renderização estrutural para o elemento filho React enquanto injeta as propriedades visuais de estilo de botão.
3. **Atualização do HOC `withTheme`:** O HOC original será alterado para retornar um componente encapsulado em `React.forwardRef` para garantir o envio correto de referências aos elementos DOM subjacentes.

---

## Checklist de Implementação

- [x] Instalar as dependências `@radix-ui/react-slot`, `clsx` e `class-variance-authority` no pacote `@ds/core`.
- [x] Atualizar o HOC `withTheme` em `packages/core/src/themes/withTheme.tsx` para usar `React.forwardRef` e repassar refs corretamente.
- [x] Criar o arquivo `Button.module.scss` e definir os styles de base, variantes, tamanhos, foco, estado disabled e animação de spinner.
- [x] Criar o arquivo de testes unitários `Button.test.tsx` com os casos para TDD.
- [x] Validar a falha dos testes unitários do botão (TDD inicial): `npx pnpm --filter @ds/core test`.
- [x] Criar o arquivo de componente `Button.tsx`.
- [x] Implementar as props, o uso de `cva`, `Slot` para polimorfismo, `forwardRef`, tratamento de `loading` e exportação com `withTheme`.
- [x] Garantir que o linter e o build passem sem erros após a implementação.
- [x] Resolver a exportação do componente no arquivo `packages/core/src/components/Button/index.ts`.
- [x] Adicionar o export do componente no `packages/core/src/index.ts`.
- [x] Rodar e passar em todos os testes unitários do botão: `npx pnpm --filter @ds/core test`.
- [x] Criar o arquivo de stories do Storybook em `Button.stories.tsx`.
- [x] Implementar stories demonstrando todas as variantes de botão.
- [x] Implementar stories demonstrando todos os tamanhos de botão.
- [x] Implementar stories para os estados `disabled`, `loading` e polimorfismo (`asChild`).
- [x] Validar que o Storybook é compilado em ambiente produtivo sem erros: `npx pnpm --filter @ds/docs build-storybook`.
- [x] Executar o linter e prettier globalmente no monorepo.
- [x] Atualizar o status da issue em `.epic/issues/005_button_component.md` e na tabela de issues em `EPIC_DESIGN_SYSTEM.md` para Concluído.
