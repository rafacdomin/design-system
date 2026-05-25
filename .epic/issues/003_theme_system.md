# #003 — Sistema de Temas (ThemeProvider & HOC)

## Status

`[ ] A Fazer` `[ ] Em progresso` `[x] Concluído`

## Objetivo

Criar o provedor de tema (`ThemeProvider`) e o Higher-Order Component (`withTheme`) no pacote `@rafacdomin/ds-core`, gerenciando a aplicação e alternância do atributo `data-theme` no DOM de forma tipada e reativa.

## Critérios de Aceite

- [x] Criar o contexto do React (`ThemeContext`) que mantém o estado do tema (`'light' | 'dark'`) e uma função para alternar o tema (`setTheme`).
- [x] Criar o componente `ThemeProvider` que injeta o `ThemeContext.Provider` e renderiza um elemento container contendo o atributo `data-theme={theme}`.
- [x] Criar o hook personalizado `useTheme` para consumir o tema atual e a função de atualização em componentes internos.
- [x] Criar o HOC `withTheme` que envolve um componente genérico e passa a propriedade `data-theme` baseada no tema atual.
- [x] Garantir tipagem estrita com TypeScript para as props do HOC (`withTheme`).
- [x] Criar testes unitários para validar que o `ThemeProvider` aplica o atributo `data-theme` correto no elemento HTML/DOM e que é possível alternar o tema via botão de toggle.
- [x] Exportar `ThemeProvider`, `withTheme` e `useTheme` no `index.ts` do `@rafacdomin/ds-core`.

## Cenários de Validação

- [x] Fazer render de um elemento envolvido no `ThemeProvider` no RTL e validar se o container pai tem `data-theme="light"`.
- [x] Invocar a função para alterar para `dark` e validar que o container muda para `data-theme="dark"`.

## Arquivos a Criar/Modificar

- `packages/core/src/themes/ThemeContext.ts` (Criar)
- `packages/core/src/themes/ThemeProvider.tsx` (Criar)
- `packages/core/src/themes/withTheme.tsx` (Criar)
- `packages/core/src/themes/useTheme.ts` (Criar)
- `packages/core/src/themes/themes.test.tsx` (Criar)
- `packages/core/src/index.ts` (Modificar para exportar hooks, provider e HOC)

## Dependências Externas

- `react`, `react-dom`

## Dependências de Issues

#001 (Monorepo), #002 (Tokens)

## Estimativa

P

## Pesquisa

### Referências do Projeto

- `references/THEMING.md`: Define a assinatura do `ThemeProvider` e o HOC `withTheme`.
- `references/TESTING_STRATEGY.md`: Define o template de testes com RTL, Vitest e `jest-axe`.
- `references/ARCHITECTURE.md`: Trata das exportações absolutas e tipagem.

### Melhores Práticas e Acessibilidade

- O atributo `data-theme` deve ser aplicado em um container wrapper que sirva de escopo para as CSS Variables.
- Testes unitários com JSDOM simulam a alternância do atributo no DOM para verificar se a reatividade do React propaga o tema correto.
- `jest-axe` garante que o markup base do ThemeProvider não viola regras WCAG (por exemplo, contraste dinâmico de cores baseadas nas variáveis HSL).

## Implementação Planejada

### Estrutura de Arquivos

```
packages/core/
├── vitest.config.ts
├── src/
│   ├── setupTests.ts
│   ├── themes/
│   │   ├── ThemeContext.ts
│   │   ├── ThemeProvider.tsx
│   │   ├── useTheme.ts
│   │   ├── withTheme.tsx
│   │   └── themes.test.tsx
│   └── index.ts
```

### Pseudocódigo

**ThemeContext.ts**:

```typescript
import { createContext } from 'react'
export type Theme = 'light' | 'dark'
export interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}
export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
)
```

**useTheme.ts**:

```typescript
import { useContext } from 'react'
import { ThemeContext } from './ThemeContext'
export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
```

**ThemeProvider.tsx**:

```typescript
import React, { useState } from 'react';
import { ThemeContext, Theme } from './ThemeContext';

export interface ThemeProviderProps {
  defaultTheme?: Theme;
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  defaultTheme = 'light',
  children
}) => {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div data-theme={theme}>{children}</div>
    </ThemeContext.Provider>
  );
};
```

**withTheme.tsx**:

```typescript
import React from 'react';
import { useTheme } from './useTheme';

export function withTheme<P extends object>(Component: React.ComponentType<P>) {
  const WithTheme = (props: P) => {
    const { theme } = useTheme();
    return <Component {...props} data-theme={theme} />;
  };
  WithTheme.displayName = `withTheme(${Component.displayName || Component.name || 'Component'})`;
  return WithTheme;
}
```

## Decisões Técnicas

1. **Configuração Local do Vitest no Core:**
   Configurar o Vitest localmente em `packages/core/vitest.config.ts` com o ambiente `jsdom`. Isso permite que o pacote de componentes principal rode seus próprios testes unitários de forma independente, enquanto o Turborepo centraliza a pipeline global no script `test` da raiz.
2. **Uso de `@vitejs/plugin-react`:**
   Utilizado pelo Vitest para permitir a transpilação e interpretação nativa do JSX do React nos arquivos `.test.tsx`.
3. **Validação Acessível (WCAG 2.1 AA) com jest-axe:**
   Integração do `jest-axe` no arquivo de `setupTests.ts` para habilitar o matcher `.toHaveNoViolations()` e validar o Markup contra as diretrizes WCAG.

## Checklist de Implementação

- [x] Instalar devDependencies de teste no pacote `@rafacdomin/ds-core` (`vitest`, `vite`, `@vitejs/plugin-react`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jest-axe`, `@types/jest-axe`).
- [x] Criar arquivo `packages/core/vitest.config.ts` configurando o ambiente `jsdom` e o plugin React.
- [x] Criar arquivo `packages/core/src/setupTests.ts` para carregar matchers do `jest-dom` e estender os matchers do `vitest` com `jest-axe/matchers`.
- [x] Atualizar `tsconfig.json` do core/raiz para incluir types do Vitest e Jest DOM.
- [x] Criar `packages/core/src/themes/ThemeContext.ts` com o tipo `Theme`, tipo `ThemeContextType` e o React Context.
- [x] Criar `packages/core/src/themes/useTheme.ts` exportando o hook personalizado com validação de escopo.
- [x] Criar `packages/core/src/themes/ThemeProvider.tsx` aplicando o `ThemeContext.Provider` e o wrapper `<div data-theme={theme}>`.
- [x] Criar `packages/core/src/themes/withTheme.tsx` implementando o Higher-Order Component genérico com displayName correto.
- [x] Criar `packages/core/src/themes/themes.test.tsx` com cenários para:
  - [x] Renderizar com tema padrão `light`.
  - [x] Renderizar com tema padrão customizado `dark`.
  - [x] Disparar `setTheme` e validar a alteração do atributo `data-theme` no DOM.
  - [x] Lançar erro quando `useTheme` for chamado fora do `ThemeProvider`.
  - [x] Validar o HOC `withTheme` repassando o atributo `data-theme` corretamente.
  - [x] Garantir acessibilidade (zero violações com `jest-axe`).
- [x] Adicionar o script `"test": "vitest run"` no `packages/core/package.json`.
- [x] Modificar `packages/core/src/index.ts` para exportar `ThemeContext`, `Theme`, `ThemeProviderProps`, `ThemeProvider`, `useTheme` e `withTheme`.
- [x] Rodar `npx pnpm test` globalmente via Turborepo para validar que a suíte de testes do core passa 100%.
- [x] Rodar linter (`npx pnpm lint`) e formatador (`npx pnpm format`) para garantir zero warnings/erros.
- [x] Atualizar `.epic/EPIC_DESIGN_SYSTEM.md` marcando a Issue #003 em progresso/concluída.
- [x] Atualizar status da própria issue para Concluído.
